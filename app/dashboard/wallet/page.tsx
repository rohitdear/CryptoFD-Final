import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getProfile } from "@/lib/queries"
import { WalletForm } from "./wallet-form"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, ArrowDownToLine, ArrowUpFromLine, Shield, Zap, Clock, CreditCard } from "lucide-react"

export default async function WalletPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  const profile = await getProfile()

  const walletBalance = Number(profile?.walletBalance) || 0
  const lockedBalance = Number(profile?.lockedBalance) || 0
  const totalBalance = walletBalance + lockedBalance

  const features = [
    { icon: Zap, label: "Instant Deposits", description: "Auto-detected within minutes", color: "text-green-500 bg-green-500/10 border-green-500/20" },
    { icon: Clock, label: "Fast Withdrawals", description: "Processed within 1 hour", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
    { icon: Shield, label: "Secure Network", description: "BEP-20 (BSC) Only", color: "text-primary bg-primary/10 border-primary/20" },
  ]

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/15 via-primary/5 to-accent/15 border border-primary/30 p-4 sm:p-8">
        <div className="absolute top-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-primary/5 rounded-full blur-3xl -mr-16 sm:-mr-20 -mt-16 sm:-mt-20"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Wallet</h1>
            <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 border gap-1">
              <CreditCard className="h-3 w-3" />
              BEP-20
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage your USDT deposits and withdrawals securely
          </p>
        </div>
      </div>

      {/* Balance Overview - Professional Cards */}
      <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
        {/* Total Balance */}
        <Card className="group relative rounded-xl sm:rounded-2xl overflow-hidden border border-border bg-card/50 hover:bg-card hover:border-primary/50 transition-all p-4 sm:p-6 hover:shadow-xl hover:shadow-primary/10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex h-12 sm:h-14 w-12 sm:w-14 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <Wallet className="h-6 sm:h-7 w-6 sm:w-7 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Total Balance</p>
                <p className="text-xl sm:text-3xl font-bold text-foreground mt-1 break-words">
                  ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Available */}
        <Card className="group relative rounded-xl sm:rounded-2xl overflow-hidden border border-border bg-card/50 hover:bg-card hover:border-green-500/50 transition-all p-4 sm:p-6 hover:shadow-xl hover:shadow-green-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex h-12 sm:h-14 w-12 sm:w-14 items-center justify-center rounded-lg sm:rounded-xl bg-green-500/20 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <ArrowDownToLine className="h-6 sm:h-7 w-6 sm:w-7 text-green-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Available</p>
                <p className="text-xl sm:text-3xl font-bold text-green-500 mt-1 break-words">
                  ${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Locked in FDs */}
        <Card className="group relative rounded-xl sm:rounded-2xl overflow-hidden border border-border bg-card/50 hover:bg-card hover:border-amber-500/50 transition-all p-4 sm:p-6 hover:shadow-xl hover:shadow-amber-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex h-12 sm:h-14 w-12 sm:w-14 items-center justify-center rounded-lg sm:rounded-xl bg-amber-500/20 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <ArrowUpFromLine className="h-6 sm:h-7 w-6 sm:w-7 text-amber-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Locked in FDs</p>
                <p className="text-xl sm:text-3xl font-bold text-amber-500 mt-1 break-words">
                  ${lockedBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Features Row - Enhanced */}
      <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
        {features.map((feature, index) => (
          <Card key={index} className="group rounded-xl sm:rounded-2xl border border-border bg-card/50 hover:bg-card hover:border-primary/50 transition-all p-4 sm:p-5 hover:shadow-lg">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4">
              <div className={`flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl ${feature.color} border transition-all group-hover:scale-110 flex-shrink-0`}>
                <feature.icon className="h-5 sm:h-6 w-5 sm:w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-bold text-foreground truncate">{feature.label}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">{feature.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Form */}
      <WalletForm 
        availableBalance={walletBalance}
        savedAddress={profile?.usdtAddress || ""}
      />
    </div>
  )
}
