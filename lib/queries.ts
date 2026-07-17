"use server"

import prisma from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import type { FDPlan, UserFD, Transaction, TeamStats, DashboardStats, Referral, Profile } from "./types"

export async function getProfile(): Promise<Profile | null> {
  const user = await getCurrentUser()
  if (!user) return null

  // Fetch profilePhoto from profile table
  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { profilePhoto: true }
  })

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    referralCode: user.referralCode,
    referredBy: user.referredBy,
    walletBalance: Number(user.walletBalance),
    lockedBalance: Number(user.lockedBalance),
    totalEarnings: Number(user.totalEarnings),
    referralEarnings: Number(user.referralEarnings),
    usdtAddress: user.usdtAddress,
    profilePhoto: profile?.profilePhoto || null,
    isAdmin: user.isAdmin,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    updatedAt: user.createdAt, // Use createdAt as fallback
  }
}

export async function getFDPlans(): Promise<FDPlan[]> {
  const plans = await prisma.fdPlan.findMany({
    where: { isActive: true },
    orderBy: { minAmount: "asc" }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return plans.map((p: any) => ({
    id: p.id,
    name: p.name,
    minAmount: Number(p.minAmount),
    maxAmount: Number(p.maxAmount),
    dailyRoi: Number(p.dailyRoi),
    durationDays: p.durationDays,
    isActive: p.isActive,
    createdAt: p.createdAt.toISOString(),
  }))
}

export async function getUserFDs(status?: string): Promise<UserFD[]> {
  const user = await getCurrentUser()
  if (!user) return []

  const fds = await prisma.userFd.findMany({
    where: {
      userId: user.id,
      ...(status ? { status } : {})
    },
    include: {
      plan: true
    },
    orderBy: { createdAt: "desc" }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return fds.map((fd: any) => ({
    id: fd.id,
    userId: fd.userId,
    planId: fd.planId,
    planName: fd.planName || fd.plan?.name || "Unknown",
    amount: Number(fd.amount),
    dailyEarning: Number(fd.dailyEarning),
    totalEarned: Number(fd.totalEarned),
    startDate: fd.startDate.toISOString(),
    endDate: fd.endDate.toISOString(),
    status: fd.status,
    lastPayoutDate: fd.lastEarningAt?.toISOString() || fd.startDate.toISOString(),
    createdAt: fd.createdAt.toISOString(),
    plan: fd.plan ? {
      id: fd.plan.id,
      name: fd.plan.name,
      minAmount: Number(fd.plan.minAmount),
      maxAmount: Number(fd.plan.maxAmount),
      dailyRoi: Number(fd.plan.dailyRoi),
      durationDays: fd.plan.durationDays,
      isActive: fd.plan.isActive,
      createdAt: fd.plan.createdAt.toISOString(),
    } : undefined
  }))
}

export async function getTransactions(limit?: number): Promise<Transaction[]> {
  const user = await getCurrentUser()
  if (!user) return []

  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: limit || undefined
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return transactions.map((tx: any) => ({
    id: tx.id,
    userId: tx.userId,
    type: tx.type,
    amount: Number(tx.amount),
    status: tx.status,
    txHash: tx.txHash,
    description: tx.description,
    referenceId: tx.referenceId || null,
    createdAt: tx.createdAt.toISOString(),
  }))
}

export async function getReferrals(): Promise<Referral[]> {
  const user = await getCurrentUser()
  if (!user) return []

  const referrals = await prisma.referral.findMany({
    where: { referrerId: user.id },
    include: {
      referred: {
        select: { id: true, name: true, createdAt: true }
      }
    },
    orderBy: { level: "asc" }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return referrals.map((r: any) => ({
    id: r.id,
    referrerId: r.referrerId,
    referredId: r.referredId,
    level: r.level,
    createdAt: r.createdAt.toISOString(),
    referred: r.referred ? {
      id: r.referred.id,
      email: "",
      name: r.referred.name,
      phone: null,
      referralCode: "",
      referredBy: null,
      walletBalance: 0,
      lockedBalance: 0,
      totalEarnings: 0,
      referralEarnings: 0,
      usdtAddress: null,
      profilePhoto: null,
      createdAt: r.referred.createdAt.toISOString(),
      updatedAt: r.referred.createdAt.toISOString(),
    } : undefined
  }))
}

export async function getTeamStats(): Promise<TeamStats[]> {
  const user = await getCurrentUser()
  if (!user) return []

  const referrals = await prisma.referral.findMany({
    where: { referrerId: user.id }
  })

  // Commission rates by level
  const commissionRates: Record<number, number> = { 1: 10, 2: 5, 3: 2 }

  // Get all referral_commission transactions for THIS user (the referrer)
  const myCommissions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      type: "referral_commission" as string
    }
  })

  // Group by level and calculate earnings
  const statsMap = new Map<number, TeamStats>()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const ref of referrals as any[]) {
    const level = ref.level
    const existing = statsMap.get(level) || {
      level,
      count: 0,
      totalEarned: 0,
      commissionRate: commissionRates[level] || 0
    }
    existing.count++
    statsMap.set(level, existing)
  }

  // Sum all commissions by level
  for (const transaction of myCommissions) {
    // Extract level from description: "Level 1 referral commission (10%)"
    const levelMatch = transaction.description?.match(/Level (\d)/);
    if (levelMatch) {
      const level = parseInt(levelMatch[1]);
      const stat = statsMap.get(level);
      if (stat) {
        stat.totalEarned += Number(transaction.amount || 0);
      }
    }
  }

  return Array.from(statsMap.values()).sort((a, b) => a.level - b.level)
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const profile = await getProfile()
  
  if (!profile) {
    return {
      totalBalance: 0,
      availableBalance: 0,
      lockedBalance: 0,
      fdEarnings: 0,
      referralEarnings: 0,
      totalTeamMembers: 0,
      activeFDs: 0,
    }
  }

  // Get active FDs count
  const activeFDsCount = await prisma.userFd.count({
    where: { userId: profile.id, status: "active" }
  })

  // Get team members count
  const teamCount = await prisma.referral.count({
    where: { referrerId: profile.id }
  })

  // Available balance = wallet_balance (includes all earnings)
  const availableBalance = profile.walletBalance

  return {
    totalBalance: availableBalance + profile.lockedBalance,
    availableBalance: availableBalance,
    lockedBalance: profile.lockedBalance,
    fdEarnings: profile.totalEarnings,
    referralEarnings: profile.referralEarnings,
    totalTeamMembers: teamCount,
    activeFDs: activeFDsCount,
  }
}

export async function getEarningsHistory(days: number = 30): Promise<{ date: string; fdEarning: number; referralEarning: number }[]> {
  const user = await getCurrentUser()
  if (!user) return []

  const fromDate = new Date()
  fromDate.setDate(fromDate.getDate() - days)

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      type: { in: ["fd_earning", "referral_commission"] },
      status: "completed",
      createdAt: { gte: fromDate }
    },
    orderBy: { createdAt: "asc" }
  })

  if (transactions.length === 0) return []

  // Group by date
  const earningsMap = new Map<string, { fdEarning: number; referralEarning: number }>()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const tx of transactions as any[]) {
    const date = tx.createdAt.toISOString().split("T")[0]
    const existing = earningsMap.get(date) || { fdEarning: 0, referralEarning: 0 }

    if (tx.type === "fd_earning") {
      existing.fdEarning += Number(tx.amount)
    } else {
      existing.referralEarning += Number(tx.amount)
    }

    earningsMap.set(date, existing)
  }

  return Array.from(earningsMap.entries()).map(([date, data]) => ({
    date,
    ...data
  }))
}

export async function getDepositAddress(): Promise<string | null> {
  const user = await getCurrentUser()
  if (!user) return null

  const wallet = await prisma.wallet.findFirst({
    where: { userId: user.id }
  })

  return wallet?.address || null
}

export async function getWithdrawalRequests() {
  const user = await getCurrentUser()
  if (!user) return []

  const requests = await prisma.withdrawalRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return requests.map((r: any) => ({
    id: r.id,
    userId: r.userId,
    amount: Number(r.amount),
    toAddress: r.toAddress,
    status: r.status,
    txHash: r.txHash,
    error: r.error,
    processedAt: r.processedAt?.toISOString() || null,
    createdAt: r.createdAt.toISOString(),
  }))
}
