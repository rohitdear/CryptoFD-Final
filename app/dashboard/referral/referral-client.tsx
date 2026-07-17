"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Copy, 
  Share2, 
  Gift, 
  Users, 
  DollarSign,
  Award,
  CheckCircle,
  Zap,
  TrendingUp,
  Link2
} from "lucide-react"

interface LevelEarning {
  level: number
  referrals: number
  earnings: number
  commission: number
}

interface ReferralClientProps {
  referralCode: string
  totalEarnings: number
  totalReferrals: number
  levelEarnings: LevelEarning[]
}

const howItWorks = [
  { step: 1, title: "Share Your Link", description: "Share your unique referral link with friends and family", icon: Share2 },
  { step: 2, title: "They Join & Invest", description: "When they sign up and create a fixed deposit", icon: Users },
  { step: 3, title: "You Earn Commission", description: "Earn up to 10% commission on their daily earnings", icon: TrendingUp },
]

const levelColors: Record<number, { bg: string; text: string; border: string }> = {
  1: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
  2: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20" },
  3: { bg: "bg-cyan-500/10", text: "text-cyan-500", border: "border-cyan-500/20" },
  4: { bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/20" },
  5: { bg: "bg-orange-500/10", text: "text-orange-500", border: "border-orange-500/20" },
}

export function ReferralClient({ 
  referralCode, 
  totalEarnings, 
  totalReferrals,
  levelEarnings 
}: ReferralClientProps) {
  const [copied, setCopied] = useState(false)
  const referralLink = typeof window !== "undefined" 
    ? `${window.location.origin}/auth/sign-up?ref=${referralCode}`
    : `/auth/sign-up?ref=${referralCode}`

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join CryptoFD",
          text: `Join CryptoFD using my referral code ${referralCode} and start earning daily interest!`,
          url: referralLink,
        })
      } catch {
        // User cancelled sharing
      }
    } else {
      handleCopy(referralLink)
    }
  }

  // Fill in default levels if not present
  const displayLevels = Array.from({ length: 3 }, (_, i) => {
    const level = i + 1
    const found = levelEarnings.find((l) => l.level === level)
    return found || { level, referrals: 0, earnings: 0, commission: level === 1 ? 10 : level === 2 ? 5 : 2 }
  })

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-transparent to-accent/10 border border-primary/20 p-4 sm:p-8">
        <div className="absolute top-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-primary/5 rounded-full blur-3xl -mr-16 sm:-mr-20 -mt-16 sm:-mt-20"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Referral Program</h1>
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 border gap-1">
              <Zap className="h-3 w-3" />
              10% Commission
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            Invite friends and earn unlimited passive income
          </p>
        </div>
      </div>

      {/* Stats Cards - Professional Grid */}
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-lg sm:rounded-2xl border-border bg-card/50 hover:bg-card hover:border-green-500/50 hover:shadow-lg transition-all p-4 sm:p-6">
          <div className="flex items-start sm:items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Earnings</p>
              <p className="text-lg sm:text-2xl font-bold text-green-500 mt-2 break-words">
                ${totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-lg bg-green-500/10 flex-shrink-0">
              <DollarSign className="h-5 sm:h-6 w-5 sm:w-6 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="rounded-lg sm:rounded-2xl border-border bg-card/50 hover:bg-card hover:border-primary/50 hover:shadow-lg transition-all p-4 sm:p-6">
          <div className="flex items-start sm:items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Referrals</p>
              <p className="text-lg sm:text-2xl font-bold text-foreground mt-2">{totalReferrals}</p>
            </div>
            <div className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
              <Users className="h-5 sm:h-6 w-5 sm:w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="rounded-lg sm:rounded-2xl border-border bg-card/50 hover:bg-card hover:border-blue-500/50 hover:shadow-lg transition-all p-4 sm:p-6">
          <div className="flex items-start sm:items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">Direct Referrals</p>
              <p className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                {displayLevels[0]?.referrals || 0}
              </p>
            </div>
            <div className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-lg bg-blue-500/10 flex-shrink-0">
              <Gift className="h-5 sm:h-6 w-5 sm:w-6 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card className="rounded-lg sm:rounded-2xl border-border bg-card/50 hover:bg-card hover:border-amber-500/50 hover:shadow-lg transition-all p-4 sm:p-6">
          <div className="flex items-start sm:items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">Commission</p>
              <p className="text-lg sm:text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">Up to 10%</p>
            </div>
            <div className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-lg bg-amber-500/10 flex-shrink-0">
              <Award className="h-5 sm:h-6 w-5 sm:w-6 text-amber-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Referral Link Card - Enhanced */}
      <Card className="rounded-lg sm:rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-4 sm:p-8">
        <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex h-12 sm:h-14 w-12 sm:w-14 items-center justify-center rounded-lg sm:rounded-xl bg-primary/20 flex-shrink-0">
            <Link2 className="h-6 sm:h-7 w-6 sm:w-7 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg sm:text-2xl font-bold text-foreground">Your Referral Link</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Share to earn 10% on referrals' daily earnings</p>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="text-xs sm:text-sm font-semibold text-foreground block mb-2">Referral Code</label>
            <div className="flex gap-2 flex-col sm:flex-row">
              <Input
                value={referralCode}
                readOnly
                className="bg-secondary/50 font-mono text-sm sm:text-lg font-bold border-border"
              />
              <Button 
                variant="secondary" 
                onClick={() => handleCopy(referralCode)}
                className="whitespace-nowrap"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
            </div>
          </div>

          <div>
            <label className="text-xs sm:text-sm font-semibold text-foreground block mb-2">Referral Link</label>
            <div className="flex gap-2 flex-col sm:flex-row">
              <Input
                value={referralLink}
                readOnly
                className="bg-secondary/50 text-muted-foreground border-border text-xs sm:text-sm truncate"
              />
              <Button 
                variant="secondary" 
                onClick={() => handleCopy(referralLink)}
                className="whitespace-nowrap"
              >
                <Copy className="mr-2 h-4 w-4" />
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          <div className="flex gap-2 sm:gap-3 pt-2 sm:pt-3 flex-col sm:flex-row">
            <Button onClick={() => handleCopy(referralLink)} className="flex-1 gap-2 h-10 sm:h-11 text-sm sm:text-base">
              <Copy className="h-4 w-4" />
              Copy Full Link
            </Button>
            <Button variant="secondary" onClick={handleShare} className="flex-1 gap-2 h-10 sm:h-11 text-sm sm:text-base">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </Card>

      {/* Level-wise Earnings */}
      <Card className="rounded-2xl border-border bg-card p-6">
        <h3 className="text-xl font-bold text-foreground mb-6">Earnings by Level</h3>
        
        <div className="grid gap-4 sm:grid-cols-3">
          {displayLevels.map((level) => {
            const colors = levelColors[level.level]
            return (
              <div 
                key={level.level} 
                className={`rounded-xl border ${colors.border} ${colors.bg} p-6 hover:shadow-lg transition-all`}
              >
                <div className="flex items-center justify-between mb-4">
                  <Badge className={`${colors.bg} ${colors.text} border ${colors.border}`}>
                    Level {level.level}
                  </Badge>
                  <span className="text-sm font-bold text-foreground">{level.commission}% Commission</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total Earnings</p>
                    <p className={`text-2xl font-bold ${colors.text}`}>
                      ${level.earnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Referrals</p>
                    <p className="text-lg font-bold text-foreground">{level.referrals} members</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* How It Works */}
      <Card className="rounded-2xl border-border bg-card p-6">
        <h3 className="text-xl font-bold text-foreground mb-6">How It Works</h3>
        
        <div className="grid gap-8 sm:grid-cols-3">
          {howItWorks.map((item) => (
            <div key={item.step} className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground mb-4 flex-shrink-0">
                  {item.step}
                </div>
                <item.icon className="h-8 w-8 text-primary mb-3" />
                <h4 className="font-semibold text-foreground mb-2">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 p-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-green-600 dark:text-green-400 mb-1">Unlimited Earning Potential</p>
              <p className="text-sm text-muted-foreground">
                There&apos;s no limit to your referral income. The more you refer, the more you earn. Build your network and watch your passive income grow exponentially!
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
