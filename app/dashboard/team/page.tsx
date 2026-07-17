import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getReferrals, getTeamStats, getProfile } from "@/lib/queries"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, UserCheck, TrendingUp, DollarSign, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Referral, TeamStats } from "@/lib/types"

const levelCommission: Record<number, number> = {
  1: 10,
  2: 5,
  3: 2,
}

const levelColors: Record<number, string> = {
  1: "bg-primary/10 text-primary",
  2: "bg-blue-500/10 text-blue-500",
  3: "bg-cyan-500/10 text-cyan-500",
}

function TeamTable({ data, level }: { data: Referral[]; level: number }) {
  const commission = levelCommission[level] || 0
  
  if (data.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No team members at this level yet
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground">Member</TableHead>
            <TableHead className="text-muted-foreground">Join Date</TableHead>
            <TableHead className="text-muted-foreground">Your Earnings ({commission}%)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((referral) => {
            const profile = referral.referred
            const initials = profile?.name
              ? profile.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
              : "U"

            return (
              <TableRow key={referral.id} className="border-border">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/20 text-primary text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">
                        {profile?.name || "Anonymous User"}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {profile?.createdAt 
                    ? new Date(profile.createdAt).toLocaleDateString()
                    : "-"
                  }
                </TableCell>
                <TableCell>
                  <span className="font-medium text-muted-foreground">
                    Earning {commission}%
                  </span>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export default async function TeamPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  const [referrals, teamStats, profile] = await Promise.all([
    getReferrals(),
    getTeamStats(),
    getProfile(),
  ])

  // Group referrals by level
  const referralsByLevel: Record<number, Referral[]> = {}
  for (let i = 1; i <= 3; i++) {
    referralsByLevel[i] = referrals.filter((r: Referral) => r.level === i)
  }

  const totalTeam = referrals.length
  const totalEarnings = teamStats.reduce((acc: number, s: TeamStats) => acc + Number(s.totalEarned), 0)

  // Build stats by level with actual data
  const levelStats = Array.from({ length: 3 }, (_, i) => {
    const level = i + 1
    const stat = teamStats.find((s: TeamStats) => s.level === level)
    return {
      level,
      count: stat?.count || 0,
      earnings: stat?.totalEarned || 0,
      commission: levelCommission[level],
    }
  })

  if (totalTeam === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Team</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your referral network and track earnings
          </p>
        </div>

        <Card className="rounded-2xl border-border bg-card p-12 text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground">No Team Members Yet</h3>
          <p className="mt-2 text-muted-foreground">
            Start inviting friends to join and build your team
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Your referral code: <span className="font-mono font-bold text-primary">{profile?.referralCode}</span>
          </p>
          <Link href="/dashboard/referral">
            <Button className="mt-6">Share Your Referral Link</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Team</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your referral network and track earnings
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Team</p>
              <p className="text-2xl font-bold text-foreground">{totalTeam}</p>
            </div>
          </div>
        </Card>
        <Card className="rounded-2xl border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
              <UserCheck className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Direct Referrals</p>
              <p className="text-2xl font-bold text-foreground">{referralsByLevel[1]?.length || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="rounded-2xl border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Team Levels</p>
              <p className="text-2xl font-bold text-foreground">
                {levelStats.filter((s) => s.count > 0).length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="rounded-2xl border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Earnings</p>
              <p className="text-2xl font-bold text-green-500">+${totalEarnings.toFixed(2)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Level-wise Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        {levelStats.map((stat) => (
          <Card key={stat.level} className="rounded-2xl border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Level {stat.level}</p>
                <p className="text-xl font-bold text-foreground">{stat.count} members</p>
              </div>
              <Badge className={levelColors[stat.level]}>{stat.commission}% Commission</Badge>
            </div>
            <Progress 
              value={totalTeam > 0 ? (stat.count / totalTeam) * 100 : 0} 
              className="mt-3 h-2" 
            />
          </Card>
        ))}
      </div>

      {/* Team Tables */}
      <Card className="rounded-2xl border-border bg-card p-6">
        <Tabs defaultValue="level1" className="space-y-4">
          <TabsList className="bg-secondary">
            {levelStats.map((stat) => (
              <TabsTrigger 
                key={stat.level}
                value={`level${stat.level}`} 
                className="data-[state=active]:bg-primary"
              >
                Level {stat.level} ({stat.count})
              </TabsTrigger>
            ))}
          </TabsList>

          {levelStats.map((stat) => (
            <TabsContent key={stat.level} value={`level${stat.level}`}>
              <TeamTable data={referralsByLevel[stat.level] || []} level={stat.level} />
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </div>
  )
}
