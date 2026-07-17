"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  User, 
  Shield, 
  Bell, 
  CreditCard, 
  Camera,
  Mail,
  Phone,
  Lock,
  Smartphone,
  Loader2,
  CheckCircle,
  AlertCircle,
  Upload,
  X
} from "lucide-react"
import { updateProfile, updatePassword, updateUSDTAddress } from "@/lib/actions"

interface SettingsFormProps {
  email: string
  fullName: string
  phone: string
  avatarUrl: string
  usdtAddress: string
}

export function SettingsForm({ 
  email, 
  fullName, 
  phone, 
  avatarUrl, 
  usdtAddress 
}: SettingsFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(avatarUrl || null)
  
  // Profile state
  const [profileData, setProfileData] = useState({
    fullName,
    phone,
  })
  
  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  
  // USDT address state
  const [usdtAddressState, setUsdtAddressState] = useState(usdtAddress)

  const initials = fullName
    ? fullName.split(" ").map((n) => n[0]).join("").toUpperCase()
    : email.charAt(0).toUpperCase()

  // Sync avatarUrl prop to photoPreview when prop changes (after router.refresh())
  useEffect(() => {
    if (avatarUrl && avatarUrl !== photoPreview) {
      console.log("[v0] Syncing avatarUrl to photoPreview:", avatarUrl)
      setPhotoPreview(avatarUrl)
    }
  }, [avatarUrl])

  const handlePhotoUpload = async (file: File) => {
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Only JPG, PNG, and WebP allowed")
      return
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setError("File too large. Maximum 5MB allowed")
      return
    }

    setError(null)
    setIsUploadingPhoto(true)

    try {
      const formData = new FormData()
      formData.append("photo", file)

      const response = await fetch("/api/user/profile-photo", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to upload photo")
      }

      const data = await response.json()
      // Set preview immediately from Cloudinary response - this is the new URL
      if (data.photo) {
        setPhotoPreview(data.photo)
        console.log("[v0] Avatar updated with Cloudinary URL:", data.photo)
      }
      setSuccess("Photo uploaded successfully!")
      // Refresh page after short delay to ensure database is updated
      setTimeout(() => {
        router.refresh()
      }, 500)
      setTimeout(() => setSuccess(null), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload photo")
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handlePhotoUpload(file)
      // Clear the input so the same file can be selected again
      e.target.value = ""
    }
  }

  const handleRemovePhoto = () => {
    setPhotoPreview(null)
  }

  const handleProfileSubmit = async () => {
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    const result = await updateProfile(profileData.fullName, profileData.phone)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    setSuccess("Profile updated successfully!")
    setIsLoading(false)
    router.refresh()
    setTimeout(() => setSuccess(null), 5000)
  }

  const handlePasswordSubmit = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setError(null)
    setSuccess(null)
    setIsLoading(true)

    const result = await updatePassword(passwordData.newPassword)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    setSuccess("Password updated successfully!")
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    setIsLoading(false)
    setTimeout(() => setSuccess(null), 5000)
  }

  const handleUSDTAddressSubmit = async () => {
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    const result = await updateUSDTAddress(usdtAddressState)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    setSuccess("Withdrawal address saved successfully!")
    setIsLoading(false)
    router.refresh()
    setTimeout(() => setSuccess(null), 5000)
  }

  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList className="bg-secondary">
        <TabsTrigger value="profile" className="gap-2 data-[state=active]:bg-primary">
          <User className="h-4 w-4" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="security" className="gap-2 data-[state=active]:bg-primary">
          <Shield className="h-4 w-4" />
          Security
        </TabsTrigger>
        <TabsTrigger value="notifications" className="gap-2 data-[state=active]:bg-primary">
          <Bell className="h-4 w-4" />
          Notifications
        </TabsTrigger>
        <TabsTrigger value="payment" className="gap-2 data-[state=active]:bg-primary">
          <CreditCard className="h-4 w-4" />
          Payment
        </TabsTrigger>
      </TabsList>

      {/* Profile Tab */}
      <TabsContent value="profile">
        <Card className="rounded-2xl border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground">Profile Information</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Update your personal information
          </p>

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

          <div className="mt-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  {(photoPreview || avatarUrl) && (
                    <AvatarImage 
                      src={photoPreview || avatarUrl} 
                      alt={fullName || "User"}
                      onError={(e) => {
                        console.log("[v0] Avatar image failed to load:", photoPreview || avatarUrl)
                        e.currentTarget.style.display = "none"
                      }}
                      onLoad={() => {
                        console.log("[v0] Avatar image loaded successfully:", photoPreview || avatarUrl)
                      }}
                    />
                  )}
                  <AvatarFallback className="bg-primary/20 text-primary text-xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  size="icon"
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                >
                  {isUploadingPhoto ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div>
                <p className="font-medium text-foreground">{fullName || "User"}</p>
                <p className="text-sm text-muted-foreground">{email}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  JPG, PNG or WebP (Max 5MB)
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm text-muted-foreground">Full Name</label>
                <Input 
                  value={profileData.fullName} 
                  onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                  className="mt-2 bg-secondary/50" 
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Email</label>
                <div className="mt-2 flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      value={email} 
                      readOnly 
                      className="bg-secondary/50 pl-10" 
                    />
                  </div>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm text-muted-foreground">Phone</label>
                <div className="mt-2 flex gap-2">
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      value={profileData.phone} 
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      placeholder="Enter your phone number"
                      className="bg-secondary/50 pl-10" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button 
              className="mt-6" 
              onClick={handleProfileSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </Card>
      </TabsContent>

      {/* Security Tab */}
      <TabsContent value="security">
        <div className="space-y-4">
          <Card className="rounded-2xl border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Change Password</h3>
                <p className="text-sm text-muted-foreground">Update your password regularly</p>
              </div>
            </div>

          {error && (
            <Alert variant="destructive" className="mt-3 sm:mt-4">
              <AlertCircle className="h-3.5 sm:h-4 w-3.5 sm:w-4 flex-shrink-0" />
              <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mt-3 sm:mt-4 border-green-500/50 bg-green-500/10">
              <CheckCircle className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-green-500 flex-shrink-0" />
              <AlertDescription className="text-xs sm:text-sm text-green-500">{success}</AlertDescription>
            </Alert>
          )}

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">New Password</label>
                <Input 
                  type="password" 
                  placeholder="Enter new password" 
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="mt-2 bg-secondary/50" 
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Confirm Password</label>
                <Input 
                  type="password" 
                  placeholder="Confirm new password" 
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="mt-2 bg-secondary/50" 
                />
              </div>
              <Button 
                onClick={handlePasswordSubmit}
                disabled={isLoading || !passwordData.newPassword || !passwordData.confirmPassword}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </div>
          </Card>

          <Card className="rounded-2xl border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
                  <Smartphone className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Two-Factor Authentication</h3>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
              </div>
              <Switch />
            </div>
          </Card>
        </div>
      </TabsContent>

      {/* Notifications Tab */}
      <TabsContent value="notifications">
        <Card className="rounded-lg sm:rounded-2xl border-border bg-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-foreground">Notification Preferences</h3>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Choose what notifications you want to receive
          </p>

          <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
            {[
              { title: "FD Maturity Alerts", description: "Get notified when your FD is about to mature" },
              { title: "Interest Credits", description: "Receive notifications when interest is credited" },
              { title: "Referral Earnings", description: "Get notified when you earn referral commission" },
              { title: "Withdrawal Updates", description: "Receive updates on withdrawal status" },
              { title: "Security Alerts", description: "Get notified about account security events" },
              { title: "Promotional Offers", description: "Receive updates about new offers and promotions" },
            ].map((item) => (
              <div key={item.title} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 rounded-lg sm:rounded-xl bg-secondary/30 p-3 sm:p-4">
                <div className="min-w-0">
                  <p className="text-sm sm:text-base font-medium text-foreground">{item.title}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{item.description}</p>
                </div>
                <div className="flex-shrink-0">
                  <Switch defaultChecked />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </TabsContent>

      {/* Payment Tab */}
      <TabsContent value="payment">
        <Card className="rounded-lg sm:rounded-2xl border-border bg-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-foreground">Withdrawal Address</h3>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Manage your default withdrawal addresses
          </p>

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

          <div className="mt-6 space-y-3 sm:space-y-4">
            <div>
              <label className="text-xs sm:text-sm text-muted-foreground font-medium">Default USDT (BEP-20) Address</label>
              <Input 
                placeholder="Enter your BEP-20 (BSC) wallet address (0x...)" 
                value={usdtAddressState}
                onChange={(e) => setUsdtAddressState(e.target.value)}
                className="mt-2 bg-secondary/50 font-mono text-xs sm:text-sm h-9 sm:h-10 break-words"
              />
            </div>

            <div className="rounded-lg sm:rounded-xl bg-yellow-500/10 p-3 sm:p-4 border border-yellow-500/20">
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                <span className="font-medium text-yellow-600 dark:text-yellow-500">Note:</span> Make sure you enter a valid BEP-20 (BSC) address starting with 0x. Withdrawals to incorrect addresses cannot be recovered.
              </p>
            </div>

            <Button 
              onClick={handleUSDTAddressSubmit}
              disabled={isLoading || !usdtAddressState}
              className="w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Address"
              )}
            </Button>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
