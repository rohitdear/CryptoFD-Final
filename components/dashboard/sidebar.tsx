"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
  HelpCircle,
  ExternalLink,
  Info,
  BarChart3,
} from "lucide-react"

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

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar">
      <div className="flex h-full flex-col">
        {/* Logo Section - Enhanced */}
        <div className="flex h-20 items-center border-b border-border px-6 bg-gradient-to-r from-primary/5 to-primary/10">
          <Link href="/dashboard" className="group">
            <Logo size="md" />
          </Link>
        </div>

        {/* Navigation - Enhanced */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-4 scrollbar-thin">
          <p className="mb-4 px-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            Main Menu
          </p>
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-200 relative",
                  isActive
                    ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:bg-sidebar-accent/80 hover:text-foreground"
                )}
              >
                {/* Icon with background circle */}
                <div className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200",
                  isActive 
                    ? "bg-primary-foreground/20" 
                    : "bg-transparent group-hover:bg-sidebar-accent/50"
                )}>
                  <item.icon className={cn(
                    "h-5 w-5 transition-all duration-200",
                    isActive ? "text-primary-foreground" : item.color
                  )} />
                </div>
                
                {/* Text with glow effect on hover */}
                <span className={cn(
                  "flex-1 transition-all duration-200",
                  isActive && "font-semibold"
                )}>
                  {item.name}
                </span>

                {/* Badge */}
                {item.badge && (
                  <span className={cn(
                    "ml-auto rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide transition-all duration-200",
                    isActive
                      ? "bg-primary-foreground/30 text-primary-foreground"
                      : item.badge === "EARN"
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/30"
                      : "bg-blue-500/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500/30"
                  )}>
                    {item.badge}
                  </span>
                )}

                {/* Active indicator line */}
                {isActive && (
                  <div className="absolute -right-4 h-6 w-1.5 rounded-l-lg bg-gradient-to-b from-primary-foreground/60 via-primary-foreground to-primary-foreground/20" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* Bottom Section - Enhanced */}
        <div className="p-4 space-y-3">
          {/* Premium Help Card - Compact */}
          <div className="group relative rounded-lg overflow-hidden">
            <div className="relative rounded-lg bg-primary/10 p-2.5 border border-primary/25 backdrop-blur-sm group-hover:border-primary/40 transition-all duration-300">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/20">
                  <HelpCircle className="h-3.5 w-3.5 text-primary" />
                </div>
                <p className="text-xs font-semibold text-foreground">24/7 Support</p>
              </div>
              <Link 
                href="/dashboard/about" 
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary hover:text-primary/80 transition-colors duration-200 group/link"
              >
                Contact
                <ExternalLink className="h-2.5 w-2.5" />
              </Link>
            </div>
          </div>

          {/* Footer with gradient */}
          <div className="rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/10 px-3 py-2">
            <p className="text-center text-[10px] font-semibold text-muted-foreground">
              CryptoFD v1.0.0
            </p>
            <p className="text-center text-[9px] text-muted-foreground/60 mt-0.5">
              Bank-Grade Security
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
