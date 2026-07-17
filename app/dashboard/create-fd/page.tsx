import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getFDPlans, getProfile } from "@/lib/queries"
import { CreateFDForm } from "./create-fd-form"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Shield, Clock, Coins, Zap } from "lucide-react"

export default async function CreateFDPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  const [plans, profile] = await Promise.all([
    getFDPlans(),
    getProfile(),
  ])

  const features = [
    { icon: TrendingUp, label: "Daily Returns", value: "2% - 3.3%", color: "text-green-500 bg-green-500/10" },
    { icon: Clock, label: "Lock Period", value: "30 Days", color: "text-blue-500 bg-blue-500/10" },
    { icon: Shield, label: "Capital Safe", value: "100%", color: "text-primary bg-primary/10" },
    { icon: Coins, label: "Min Investment", value: "$50 USDT", color: "text-amber-500 bg-amber-500/10" },
  ]

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-transparent to-accent/10 border border-primary/20 p-4 sm:p-8">
        <div className="absolute top-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-primary/5 rounded-full blur-3xl -mr-16 sm:-mr-20 -mt-16 sm:-mt-20"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">New Investment</h1>
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 border gap-1">
              <Zap className="h-3 w-3" />
              High Returns
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            Choose a plan and start earning daily interest on your USDT
          </p>
        </div>
      </div>

      {/* Key Features Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        {features.map((feature, index) => (
          <Card key={index} className="rounded-lg sm:rounded-xl border-border bg-card/50 hover:bg-card hover:border-primary/50 transition-all p-3 sm:p-4 hover:shadow-lg">
            <div className="flex items-start sm:items-center gap-2 sm:gap-3">
              <div className={`flex h-9 sm:h-10 w-9 sm:w-10 items-center justify-center rounded-lg ${feature.color} flex-shrink-0`}>
                <feature.icon className="h-4.5 sm:h-5 w-4.5 sm:w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate">{feature.label}</p>
                <p className="text-xs sm:text-sm font-bold text-foreground truncate">{feature.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Form */}
      <CreateFDForm 
        plans={plans} 
        availableBalance={Number(profile?.walletBalance) || 0} 
      />

      {/* Security Info Section */}
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
        <Card className="rounded-xl sm:rounded-2xl border-border bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20 p-4 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-green-500/20 flex-shrink-0">
              <Shield className="h-5 sm:h-6 w-5 sm:w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">Your Investment is Secure</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Your principal is 100% safe. After the 30-day lock period, your full investment plus all earned returns are credited to your wallet.
              </p>
            </div>
          </div>
        </Card>

        <Card className="rounded-xl sm:rounded-2xl border-border bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/20 p-4 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-blue-500/20 flex-shrink-0">
              <TrendingUp className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">Daily Earnings</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Earn daily from day 1. Withdrawable anytime without penalties or waiting periods.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
