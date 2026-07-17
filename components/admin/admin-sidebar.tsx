"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Receipt,
  Layers,
  Settings,
  Shield,
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  TrendingUp,
  Activity,
  Sliders,
} from "lucide-react"

const navigation = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Trading Control", href: "/admin/trading-control", icon: TrendingUp },
  { name: "Trading Data", href: "/admin/trading-data", icon: Activity },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "All Transactions", href: "/admin/transactions", icon: Receipt },
  { name: "Deposit History", href: "/admin/deposits", icon: ArrowDownToLine },
  { name: "Withdrawal History", href: "/admin/withdrawals", icon: ArrowUpFromLine },
  { name: "Fixed Deposits", href: "/admin/fds", icon: Layers },
  { name: "FD Plans", href: "/admin/plans", icon: Settings },
  { name: "Site Settings", href: "/admin/site-settings", icon: Sliders },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="text-lg font-bold text-foreground">Admin Panel</span>
          <p className="text-xs text-muted-foreground">Management Console</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-red-500/10 text-red-500"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Back to Dashboard */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <LayoutDashboard className="h-5 w-5" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
