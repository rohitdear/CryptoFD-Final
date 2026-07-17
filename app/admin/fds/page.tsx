import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getAllFDs } from "@/lib/admin-queries"
import { Progress } from "@/components/ui/progress"
import { DollarSign, Layers, TrendingUp } from "lucide-react"

export default async function FDsPage() {
  const allFDs = await getAllFDs()
  const activeFDs = allFDs.filter((fd) => fd.status === "active")
  const completedFDs = allFDs.filter((fd) => fd.status === "completed")

  const totalInvested = activeFDs.reduce((acc, fd) => acc + Number(fd.amount), 0)
  const totalEarned = allFDs.reduce((acc, fd) => acc + Number(fd.totalEarned), 0)
  const dailyLiability = activeFDs.reduce((acc, fd) => acc + Number(fd.dailyEarning), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Fixed Deposits</h1>
        <p className="text-muted-foreground">View all user fixed deposits</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="rounded-2xl border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
              <Layers className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active FDs</p>
              <p className="text-2xl font-bold text-foreground">{activeFDs.length}</p>
            </div>
          </div>
        </Card>
        <Card className="rounded-2xl border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Invested</p>
              <p className="text-2xl font-bold text-foreground">
                ${totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>
        <Card className="rounded-2xl border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Earned</p>
              <p className="text-2xl font-bold text-green-500">
                ${totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>
        <Card className="rounded-2xl border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
              <DollarSign className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Daily Liability</p>
              <p className="text-2xl font-bold text-orange-500">
                ${dailyLiability.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Active FDs */}
      <Card className="rounded-2xl border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground">
          Active Fixed Deposits ({activeFDs.length})
        </h3>
        
        {activeFDs.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No active FDs
          </div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeFDs.map((fd) => {
              const startDate = new Date(fd.startDate)
              const endDate = new Date(fd.endDate)
              const now = new Date()
              const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
              const daysElapsed = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
              const progress = Math.min(100, Math.max(0, (daysElapsed / totalDays) * 100))

              return (
                <div key={fd.id} className="rounded-xl border border-border bg-secondary/30 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        ${Number(fd.amount).toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">{fd.plan?.name}</p>
                    </div>
                    <Badge className="bg-green-500/10 text-green-500">{fd.plan?.dailyRoi}%/day</Badge>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-foreground">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="mt-2 h-2" />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Daily</p>
                      <p className="font-medium text-green-500">+${Number(fd.dailyEarning).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Earned</p>
                      <p className="font-medium text-green-500">+${Number(fd.totalEarned).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    User: {fd.userId.slice(0, 8)}... | Ends: {endDate.toLocaleDateString()}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Completed FDs */}
      <Card className="rounded-2xl border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground">
          Completed Fixed Deposits ({completedFDs.length})
        </h3>
        
        {completedFDs.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No completed FDs yet
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                  <th className="pb-3 pr-4">User</th>
                  <th className="pb-3 pr-4">Plan</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3 pr-4">Total Earned</th>
                  <th className="pb-3">Completed</th>
                </tr>
              </thead>
              <tbody>
                {completedFDs.slice(0, 20).map((fd) => (
                  <tr key={fd.id} className="border-b border-border">
                    <td className="py-3 pr-4 text-muted-foreground">
                      {fd.userId.slice(0, 8)}...
                    </td>
                    <td className="py-3 pr-4 text-foreground">
                      {fd.plan?.name}
                    </td>
                    <td className="py-3 pr-4 font-medium text-foreground">
                      ${Number(fd.amount).toFixed(2)}
                    </td>
                    <td className="py-3 pr-4 font-medium text-green-500">
                      +${Number(fd.totalEarned).toFixed(2)}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {new Date(fd.endDate).toLocaleDateString()}
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
