"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Users } from "lucide-react"
import type { TeamStats } from "@/lib/types"

interface TeamCardProps {
  totalMembers: number
  teamStats: TeamStats[]
}

export function TeamCard({ totalMembers, teamStats }: TeamCardProps) {
  // Calculate team growth (percentage of max potential - 5 levels with members)
  const levelsWithMembers = teamStats.filter(s => s.count > 0).length
  const teamGrowth = (levelsWithMembers / 5) * 100

  return (
    <Card className="rounded-lg sm:rounded-2xl border-border bg-card p-4 sm:p-6 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
      <div className="flex items-start sm:items-center gap-3">
        <div className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-primary/10 hover:bg-primary/15 transition-colors flex-shrink-0">
          <Users className="h-5 sm:h-6 w-5 sm:w-6 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm text-muted-foreground">Team Overview</p>
          <p className="text-lg sm:text-xl font-bold text-foreground">{totalMembers} <span className="text-sm sm:text-base">Members</span></p>
        </div>
      </div>

      <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
        {teamStats.length > 0 ? (
          <>
            {teamStats.slice(0, 3).map((stat) => (
              <div key={stat.level} className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                <span className="text-xs sm:text-sm text-muted-foreground">Level {stat.level}</span>
                <span className="text-xs sm:text-sm font-semibold text-foreground bg-primary/10 px-2 sm:px-3 py-1 rounded-full">{stat.count} <span className="hidden sm:inline">members</span><span className="inline sm:hidden">M</span></span>
              </div>
            ))}
          </>
        ) : (
          <p className="text-xs sm:text-sm text-muted-foreground text-center py-3">
            Build your team
          </p>
        )}

        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-border">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Network Depth</span>
            <span className="font-semibold text-foreground">{levelsWithMembers}<span className="text-muted-foreground">/5</span></span>
          </div>
          <Progress value={teamGrowth} className="mt-2 sm:mt-3 h-1.5 sm:h-2" />
        </div>
      </div>
    </Card>
  )
}
