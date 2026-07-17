"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Check, Clock, Loader2, AlertCircle, Sparkles } from "lucide-react"
import { createFD } from "@/lib/actions"
import type { FDPlan } from "@/lib/types"

interface CreateFDFormProps {
  plans: FDPlan[]
  availableBalance: number
}

// Find the best matching plan for a given amount
function findBestPlanForAmount(plans: FDPlan[], amount: number): FDPlan | null {
  if (amount <= 0 || plans.length === 0) return null
  
  // Find plans where the amount fits within min/max range
  const matchingPlans = plans.filter(
    (plan) => amount >= plan.minAmount && amount <= plan.maxAmount
  )
  
  if (matchingPlans.length > 0) {
    // Return the plan with highest daily ROI among matching plans
    return matchingPlans.reduce((best, current) => 
      current.dailyRoi > best.dailyRoi ? current : best
    )
  }
  
  // If no exact match, find the closest plan
  // First try plans where amount is above minAmount (user can invest that amount)
  const plansAboveMin = plans.filter((plan) => amount >= plan.minAmount)
  if (plansAboveMin.length > 0) {
    // Return the plan with highest minAmount that's still below the amount
    return plansAboveMin.reduce((best, current) => 
      current.minAmount > best.minAmount ? current : best
    )
  }
  
  // If amount is below all minimums, return the plan with lowest minimum
  return plans.reduce((lowest, current) => 
    current.minAmount < lowest.minAmount ? current : lowest
  )
}

