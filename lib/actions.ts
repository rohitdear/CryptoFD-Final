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
    where: { id: user.id },
  })

  if (!profile) {
    return { error: "Profile not found" }
  }

  // Get the plan details
  const plan = await prisma.fdPlan.findUnique({
    where: {
      id: planId,
      isActive: true,
    },
  })

  if (!plan) {
    return { error: "Plan not found" }
  }

  // Validate amount
  if (
    amount < Number(plan.minAmount) ||
    amount > Number(plan.maxAmount)
  ) {
    return {
      error: `Amount must be between ${plan.minAmount} and ${plan.maxAmount} USDT`,
    }
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
    // ============================================================
    // CREATE FD + DEDUCT BALANCE + PROCESS FIRST-FD REFERRAL
    // ============================================================
    const result = await prisma.$transaction(async (tx) => {
      // ------------------------------------------------------------
      // Check whether this is the user's FIRST FD
      // ------------------------------------------------------------
      const existingFD = await tx.userFd.findFirst({
        where: {
          userId: user.id,
        },
        select: {
          id: true,
        },
      })

      const isFirstFD = !existingFD

      // ------------------------------------------------------------
      // Update balance
      // ------------------------------------------------------------
      await tx.profile.update({
        where: {
          id: user.id,
        },
        data: {
          walletBalance: {
            decrement: amount,
          },
          lockedBalance: {
            increment: amount,
          },
        },
      })

      // ------------------------------------------------------------
      // Create FD
      // ------------------------------------------------------------
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
        },
      })

      // ------------------------------------------------------------
      // Create FD investment transaction
      // ------------------------------------------------------------
      await tx.transaction.create({
        data: {
          userId: user.id,
          type: "fd_investment",
          amount: -amount,
          status: "completed",
          description: `Investment in ${plan.name} plan`,
        },
      })

      // ------------------------------------------------------------
      // FIRST FD ONLY:
      // Process referral commissions
      //
      // Level 1 = 10%
      // Level 2 = 5%
      // Level 3 = 2%
      // ------------------------------------------------------------
      if (isFirstFD) {
        await processReferralCommissions(
          tx,
          user.id,
          fd.id,
          amount
        )
      }

      return {
        fd,
        isFirstFD,
      }
    })

    // Revalidate pages
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/my-fds")
    revalidatePath("/dashboard/wallet")
    revalidatePath("/dashboard/transactions")

    return {
      success: true,
      fdId: result.fd.id,
    }
  } catch (error) {
    console.error("Create FD error:", error)

    return {
      error: "Failed to create FD",
    }
  }
}

// ================================================================
// REFERRAL COMMISSIONS
// ================================================================
//
// Commission is paid ONLY when the referred user creates
// their FIRST FD.
//
// Level 1 = 10%
// Level 2 = 5%
// Level 3 = 2%
//
// Example:
//
// User C creates first FD of 100 USDT
//
// User B (Level 1) = 10 USDT
// User A (Level 2) = 5 USDT
// User X (Level 3) = 2 USDT
//
// If User C creates another FD later:
// NO referral commission is paid.
// ================================================================

async function processReferralCommissions(
  tx: any,
  userId: string,
  fdId: string,
  fdAmount: number
) {
  const commissionRates: Record<number, number> = {
    1: 10,
    2: 5,
    3: 2,
  }

  // Get referrers for this user
  const referrers = await tx.referral.findMany({
    where: {
      referredId: userId,
    },
  })

  if (referrers.length === 0) {
    return
  }

  // Process each referral level
  for (const ref of referrers) {
    const rate = commissionRates[ref.level] || 0

    if (rate === 0) {
      continue
    }

    const commission = (fdAmount * rate) / 100

    // ------------------------------------------------------------
    // Add commission to referrer's profile
    // ------------------------------------------------------------
    await tx.profile.update({
      where: {
        id: ref.referrerId,
      },
      data: {
        referralEarnings: {
          increment: commission,
        },
        walletBalance: {
          increment: commission,
        },
      },
    })

    // ------------------------------------------------------------
    // Create commission transaction
    // ------------------------------------------------------------
    await tx.transaction.create({
      data: {
        userId: ref.referrerId,
        type: "referral_commission",
        amount: commission,
        status: "completed",
        description: `Level ${ref.level} referral commission (${rate}%)`,
        referenceId: fdId,
      },
    })
  }
}

// ================================================================
// WITHDRAWAL REQUEST
// ================================================================

