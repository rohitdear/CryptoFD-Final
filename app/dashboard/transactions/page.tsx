import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getTransactions } from "@/lib/queries"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Layers, 
  Users,
  Percent,
  Coins,
  History,
  TrendingUp,
  ExternalLink
} from "lucide-react"
import type { Transaction } from "@/lib/types"

const typeConfig: Record<string, { icon: typeof Layers; color: string; label: string }> = {
  deposit: { icon: ArrowDownToLine, color: "bg-green-500/10 text-green-500 border-green-500/20", label: "Deposit" },
  withdrawal: { icon: ArrowUpFromLine, color: "bg-orange-500/10 text-orange-500 border-orange-500/20", label: "Withdrawal" },
  fd_investment: { icon: Layers, color: "bg-blue-500/10 text-blue-500 border-blue-500/20", label: "FD Investment" },
  fd_earning: { icon: Percent, color: "bg-green-500/10 text-green-500 border-green-500/20", label: "FD Earning" },
  referral_earning: { icon: TrendingUp, color: "bg-purple-500/10 text-purple-500 border-purple-500/20", label: "Referral Earning" },
  referral_commission: { icon: TrendingUp, color: "bg-purple-500/10 text-purple-500 border-purple-500/20", label: "Referral Commission" },
  fd_maturity: { icon: Coins, color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", label: "FD Maturity" },
}

const statusConfig: Record<string, string> = {
  completed: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 border",
  pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20 border",
  failed: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 border",
  cancelled: "bg-muted text-muted-foreground border-border border",
}

function TransactionTable({ data }: { data: Transaction[] }) {
  if (data.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
            <History className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <p className="text-muted-foreground">No transactions found</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground font-semibold">Type</TableHead>
            <TableHead className="text-muted-foreground font-semibold">Description</TableHead>
            <TableHead className="text-muted-foreground font-semibold">Amount</TableHead>
            <TableHead className="text-muted-foreground font-semibold">Date</TableHead>
            <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
            <TableHead className="text-muted-foreground font-semibold">TX Hash</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((tx) => {
            const config = typeConfig[tx.type] || typeConfig.fd_earning
            const Icon = config.icon
            const isPositive = Number(tx.amount) > 0

            return (
              <TableRow key={tx.id} className="border-border hover:bg-secondary/50 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${config.color} border transition-transform hover:scale-110`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{config.label}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  {tx.description || config.label}
                </TableCell>
                <TableCell>
                  <span className={`font-bold text-base ${isPositive ? "text-green-500" : "text-foreground"}`}>
                    {isPositive ? "+" : ""}${Math.abs(Number(tx.amount)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(tx.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge className={statusConfig[tx.status]}>
                    {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {tx.txHash ? (
                    <a 
                      href={`https://bscscan.com/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 hover:underline transition-colors inline-flex items-center gap-1 group"
                    >
                      {`${tx.txHash.slice(0, 8)}...${tx.txHash.slice(-6)}`}
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export default async function TransactionsPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  const transactions = await getTransactions()
  
  const deposits = transactions.filter((t) => t.type === "deposit")
  const withdrawals = transactions.filter((t) => t.type === "withdrawal")
  const fdTransactions = transactions.filter((t) => t.type === "fd_investment" || t.type === "fd_earning" || t.type === "fd_maturity")
  const referralTransactions = transactions.filter((t) => (t.type as string) === "referral_earning" || (t.type as string) === "referral_commission")

  // Calculate totals
  const totalDeposits = deposits.filter(t => t.status === "completed").reduce((acc, t) => acc + Math.abs(Number(t.amount)), 0)
  const totalWithdrawals = withdrawals.filter(t => t.status === "completed").reduce((acc, t) => acc + Math.abs(Number(t.amount)), 0)
  const totalFDEarnings = fdTransactions.filter(t => t.type === "fd_earning" && t.status === "completed").reduce((acc, t) => acc + Number(t.amount), 0)
  const totalReferralEarnings = referralTransactions.filter(t => t.status === "completed").reduce((acc, t) => acc + Number(t.amount), 0)

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/15 via-primary/5 to-accent/15 border border-primary/30 p-4 sm:p-8">
        <div className="absolute top-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-primary/5 rounded-full blur-3xl -mr-16 sm:-mr-20 -mt-16 sm:-mt-20"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Transactions</h1>
            <Badge className="bg-primary/10 text-primary border-primary/20 border gap-1">
              <History className="h-3 w-3" />
              Complete History
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            Track all your deposits, withdrawals, and earnings
          </p>
        </div>
      </div>

      {/* Summary Cards - Professional */}
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="group relative rounded-xl sm:rounded-2xl overflow-hidden border border-border bg-card/50 hover:bg-card hover:border-green-500/50 transition-all p-4 sm:p-5 hover:shadow-xl hover:shadow-green-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-green-500/20 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
              <ArrowDownToLine className="h-5 sm:h-6 w-5 sm:w-6 text-green-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground font-medium">Total Deposits</p>
              <p className="text-lg sm:text-xl font-bold text-foreground mt-1 break-words">
                ${totalDeposits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>

        <Card className="group relative rounded-xl sm:rounded-2xl overflow-hidden border border-border bg-card/50 hover:bg-card hover:border-orange-500/50 transition-all p-4 sm:p-5 hover:shadow-xl hover:shadow-orange-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-orange-500/20 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
              <ArrowUpFromLine className="h-5 sm:h-6 w-5 sm:w-6 text-orange-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground font-medium">Total Withdrawals</p>
              <p className="text-lg sm:text-xl font-bold text-foreground mt-1 break-words">
                ${totalWithdrawals.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>

        <Card className="group relative rounded-xl sm:rounded-2xl overflow-hidden border border-border bg-card/50 hover:bg-card hover:border-emerald-500/50 transition-all p-4 sm:p-5 hover:shadow-xl hover:shadow-emerald-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-emerald-500/20 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
              <Percent className="h-5 sm:h-6 w-5 sm:w-6 text-emerald-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground font-medium">FD Earnings</p>
              <p className="text-lg sm:text-xl font-bold text-emerald-500 mt-1 break-words">
                +${totalFDEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>

        <Card className="group relative rounded-xl sm:rounded-2xl overflow-hidden border border-border bg-card/50 hover:bg-card hover:border-purple-500/50 transition-all p-4 sm:p-5 hover:shadow-xl hover:shadow-purple-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-purple-500/20 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
              <Users className="h-5 sm:h-6 w-5 sm:w-6 text-purple-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground font-medium">Referral Earnings</p>
              <p className="text-lg sm:text-xl font-bold text-purple-500 mt-1 break-words">
                +${totalReferralEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="rounded-2xl border-border bg-card p-6 overflow-hidden">
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="bg-secondary gap-1">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary gap-2">
              <History className="h-4 w-4" />
              All ({transactions.length})
            </TabsTrigger>
            <TabsTrigger value="deposits" className="data-[state=active]:bg-primary gap-2">
              <ArrowDownToLine className="h-4 w-4" />
              Deposits ({deposits.length})
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="data-[state=active]:bg-primary gap-2">
              <ArrowUpFromLine className="h-4 w-4" />
              Withdrawals ({withdrawals.length})
            </TabsTrigger>
            <TabsTrigger value="fd" className="data-[state=active]:bg-primary gap-2">
              <Layers className="h-4 w-4" />
              FD ({fdTransactions.length})
            </TabsTrigger>
            <TabsTrigger value="referral" className="data-[state=active]:bg-primary gap-2">
              <Users className="h-4 w-4" />
              Referral ({referralTransactions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <TransactionTable data={transactions} />
          </TabsContent>
          <TabsContent value="deposits">
            <TransactionTable data={deposits} />
          </TabsContent>
          <TabsContent value="withdrawals">
            <TransactionTable data={withdrawals} />
          </TabsContent>
          <TabsContent value="fd">
            <TransactionTable data={fdTransactions} />
          </TabsContent>
          <TabsContent value="referral">
            <TransactionTable data={referralTransactions} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
