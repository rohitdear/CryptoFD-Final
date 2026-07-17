"use client"

import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
  showText?: boolean
  variant?: "full" | "icon"
}

export function Logo({ 
  className, 
  size = "md", 
  showText = true,
  variant = "full" 
}: LogoProps) {
  const sizes = {
    sm: { icon: "w-6 h-6", text: "text-base", gap: "gap-1.5" },
    md: { icon: "w-8 h-8", text: "text-xl", gap: "gap-2" },
    lg: { icon: "w-10 h-10", text: "text-2xl", gap: "gap-2.5" },
    xl: { icon: "w-14 h-14", text: "text-3xl", gap: "gap-3" },
  }

  const { icon, text, gap } = sizes[size]

  return (
    <div className={cn("flex items-center", gap, className)}>
      {/* Logo Icon - Hexagonal crypto-style design */}
      <div className={cn("relative", icon)}>
        {/* Outer glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg blur-sm opacity-50" />
        
        {/* Main hexagon shape */}
        <div className="relative w-full h-full bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
          {/* Inner diamond/crystal shape */}
          <svg 
            viewBox="0 0 24 24" 
            className="w-[60%] h-[60%] text-white drop-shadow-sm"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Crystal/Diamond shape representing value */}
            <path d="M6 3h12l4 6-10 13L2 9z" />
            <path d="M12 22V9" />
            <path d="M2 9h20" />
            <path d="M6 3l6 6 6-6" />
          </svg>
        </div>
        
        {/* Accent dot */}
        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full shadow-sm" />
      </div>

      {/* Logo Text */}
      {showText && variant === "full" && (
        <div className="flex flex-col leading-none">
          <span className={cn("font-bold tracking-tight text-foreground", text)}>
            Crypto<span className="text-emerald-500">FD</span>
          </span>
          <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
            Secure Investments
          </span>
        </div>
      )}
    </div>
  )
}

// Animated version for loading states
export function LogoAnimated({ className, size = "lg" }: { className?: string; size?: "sm" | "md" | "lg" | "xl" }) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  }

  return (
    <div className={cn("relative", sizes[size], className)}>
      {/* Pulsing glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl blur-md opacity-50 animate-pulse" />
      
      {/* Rotating outer ring */}
      <div className="absolute inset-0 rounded-xl border-2 border-emerald-500/30 animate-spin" style={{ animationDuration: '3s' }} />
      
      {/* Main icon */}
      <div className="relative w-full h-full bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-xl">
        <svg 
          viewBox="0 0 24 24" 
          className="w-[55%] h-[55%] text-white animate-pulse"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 3h12l4 6-10 13L2 9z" />
          <path d="M12 22V9" />
          <path d="M2 9h20" />
          <path d="M6 3l6 6 6-6" />
        </svg>
      </div>
    </div>
  )
}
