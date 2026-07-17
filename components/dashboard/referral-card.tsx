"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Share2, Gift, CheckCircle, Users, Sparkles } from "lucide-react"
import { useState } from "react"

interface ReferralCardProps {
  referralCode: string
}

export function ReferralCard({ referralCode }: ReferralCardProps) {
  const [copied, setCopied] = useState(false)
  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
  const referralLink = `${baseUrl}/auth/sign-up?ref=${referralCode}`

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join CryptoFD - Earn 2-3.3% Daily",
        text: "I'm earning daily returns with CryptoFD! Join using my referral link and start your investment journey.",
        url: referralLink,
      })
    } else {
      handleCopy()
    }
  }

  return (
    <Card className="rounded-lg sm:rounded-2xl border-border bg-card overflow-hidden">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-4 sm:p-6 text-white">
        <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-white/20 backdrop-blur flex-shrink-0">
            <Gift className="h-5 sm:h-6 w-5 sm:w-6" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-bold">Invite & Earn</h3>
            <p className="text-xs sm:text-sm text-white/80">Get 10% commission</p>
          </div>
        </div>
        
        {/* Bonus tiers */}
        <div className="flex gap-2 mt-3 sm:mt-4">
          <div className="flex-1 rounded-lg bg-white/10 backdrop-blur p-2 sm:p-3 text-center hover:bg-white/15 transition-all">
            <p className="text-xs text-white/70">L1</p>
            <p className="font-bold text-sm sm:text-base">10%</p>
          </div>
          <div className="flex-1 rounded-lg bg-white/10 backdrop-blur p-2 sm:p-3 text-center hover:bg-white/15 transition-all">
            <p className="text-xs text-white/70">L2</p>
            <p className="font-bold text-sm sm:text-base">5%</p>
          </div>
          <div className="flex-1 rounded-lg bg-white/10 backdrop-blur p-2 sm:p-3 text-center hover:bg-white/15 transition-all">
            <p className="text-xs text-white/70">L3</p>
            <p className="font-bold text-sm sm:text-base">2%</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
        {/* Referral Code */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Code
          </label>
          <div className="mt-1.5 sm:mt-2 flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={referralCode || "Loading..."}
                readOnly
                className="bg-secondary/50 font-mono text-base sm:text-lg font-bold text-center tracking-wider h-9 sm:h-10"
              />
              <Sparkles className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary flex-shrink-0" />
            </div>
          </div>
        </div>

        {/* Referral Link */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Link
          </label>
          <div className="mt-1.5 sm:mt-2">
            <Input
              value={referralCode ? referralLink : "Loading..."}
              readOnly
              className="bg-secondary/50 text-xs sm:text-sm text-muted-foreground truncate h-9 sm:h-10"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-1">
          <Button 
            onClick={handleCopy} 
            className="flex-1 gap-2 h-9 sm:h-11 text-xs sm:text-sm" 
            disabled={!referralCode}
            variant={copied ? "secondary" : "default"}
          >
            {copied ? (
              <>
                <CheckCircle className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-emerald-500" />
                <span className="hidden xs:inline">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                <span className="hidden xs:inline">Copy</span>
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleShare} 
            className="flex-1 gap-2 h-9 sm:h-11 text-xs sm:text-sm" 
            disabled={!referralCode}
          >
            <Share2 className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
            <span className="hidden xs:inline">Share</span>
          </Button>
        </div>

        {/* Info */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <Users className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Earn when referrals invest. Unlimited potential!
          </p>
        </div>
      </div>
    </Card>
  )
}
