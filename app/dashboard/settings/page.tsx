import { redirect } from "next/navigation"
import Image from "next/image"
import { getCurrentUser } from "@/lib/auth"
import { getProfile } from "@/lib/queries"
import { SettingsForm } from "./settings-form"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { User, Shield, Bell, Lock, Check, Calendar } from "lucide-react"

export default async function SettingsPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  const profile = await getProfile()

  const settingsSections = [
    { icon: User, label: "Profile", description: "Manage your personal information", color: "text-primary bg-primary/10" },
    { icon: Shield, label: "Security", description: "Password and authentication", color: "text-green-500 bg-green-500/10" },
    { icon: Bell, label: "Notifications", description: "Email and push preferences", color: "text-blue-500 bg-blue-500/10" },
    { icon: Lock, label: "Privacy", description: "Data and account controls", color: "text-amber-500 bg-amber-500/10" },
  ]

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-transparent to-accent/10 border border-primary/20 p-4 sm:p-8">
        <div className="absolute top-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-primary/5 rounded-full blur-3xl -mr-16 sm:-mr-20 -mt-16 sm:-mt-20"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Settings</h1>
            <Badge className="bg-primary/10 text-primary border-primary/20 border">
              Account
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      {/* Settings Overview Cards */}
      <div className="grid gap-2 sm:gap-4 md:grid-cols-4">
        {settingsSections.map((section, index) => (
          <Card key={index} className="rounded-lg sm:rounded-xl border-border bg-card/50 hover:bg-card hover:border-primary/50 hover:shadow-lg transition-all p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className={`flex h-9 sm:h-10 w-9 sm:w-10 items-center justify-center rounded-lg ${section.color} flex-shrink-0`}>
                <section.icon className="h-4.5 sm:h-5 w-4.5 sm:w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-semibold text-foreground">{section.label}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">{section.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Account Info Card - Premium - Responsive Mobile First */}
      <Card className="rounded-lg sm:rounded-2xl border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20 overflow-hidden">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
            {/* Avatar - Show profile photo or initials */}
            <Avatar className="h-16 sm:h-20 w-16 sm:w-20 flex-shrink-0 mx-auto sm:mx-0 shadow-lg">
              {profile?.profilePhoto && (
                <AvatarImage 
                  src={profile.profilePhoto} 
                  alt={profile?.name || "User"}
                />
              )}
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-xl sm:text-2xl font-bold text-white">
                {profile?.name ? profile.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            {/* Account Details */}
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <h3 className="text-lg sm:text-2xl font-bold text-foreground truncate">{profile?.name || "User"}</h3>
              <p className="text-muted-foreground mt-1 text-sm truncate">{user.email}</p>
              
              {/* Status Badges */}
              <div className="flex flex-col sm:flex-row flex-wrap items-center sm:items-start gap-2 mt-4 justify-center sm:justify-start">
                <Badge variant="outline" className="text-xs gap-1 border-green-500/30 text-green-600 dark:text-green-400 bg-green-500/10 whitespace-nowrap">
                  <Check className="h-3 w-3 flex-shrink-0" />
                  {profile?.isVerified ? "Verified Account" : "Pending Verification"}
                </Badge>
                <Badge variant="outline" className="text-xs gap-1 border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10 whitespace-nowrap">
                  <Calendar className="h-3 w-3 flex-shrink-0" />
                  <span className="hidden sm:inline">Member since</span>
                  <span className="inline sm:hidden">Since</span> {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : "N/A"}
                </Badge>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex justify-center sm:justify-end">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-green-500/10 border border-green-500/20 flex-shrink-0">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-xs font-semibold text-green-600 dark:text-green-400">Active</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Settings Form */}
      <SettingsForm 
        email={user.email || ""}
        fullName={profile?.name || ""}
        phone={profile?.phone || ""}
        avatarUrl={(profile as any)?.profilePhoto || ""}
        usdtAddress={profile?.usdtAddress || ""}
      />
    </div>
  )
}
