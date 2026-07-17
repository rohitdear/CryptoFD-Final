"use server"

import { prisma } from "@/lib/db"
import { getCurrentUser, hashPassword } from "@/lib/auth"
import { sendWithdrawalEmail } from "@/lib/email"
import { revalidatePath } from "next/cache"

export async function createFD(planId: string, amount: number) {
  const user = await getCurrentUser()
  
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Get user profile
  const profile = await prisma.profile.findUnique({
    where: { id: user.id }
  })

  if (!profile) {
    return { error: "Profile not found" }
  }
  
  // Get the plan details
  const plan = await prisma.fdPlan.findUnique({
    where: { id: planId, isActive: true }
  })
  
  if (!plan) {
    return { error: "Plan not found" }
  }
  
  // Validate amount
  if (amount < Number(plan.minAmount) || amount > Number(plan.maxAmount)) {
    return { error: `Amount must be between ${plan.minAmount} and ${plan.maxAmount} USDT` }
  }
  
  // Check user balance
  if (Number(profile.walletBalance) < amount) {
    return { error: "Insufficient balance" }
  }
  
  // Calculate daily earning and end date
  const dailyEarning = (amount * Number(plan.dailyRoi)) / 100
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + plan.durationDays)
  
  try {
    // Use transaction for atomic operations
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await prisma.$transaction(async (tx: any) => {
      // Update balance: deduct from wallet, add to locked
      await tx.profile.update({
        where: { id: user.id },
        data: {
          walletBalance: { decrement: amount },
          lockedBalance: { increment: amount },
        }
      })

      // Create the FD
      const fd = await tx.userFd.create({
        data: {
          userId: user.id,
          planId,
          planName: plan.name,
          amount,
          dailyEarning,
          endDate,
          lastPayoutDate: new Date(),
          totalEarned: 0,
          status: "active",
        }
      })
      
      // Create transaction record
      await tx.transaction.create({
        data: {
          userId: user.id,
          type: "fd_investment",
          amount: -amount,
          status: "completed",
          description: `Investment in ${plan.name} plan`,
        }
      })

      return fd
    })
    
    // Process referral commissions (outside transaction for performance)
    await processReferralCommissions(user.id, result.id, amount)
    
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/my-fds")
    
    return { success: true, fdId: result.id }
  } catch (error) {
    console.error("Create FD error:", error)
    return { error: "Failed to create FD" }
  }
}

// Referral commissions - 3 levels: 10%, 5%, 2%
async function processReferralCommissions(userId: string, fdId: string, fdAmount: number) {
  const commissionRates: Record<number, number> = { 1: 10, 2: 5, 3: 2 }

  // Get referrers for this user
  const referrers = await prisma.referral.findMany({
    where: { referredId: userId }
  })
  
  if (referrers.length === 0) return
  
  for (const ref of referrers) {
    const rate = commissionRates[ref.level] || 0
    if (rate === 0) continue

    const commission = (fdAmount * rate) / 100
    
    // Update referral_earnings and wallet_balance for referrer
    await prisma.profile.update({
      where: { id: ref.referrerId },
      data: {
        referralEarnings: { increment: commission },
        walletBalance: { increment: commission },
      }
    })
    
    // Create transaction for referrer
    await prisma.transaction.create({
      data: {
        userId: ref.referrerId,
        type: "referral_commission",
        amount: commission,
        status: "completed",
        description: `Level ${ref.level} referral commission (${rate}%)`,
      }
    })
  }
}

// Withdrawal request
export async function requestWithdrawal(amount: number, address: string) {
  const user = await getCurrentUser()
  
  if (!user) {
    return { error: "Not authenticated" }
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id }
  })
  
  if (!profile) {
    return { error: "Profile not found" }
  }

  // Check if withdrawal is disabled for this user
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((profile as any).withdrawalDisabled) {
    return { error: "Withdrawals are currently disabled for your account. Please contact support." }
  }

  // Check if today is Saturday (6) or Sunday (0)
  const today = new Date()
  const dayOfWeek = today.getDay()
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return { error: "Withdrawals are not available on weekends. Please try again on a weekday." }
  }

  // Available = wallet_balance (includes deposits, earnings, referral)
  const totalAvailable = Number(profile.walletBalance)
  
  if (amount > totalAvailable) {
    return { error: "Insufficient balance" }
  }
  
  if (amount < 10) {
    return { error: "Minimum withdrawal is 10 USDT" }
  }
  
  try {
    // Calculate 3% platform fee and actual payout
    const platformFee = amount * 0.03;
    const amountAfterFee = amount - platformFee;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await prisma.$transaction(async (tx: any) => {
      // Deduct full amount from wallet balance (includes fee)
      await tx.profile.update({
        where: { id: user.id },
        data: {
          walletBalance: { decrement: amount },
        }
      })
      
      // Create withdrawal request (worker will process instantly)
      const withdrawalRequest = await tx.withdrawalRequest.create({
        data: {
          userId: user.id,
          amount,
          toAddress: address,
          status: "pending",
        }
      })

      // Create transaction record (pending - will be updated to completed by worker)
      // Store withdrawalRequest.id in referenceId so backend can update the correct transaction
      // Transaction amount is the actual amount user receives (after 3% fee)
      await tx.transaction.create({
        data: {
          userId: user.id,
          type: "withdrawal",
          amount: -amountAfterFee,
          status: "pending",
          description: `Withdrawal to ${address.slice(0, 10)}...${address.slice(-6)} (3% fee: ${platformFee.toFixed(2)} USDT)`,
          referenceId: withdrawalRequest.id,
        }
      })
    })

    // Send email notification
    await sendWithdrawalEmail(profile.email, amount, address)
    
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/wallet")
    revalidatePath("/dashboard/transactions")
    
    return { success: true, message: "Withdrawal processing instantly (within seconds)..." }
  } catch (error) {
    console.error("Withdrawal error:", error)
    return { error: "Failed to process withdrawal" }
  }
}

export async function updateProfile(fullName: string, phone: string) {
  const user = await getCurrentUser()
  
  if (!user) {
    return { error: "Not authenticated" }
  }
  
  try {
    await prisma.profile.update({
      where: { id: user.id },
      data: { name: fullName, phone }
    })
    
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/settings")
    
    return { success: true }
  } catch (error) {
    console.error("Update profile error:", error)
    return { error: "Failed to update profile" }
  }
}

export async function updatePassword(newPassword: string) {
  const user = await getCurrentUser()
  
  if (!user) {
    return { error: "Not authenticated" }
  }

  if (newPassword.length < 6) {
    return { error: "Password must be at least 6 characters" }
  }
  
  try {
    const passwordHash = await hashPassword(newPassword)
    
    await prisma.profile.update({
      where: { id: user.id },
      data: { passwordHash }
    })
    
    return { success: true }
  } catch (error) {
    console.error("Update password error:", error)
    return { error: "Failed to update password" }
  }
}

export async function updateUSDTAddress(address: string) {
  const user = await getCurrentUser()
  
  if (!user) {
    return { error: "Not authenticated" }
  }

  if (!address.startsWith("0x") || address.length !== 42) {
    return { error: "Invalid BEP20 address format" }
  }
  
  try {
    await prisma.profile.update({
      where: { id: user.id },
      data: { usdtAddress: address }
    })
    
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/settings")
    revalidatePath("/dashboard/wallet")
    
    return { success: true }
  } catch (error) {
    console.error("Update USDT address error:", error)
    return { error: "Failed to save address" }
  }
}
