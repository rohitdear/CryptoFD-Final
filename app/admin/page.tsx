import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  DollarSign, 
  ArrowDownToLine, 
  ArrowUpFromLine,
  Layers,
  AlertCircle,
  TrendingUp
} from "lucide-react"
import { getAdminDashboardStats, getAllTransactions, getAllUsers } from "@/lib/admin-queries"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AdminDashboardPage() {
  const [stats, recentTransactions, recentUsers] = await Promise.all([
    getAdminDashboardStats(),
    getAllTransactions(10),
    getAllUsers(5),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of platform activity</p>
      </div>

      {/* Alert Cards */}
      {(stats.pendingDeposits > 0 || stats.pendingWithdrawals > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {stats.pendingDeposits > 0 && (
            <Link href="/admin/deposits">
              <Card className="rounded-2xl border-yellow-500/50 bg-yellow-500/10 p-4 transition-colors hover:bg-yellow-500/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/20">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="font-medium text-yellow-500">{stats.pendingDeposits} Pending Deposits</p>
                    <p className="text-sm text-muted-foreground">Require your attention</p>
                  </div>
                </div>
              </Card>
            </Link>
          )}
          {stats.pendingWithdrawals > 0 && (
            <Link href="/admin/withdrawals">
              <Card className="rounded-2xl border-orange-500/50 bg-orange-500/10 p-4 transition-colors hover:bg-orange-500/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-medium text-orange-500">{stats.pendingWithdrawals} Pending Withdrawals</p>
                    <p className="text-sm text-muted-foreground">Require your attention</p>
                  </div>
                </div>
              </Card>
            </Link>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalUsers}</p>
            </div>
          </div>
        </Card>
        <Card className="rounded-2xl border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
              <ArrowDownToLine className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Deposits</p>
              <p className="text-2xl font-bold text-green-500">
                ${stats.totalDeposits.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>
        <Card className="rounded-2xl border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
              <ArrowUpFromLine className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Withdrawals</p>
              <p className="text-2xl font-bold text-foreground">
                ${stats.totalWithdrawals.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>
        <Card className="rounded-2xl border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
              <Layers className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Investments</p>
              <p className="text-2xl font-bold text-foreground">
                ${stats.totalActiveInvestment.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Platform Stats */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <Card className="rounded-2xl border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Recent Users</h3>
            <Link href="/admin/users">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {recentUsers.length === 0 ? (
              <p className="text-center text-muted-foreground">No users yet</p>
            ) : (
              recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between rounded-xl bg-secondary/30 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary font-medium">
                      {(user.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{user.name || "Anonymous"}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">
                      ${Number(user.walletBalance).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">Balance</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card className="rounded-2xl border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
            <Link href="/admin/transactions">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {recentTransactions.length === 0 ? (
              <p className="text-center text-muted-foreground">No transactions yet</p>
            ) : (
              recentTransactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between rounded-xl bg-secondary/30 p-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      tx.type === "deposit" ? "bg-green-500/10 text-green-500" :
                      tx.type === "withdrawal" ? "bg-orange-500/10 text-orange-500" :
                      tx.type === "fd_earning" ? "bg-blue-500/10 text-blue-500" :
                      "bg-primary/10 text-primary"
                    }`}>
                      {tx.type === "deposit" ? <ArrowDownToLine className="h-4 w-4" /> :
                       tx.type === "withdrawal" ? <ArrowUpFromLine className="h-4 w-4" /> :
                       <TrendingUp className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground capitalize">
                        {tx.type.replace("_", " ")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${Number(tx.amount) > 0 ? "text-green-500" : "text-foreground"}`}>
                      {Number(tx.amount) > 0 ? "+" : ""}${Math.abs(Number(tx.amount)).toFixed(2)}
                    </span>
                    <Badge className={
                      tx.status === "completed" ? "bg-green-500/10 text-green-500" :
                      tx.status === "pending" ? "bg-yellow-500/10 text-yellow-500" :
                      "bg-red-500/10 text-red-500"
                    }>
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