export function CreateFDForm({ plans, availableBalance }: CreateFDFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isReinvest = searchParams.get("reinvest") === "true"
  
  // Auto-select best plan based on available balance for reinvest
  const recommendedPlan = useMemo(() => {
    return findBestPlanForAmount(plans, availableBalance)
  }, [plans, availableBalance])
  
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(() => {
    // If reinvesting, auto-select the recommended plan
    if (isReinvest && recommendedPlan) {
      return recommendedPlan.id
    }
    return plans[1]?.id || plans[0]?.id || null
  })
  
  const [amount, setAmount] = useState(() => {
    // If reinvesting, pre-fill with available balance
    if (isReinvest && availableBalance > 0) {
      return availableBalance.toString()
    }
    return ""
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Auto-select plan when amount changes
  useEffect(() => {
    const amountNum = parseFloat(amount) || 0
    if (amountNum > 0) {
      const bestPlan = findBestPlanForAmount(plans, amountNum)
      if (bestPlan && bestPlan.id !== selectedPlanId) {
        // Only auto-switch if the current plan doesn't support this amount
        const currentPlan = plans.find(p => p.id === selectedPlanId)
        if (currentPlan && (amountNum < currentPlan.minAmount || amountNum > currentPlan.maxAmount)) {
          setSelectedPlanId(bestPlan.id)
        }
      }
    }
  }, [amount, plans, selectedPlanId])

  const selectedPlan = plans.find((p) => p.id === selectedPlanId)
  const amountNum = parseFloat(amount) || 0
  
  // Calculate estimated returns
  const dailyEarning = selectedPlan ? (amountNum * selectedPlan.dailyRoi) / 100 : 0
  const totalROI = selectedPlan ? dailyEarning * selectedPlan.durationDays : 0
  const totalReturn = amountNum + totalROI
  const totalROIPercentage = selectedPlan ? selectedPlan.dailyRoi * selectedPlan.durationDays : 0

  const handleSubmit = async () => {
    if (!selectedPlanId || amountNum <= 0) return
    
    setError(null)
    setIsLoading(true)

    const result = await createFD(selectedPlanId, amountNum)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    router.push("/dashboard/my-fds")
    router.refresh()
  }

  const isValidAmount = selectedPlan && amountNum >= selectedPlan.minAmount && amountNum <= selectedPlan.maxAmount
  const hasEnoughBalance = amountNum <= availableBalance

  return (
    <>
      {/* Available Balance - Re-invest Section */}
      <Card className="rounded-2xl border-primary/50 bg-primary/5 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Re-invest from Available Balance</p>
                <p className="text-2xl font-bold text-foreground">
                  ${availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
                </p>
              </div>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setAmount(availableBalance.toString())}
            disabled={availableBalance <= 0}
            className="border-primary/50 hover:bg-primary/10"
          >
            Use Full Balance
          </Button>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Your available balance includes deposits, daily earnings, and referral bonuses - all ready to re-invest!
        </p>
      </Card>

      {/* FD Plans */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {plans.map((plan, index) => {
          const isRecommended = recommendedPlan?.id === plan.id && availableBalance > 0
          return (
          <Card
            key={plan.id}
            onClick={() => setSelectedPlanId(plan.id)}
            className={`relative cursor-pointer rounded-2xl border-2 p-6 transition-all hover:border-primary/50 ${
              selectedPlanId === plan.id
                ? "border-primary bg-primary/5"
                : "border-border bg-card"
            }`}
          >
            {isRecommended && (
              <Badge className="absolute -top-2 left-4 bg-emerald-500 text-white flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Best Match
              </Badge>
            )}
            {index === 2 && !isRecommended && (
              <Badge className="absolute -top-2 right-4 bg-primary text-primary-foreground">
                Popular
              </Badge>
            )}
            
            {selectedPlanId === plan.id && (
              <div className="absolute right-4 top-4">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                  <Check className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>
            )}

            <div className="text-lg font-semibold text-foreground">{plan.name}</div>

            <div className="mt-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{plan.durationDays} Days</span>
            </div>

            <div className="mt-4">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-green-500">{plan.dailyRoi}%</span>
                <span className="text-sm text-muted-foreground">/day</span>
              </div>
            </div>

            <div className="mt-4 text-sm text-muted-foreground">
              ${plan.minAmount.toLocaleString()} - ${plan.maxAmount.toLocaleString()}
            </div>
          </Card>
        )})}
      </div>

      {/* Amount Input */}
      <Card className="rounded-2xl border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground">Enter Amount</h3>
        
        {selectedPlan && (
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Min: ${selectedPlan.minAmount.toLocaleString()}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Max: ${selectedPlan.maxAmount.toLocaleString()}
            </Badge>
          </div>
        )}
        
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="mt-4">
          <div className="relative">
            <Input
              type="number"
              placeholder={selectedPlan ? `Enter $${selectedPlan.minAmount} - $${selectedPlan.maxAmount}` : "Select a plan first"}
              value={amount}
              onChange={(e) => {
                const val = e.target.value
                setAmount(val)
              }}
              min={selectedPlan?.minAmount}
              max={selectedPlan?.maxAmount}
              className={`h-14 bg-secondary/50 pr-20 text-lg ${
                amountNum > 0 && selectedPlan && (amountNum < selectedPlan.minAmount || amountNum > selectedPlan.maxAmount)
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
              USDT
            </span>
          </div>
          
          {/* Amount validation message */}
          {amountNum > 0 && selectedPlan && (amountNum < selectedPlan.minAmount || amountNum > selectedPlan.maxAmount) && (
            <p className="mt-2 text-sm text-red-500">
              Amount must be between ${selectedPlan.minAmount.toLocaleString()} and ${selectedPlan.maxAmount.toLocaleString()} for {selectedPlan.name} plan
            </p>
          )}
          
          {/* Quick amount buttons - filtered by selected plan */}
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedPlan && [selectedPlan.minAmount, Math.round((selectedPlan.minAmount + selectedPlan.maxAmount) / 4), Math.round((selectedPlan.minAmount + selectedPlan.maxAmount) / 2), selectedPlan.maxAmount].map((value) => (
              <Button
                key={value}
                variant="secondary"
                size="sm"
                onClick={() => setAmount(value.toString())}
                disabled={value > availableBalance}
                className="flex-1 min-w-[70px]"
              >
                ${value.toLocaleString()}
              </Button>
            ))}
          </div>
        </div>

        {/* Calculated Returns */}
        {selectedPlan && amountNum > 0 && (
          <div className="mt-6 rounded-xl bg-secondary/30 p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-muted-foreground">Estimated Returns</h4>
              <Badge variant="secondary" className="text-emerald-600 bg-emerald-500/10">
                {totalROIPercentage.toFixed(0)}% Total ROI
              </Badge>
            </div>
            
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Principal Amount</span>
                <span className="font-medium text-foreground">${amountNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Daily ROI Rate</span>
                <span className="font-medium text-foreground">{selectedPlan.dailyRoi}% per day</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Daily Earning</span>
                <span className="font-medium text-green-500">
                  +${dailyEarning.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Duration</span>
                <span className="font-medium text-foreground">{selectedPlan.durationDays} days</span>
              </div>
              
              <div className="flex items-center justify-between text-emerald-600">
                <span className="text-sm">Total Interest Earned</span>
                <span className="font-semibold">
                  +${totalROI.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
                </span>
              </div>
              
              <div className="border-t border-border pt-3 mt-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-foreground">Total Returns</span>
                    <p className="text-xs text-muted-foreground">Principal + Interest after {selectedPlan.durationDays} days</p>
                  </div>
                  <span className="text-xl font-bold text-foreground">${totalReturn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT</span>
                </div>
              </div>
            </div>
            
            {/* Calculation breakdown */}
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Calculation:</span>{" "}
                ${amountNum.toLocaleString()} × {selectedPlan.dailyRoi}% × {selectedPlan.durationDays} days = ${totalROI.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} interest
              </p>
            </div>
          </div>
        )}

        <Button 
          className="mt-6 h-12 w-full text-base" 
          disabled={!selectedPlan || !isValidAmount || !hasEnoughBalance || isLoading}
          onClick={handleSubmit}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating FD...
            </>
          ) : !hasEnoughBalance ? (
            "Insufficient Balance"
          ) : !isValidAmount && amountNum > 0 ? (
            `Amount must be between $${selectedPlan?.minAmount} - $${selectedPlan?.maxAmount}`
          ) : (
            "Create Fixed Deposit"
          )}
        </Button>
      </Card>
    </>
  )
}
