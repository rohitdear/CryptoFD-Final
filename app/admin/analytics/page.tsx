import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Trophy, 
  Users, 
  DollarSign, 
  TrendingUp,
  Crown,
  Medal,
  Award,
  ArrowDownToLine,
  Network,
  UserPlus,
  Layers,
  Calendar,
  Target,
  Wallet,
  Clock,
  ArrowUpFromLine,
  Ban
} from "lucide-react"
import { 
  getTopDepositors, 
  getTopTeamLeaders, 
  getReferralStats, 
  getAdminDashboardStats,
  getTopFDCreators,
  getUserDetailedStats,
  getHighPotentialDepositors,
  getPlatformEarningsSummary
} from "@/lib/admin-queries"
import { WithdrawalToggle } from "./withdrawal-toggle"

export default async function AdminAnalyticsPage() {
  const [
    topDepositors, 
    topTeamLeaders, 
    referralStats, 
    dashboardStats,
    topFDCreators,
    userDetailedStats,
    highPotentialDepositors,
    platformSummary
  ] = await Promise.all([
    getTopDepositors(10),
    getTopTeamLeaders(10),
    getReferralStats(),
    getAdminDashboardStats(),
    getTopFDCreators(20),
    getUserDetailedStats(50),
    getHighPotentialDepositors(20),
    getPlatformEarningsSummary(),
  ])

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="h-5 w-5 text-amber-500" />
    if (index === 1) return <Medal className="h-5 w-5 text-slate-400" />
    if (index === 2) return <Award className="h-5 w-5 text-amber-700" />
    return <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>
  }

  const getRankColor = (index: number) => {
    if (index === 0) return "border-amber-500/50 bg-amber-500/5"
    if (index === 1) return "border-slate-400/50 bg-slate-400/5"
    if (index === 2) return "border-amber-700/50 bg-amber-700/5"
    return "border-border bg-card"
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Complete platform analytics and user insights</p>
      </div>

      {/* Platform Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card className="rounded-2xl border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
              <ArrowDownToLine className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Deposits</p>
              <p className="text-lg font-bold text-green-500">${formatCurrency(platformSummary.totalDepositsReceived)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
              <ArrowUpFromLine className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Withdrawals</p>
              <p className="text-lg font-bold text-red-500">${formatCurrency(platformSummary.totalWithdrawalsSent)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
              <Layers className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Investment</p>
              <p className="text-lg font-bold text-amber-500">${formatCurrency(platformSummary.activeInvestment)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
              <DollarSign className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">FD Earnings Paid</p>
              <p className="text-lg font-bold text-blue-500">${formatCurrency(platformSummary.totalFDEarningsPaid)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
              <Network className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Referral Commissions</p>
              <p className="text-lg font-bold text-violet-500">${formatCurrency(platformSummary.totalReferralCommissionsPaid)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <Wallet className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Net Platform Balance</p>
              <p className="text-lg font-bold text-emerald-500">${formatCurrency(platformSummary.netPlatformBalance)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs for different analytics views */}
      <Tabs defaultValue="fd-creators" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-flex">
          <TabsTrigger value="fd-creators">Top FD Creators</TabsTrigger>
          <TabsTrigger value="team-leaders">Team Leaders</TabsTrigger>
          <TabsTrigger value="user-earnings">User Earnings</TabsTrigger>
          <TabsTrigger value="depositors">Top Depositors</TabsTrigger>
          <TabsTrigger value="potential">High Potential</TabsTrigger>
          <TabsTrigger value="withdrawal-control" className="text-red-500">Withdrawal Control</TabsTrigger>
        </TabsList>

        {/* Top FD Creators Tab */}
        <TabsContent value="fd-creators">
          <Card className="rounded-2xl border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="h-5 w-5 text-amber-500" />
              <h3 className="text-lg font-semibold text-foreground">Top FD Creators (High to Low Investment)</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Rank</th>
                    <th className="pb-3 text-left text-xs font-medium text-muted-foreground">User</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Total FDs</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Active FDs</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Total Invested</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Active Investment</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Total Earned</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Wallet Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {topFDCreators.map((creator, index) => (
                    <tr key={creator.userId} className={`border-b border-border/50 ${getRankColor(index)}`}>
                      <td className="py-3">
                        <div className="flex h-8 w-8 items-center justify-center">
                          {getRankIcon(index)}
                        </div>
                      </td>
                      <td className="py-3">
                        <p className="font-medium text-foreground">{creator.user?.name || "Anonymous"}</p>
                        <p className="text-xs text-muted-foreground">{creator.user?.email}</p>
                      </td>
                      <td className="py-3 text-right font-medium text-foreground">{creator.totalFDs}</td>
                      <td className="py-3 text-right">
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
                          {creator.activeFDs} active
                        </Badge>
                      </td>
                      <td className="py-3 text-right font-bold text-amber-500">${formatCurrency(creator.totalInvested)}</td>
                      <td className="py-3 text-right text-foreground">${formatCurrency(creator.activeInvestment)}</td>
                      <td className="py-3 text-right font-medium text-green-500">${formatCurrency(creator.user?.totalEarnings || 0)}</td>
                      <td className="py-3 text-right text-foreground">${formatCurrency(creator.user?.walletBalance || 0)}</td>
                    </tr>
                  ))}
                  {topFDCreators.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-muted-foreground">No FDs created yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Team Leaders Tab */}
        <TabsContent value="team-leaders">
          <Card className="rounded-2xl border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-violet-500" />
              <h3 className="text-lg font-semibold text-foreground">Team Leaders (By Team Size & Earnings)</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Rank</th>
                    <th className="pb-3 text-left text-xs font-medium text-muted-foreground">User</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Direct Referrals</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Total Team</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Referral Earnings</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Wallet Balance</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {topTeamLeaders.map((leader, index) => (
                    <tr key={leader.userId} className={`border-b border-border/50 ${getRankColor(index)}`}>
                      <td className="py-3">
                        <div className="flex h-8 w-8 items-center justify-center">
                          {getRankIcon(index)}
                        </div>
                      </td>
                      <td className="py-3">
                        <p className="font-medium text-foreground">{leader.name || "Anonymous"}</p>
                        <p className="text-xs text-muted-foreground">{leader.email}</p>
                      </td>
                      <td className="py-3 text-right">
                        <Badge variant="secondary">{leader.directReferrals} direct</Badge>
                      </td>
                      <td className="py-3 text-right">
                        <Badge variant="outline" className="bg-violet-500/10 text-violet-600">{leader.totalTeamSize} members</Badge>
                      </td>
                      <td className="py-3 text-right font-bold text-violet-500">${formatCurrency(leader.referralEarnings)}</td>
                      <td className="py-3 text-right text-foreground">${formatCurrency(leader.walletBalance)}</td>
                      <td className="py-3 text-right text-sm text-muted-foreground">
                        {new Date(leader.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {topTeamLeaders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">No referrals yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* User Earnings Tab */}
        <TabsContent value="user-earnings">
          <Card className="rounded-2xl border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-semibold text-foreground">Complete User Earnings Breakdown</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left text-xs font-medium text-muted-foreground">User</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Days Active</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Months</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Total Deposits</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">FD Earnings</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Referral Earnings</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Total Earned</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Team Size</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Team Generated</th>
                  </tr>
                </thead>
                <tbody>
                  {userDetailedStats.map((user, index) => (
                    <tr key={user.userId} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground font-medium">#{index + 1}</span>
                          <div>
                            <p className="font-medium text-foreground">{user.name || "Anonymous"}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span>{user.daysActive}d</span>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <Badge variant="outline">{user.monthsActive}m</Badge>
                      </td>
                      <td className="py-3 text-right text-foreground">${formatCurrency(user.totalDeposits)}</td>
                      <td className="py-3 text-right text-blue-500">${formatCurrency(user.fdEarnings)}</td>
                      <td className="py-3 text-right text-violet-500">${formatCurrency(user.referralEarnings)}</td>
                      <td className="py-3 text-right font-bold text-green-500">${formatCurrency(user.totalEarnings)}</td>
                      <td className="py-3 text-right">
                        {user.teamSize > 0 ? (
                          <Badge variant="secondary" className="bg-violet-500/10 text-violet-600">
                            {user.teamSize}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-3 text-right text-amber-500">
                        {user.teamGeneratedEarnings > 0 ? `$${formatCurrency(user.teamGeneratedEarnings)}` : "-"}
                      </td>
                    </tr>
                  ))}
                  {userDetailedStats.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-muted-foreground">No users yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Top Depositors Tab */}
        <TabsContent value="depositors">
          <Card className="rounded-2xl border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-amber-500" />
              <h3 className="text-lg font-semibold text-foreground">Top Depositors (Highest to Lowest)</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Rank</th>
                    <th className="pb-3 text-left text-xs font-medium text-muted-foreground">User</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Total Deposits</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Deposit Count</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Wallet Balance</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Locked (In FDs)</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {topDepositors.map((depositor, index) => (
                    <tr key={depositor.userId} className={`border-b border-border/50 ${getRankColor(index)}`}>
                      <td className="py-3">
                        <div className="flex h-8 w-8 items-center justify-center">
                          {getRankIcon(index)}
                        </div>
                      </td>
                      <td className="py-3">
                        <p className="font-medium text-foreground">{depositor.user?.name || "Anonymous"}</p>
                        <p className="text-xs text-muted-foreground">{depositor.user?.email}</p>
                      </td>
                      <td className="py-3 text-right font-bold text-green-500">${formatCurrency(depositor.totalDeposits)}</td>
                      <td className="py-3 text-right text-foreground">{depositor.depositCount}</td>
                      <td className="py-3 text-right text-foreground">${formatCurrency(depositor.user?.walletBalance || 0)}</td>
                      <td className="py-3 text-right text-amber-500">${formatCurrency(depositor.user?.lockedBalance || 0)}</td>
                      <td className="py-3 text-right text-sm text-muted-foreground">
                        {depositor.user?.createdAt ? new Date(depositor.user.createdAt).toLocaleDateString() : "-"}
                      </td>
                    </tr>
                  ))}
                  {topDepositors.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">No deposits yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* High Potential Depositors Tab */}
        <TabsContent value="potential">
          <Card className="rounded-2xl border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-emerald-500" />
              <h3 className="text-lg font-semibold text-foreground">High Potential Depositors</h3>
              <Badge variant="secondary" className="ml-2">Based on deposit history & activity</Badge>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Score</th>
                    <th className="pb-3 text-left text-xs font-medium text-muted-foreground">User</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Total Deposited</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Avg Deposit</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Deposits</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Last Deposit</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Days Ago</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Current Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {highPotentialDepositors.map((depositor, index) => (
                    <tr key={depositor.userId} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-12 h-2 rounded-full overflow-hidden bg-secondary`}>
                            <div 
                              className={`h-full ${depositor.score >= 70 ? 'bg-emerald-500' : depositor.score >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${depositor.score}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{depositor.score}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <p className="font-medium text-foreground">{depositor.user?.name || "Anonymous"}</p>
                        <p className="text-xs text-muted-foreground">{depositor.user?.email}</p>
                      </td>
                      <td className="py-3 text-right font-medium text-green-500">${formatCurrency(depositor.totalDeposited)}</td>
                      <td className="py-3 text-right text-foreground">${formatCurrency(depositor.avgDeposit)}</td>
                      <td className="py-3 text-right">
                        <Badge variant="secondary">{depositor.depositCount}</Badge>
                      </td>
                      <td className="py-3 text-right text-sm text-muted-foreground">
                        {new Date(depositor.lastDeposit).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-right">
                        <Badge 
                          variant="outline" 
                          className={depositor.daysSinceLastDeposit <= 7 ? 'bg-emerald-500/10 text-emerald-600' : depositor.daysSinceLastDeposit <= 30 ? 'bg-amber-500/10 text-amber-600' : 'bg-red-500/10 text-red-600'}
                        >
                          {depositor.daysSinceLastDeposit}d ago
                        </Badge>
                      </td>
                      <td className="py-3 text-right text-foreground">${formatCurrency(depositor.user?.walletBalance || 0)}</td>
                    </tr>
                  ))}
                  {highPotentialDepositors.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-muted-foreground">No deposit history yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Withdrawal Control Tab */}
        <TabsContent value="withdrawal-control">
          <Card className="rounded-2xl border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Ban className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-semibold text-foreground">Withdrawal Control</h3>
              <Badge variant="secondary" className="ml-2 bg-red-500/10 text-red-600">Block/Unblock User Withdrawals</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Review user performance metrics and control their withdrawal access. Click the button to toggle withdrawal permission.
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left text-xs font-medium text-muted-foreground">User</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Total Invested</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Total Earned</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">ROI %</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Days Active</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Team Size</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Team Generated</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Wallet Balance</th>
                    <th className="pb-3 text-center text-xs font-medium text-muted-foreground">Withdrawal</th>
                  </tr>
                </thead>
                <tbody>
                  {userDetailedStats.map((user) => {
                    const roi = user.totalInvested > 0 
                      ? ((user.totalEarnings / user.totalInvested) * 100).toFixed(1)
                      : "0.0"
                    return (
                      <tr key={user.userId} className="border-b border-border/50 hover:bg-secondary/30">
                        <td className="py-3">
                          <p className="font-medium text-foreground">{user.name || "Anonymous"}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </td>
                        <td className="py-3 text-right font-medium text-amber-500">${formatCurrency(user.totalInvested)}</td>
                        <td className="py-3 text-right font-medium text-green-500">${formatCurrency(user.totalEarnings)}</td>
                        <td className="py-3 text-right">
                          <Badge 
                            variant="outline" 
                            className={
                              parseFloat(roi) > 100 ? 'bg-red-500/10 text-red-600' : 
                              parseFloat(roi) > 50 ? 'bg-amber-500/10 text-amber-600' : 
                              'bg-emerald-500/10 text-emerald-600'
                            }
                          >
                            {roi}%
                          </Badge>
                        </td>
                        <td className="py-3 text-right text-foreground">{user.daysActive}d</td>
                        <td className="py-3 text-right">
                          <Badge variant="secondary" className="bg-violet-500/10 text-violet-600">
                            {user.teamSize}
                          </Badge>
                        </td>
                        <td className="py-3 text-right text-blue-500">${formatCurrency(user.teamGeneratedEarnings)}</td>
                        <td className="py-3 text-right font-semibold">${formatCurrency(user.walletBalance)}</td>
                        <td className="py-3 text-center">
                          <WithdrawalToggle 
                            userId={user.userId} 
                            userName={user.name || user.email}
                            isDisabled={user.withdrawalDisabled}
                          />
                        </td>
                      </tr>
                    )
                  })}
                  {userDetailedStats.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-muted-foreground">No users yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Referral Network Breakdown */}
      <Card className="rounded-2xl border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Network className="h-5 w-5 text-violet-500" />
          Referral Network Breakdown
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
            <p className="text-sm text-muted-foreground">Level 1 (Direct)</p>
            <p className="text-2xl font-bold text-emerald-500">{referralStats.level1Referrals}</p>
            <p className="text-xs text-muted-foreground mt-1">5% commission</p>
          </div>
          <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4">
            <p className="text-sm text-muted-foreground">Level 2</p>
            <p className="text-2xl font-bold text-blue-500">{referralStats.level2Referrals}</p>
            <p className="text-xs text-muted-foreground mt-1">2% commission</p>
          </div>
          <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 p-4">
            <p className="text-sm text-muted-foreground">Level 3</p>
            <p className="text-2xl font-bold text-violet-500">{referralStats.level3Referrals}</p>
            <p className="text-xs text-muted-foreground mt-1">1% commission</p>
          </div>
          <div className="rounded-xl bg-primary/10 border border-primary/20 p-4">
            <p className="text-sm text-muted-foreground">Users with Referrals</p>
            <p className="text-2xl font-bold text-primary">{referralStats.usersWithReferrals}</p>
            <p className="text-xs text-muted-foreground mt-1">active referrers</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
