"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toggleUserWithdrawal } from "@/lib/admin-actions"
import { Ban, CheckCircle, Loader2 } from "lucide-react"

interface WithdrawalToggleProps {
  userId: string
  userName: string
  isDisabled?: boolean
}

export function WithdrawalToggle({ userId, userName, isDisabled = false }: WithdrawalToggleProps) {
  const [disabled, setDisabled] = useState(isDisabled)
  const [isLoading, setIsLoading] = useState(false)

  async function handleToggle() {
    setIsLoading(true)
    try {
      const result = await toggleUserWithdrawal(userId, !disabled)
      if (result.success) {
        setDisabled(!disabled)
      }
    } catch (error) {
      console.error("Failed to toggle withdrawal:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={disabled ? "destructive" : "outline"}
      size="sm"
      onClick={handleToggle}
      disabled={isLoading}
      className={`min-w-[100px] ${
        disabled 
          ? "bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/30" 
          : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/30"
      }`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : disabled ? (
        <>
          <Ban className="h-4 w-4 mr-1" />
          Blocked
        </>
      ) : (
        <>
          <CheckCircle className="h-4 w-4 mr-1" />
          Enabled
        </>
      )}
    </Button>
  )
}
