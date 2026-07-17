"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface SiteStats {
  id: string
  activeUsers: string
  totalInvested: string
  countries: string
  yearsExp: string
  supportEmail: string
  updatedAt: string
}

export default function SiteSettingsPage() {
  const { toast } = useToast()
  const [stats, setStats] = useState<SiteStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    activeUsers: "",
    totalInvested: "",
    countries: "",
    yearsExp: "",
    supportEmail: "",
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/site-stats")
      if (!response.ok) throw new Error("Failed to fetch stats")
      const data = await response.json()
      setStats(data)
      setFormData({
        activeUsers: data.activeUsers,
        totalInvested: data.totalInvested,
        countries: data.countries,
        yearsExp: data.yearsExp,
        supportEmail: data.supportEmail,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
      toast({
        title: "Error",
        description: "Failed to load site statistics",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    try {
      console.log("[AdminForm] Save button clicked")
      setSaving(true)
      console.log("[AdminForm] Sending data to API:", formData)
      
      const response = await fetch("/api/admin/site-stats", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      console.log("[AdminForm] API Response status:", response.status)
      
      if (!response.ok) throw new Error("Failed to save stats")
      
      const data = await response.json()
      console.log("[AdminForm] API Response data:", data)
      
      setStats(data.data)
      toast({
        title: "Success",
        description: "Site statistics updated successfully. About page will update in seconds.",
      })
      
      // Give server time to revalidate cache, then reload page to fetch fresh data
      console.log("[AdminForm] Reloading page in 1.5 seconds...")
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      console.error("[AdminForm] Error saving stats:", error)
      toast({
        title: "Error",
        description: "Failed to save site statistics",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Site Settings</h1>
        <p className="text-muted-foreground mt-2">Manage site statistics and public information</p>
      </div>

      {/* Site Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle>About Page Statistics</CardTitle>
          <CardDescription>
            These values appear on the public About page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Active Users */}
          <div className="space-y-2">
            <Label htmlFor="activeUsers">Active Users</Label>
            <Input
              id="activeUsers"
              name="activeUsers"
              value={formData.activeUsers}
              onChange={handleChange}
              placeholder="e.g., 10,000+"
            />
            <p className="text-xs text-muted-foreground">
              Display value for active users statistic
            </p>
          </div>

          {/* Total Invested */}
          <div className="space-y-2">
            <Label htmlFor="totalInvested">Total Invested</Label>
            <Input
              id="totalInvested"
              name="totalInvested"
              value={formData.totalInvested}
              onChange={handleChange}
              placeholder="e.g., $5M+"
            />
            <p className="text-xs text-muted-foreground">
              Display value for total invested statistic
            </p>
          </div>

          {/* Countries */}
          <div className="space-y-2">
            <Label htmlFor="countries">Countries</Label>
            <Input
              id="countries"
              name="countries"
              value={formData.countries}
              onChange={handleChange}
              placeholder="e.g., 50+"
            />
            <p className="text-xs text-muted-foreground">
              Number of countries served
            </p>
          </div>

          {/* Years Experience */}
          <div className="space-y-2">
            <Label htmlFor="yearsExp">Years Experience</Label>
            <Input
              id="yearsExp"
              name="yearsExp"
              value={formData.yearsExp}
              onChange={handleChange}
              placeholder="e.g., 3+"
            />
            <p className="text-xs text-muted-foreground">
              Years of experience in the industry
            </p>
          </div>

          {/* Support Email */}
          <div className="space-y-2">
            <Label htmlFor="supportEmail">Support Email</Label>
            <Input
              id="supportEmail"
              name="supportEmail"
              type="email"
              value={formData.supportEmail}
              onChange={handleChange}
              placeholder="support@cryptofdforever.com"
            />
            <p className="text-xs text-muted-foreground">
              Email address displayed on the About page
            </p>
          </div>

          {/* Last Updated */}
          {stats && (
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Last updated: {new Date(stats.updatedAt).toLocaleString()}
              </p>
            </div>
          )}

          {/* Save Button */}
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full mt-6"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
