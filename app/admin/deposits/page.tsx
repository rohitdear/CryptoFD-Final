import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getAllTransactions } from "@/lib/admin-queries"
import { ArrowDownToLine, CheckCircle } from "lucide-react"

export default async function DepositsHistoryPage() {
  const completedDeposits = await getAllTransactions(100, "completed", "deposit")
  
  // Calculate totals
  const totalDeposited = completedDeposits.reduce((sum, tx) => sum + Math.abs(Number(tx.amount)), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Deposit History</h1>
        <p className="text-muted-foreground">All deposits are processed automatically via blockchain</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
              <ArrowDownToLine className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Deposited</p>
              <p className="text-2xl font-bold text-foreground">${totalDeposited.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
              <CheckCircle className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Transactions</p>
              <p className="text-2xl font-bold text-foreground">{completedDeposits.length}</p>
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
        <h3 className="text-sm font-medium text-muted-foreground mb-3">How Deposits Work</h3>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</div>
            <div>
              <p className="text-sm font-medium text-foreground">User Sends USDT</p>
              <p className="text-xs text-muted-foreground">To their assigned BEP-20 wallet</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</div>
            <div>
              <p className="text-sm font-medium text-foreground">Scanner Detects</p>
              <p className="text-xs text-muted-foreground">Blockchain scanned every 15s</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</div>
            <div>
              <p className="text-sm font-medium text-foreground">Balance Credited</p>
              <p className="text-xs text-muted-foreground">User balance updated instantly</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</div>
            <div>
              <p className="text-sm font-medium text-foreground">Funds Swept</p>
              <p className="text-xs text-muted-foreground">Auto-moved to hot wallet</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Deposits */}
      <Card className="rounded-2xl border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Recent Deposits ({completedDeposits.length})
        </h3>
        
        {completedDeposits.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No deposits yet
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
                {completedDeposits.map((tx) => (
                  <tr key={tx.id} className="border-b border-border">
                    <td className="py-3 pr-4 font-medium text-green-500">
                      +${Math.abs(Number(tx.amount)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
