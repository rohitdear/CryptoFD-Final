"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Minus, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { addUserBalance, deductUserBalance, setUserAdmin } from "@/lib/admin-actions"

interface UserActionsProps {
  userId: string
  isAdmin: boolean
}

export function UserActions({ userId, isAdmin }: UserActionsProps) {
  const router = useRouter()
  const [addAmount, setAddAmount] = useState("")
  const [deductAmount, setDeductAmount] = useState("")
  const [addDescription, setAddDescription] = useState("")
  const [deductDescription, setDeductDescription] = useState("")
  const [isAddingBalance, setIsAddingBalance] = useState(false)
  const [isDeductingBalance, setIsDeductingBalance] = useState(false)
  const [isTogglingAdmin, setIsTogglingAdmin] = useState(false)
  const [adminStatus, setAdminStatus] = useState(isAdmin)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleAddBalance = async () => {
    const amount = parseFloat(addAmount)
    if (!amount || amount <= 0) return

    setError(null)
    setSuccess(null)
    setIsAddingBalance(true)

    const result = await addUserBalance(userId, amount, addDescription || undefined)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(`Added $${amount.toFixed(2)} to user balance`)
      setAddAmount("")
      setAddDescription("")
      router.refresh()
    }

    setIsAddingBalance(false)
    setTimeout(() => setSuccess(null), 5000)
  }

  const handleDeductBalance = async () => {
    const amount = parseFloat(deductAmount)
    if (!amount || amount <= 0) return

    setError(null)
    setSuccess(null)
    setIsDeductingBalance(true)

    const result = await deductUserBalance(userId, amount, deductDescription || undefined)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(`Deducted $${amount.toFixed(2)} from user balance`)
      setDeductAmount("")
      setDeductDescription("")
      router.refresh()
    }

    setIsDeductingBalance(false)
    setTimeout(() => setSuccess(null), 5000)
  }

  const handleToggleAdmin = async (checked: boolean) => {
    setIsTogglingAdmin(true)
    setError(null)

    const result = await setUserAdmin(userId, checked)

    if ('error' in result) {
      setError(result.error as string)
    } else {
      setAdminStatus(checked)
      setSuccess(checked ? "User is now an admin" : "Admin privileges removed")
      router.refresh()
    }

    setIsTogglingAdmin(false)
    setTimeout(() => setSuccess(null), 5000)
  }

  return (
    <Card className="rounded-2xl border-border bg-card p-6">
      <h3 className="text-lg font-semibold text-foreground">Admin Actions</h3>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mt-4 border-green-500/50 bg-green-500/10">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-500">{success}</AlertDescription>
        </Alert>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Add Balance */}
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">Add Balance</h4>
          <Input
            type="number"
            placeholder="Amount"
            value={addAmount}
            onChange={(e) => setAddAmount(e.target.value)}
          />
          <Input
            placeholder="Description (optional)"
            value={addDescription}
            onChange={(e) => setAddDescription(e.target.value)}
          />
          <Button
            onClick={handleAddBalance}
            disabled={isAddingBalance || !addAmount}
            className="w-full"
          >
            {isAddingBalance ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Add Balance
          </Button>
        </div>

        {/* Deduct Balance */}
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">Deduct Balance</h4>
          <Input
            type="number"
            placeholder="Amount"
            value={deductAmount}
            onChange={(e) => setDeductAmount(e.target.value)}
          />
          <Input
            placeholder="Description (optional)"
            value={deductDescription}
            onChange={(e) => setDeductDescription(e.target.value)}
          />
          <Button
            variant="destructive"
            onClick={handleDeductBalance}
            disabled={isDeductingBalance || !deductAmount}
            className="w-full"
          >
            {isDeductingBalance ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Minus className="mr-2 h-4 w-4" />
            )}
            Deduct Balance
          </Button>
        </div>

        {/* Admin Toggle */}
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">Admin Access</h4>
          <div className="rounded-xl bg-secondary/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Admin Privileges</p>
                <p className="text-sm text-muted-foreground">
                  {adminStatus ? "User can access admin panel" : "Normal user access"}
                </p>
              </div>
              <Switch
                checked={adminStatus}
                onCheckedChange={handleToggleAdmin}
                disabled={isTogglingAdmin}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
