"use client"

import { useRouter } from "next/navigation"
import { Bell, ChevronDown, Menu, LogOut, Settings, User, Shield } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { MobileSidebar } from "./mobile-sidebar"
import Link from "next/link"

interface NavbarProps {
  fullName?: string | null
  email?: string | null
  avatarUrl?: string | null
}

export function Navbar({ fullName, email, avatarUrl }: NavbarProps) {
  const router = useRouter()
  
  const initials = fullName
    ? fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : email?.[0]?.toUpperCase() || "U"

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.href = "/auth/login"
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center justify-between border-b border-border bg-background/95 px-3 sm:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60 gap-2">
      {/* Mobile Menu & Status */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden h-9 sm:h-10 w-9 sm:w-10">
              <Menu className="h-4 sm:h-5 w-4 sm:w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-56 sm:w-64 p-0">
            <MobileSidebar />
          </SheetContent>
        </Sheet>

        {/* Platform Status */}
        <div className="hidden md:flex items-center gap-2 rounded-full bg-emerald-500/10 px-2.5 sm:px-3 py-1 sm:py-1.5 flex-shrink-0">
          <div className="h-1.5 sm:h-2 w-1.5 sm:w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 whitespace-nowrap">Platform Online</span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1 sm:gap-3 ml-auto">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-9 sm:h-10 w-9 sm:w-10">
          <Bell className="h-4 sm:h-5 w-4 sm:w-5 text-muted-foreground" />
          <span className="absolute -top-0.5 -right-0.5 h-3.5 sm:h-4 w-3.5 sm:w-4 rounded-full bg-primary text-[8px] sm:text-[10px] font-bold text-primary-foreground flex items-center justify-center">
            0
          </span>
          <span className="sr-only">Notifications</span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2 sm:px-3 py-1.5 h-auto hover:bg-secondary/50">
              <Avatar className="h-8 sm:h-9 w-8 sm:w-9 border-2 border-primary/20">
                <AvatarImage src={avatarUrl || ""} alt={fullName || "User"} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs sm:text-sm">{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start text-left sm:flex min-w-0">
                <span className="text-xs sm:text-sm font-semibold text-foreground truncate">{fullName || "User"}</span>
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                  <span className="text-[9px] sm:text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Verified</span>
                </div>
              </div>
              <ChevronDown className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-muted-foreground hidden sm:block flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 sm:w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-xs sm:text-sm font-medium truncate">{fullName || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm">
                <User className="h-3.5 sm:h-4 w-3.5 sm:w-4 flex-shrink-0" />
                My Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm">
                <Settings className="h-3.5 sm:h-4 w-3.5 sm:w-4 flex-shrink-0" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive flex items-center gap-2 cursor-pointer focus:text-destructive text-xs sm:text-sm"
              onClick={handleSignOut}
            >
              <LogOut className="h-3.5 sm:h-4 w-3.5 sm:w-4 flex-shrink-0" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
