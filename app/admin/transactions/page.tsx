import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getAllTransactions } from "@/lib/admin-queries"
import { ArrowDownToLine, ArrowUpFromLine, Layers, Users, Percent, Coins } from "lucide-react"

const typeConfig: Record<string, { icon: typeof Layers; color: string; label: string }> = {
  deposit: { icon: ArrowDownToLine, color: "bg-green-500/10 text-green-500", label: "Deposit" },
  withdrawal: { icon: ArrowUpFromLine, color: "bg-orange-500/10 text-orange-500", label: "Withdrawal" },
  fd_investment: { icon: Layers, color: "bg-blue-500/10 text-blue-500", label: "FD Investment" },
  fd_earning: { icon: Percent, color: "bg-green-500/10 text-green-500", label: "FD Earning" },
  referral_earning: { icon: Users, color: "bg-purple-500/10 text-purple-500", label: "Referral" },
  fd_maturity: { icon: Coins, color: "bg-yellow-500/10 text-yellow-500", label: "FD Maturity" },
}

const statusConfig: Record<string, string> = {
  completed: "bg-green-500/10 text-green-500",
  pending: "bg-yellow-500/10 text-yellow-500",
  failed: "bg-red-500/10 text-red-500",
  cancelled: "bg-muted text-muted-foreground",
}

export default async function TransactionsPage() {
  const transactions = await getAllTransactions(200)

  // Calculate stats
  const deposits = transactions.filter((t) => t.type === "deposit" && t.status === "completed")
  const withdrawals = transactions.filter((t) => t.type === "withdrawal" && t.status === "completed")
  const earnings = transactions.filter((t) => (t.type === "fd_earning" || t.type === "referral_earning") && t.status === "completed")

  const totalDeposits = deposits.reduce((acc, t) => acc + Math.abs(Number(t.amount)), 0)
  const totalWithdrawals = withdrawals.reduce((acc, t) => acc + Math.abs(Number(t.amount)), 0)
  const totalEarnings = earnings.reduce((acc, t) => acc + Number(t.amount), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">All Transactions</h1>
        <p className="text-muted-foreground">View all platform transactions</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
              <ArrowDownToLine className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Deposits</p>
              <p className="text-2xl font-bold text-green-500">
                ${totalDeposits.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
                ${totalWithdrawals.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>
        <Card className="rounded-2xl border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
              <Percent className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Distributed Earnings</p>
              <p className="text-2xl font-bold text-blue-500">
                ${totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="rounded-2xl border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground">Transaction History</h3>
        
        {transactions.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No transactions found
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                  <th className="pb-3 pr-4">Type</th>
                  <th className="pb-3 pr-4">User</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3 pr-4">Description</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const config = typeConfig[tx.type] || typeConfig.fd_earning
                  const Icon = config.icon
                  const isPositive = Number(tx.amount) > 0

                  return (
                    <tr key={tx.id} className="border-b border-border">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${config.color}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-medium text-foreground">{config.label}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-sm text-muted-foreground">
                        {tx.userId.slice(0, 8)}...
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`font-medium ${isPositive ? "text-green-500" : "text-foreground"}`}>
                          {isPositive ? "+" : ""}${Math.abs(Number(tx.amount)).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-sm text-muted-foreground">
                        {tx.description || "-"}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge className={statusConfig[tx.status]}>
                          {tx.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
