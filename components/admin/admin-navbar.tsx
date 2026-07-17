"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { adminLogout } from "@/lib/admin-auth"
import {
  LayoutDashboard,
  Users,
  Receipt,
  Layers,
  Settings,
  Shield,
  Menu,
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  LogOut,
} from "lucide-react"

const navigation = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "All Transactions", href: "/admin/transactions", icon: Receipt },
  { name: "Deposit History", href: "/admin/deposits", icon: ArrowDownToLine },
  { name: "Withdrawal History", href: "/admin/withdrawals", icon: ArrowUpFromLine },
  { name: "Fixed Deposits", href: "/admin/fds", icon: Layers },
  { name: "FD Plans", href: "/admin/plans", icon: Settings },
]

export function AdminNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    setIsLoggingOut(true)
    await adminLogout()
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      {/* Mobile Menu */}
      <div className="flex items-center gap-4 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-16 items-center gap-2 border-b border-border px-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-foreground">Admin Panel</span>
            </div>
            <nav className="flex flex-col gap-1 p-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setOpen(false)}
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
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="mt-4 flex w-full items-center gap-3 rounded-xl border-t border-border px-4 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10"
              >
                <LogOut className="h-5 w-5" />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-foreground">Admin</span>
        </div>
      </div>

      {/* Page Title */}
      <div className="hidden lg:block">
        <h2 className="text-lg font-semibold text-foreground">
          {navigation.find((item) => item.href === pathname)?.name || "Admin Panel"}
        </h2>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          {isLoggingOut ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </header>
  )
}
