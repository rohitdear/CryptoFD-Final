import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import type { Profile, Transaction, FDPlan, UserFD } from "@/lib/types"

// Type for FD with relations
export type UserFdWithRelations = UserFD & {
  plan: FDPlan
  user?: {
    id: string
    name: string | null
    walletBalance: number
  }
}

export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.isAdmin === true
}

export async function getAdminDashboardStats() {
  // Get total users
  const totalUsers = await prisma.profile.count()
  
  // Get total deposits (completed)
  const deposits = await prisma.transaction.findMany({
    where: { type: "deposit", status: "completed" },
    select: { amount: true }
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalDeposits = deposits.reduce((acc: number, d: any) => acc + Math.abs(Number(d.amount)), 0)
  
  // Get total withdrawals (completed)
  const withdrawals = await prisma.transaction.findMany({
    where: { type: "withdrawal", status: "completed" },
    select: { amount: true }
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalWithdrawals = withdrawals.reduce((acc: number, w: any) => acc + Math.abs(Number(w.amount)), 0)
  
  // Get active FDs
  const activeFDs = await prisma.userFd.findMany({
    where: { status: "active" },
    select: { amount: true }
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalActiveInvestment = activeFDs.reduce((acc: number, fd: any) => acc + Number(fd.amount), 0)
  const activeFDCount = activeFDs.length
  
  // Get pending withdrawals
  const pendingWithdrawals = await prisma.transaction.count({
    where: { type: "withdrawal", status: "pending" }
  })
  
  // Get pending deposits
  const pendingDeposits = await prisma.transaction.count({
    where: { type: "deposit", status: "pending" }
  })
  
  return {
    totalUsers,
    totalDeposits,
    totalWithdrawals,
    totalActiveInvestment,
    activeFDCount,
    pendingWithdrawals,
    pendingDeposits,
  }
}

export async function getAllUsers(limit?: number): Promise<Profile[]> {
  const users = await prisma.profile.findMany({
    orderBy: { createdAt: "desc" },
    take: limit || undefined
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return users.map((u: any) => ({
    ...u,
    walletBalance: Number(u.walletBalance),
    lockedBalance: Number(u.lockedBalance),
    totalEarnings: Number(u.totalEarnings),
    referralEarnings: Number(u.referralEarnings),
  }))
}

export async function getAllTransactions(limit?: number, status?: string, type?: string): Promise<Transaction[]> {
  const transactions = await prisma.transaction.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(type ? { type } : {})
    },
    orderBy: { createdAt: "desc" },
    take: limit || undefined
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return transactions.map((t: any) => ({
    ...t,
    amount: Number(t.amount),
  }))
}

export async function getAllFDs(status?: string): Promise<UserFdWithRelations[]> {
  const fds = await prisma.userFd.findMany({
    where: status ? { status } : {},
    include: {
      plan: true,
      user: {
        select: { id: true, name: true, walletBalance: true }
      }
    },
    orderBy: { createdAt: "desc" }
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return fds.map((fd: any) => ({
    ...fd,
    amount: Number(fd.amount),
    dailyEarning: Number(fd.dailyEarning),
    totalEarned: Number(fd.totalEarned),
    plan: {
      ...fd.plan,
      minAmount: Number(fd.plan.minAmount),
      maxAmount: Number(fd.plan.maxAmount),
      dailyRoi: Number(fd.plan.dailyRoi),
    },
    user: fd.user ? {
      ...fd.user,
      walletBalance: Number(fd.user.walletBalance)
    } : undefined
  }))
}

export async function getUserById(userId: string): Promise<Profile | null> {
  const user = await prisma.profile.findUnique({
    where: { id: userId }
  })
  if (!user) return null
  return {
    ...user,
    walletBalance: Number(user.walletBalance),
    lockedBalance: Number(user.lockedBalance),
    totalEarnings: Number(user.totalEarnings),
    referralEarnings: Number(user.referralEarnings),
  }
}

export async function getUserTransactions(userId: string): Promise<Transaction[]> {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return transactions.map((t: any) => ({
    ...t,
    amount: Number(t.amount),
  }))
}

export async function getUserFDs(userId: string): Promise<UserFdWithRelations[]> {
  const fds = await prisma.userFd.findMany({
    where: { userId },
    include: { plan: true },
    orderBy: { createdAt: "desc" }
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return fds.map((fd: any) => ({
    ...fd,
    amount: Number(fd.amount),
    dailyEarning: Number(fd.dailyEarning),
    totalEarned: Number(fd.totalEarned),
    plan: {
      ...fd.plan,
      minAmount: Number(fd.plan.minAmount),
      maxAmount: Number(fd.plan.maxAmount),
      dailyRoi: Number(fd.plan.dailyRoi),
    }
  }))
}

export async function getAdminFDPlans(): Promise<FDPlan[]> {
  const plans = await prisma.fdPlan.findMany({
    orderBy: { minAmount: "asc" }
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return plans.map((p: any) => ({
    ...p,
    minAmount: Number(p.minAmount),
    maxAmount: Number(p.maxAmount),
    dailyRoi: Number(p.dailyRoi),
  }))
}

// Analytics: Top depositors by total deposits
export async function getTopDepositors(limit: number = 10) {
  const deposits = await prisma.transaction.groupBy({
    by: ['userId'],
    where: { 
      type: 'deposit', 
      status: 'completed' 
    },
    _sum: { amount: true },
    _count: { id: true },
    orderBy: { _sum: { amount: 'desc' } },
    take: limit
  })
  
  // Get user details
  const userIds = deposits.map(d => d.userId)
  const users = await prisma.profile.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true, createdAt: true, walletBalance: true, lockedBalance: true }
  })
  
  const userMap = new Map(users.map(u => [u.id, u]))
  
  return deposits.map(d => ({
    userId: d.userId,
    totalDeposits: Number(d._sum.amount) || 0,
    depositCount: d._count.id,
    user: userMap.get(d.userId) ? {
      name: userMap.get(d.userId)!.name,
      email: userMap.get(d.userId)!.email,
      createdAt: userMap.get(d.userId)!.createdAt,
      walletBalance: Number(userMap.get(d.userId)!.walletBalance),
      lockedBalance: Number(userMap.get(d.userId)!.lockedBalance),
    } : null
  }))
}

// Analytics: Top team leaders by referral count and earnings
export async function getTopTeamLeaders(limit: number = 10) {
  // Get referral counts for each referrer (level 1 direct referrals)
  const referralCounts = await prisma.referral.groupBy({
    by: ['referrerId'],
    where: { level: 1 },
    _count: { id: true }
  })
  
  // Get all referrals for team size calculation (all levels)
  const allReferrals = await prisma.referral.groupBy({
    by: ['referrerId'],
    _count: { id: true }
  })
  
  // Get user details with referral earnings
  const referrerIds = [...new Set([...referralCounts.map(r => r.referrerId), ...allReferrals.map(r => r.referrerId)])]
  const users = await prisma.profile.findMany({
    where: { id: { in: referrerIds } },
    select: { 
      id: true, 
      name: true, 
      email: true, 
      referralEarnings: true, 
      createdAt: true,
      walletBalance: true
    }
  })
  
  const userMap = new Map(users.map(u => [u.id, u]))
  const directReferralMap = new Map(referralCounts.map(r => [r.referrerId, r._count.id]))
  const totalTeamMap = new Map(allReferrals.map(r => [r.referrerId, r._count.id]))
  
  // Build the result array sorted by referral earnings
  const result = users
    .map(user => ({
      userId: user.id,
      name: user.name,
      email: user.email,
      directReferrals: directReferralMap.get(user.id) || 0,
      totalTeamSize: totalTeamMap.get(user.id) || 0,
      referralEarnings: Number(user.referralEarnings),
      walletBalance: Number(user.walletBalance),
      createdAt: user.createdAt
    }))
    .sort((a, b) => b.referralEarnings - a.referralEarnings)
    .slice(0, limit)
  
  return result
}

// Analytics: Get overall platform referral stats
export async function getReferralStats() {
  const totalReferrals = await prisma.referral.count()
  const level1Referrals = await prisma.referral.count({ where: { level: 1 } })
  const level2Referrals = await prisma.referral.count({ where: { level: 2 } })
  const level3Referrals = await prisma.referral.count({ where: { level: 3 } })
  
  // Total referral earnings paid out
  const referralTransactions = await prisma.transaction.findMany({
    where: { type: 'referral_commission', status: 'completed' },
    select: { amount: true }
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalReferralEarnings = referralTransactions.reduce((acc: number, t: any) => acc + Number(t.amount), 0)
  
  // Users with at least one referral
  const usersWithReferrals = await prisma.referral.groupBy({
    by: ['referrerId'],
    _count: { id: true }
  })
  
  return {
    totalReferrals,
    level1Referrals,
    level2Referrals,
    level3Referrals,
    totalReferralEarnings,
    usersWithReferrals: usersWithReferrals.length
  }
}

// Get all withdrawal requests
export async function getWithdrawalRequests() {
  const requests = await prisma.withdrawalRequest.findMany({
    orderBy: { createdAt: "desc" }
  })
  return requests
}

// Analytics: Top FD creators (by number of FDs and total invested)
export async function getTopFDCreators(limit: number = 20) {
  const fdStats = await prisma.userFd.groupBy({
    by: ['userId'],
    _count: { id: true },
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
    take: limit
  })
  
  const userIds = fdStats.map(fd => fd.userId)
  const users = await prisma.profile.findMany({
    where: { id: { in: userIds } },
    select: { 
      id: true, 
      name: true, 
      email: true, 
      createdAt: true, 
      walletBalance: true, 
      lockedBalance: true,
      totalEarnings: true 
    }
  })
  
  // Get active FD count per user
  const activeFDs = await prisma.userFd.groupBy({
    by: ['userId'],
    where: { status: 'active' },
    _count: { id: true },
    _sum: { amount: true }
  })
  
  const userMap = new Map(users.map(u => [u.id, u]))
  const activeFDMap = new Map(activeFDs.map(fd => [fd.userId, { count: fd._count.id, amount: Number(fd._sum.amount) || 0 }]))
  
  return fdStats.map(fd => ({
    userId: fd.userId,
    totalFDs: fd._count.id,
    totalInvested: Number(fd._sum.amount) || 0,
    activeFDs: activeFDMap.get(fd.userId)?.count || 0,
    activeInvestment: activeFDMap.get(fd.userId)?.amount || 0,
    user: userMap.get(fd.userId) ? {
      name: userMap.get(fd.userId)!.name,
      email: userMap.get(fd.userId)!.email,
      createdAt: userMap.get(fd.userId)!.createdAt,
      walletBalance: Number(userMap.get(fd.userId)!.walletBalance),
      lockedBalance: Number(userMap.get(fd.userId)!.lockedBalance),
      totalEarnings: Number(userMap.get(fd.userId)!.totalEarnings),
    } : null
  }))
}

// Analytics: Comprehensive user stats with earnings breakdown
export async function getUserDetailedStats(limit: number = 50) {
  const users = await prisma.profile.findMany({
    orderBy: { totalEarnings: 'desc' },
    take: limit,
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      walletBalance: true,
      lockedBalance: true,
      totalEarnings: true,
      referralEarnings: true,
      referralCode: true,
      withdrawalDisabled: true,
    }
  })
  
  // Get FD stats per user
  const fdStats = await prisma.userFd.groupBy({
    by: ['userId'],
    _count: { id: true },
    _sum: { amount: true, totalEarned: true }
  })
  
  // Get deposit stats per user
  const depositStats = await prisma.transaction.groupBy({
    by: ['userId'],
    where: { type: 'deposit', status: 'completed' },
    _sum: { amount: true },
    _count: { id: true }
  })
  
  // Get referral team size
  const teamStats = await prisma.referral.groupBy({
    by: ['referrerId'],
    _count: { id: true }
  })
  
  // Get team earnings (earnings generated by team members)
  const teamMemberIds = await prisma.referral.findMany({
    select: { referrerId: true, referredId: true }
  })
  
  // Calculate team earnings per referrer
  const teamEarningsMap = new Map<string, number>()
  for (const ref of teamMemberIds) {
    const memberFDEarnings = await prisma.userFd.aggregate({
      where: { userId: ref.referredId },
      _sum: { totalEarned: true }
    })
    const currentEarnings = teamEarningsMap.get(ref.referrerId) || 0
    teamEarningsMap.set(ref.referrerId, currentEarnings + (Number(memberFDEarnings._sum.totalEarned) || 0))
  }
  
  const fdStatsMap = new Map(fdStats.map(fd => [fd.userId, { 
    count: fd._count.id, 
    invested: Number(fd._sum.amount) || 0,
    earned: Number(fd._sum.totalEarned) || 0 
  }]))
  const depositStatsMap = new Map(depositStats.map(d => [d.userId, { 
    count: d._count.id, 
    total: Number(d._sum.amount) || 0 
  }]))
  const teamStatsMap = new Map(teamStats.map(t => [t.referrerId, t._count.id]))
  
  return users.map(user => {
    const daysActive = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    const monthsActive = Math.floor(daysActive / 30)
    const fdEarnings = fdStatsMap.get(user.id)?.earned || 0
    
    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      referralCode: user.referralCode,
      createdAt: user.createdAt,
      daysActive,
      monthsActive,
      walletBalance: Number(user.walletBalance),
      lockedBalance: Number(user.lockedBalance),
      totalEarnings: Number(user.totalEarnings),
      fdEarnings,
      referralEarnings: Number(user.referralEarnings),
      totalDeposits: depositStatsMap.get(user.id)?.total || 0,
      depositCount: depositStatsMap.get(user.id)?.count || 0,
      totalFDs: fdStatsMap.get(user.id)?.count || 0,
      totalInvested: fdStatsMap.get(user.id)?.invested || 0,
      teamSize: teamStatsMap.get(user.id) || 0,
      teamGeneratedEarnings: teamEarningsMap.get(user.id) || 0,
      withdrawalDisabled: user.withdrawalDisabled || false,
    }
  })
}

// Analytics: Get users most likely to deposit (active users with history)
export async function getHighPotentialDepositors(limit: number = 20) {
  // Get users with deposit history, sorted by frequency and recency
  const recentDeposits = await prisma.transaction.findMany({
    where: { type: 'deposit', status: 'completed' },
    orderBy: { createdAt: 'desc' },
    select: { userId: true, amount: true, createdAt: true }
  })
  
  // Calculate deposit frequency and recency score
  const userDepositStats = new Map<string, { 
    count: number, 
    total: number, 
    lastDeposit: Date,
    avgDeposit: number 
  }>()
  
  for (const dep of recentDeposits) {
    const stats = userDepositStats.get(dep.userId)
    if (stats) {
      stats.count++
      stats.total += Number(dep.amount)
      if (dep.createdAt > stats.lastDeposit) {
        stats.lastDeposit = dep.createdAt
      }
      stats.avgDeposit = stats.total / stats.count
    } else {
      userDepositStats.set(dep.userId, {
        count: 1,
        total: Number(dep.amount),
        lastDeposit: dep.createdAt,
        avgDeposit: Number(dep.amount)
      })
    }
  }
  
  // Get user details
  const userIds = Array.from(userDepositStats.keys())
  const users = await prisma.profile.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      name: true,
      email: true,
      walletBalance: true,
      lockedBalance: true,
      createdAt: true
    }
  })
  
  const userMap = new Map(users.map(u => [u.id, u]))
  
  // Score users: frequency * recency * average amount
  const scoredUsers = Array.from(userDepositStats.entries()).map(([userId, stats]) => {
    const daysSinceLastDeposit = Math.floor((Date.now() - stats.lastDeposit.getTime()) / (1000 * 60 * 60 * 24))
    const recencyScore = Math.max(0, 100 - daysSinceLastDeposit) // Higher for recent
    const frequencyScore = Math.min(stats.count * 10, 100)
    const amountScore = Math.min(stats.avgDeposit / 10, 100)
    const totalScore = (recencyScore * 0.4) + (frequencyScore * 0.3) + (amountScore * 0.3)
    
    return {
      userId,
      score: Math.round(totalScore),
      depositCount: stats.count,
      totalDeposited: stats.total,
      avgDeposit: stats.avgDeposit,
      lastDeposit: stats.lastDeposit,
      daysSinceLastDeposit,
      user: userMap.get(userId) ? {
        name: userMap.get(userId)!.name,
        email: userMap.get(userId)!.email,
        walletBalance: Number(userMap.get(userId)!.walletBalance),
        lockedBalance: Number(userMap.get(userId)!.lockedBalance),
        createdAt: userMap.get(userId)!.createdAt,
      } : null
    }
  })
  
  return scoredUsers
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

// Analytics: Platform earnings summary
export async function getPlatformEarningsSummary() {
  // Total FD earnings paid to users
  const fdEarnings = await prisma.transaction.aggregate({
    where: { type: 'fd_earning', status: 'completed' },
    _sum: { amount: true }
  })
  
  // Total referral commissions paid
  const referralCommissions = await prisma.transaction.aggregate({
    where: { type: 'referral_commission', status: 'completed' },
    _sum: { amount: true }
  })
  
  // Total deposits received
  const totalDeposits = await prisma.transaction.aggregate({
    where: { type: 'deposit', status: 'completed' },
    _sum: { amount: true }
  })
  
  // Total withdrawals sent
  const totalWithdrawals = await prisma.transaction.aggregate({
    where: { type: 'withdrawal', status: 'completed' },
    _sum: { amount: true }
  })
  
  // Active investment (locked in FDs)
  const activeInvestment = await prisma.userFd.aggregate({
    where: { status: 'active' },
    _sum: { amount: true }
  })
  
  return {
    totalFDEarningsPaid: Number(fdEarnings._sum.amount) || 0,
    totalReferralCommissionsPaid: Number(referralCommissions._sum.amount) || 0,
    totalDepositsReceived: Number(totalDeposits._sum.amount) || 0,
    totalWithdrawalsSent: Math.abs(Number(totalWithdrawals._sum.amount) || 0),
    activeInvestment: Number(activeInvestment._sum.amount) || 0,
    netPlatformBalance: (Number(totalDeposits._sum.amount) || 0) - Math.abs(Number(totalWithdrawals._sum.amount) || 0),
  }
}
