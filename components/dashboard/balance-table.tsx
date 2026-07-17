"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, Lock, TrendingUp, Users, ArrowRight, Plus, CheckCircle2, Clock } from "lucide-react"
import Link from "next/link"

interface BalanceTableProps {
  availableBalance: number
  lockedBalance: number
  totalEarnings: number
  referralEarnings: number
}

export function BalanceTable({
  availableBalance,
  lockedBalance,
  totalEarnings,
  referralEarnings,
}: BalanceTableProps) {
  const balanceItems = [
    {
      label: "Available Balance",
      value: availableBalance,
      icon: Wallet,
      description: "Ready to withdraw or reinvest",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      withdrawable: true,
    },
    {
      label: "Locked in FDs",
      value: lockedBalance,
      icon: Lock,
      description: "Principal earning daily ROI",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      withdrawable: false,
    },
    {
      label: "FD Earnings",
      value: totalEarnings,
      icon: TrendingUp,
      description: "Cumulative earnings (in available)",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      withdrawable: true,
    },
    {
      label: "Referral Bonus",
      value: referralEarnings,
      icon: Users,
      description: "Team commissions (in available)",
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
      borderColor: "border-violet-500/20",
      withdrawable: true,
    },
  ]

  const totalPortfolio = availableBalance + lockedBalance

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-semibold">Balance Overview</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Total Portfolio: <span className="text-foreground font-bold text-lg">${totalPortfolio.toFixed(2)}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild size="sm" className="shadow-sm">
              <Link href="/dashboard/create-fd">
                <Plus className="h-4 w-4 mr-1.5" />
                New Investment
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/wallet">
                <Wallet className="h-4 w-4 mr-1.5" />
                Wallet
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Balance Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {balanceItems.map((item, index) => (
            <div 
              key={index} 
              className={`relative rounded-xl border ${item.borderColor} ${item.bgColor} p-5 transition-all hover:shadow-md`}
            >
              <div className="flex items-start justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.bgColor}`}>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                {item.withdrawable ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Withdrawable
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                    <Clock className="h-3.5 w-3.5" />
                    Locked
                  </span>
                )}
              </div>
              
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                <p className={`mt-1 text-2xl font-bold ${item.value > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                  ${item.value.toFixed(2)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Bar */}
        <div className="mt-6 rounded-xl bg-secondary/50 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Available to Withdraw</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">${availableBalance.toFixed(2)}</p>
              </div>
              <div className="h-10 w-px bg-border hidden sm:block" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Earnings</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">${(totalEarnings + referralEarnings).toFixed(2)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <Link href="/dashboard/create-fd?reinvest=true">
                  Reinvest Balance
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <Link href="/dashboard/wallet">
                  Withdraw
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
