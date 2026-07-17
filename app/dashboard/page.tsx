import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getDashboardStats, getTransactions, getTeamStats, getProfile, getEarningsHistory } from "@/lib/queries"
import { BalanceCard } from "@/components/dashboard/balance-card"
import { BalanceTable } from "@/components/dashboard/balance-table"
import { FDEarningsCard, ReferralEarningsCard } from "@/components/dashboard/earnings-card"
import { TeamCard } from "@/components/dashboard/team-card"
import { ActionGrid } from "@/components/dashboard/action-grid"
import { ChartCard } from "@/components/dashboard/chart-card"
import { ActivityTable } from "@/components/dashboard/activity-table"
import { ReferralCard } from "@/components/dashboard/referral-card"
import { TrendingUp, Shield, Clock, Zap, Award, Headphones, Flame, Lightbulb } from "lucide-react"

export default async function DashboardPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  const [stats, transactions, teamStats, profile, earningsHistory] = await Promise.all([
    getDashboardStats(),
    getTransactions(10),
    getTeamStats(),
    getProfile(),
    getEarningsHistory(30),
  ])

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      {/* Premium Welcome Header with Animated Background */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl bg-gradient-to-r from-primary/15 via-primary/5 to-accent/15 border border-primary/30 p-4 sm:p-6 lg:p-8 group">
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-40 sm:w-64 h-40 sm:h-64 bg-primary/10 rounded-full blur-3xl -mr-16 sm:-mr-32 -mt-16 sm:-mt-32 group-hover:scale-110 transition-transform duration-500"></div>
        <div className="absolute bottom-0 left-10 sm:left-20 w-32 sm:w-40 h-32 sm:h-40 bg-accent/10 rounded-full blur-2xl -mb-16 sm:-mb-20 -ml-16 sm:-ml-20 group-hover:scale-125 transition-transform duration-500"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col gap-4 sm:gap-6">
            <div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight">
                Welcome{profile?.name ? ` back, ${profile.name.split(' ')[0]}` : ""}
              </h1>
              <p className="text-muted-foreground mt-2 sm:mt-3 text-sm sm:text-base md:text-lg font-medium leading-relaxed">
                Track your investments, earnings, and referral network at a glance
              </p>
            </div>
            
            {/* Quick Status Pills with Glow */}
            <div className="flex flex-col gap-2 sm:gap-3 w-full sm:w-auto sm:min-w-fit">
              <div className="flex items-center gap-2 sm:gap-3 rounded-full bg-emerald-500/10 px-3 sm:px-6 py-2 sm:py-3 border border-emerald-500/30 backdrop-blur-sm hover:bg-emerald-500/15 hover:border-emerald-500/50 transition-all">
                <div className="flex h-7 sm:h-8 w-7 sm:w-8 items-center justify-center rounded-full bg-emerald-500/20 flex-shrink-0">
                  <Flame className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-emerald-500" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 truncate">
                  {stats.activeFDs} Active FDs
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 rounded-full bg-primary/10 px-3 sm:px-6 py-2 sm:py-3 border border-primary/30 backdrop-blur-sm hover:bg-primary/15 hover:border-primary/50 transition-all">
                <div className="flex h-7 sm:h-8 w-7 sm:w-8 items-center justify-center rounded-full bg-primary/20 flex-shrink-0">
                  <Shield className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-primary" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-primary truncate">
                  Bank-Grade Secure
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Balance Card */}
      <BalanceCard
        totalBalance={stats.totalBalance}
        availableBalance={stats.availableBalance}
        lockedBalance={stats.lockedBalance}
      />

      {/* Balance Overview Table */}
      <BalanceTable
        availableBalance={stats.availableBalance}
        lockedBalance={stats.lockedBalance}
        totalEarnings={stats.fdEarnings}
        referralEarnings={stats.referralEarnings}
      />

      {/* Key Metrics - Enhanced Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <FDEarningsCard
          totalEarnings={stats.fdEarnings}
          activeFDs={stats.activeFDs}
        />
        <ReferralEarningsCard
          totalEarnings={stats.referralEarnings}
          teamStats={teamStats}
        />
        <TeamCard
          totalMembers={stats.totalTeamMembers}
          teamStats={teamStats}
        />
      </div>

      {/* Quick Actions Grid */}
      <ActionGrid />

      {/* Charts & Referral Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard earningsHistory={earningsHistory} />
        </div>
        <ReferralCard referralCode={profile?.referralCode || ""} />
      </div>

      {/* Recent Activity */}
      <ActivityTable transactions={transactions} />

      {/* Trust Indicators - Professional Premium Cards */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Why CryptoFD</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* Security */}
          <div className="group relative rounded-xl sm:rounded-2xl overflow-hidden border border-border bg-card/30 hover:bg-card hover:border-green-500/50 transition-all duration-300 p-4 sm:p-6 hover:shadow-xl hover:shadow-green-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-start sm:items-center gap-3 mb-3">
                <div className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-green-500/10 group-hover:bg-green-500/20 group-hover:scale-110 transition-all duration-300 flex-shrink-0">
                  <Shield className="h-5 sm:h-6 w-5 sm:w-6 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-foreground">Bank-Grade</p>
                  <p className="text-xs text-muted-foreground">Security</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground/70 leading-relaxed">SSL encrypted & secured</p>
            </div>
          </div>
          
          {/* 24/7 */}
          <div className="group relative rounded-xl sm:rounded-2xl overflow-hidden border border-border bg-card/30 hover:bg-card hover:border-blue-500/50 transition-all duration-300 p-4 sm:p-6 hover:shadow-xl hover:shadow-blue-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-start sm:items-center gap-3 mb-3">
                <div className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 group-hover:scale-110 transition-all duration-300 flex-shrink-0">
                  <Clock className="h-5 sm:h-6 w-5 sm:w-6 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-foreground">24/7</p>
                  <p className="text-xs text-muted-foreground">Withdrawals</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground/70 leading-relaxed">Anytime withdrawals</p>
            </div>
          </div>
          
          {/* Daily ROI */}
          <div className="group relative rounded-xl sm:rounded-2xl overflow-hidden border border-border bg-card/30 hover:bg-card hover:border-violet-500/50 transition-all duration-300 p-4 sm:p-6 hover:shadow-xl hover:shadow-violet-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-start sm:items-center gap-3 mb-3">
                <div className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-violet-500/10 group-hover:bg-violet-500/20 group-hover:scale-110 transition-all duration-300 flex-shrink-0">
                  <TrendingUp className="h-5 sm:h-6 w-5 sm:w-6 text-violet-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-foreground">Daily</p>
                  <p className="text-xs text-muted-foreground">ROI Payouts</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground/70 leading-relaxed">2% - 3.3% daily</p>
            </div>
          </div>
          
          {/* Support */}
          <div className="group relative rounded-xl sm:rounded-2xl overflow-hidden border border-border bg-card/30 hover:bg-card hover:border-amber-500/50 transition-all duration-300 p-4 sm:p-6 hover:shadow-xl hover:shadow-amber-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-start sm:items-center gap-3 mb-3">
                <div className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-amber-500/10 group-hover:bg-amber-500/20 group-hover:scale-110 transition-all duration-300 flex-shrink-0">
                  <Headphones className="h-5 sm:h-6 w-5 sm:w-6 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-foreground">24/7</p>
                  <p className="text-xs text-muted-foreground">Support</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground/70 leading-relaxed">Expert assistance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
