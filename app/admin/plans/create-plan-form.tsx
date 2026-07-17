"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createPlan } from "@/lib/admin-actions"
import { Loader2, Plus } from "lucide-react"

export function CreatePlanForm() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    min_amount: "",
    max_amount: "",
    daily_roi: "",
    duration_days: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    await createPlan({
      name: formData.name,
      min_amount: parseFloat(formData.min_amount),
      max_amount: parseFloat(formData.max_amount),
      daily_roi: parseFloat(formData.daily_roi),
      duration_days: parseInt(formData.duration_days),
    })

    setFormData({
      name: "",
      min_amount: "",
      max_amount: "",
      daily_roi: "",
      duration_days: "",
    })
    setIsOpen(false)
    setIsLoading(false)
    router.refresh()
  }

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Create New Plan
      </Button>
    )
  }

  return (
    <Card className="rounded-2xl border-border bg-card p-6">
      <h3 className="text-lg font-semibold text-foreground">Create New Plan</h3>
      
      <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className="text-sm text-muted-foreground">Plan Name</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Gold"
            className="mt-1 bg-secondary/50"
            required
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Min Amount ($)</label>
          <Input
            type="number"
            value={formData.min_amount}
            onChange={(e) => setFormData({ ...formData, min_amount: e.target.value })}
            placeholder="100"
            className="mt-1 bg-secondary/50"
            required
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Max Amount ($)</label>
          <Input
            type="number"
            value={formData.max_amount}
            onChange={(e) => setFormData({ ...formData, max_amount: e.target.value })}
            placeholder="5000"
            className="mt-1 bg-secondary/50"
            required
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Daily ROI (%)</label>
          <Input
            type="number"
            step="0.01"
            value={formData.daily_roi}
            onChange={(e) => setFormData({ ...formData, daily_roi: e.target.value })}
            placeholder="1.5"
            className="mt-1 bg-secondary/50"
            required
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Duration (days)</label>
          <Input
            type="number"
            value={formData.duration_days}
            onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
            placeholder="30"
            className="mt-1 bg-secondary/50"
            required
          />
        </div>
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-5">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Plan
              </>
            )}
          </Button>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}
