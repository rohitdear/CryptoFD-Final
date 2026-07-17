export interface Profile {
  id: string
  email: string
  name: string | null
  phone: string | null
  referralCode: string
  referredBy: string | null
  walletBalance: number
  lockedBalance: number
  totalEarnings: number
  referralEarnings: number
  usdtAddress: string | null
  profilePhoto: string | null
  isAdmin?: boolean
  isVerified?: boolean
  createdAt: string | Date
  updatedAt: string | Date
}

export interface FDPlan {
  id: string
  name: string
  minAmount: number
  maxAmount: number
  dailyRoi: number
  durationDays: number
  isActive: boolean
  createdAt: string | Date
}

export interface UserFD {
  id: string
  userId: string
  planId: string
  planName: string
  amount: number
  dailyEarning: number
  totalEarned: number
  startDate: string | Date
  endDate: string | Date
  status: "active" | "completed" | "cancelled"
  lastPayoutDate: string | Date
  createdAt: string | Date
  plan?: FDPlan
}

export interface Transaction {
  id: string
  userId: string
  type: "deposit" | "withdrawal" | "fd_earning" | "referral_earning" | "fd_investment" | "fd_maturity" | "cold_sweep"
  amount: number
  status: "pending" | "completed" | "failed" | "cancelled"
  txHash: string | null
  description: string | null
  referenceId: string | null
  createdAt: string | Date
}

export interface Referral {
  id: string
  referrerId: string
  referredId: string
  level: number
  createdAt: string | Date
  referred?: Profile
}

export interface TeamStats {
  level: number
  count: number
  totalEarned: number
  commissionRate: number
}

export interface DashboardStats {
  totalBalance: number
  availableBalance: number
  lockedBalance: number
  fdEarnings: number
  referralEarnings: number
  totalTeamMembers: number
  activeFDs: number
}
