"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, TrendingUp, Wallet, Lock, ArrowDownLeft, ArrowUpRight, Sparkles } from "lucide-react"
import Link from "next/link"

interface BalanceCardProps {
  totalBalance: number
  availableBalance: number
  lockedBalance: number
}

export function BalanceCard({ totalBalance, availableBalance, lockedBalance }: BalanceCardProps) {
  const [showBalance, setShowBalance] = useState(true)
  const [displayBalance, setDisplayBalance] = useState(totalBalance)

  useEffect(() => {
    const difference = totalBalance - displayBalance
    if (Math.abs(difference) < 0.01) {
      setDisplayBalance(totalBalance)
      return
    }
    
    const step = difference / 20
    const timer = setTimeout(() => {
      setDisplayBalance(prev => prev + step)
    }, 30)
    
    return () => clearTimeout(timer)
  }, [totalBalance, displayBalance])

  const formatBalance = (value: number) => {
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-4 sm:p-6 lg:p-8 shadow-2xl shadow-primary/20">
      {/* Background decorations */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
      <div className="absolute right-10 top-10 h-20 w-20 rounded-full bg-white/10 blur-xl" />
      
      <div className="relative z-10">
        {/* Header - Responsive layout */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-start sm:items-center gap-2 sm:gap-3">
            <div className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm flex-shrink-0">
              <Wallet className="h-5 sm:h-6 w-5 sm:w-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-medium text-white/70">Total Portfolio</p>
              <p className="text-xs sm:text-sm font-medium text-white/70">Value</p>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-1.5 text-white/70 hover:text-white hover:bg-white/10 mt-1 sm:hidden"
                onClick={() => setShowBalance(!showBalance)}
              >
                {showBalance ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Toggle visibility on desktop */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex h-8 px-2 text-white/70 hover:text-white hover:bg-white/10"
              onClick={() => setShowBalance(!showBalance)}
            >
              {showBalance ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
            
            {totalBalance > 0 && (
              <div className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-white/20 px-3 sm:px-4 py-1.5 sm:py-2 backdrop-blur-sm whitespace-nowrap">
                <Sparkles className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-yellow-300 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-white">Earning Daily</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Balance - Responsive sizing */}
        <div className="mt-4 sm:mt-6 lg:mt-8">
          <div className="flex flex-wrap items-baseline gap-1 sm:gap-2">
            <span className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              {showBalance ? `$${formatBalance(displayBalance)}` : "****"}
            </span>
            <span className="text-sm sm:text-lg lg:text-xl font-medium text-white/60">USDT</span>
          </div>
        </div>

        {/* Balance Breakdown - Responsive grid */}
        <div className="mt-5 sm:mt-8 lg:mt-10 grid grid-cols-2 gap-2.5 sm:gap-4">
          <div className="rounded-lg sm:rounded-2xl bg-white/10 p-3 sm:p-5 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all">
            <div className="flex items-start sm:items-center gap-2 sm:gap-3">
              <div className="flex h-9 sm:h-10 w-9 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-green-400/20 flex-shrink-0">
                <TrendingUp className="h-4 sm:h-5 w-4 sm:w-5 text-green-300" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-white/60">Available</p>
                <p className="text-base sm:text-xl font-bold text-white truncate">
                  {showBalance ? `$${formatBalance(availableBalance)}` : "****"}
                </p>
              </div>
            </div>
            <div className="mt-2 sm:mt-3 flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-green-400 flex-shrink-0" />
              <span className="text-xs text-green-300 truncate">Ready to withdraw</span>
            </div>
          </div>
          
          <div className="rounded-lg sm:rounded-2xl bg-white/10 p-3 sm:p-5 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all">
            <div className="flex items-start sm:items-center gap-2 sm:gap-3">
              <div className="flex h-9 sm:h-10 w-9 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-yellow-400/20 flex-shrink-0">
                <Lock className="h-4 sm:h-5 w-4 sm:w-5 text-yellow-300" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-white/60">Locked in FD</p>
                <p className="text-base sm:text-xl font-bold text-white truncate">
                  {showBalance ? `$${formatBalance(lockedBalance)}` : "****"}
                </p>
              </div>
            </div>
            <div className="mt-2 sm:mt-3 flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse flex-shrink-0" />
              <span className="text-xs text-yellow-300 truncate">Generating ROI</span>
            </div>
          </div>
        </div>

        {/* Quick Actions - Responsive buttons */}
        <div className="mt-5 sm:mt-8 lg:mt-10 flex flex-col sm:flex-row gap-2.5 sm:gap-4">
          <Button 
            asChild 
            size="lg"
            className="h-10 sm:h-12 lg:h-14 bg-white text-primary hover:bg-white/90 font-semibold text-xs sm:text-sm lg:text-base shadow-lg transition-all"
          >
            <Link href="/dashboard/wallet" className="flex items-center justify-center gap-2">
              <ArrowDownLeft className="h-4 sm:h-5 w-4 sm:w-5" />
              <span>Deposit</span>
            </Link>
          </Button>
          <Button 
            asChild 
            variant="outline" 
            size="lg"
            className="h-10 sm:h-12 lg:h-14 border-white/30 bg-white/10 text-white hover:bg-white/20 font-semibold text-xs sm:text-sm lg:text-base backdrop-blur-sm transition-all"
          >
            <Link href="/dashboard/wallet" className="flex items-center justify-center gap-2">
              <ArrowUpRight className="h-4 sm:h-5 w-4 sm:w-5" />
              <span>Withdraw</span>
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  )
}
