"use server"

import { prisma } from "@/lib/db"
import { requireAdminSession } from "@/lib/admin-auth"
import { revalidatePath } from "next/cache"

// Admin balance management
export async function addUserBalance(userId: string, amount: number, description?: string) {
  await requireAdminSession()
  
  if (amount <= 0) {
    return { error: "Amount must be positive" }
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await prisma.$transaction(async (prismaClient: any) => {
    await prismaClient.profile.update({
      where: { id: userId },
      data: {
        walletBalance: { increment: amount }
      }
    })
    
    await prismaClient.transaction.create({
      data: {
        userId,
        type: "deposit",
        amount: amount,
        status: "completed",
        description: description || "Admin credit",
      }
    })
  })
  
  revalidatePath("/admin")
  revalidatePath("/admin/users")
  
  return { success: true }
}

export async function deductUserBalance(userId: string, amount: number, description?: string) {
  await requireAdminSession()
  
  if (amount <= 0) {
    return { error: "Amount must be positive" }
  }
  
  const profile = await prisma.profile.findUnique({
    where: { id: userId }
  })
  
  if (!profile) {
    return { error: "User not found" }
  }
  
  if (Number(profile.walletBalance) < amount) {
    return { error: "Insufficient balance" }
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await prisma.$transaction(async (prismaClient: any) => {
    await prismaClient.profile.update({
      where: { id: userId },
      data: {
        walletBalance: { decrement: amount }
      }
    })
    
    await prismaClient.transaction.create({
      data: {
        userId,
        type: "withdrawal",
        amount: -amount,
        status: "completed",
        description: description || "Admin debit",
      }
    })
  })
  
  revalidatePath("/admin")
  revalidatePath("/admin/users")
  
  return { success: true }
}

export async function setUserAdmin(userId: string, isAdminStatus: boolean) {
  await requireAdminSession()
  
  await prisma.profile.update({
    where: { id: userId },
    data: { isAdmin: isAdminStatus }
  })
  
  revalidatePath("/admin/users")
  
  return { success: true }
}

// Toggle user withdrawal access
export async function toggleUserWithdrawal(userId: string, disabled: boolean) {
  await requireAdminSession()
  
  await prisma.profile.update({
    where: { id: userId },
    data: { withdrawalDisabled: disabled }
  })
  
  revalidatePath("/admin/users")
  revalidatePath("/admin/analytics")
  
  return { success: true }
}

// FD Plan management
export async function createFDPlan(
  name: string,
  minAmount: number,
  maxAmount: number,
  dailyRoi: number,
  durationDays: number
) {
  await requireAdminSession()
  
  const activeCount = await prisma.fdPlan.count({
    where: { isActive: true }
  })
  
  if (activeCount >= 6) {
    return { error: "Maximum 6 FD plans allowed. Please deactivate an existing plan first." }
  }
  
  if (minAmount >= maxAmount) {
    return { error: "Min amount must be less than max amount" }
  }
  
  if (dailyRoi <= 0 || dailyRoi > 10) {
    return { error: "Daily ROI must be between 0 and 10%" }
  }
  
  await prisma.fdPlan.create({
    data: {
      name,
      minAmount,
      maxAmount,
      dailyRoi,
      durationDays,
      isActive: true,
    }
  })
  
  revalidatePath("/admin/plans")
  
  return { success: true }
}

export async function updateFDPlan(
  planId: string,
  name: string,
  minAmount: number,
  maxAmount: number,
  dailyRoi: number,
  durationDays: number,
  isActive: boolean
) {
  await requireAdminSession()
  
  await prisma.fdPlan.update({
    where: { id: planId },
    data: {
      name,
      minAmount,
      maxAmount,
      dailyRoi,
      durationDays,
      isActive,
    }
  })
  
  revalidatePath("/admin/plans")
  
  return { success: true }
}

export async function togglePlanStatus(planId: string, isActive: boolean) {
  await requireAdminSession()
  
  await prisma.fdPlan.update({
    where: { id: planId },
    data: { isActive }
  })
  
  revalidatePath("/admin/plans")
  
  return { success: true }
}

export async function deleteFDPlan(planId: string) {
  await requireAdminSession()
  
  const activeCount = await prisma.userFd.count({
    where: { planId, status: "active" }
  })
  
  if (activeCount > 0) {
    return { error: "Cannot delete plan with active FDs" }
  }
  
  await prisma.fdPlan.update({
    where: { id: planId },
    data: { isActive: false }
  })
  
  revalidatePath("/admin/plans")
  
  return { success: true }
}

// Alias functions for backwards compatibility
export async function deletePlan(planId: string) {
  return deleteFDPlan(planId)
}

export async function createPlan(data: {
  name: string
  min_amount: number
  max_amount: number
  daily_roi: number
  duration_days: number
}) {
  return createFDPlan(
    data.name,
    data.min_amount,
    data.max_amount,
    data.daily_roi,
    data.duration_days
  )
}
