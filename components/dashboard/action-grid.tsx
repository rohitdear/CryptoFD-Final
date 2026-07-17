"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  PlusCircle,
  Layers,
  Gift,
  Users,
  Sparkles,
} from "lucide-react"

const actions = [
  {
    name: "Deposit",
    description: "Add funds",
    icon: ArrowDownToLine,
    href: "/dashboard/wallet",
    gradient: "from-emerald-500 to-emerald-600",
    shadow: "shadow-emerald-500/25",
  },
  {
    name: "Withdraw",
    description: "Cash out",
    icon: ArrowUpFromLine,
    href: "/dashboard/wallet",
    gradient: "from-orange-500 to-orange-600",
    shadow: "shadow-orange-500/25",
  },
  {
    name: "New FD",
    description: "Start earning",
    icon: PlusCircle,
    href: "/dashboard/create-fd",
    gradient: "from-primary to-primary/80",
    shadow: "shadow-primary/25",
    badge: "2-3.3% Daily",
  },
  {
    name: "My FDs",
    description: "View investments",
    icon: Layers,
    href: "/dashboard/my-fds",
    gradient: "from-blue-500 to-blue-600",
    shadow: "shadow-blue-500/25",
  },
  {
    name: "Invite",
    description: "Earn bonus",
    icon: Gift,
    href: "/dashboard/referral",
    gradient: "from-pink-500 to-pink-600",
    shadow: "shadow-pink-500/25",
    badge: "10% Bonus",
  },
  {
    name: "Team",
    description: "View members",
    icon: Users,
    href: "/dashboard/team",
    gradient: "from-violet-500 to-violet-600",
    shadow: "shadow-violet-500/25",
  },
]

export function ActionGrid() {
  return (
    <Card className="rounded-2xl border-border bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
          <p className="text-sm text-muted-foreground">Manage your investments</p>
        </div>
        <Sparkles className="h-5 w-5 text-primary" />
      </div>
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
        {actions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className="group relative flex flex-col items-center gap-3 rounded-2xl bg-secondary/50 p-4 transition-all hover:bg-secondary hover:scale-105 hover:shadow-lg"
          >
            {action.badge && (
              <span className="absolute -top-2 -right-2 text-[10px] font-bold text-white bg-gradient-to-r from-primary to-primary/80 px-2 py-0.5 rounded-full shadow-lg">
                {action.badge}
              </span>
            )}
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} shadow-lg ${action.shadow} transition-transform group-hover:scale-110`}>
              <action.icon className="h-6 w-6 text-white" />
            </div>
            <div className="text-center">
              <span className="text-sm font-semibold text-foreground">
                {action.name}
              </span>
              <p className="text-xs text-muted-foreground">
                {action.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  )
}
