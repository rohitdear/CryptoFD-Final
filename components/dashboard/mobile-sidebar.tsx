"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
import {
  LayoutDashboard,
  Zap,
  Layers,
  Wallet,
  History,
  TrendingUp,
  Users,
  Gift,
  Settings,
  Info,
  LogOut,
  Shield,
  BarChart3,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, color: "text-blue-500" },
  { name: "New Investment", href: "/dashboard/create-fd", icon: Zap, color: "text-emerald-500", badge: "NEW" },
  { name: "My Investments", href: "/dashboard/my-fds", icon: Layers, color: "text-violet-500" },
  { name: "Wallet", href: "/dashboard/wallet", icon: Wallet, color: "text-amber-500" },
  { name: "Transactions", href: "/dashboard/transactions", icon: History, color: "text-cyan-500" },
  { name: "Analytics", href: "/dashboard/our-works", icon: BarChart3, color: "text-pink-500" },
  { name: "Team", href: "/dashboard/team", icon: Users, color: "text-indigo-500" },
  { name: "Referral Program", href: "/dashboard/referral", icon: Gift, color: "text-orange-500", badge: "EARN" },
  { name: "Settings", href: "/dashboard/settings", icon: Settings, color: "text-slate-500" },
  { name: "About", href: "/dashboard/about", icon: Info, color: "text-teal-500" },
]

interface MobileSidebarProps {
  onClose?: () => void
}

export function MobileSidebar({ onClose }: MobileSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.href = "/auth/login"
  }

  const handleNavigate = (href: string) => {
    onClose?.()
  }

  return (
    <div className="flex h-full flex-col bg-sidebar">
      {/* Logo Section - MATCHING DESKTOP STYLE */}
      <div className="flex h-20 items-center border-b border-border px-6 bg-gradient-to-r from-primary/5 to-primary/10">
        <Link href="/dashboard" className="group" onClick={() => onClose?.()}>
          <Logo size="md" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-4 scrollbar-thin">
        {/* Main Menu Label */}
        <p className="mb-4 px-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
          Main Menu
        </p>

        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => handleNavigate(item.href)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-primary-foreground" : item.color)} />
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <span className={cn(
                  "ml-auto px-2 py-0.5 text-[10px] font-bold rounded-full",
                  isActive
                    ? "bg-white/20 text-primary-foreground"
                    : "bg-primary/10 text-primary"
                )}>
                  {item.badge}
                </span>
              )}
              {isActive && <div className="h-2 w-2 rounded-full bg-primary-foreground flex-shrink-0" />}
            </Link>
          )
        })}
      </nav>

      {/* Verification & Sign Out */}
      <div className="space-y-3 border-t border-border px-4 py-4">
        {/* Verification Badge */}
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 border border-emerald-500/20">
          <Shield className="h-4 w-4 text-emerald-500 flex-shrink-0" />
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Account Verified</span>
        </div>

        {/* Sign Out Button */}
        <Button
          variant="destructive"
          className="w-full flex items-center justify-center gap-2"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
