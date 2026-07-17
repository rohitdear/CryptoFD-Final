import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getAllTransactions } from "@/lib/admin-queries"
import { getWithdrawalRequests } from "@/lib/admin-queries"
import { ArrowUpFromLine, CheckCircle, Clock, AlertCircle } from "lucide-react"

export default async function WithdrawalsHistoryPage() {
  const withdrawalRequests = await getWithdrawalRequests()
  const completedWithdrawals = await getAllTransactions(100, "completed", "withdrawal")
  
  // Calculate stats
  const totalWithdrawn = completedWithdrawals.reduce((sum, tx) => sum + Math.abs(Number(tx.amount)), 0)
  const pendingCount = withdrawalRequests.filter(w => w.status === "pending").length
  const processingCount = withdrawalRequests.filter(w => w.status === "processing").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Withdrawal History</h1>
        <p className="text-muted-foreground">All withdrawals are processed automatically from hot wallet</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-2xl border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
              <ArrowUpFromLine className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Withdrawn</p>
              <p className="text-2xl font-bold text-foreground">${totalWithdrawn.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10">
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Processing</p>
              <p className="text-2xl font-bold text-foreground">{processingCount}</p>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border-border bg-emerald-500/5 border-emerald-500/20 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-lg font-bold text-emerald-500">Auto-Processing</p>
            </div>
          </div>
        </Card>
      </div>

      {/* How it works */}
      <Card className="rounded-2xl border-border bg-secondary/30 p-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">How Withdrawals Work</h3>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</div>
            <div>
              <p className="text-sm font-medium text-foreground">User Requests</p>
              <p className="text-xs text-muted-foreground">Withdrawal from dashboard</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</div>
            <div>
              <p className="text-sm font-medium text-foreground">Balance Deducted</p>
              <p className="text-xs text-muted-foreground">User balance updated instantly</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</div>
            <div>
              <p className="text-sm font-medium text-foreground">Auto-Processed</p>
              <p className="text-xs text-muted-foreground">Executor runs every 60s</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</div>
            <div>
              <p className="text-sm font-medium text-foreground">USDT Sent</p>
              <p className="text-xs text-muted-foreground">From hot wallet to user address</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Pending/Processing Withdrawals */}
      {(pendingCount > 0 || processingCount > 0) && (
        <Card className="rounded-2xl border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Queued Withdrawals ({pendingCount + processingCount})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">To Address</th>
                  <th className="pb-3 pr-4">User</th>
                  <th className="pb-3">Requested</th>
                </tr>
              </thead>
              <tbody>
                {withdrawalRequests
                  .filter(w => w.status === "pending" || w.status === "processing")
                  .map((w) => (
                  <tr key={w.id} className="border-b border-border">
                    <td className="py-3 pr-4 font-medium text-foreground">
                      ${Number(w.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge className={w.status === "pending" ? "bg-yellow-500/10 text-yellow-500" : "bg-blue-500/10 text-blue-500"}>
                        {w.status === "pending" ? "Queued" : "Processing"}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">
                      {w.toAddress.slice(0, 10)}...{w.toAddress.slice(-6)}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {w.userId.slice(0, 8)}...
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {new Date(w.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Completed Withdrawals */}
      <Card className="rounded-2xl border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Completed Withdrawals ({completedWithdrawals.length})
        </h3>
        
        {completedWithdrawals.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No completed withdrawals yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">User</th>
                  <th className="pb-3 pr-4">TX Hash</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {completedWithdrawals.map((tx) => (
                  <tr key={tx.id} className="border-b border-border">
                    <td className="py-3 pr-4 font-medium text-foreground">
                      ${Math.abs(Number(tx.amount)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge className="bg-green-500/10 text-green-500">Completed</Badge>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {tx.userId.slice(0, 8)}...
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">
                      {tx.txHash ? (
                        <a 
                          href={`https://bscscan.com/tx/${tx.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {tx.txHash.slice(0, 10)}...{tx.txHash.slice(-6)}
                        </a>
                      ) : "-"}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
