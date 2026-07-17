import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getUserFDs } from "@/lib/queries"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, TrendingUp, Calendar, Layers, Wallet, CheckCircle2, Hourglass, Flame, Zap } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { UserFD } from "@/lib/types"

function FDCard({ fd }: { fd: UserFD }) {
  const startDate = new Date(fd.startDate)
  const endDate = new Date(fd.endDate)
  const now = new Date()
  
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const daysElapsed = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const progress = Math.min(100, Math.max(0, (daysElapsed / totalDays) * 100))
  
  const isActive = fd.status === "active"
  
  return (
    <Card className="group relative rounded-2xl overflow-hidden border border-border bg-card/50 hover:bg-card hover:shadow-xl hover:border-primary/50 transition-all">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative p-6 space-y-4">
        {/* Header with Status - Responsive Mobile First */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-start sm:items-center gap-2 sm:gap-3">
              <div className={`flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br ${isActive ? 'from-primary/20 to-primary/10' : 'from-blue-500/20 to-blue-500/10'} group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                <Wallet className={`h-5 sm:h-6 w-5 sm:w-6 ${isActive ? 'text-primary' : 'text-blue-500'}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-1 sm:gap-2">
                  <span className="text-lg sm:text-2xl font-bold text-foreground break-words">
                    ${Number(fd.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs sm:text-sm text-muted-foreground font-medium">USDT</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">{fd.plan?.name} Plan</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-col gap-2 w-full sm:w-auto text-right sm:text-right">
            <Badge
              className={`w-full sm:w-auto justify-center sm:justify-start ${
                fd.status === "active"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 border gap-1.5 font-bold text-xs sm:text-sm"
                  : fd.status === "completed"
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 border gap-1.5 font-bold text-xs sm:text-sm"
                  : "bg-muted text-muted-foreground border-border border gap-1.5 font-bold text-xs sm:text-sm"
              }`}
            >
              <span className="flex items-center gap-1">
                {fd.status === "completed" ? <CheckCircle2 className="h-3.5 sm:h-4 w-3.5 sm:w-4" /> : <Flame className="h-3.5 sm:h-4 w-3.5 sm:w-4" />}
                {fd.status.charAt(0).toUpperCase() + fd.status.slice(1)}
              </span>
            </Badge>
            <div className="flex items-center gap-1.5 text-green-500 justify-center sm:justify-end bg-green-500/10 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-green-500/20 text-xs sm:text-sm">
              <TrendingUp className="h-3.5 sm:h-4 w-3.5 sm:w-4 flex-shrink-0" />
              <span className="font-bold">{fd.plan?.dailyRoi}%</span>
              <span className="text-muted-foreground font-medium">/day</span>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="space-y-3 bg-secondary/50 rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">Duration Progress</span>
            <span className="text-sm font-bold text-primary">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-3 rounded-full" />
          <div className="flex justify-between text-xs text-muted-foreground font-medium">
            <span>{Math.max(0, daysElapsed)} / {totalDays} days</span>
            <span>{Math.max(0, totalDays - daysElapsed)} days left</span>
          </div>
        </div>

        {/* Key Information Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 p-4 hover:border-blue-500/50 transition-all">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2 font-medium">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span>Start Date</span>
            </div>
            <p className="text-sm font-bold text-foreground">
              {startDate.toLocaleDateString()}
            </p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 p-4 hover:border-amber-500/50 transition-all">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2 font-medium">
              <Clock className="h-4 w-4 text-amber-500" />
              <span>Maturity Date</span>
            </div>
            <p className="text-sm font-bold text-foreground">
              {endDate.toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Earnings Summary - Premium */}
        <div className="rounded-xl bg-gradient-to-r from-green-500/15 via-emerald-500/10 to-green-500/5 border-2 border-green-500/30 p-5 group/earnings hover:border-green-500/50 transition-all">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-muted-foreground block mb-2 font-bold uppercase tracking-wide">Total Earned</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-green-500">
                  ${Number(fd.totalEarned).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground block mb-2 font-bold uppercase tracking-wide">Daily Rate</span>
              <div className="flex items-center justify-end gap-1">
                <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${Number(fd.dailyEarning).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default async function MyFDsPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  const allFDs = await getUserFDs()
  const activeFDs = allFDs.filter((fd) => fd.status === "active")
  const completedFDs = allFDs.filter((fd) => fd.status === "completed")

  const totalLocked = activeFDs.reduce((acc, fd) => acc + Number(fd.amount), 0)
  const totalEarned = allFDs.reduce((acc, fd) => acc + Number(fd.totalEarned), 0)

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-primary/15 via-primary/5 to-accent/15 border border-primary/30 p-4 sm:p-8 group">
        <div className="absolute top-0 right-0 w-40 sm:w-64 h-40 sm:h-64 bg-primary/10 rounded-full blur-3xl -mr-16 sm:-mr-32 -mt-16 sm:-mt-32 group-hover:scale-110 transition-transform duration-500"></div>
        <div className="absolute bottom-0 left-10 sm:left-20 w-32 sm:w-40 h-32 sm:h-40 bg-accent/10 rounded-full blur-2xl -mb-16 sm:-mb-20 -ml-16 sm:-ml-20 group-hover:scale-125 transition-transform duration-500"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">My Fixed Deposits</h1>
            <Badge className="bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20 border gap-1.5">
              <Layers className="h-3 w-3" />
              Growing
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            Track and manage all your active investments and earnings
          </p>
        </div>
      </div>

      {/* Summary Cards - Professional Grid */}
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-3">
        {/* Total Locked */}
        <Card className="group relative rounded-xl sm:rounded-2xl overflow-hidden border border-border bg-card/50 hover:bg-card hover:border-primary/50 transition-all p-4 sm:p-6 hover:shadow-xl hover:shadow-primary/10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex h-12 sm:h-14 w-12 sm:w-14 items-center justify-center rounded-lg sm:rounded-xl bg-primary/20 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
              <Wallet className="h-6 sm:h-7 w-6 sm:w-7 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-widest">Total Locked</p>
              <p className="mt-2 text-xl sm:text-2xl font-bold text-foreground break-words">
                ${totalLocked.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>
        
        {/* Total Earned */}
        <Card className="group relative rounded-xl sm:rounded-2xl overflow-hidden border border-border bg-card/50 hover:bg-card hover:border-green-500/50 transition-all p-4 sm:p-6 hover:shadow-xl hover:shadow-green-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex h-12 sm:h-14 w-12 sm:w-14 items-center justify-center rounded-lg sm:rounded-xl bg-green-500/20 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
              <TrendingUp className="h-6 sm:h-7 w-6 sm:w-7 text-green-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-widest">Total Earned</p>
              <p className="mt-2 text-xl sm:text-2xl font-bold text-green-500 break-words">
                +${totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>
        
        {/* Active FDs */}
        <Card className="group relative rounded-xl sm:rounded-2xl overflow-hidden border border-border bg-card/50 hover:bg-card hover:border-blue-500/50 transition-all p-4 sm:p-6 hover:shadow-xl hover:shadow-blue-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex h-12 sm:h-14 w-12 sm:w-14 items-center justify-center rounded-lg sm:rounded-xl bg-blue-500/20 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
              <Flame className="h-6 sm:h-7 w-6 sm:w-7 text-blue-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-widest">Active FDs</p>
              <p className="mt-2 text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{activeFDs.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {allFDs.length === 0 ? (
        <Card className="relative rounded-2xl overflow-hidden border border-border bg-card/50 p-12 text-center hover:bg-card transition-all">
          <div className="relative z-10">
            <div className="flex justify-center mb-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Layers className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-foreground">No Fixed Deposits Yet</h3>
            <p className="mt-3 text-muted-foreground max-w-sm mx-auto">
              Start earning daily interest by creating your first Fixed Deposit today!
            </p>
            <Link href="/dashboard/create-fd">
              <Button className="mt-6 gap-2">
                <Zap className="h-4 w-4" />
                Create Your First FD
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList className="bg-secondary gap-1">
            <TabsTrigger value="active" className="data-[state=active]:bg-primary gap-2">
              <Flame className="h-4 w-4" />
              Active ({activeFDs.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-primary gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Completed ({completedFDs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeFDs.length === 0 ? (
              <Card className="rounded-2xl border-border bg-card/50 p-12 text-center hover:bg-card transition-all">
                <p className="text-muted-foreground text-lg mb-4">No active FDs currently</p>
                <Link href="/dashboard/create-fd">
                  <Button variant="outline" className="gap-2">
                    <Zap className="h-4 w-4" />
                    Create New FD
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeFDs.map((fd) => (
                  <FDCard key={fd.id} fd={fd} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedFDs.length === 0 ? (
              <Card className="rounded-2xl border-border bg-card/50 p-12 text-center hover:bg-card transition-all">
                <p className="text-muted-foreground text-lg">No completed FDs yet</p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completedFDs.map((fd) => (
                  <FDCard key={fd.id} fd={fd} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
