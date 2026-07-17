"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { togglePlanStatus, deletePlan } from "@/lib/admin-actions"
import { Loader2, Power, Trash2 } from "lucide-react"
import type { FDPlan } from "@/lib/types"

interface PlanActionsProps {
  plan: FDPlan
  compact?: boolean
}

export function PlanActions({ plan, compact }: PlanActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)
    await togglePlanStatus(plan.id, !plan.isActive)
    setIsLoading(false)
    router.refresh()
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this plan?")) return
    setIsLoading(true)
    await deletePlan(plan.id)
    setIsLoading(false)
    router.refresh()
  }

  if (compact) {
    return (
      <div className="flex gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleToggle}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Power className="h-4 w-4" />}
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleDelete}
          disabled={isLoading}
          className="text-red-500 hover:text-red-400"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="mt-4 flex gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        className="flex-1"
        onClick={handleToggle}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Power className="mr-2 h-4 w-4" />
        )}
        {plan.isActive ? "Deactivate" : "Activate"}
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleDelete}
        disabled={isLoading}
        className="text-red-500 hover:text-red-400"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
