import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getProfile, getTeamStats } from "@/lib/queries"
import { ReferralClient } from "./referral-client"

export default async function ReferralPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  const [profile, teamStats] = await Promise.all([
    getProfile(),
    getTeamStats(),
  ])

  const totalReferrals = teamStats.reduce((acc, s) => acc + s.count, 0)
  const totalEarnings = Number(profile?.referralEarnings || 0)

  // Calculate earnings by level
  const levelEarnings = teamStats.map((stat) => ({
    level: stat.level,
    referrals: stat.count,
    earnings: stat.totalEarned,
    commission: stat.commissionRate,
  }))

  return (
    <ReferralClient
      referralCode={profile?.referralCode || ""}
      totalEarnings={totalEarnings}
      totalReferrals={totalReferrals}
      levelEarnings={levelEarnings}
    />
  )
}