export async function requestWithdrawal(
  amount: number,
  address: string
) {
  const user = await getCurrentUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const profile = await prisma.profile.findUnique({
    where: {
      id: user.id,
    },
  })

  if (!profile) {
    return { error: "Profile not found" }
  }

  // Check if withdrawal is disabled for this user
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((profile as any).withdrawalDisabled) {
    return {
      error:
        "Withdrawals are currently disabled for your account. Please contact support.",
    }
  }

  // Check if today is Saturday or Sunday
  const today = new Date()
  const dayOfWeek = today.getDay()

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return {
      error:
        "Withdrawals are not available on weekends. Please try again on a weekday.",
    }
  }

  // Available balance
  const totalAvailable = Number(profile.walletBalance)

  if (amount > totalAvailable) {
    return {
      error: "Insufficient balance",
    }
  }

  // Minimum withdrawal
  if (amount < 10) {
    return {
      error: "Minimum withdrawal is 10 USDT",
    }
  }

  try {
    // ------------------------------------------------------------
    // Calculate 3% platform fee
    // ------------------------------------------------------------
    const platformFee = amount * 0.03
    const amountAfterFee = amount - platformFee

    await prisma.$transaction(async (tx: any) => {
      // ----------------------------------------------------------
      // Deduct full withdrawal amount
      // ----------------------------------------------------------
      await tx.profile.update({
        where: {
          id: user.id,
        },
        data: {
          walletBalance: {
            decrement: amount,
          },
        },
      })

      // ----------------------------------------------------------
      // Create withdrawal request
      // ----------------------------------------------------------
      const withdrawalRequest =
        await tx.withdrawalRequest.create({
          data: {
            userId: user.id,
            amount,
            toAddress: address,
            status: "pending",
          },
        })

      // ----------------------------------------------------------
      // Create pending transaction
      // ----------------------------------------------------------
      await tx.transaction.create({
        data: {
          userId: user.id,
          type: "withdrawal",
          amount: -amountAfterFee,
          status: "pending",
          description: `Withdrawal to ${address.slice(
            0,
            10
          )}...${address.slice(
            -6
          )} (3% fee: ${platformFee.toFixed(2)} USDT)`,
          referenceId: withdrawalRequest.id,
        },
      })
    })

    // Send email notification
    await sendWithdrawalEmail(
      profile.email,
      amount,
      address
    )

    // Revalidate pages
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/wallet")
    revalidatePath("/dashboard/transactions")

    return {
      success: true,
      message:
        "Withdrawal processing instantly (within seconds)...",
    }
  } catch (error) {
    console.error("Withdrawal error:", error)

    return {
      error: "Failed to process withdrawal",
    }
  }
}

// ================================================================
// UPDATE PROFILE
// ================================================================

export async function updateProfile(
  fullName: string,
  phone: string
) {
  const user = await getCurrentUser()

  if (!user) {
    return {
      error: "Not authenticated",
    }
  }

  try {
    await prisma.profile.update({
      where: {
        id: user.id,
      },
      data: {
        name: fullName,
        phone,
      },
    })

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/settings")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Update profile error:", error)

    return {
      error: "Failed to update profile",
    }
  }
}

// ================================================================
// UPDATE PASSWORD
// ================================================================

export async function updatePassword(
  newPassword: string
) {
  const user = await getCurrentUser()

  if (!user) {
    return {
      error: "Not authenticated",
    }
  }

  if (newPassword.length < 6) {
    return {
      error: "Password must be at least 6 characters",
    }
  }

  try {
    const passwordHash = await hashPassword(newPassword)

    await prisma.profile.update({
      where: {
        id: user.id,
      },
      data: {
        passwordHash,
      },
    })

    return {
      success: true,
    }
  } catch (error) {
    console.error("Update password error:", error)

    return {
      error: "Failed to update password",
    }
  }
}

// ================================================================
// UPDATE USDT ADDRESS
// ================================================================

export async function updateUSDTAddress(
  address: string
) {
  const user = await getCurrentUser()

  if (!user) {
    return {
      error: "Not authenticated",
    }
  }

  // Basic BEP20 address validation
  if (
    !address.startsWith("0x") ||
    address.length !== 42
  ) {
    return {
      error: "Invalid BEP20 address format",
    }
  }

  try {
    await prisma.profile.update({
      where: {
        id: user.id,
      },
      data: {
        usdtAddress: address,
      },
    })

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/settings")
    revalidatePath("/dashboard/wallet")

    return {
      success: true,
    }
  } catch (error) {
    console.error(
      "Update USDT address error:",
      error
    )

    return {
      error: "Failed to save address",
    }
  }
}
