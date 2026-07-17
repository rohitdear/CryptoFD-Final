"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"
import { TrendingUp, TrendingDown, BarChart3, LineChart } from "lucide-react"

interface EarningsData {
  date: string
  fdEarning: number
  referralEarning: number
}

interface ChartCardProps {
  earningsHistory: EarningsData[]
}

export function ChartCard({ earningsHistory }: ChartCardProps) {
  const [activeChart, setActiveChart] = useState<"fd" | "referral" | "combined">("combined")
  const [chartType, setChartType] = useState<"area" | "bar">("area")

  // Format data for display
  const chartData = earningsHistory.map((item) => ({
    name: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    fdEarnings: item.fdEarning,
    referralEarnings: item.referralEarning,
    total: item.fdEarning + item.referralEarning,
  }))

  // Calculate totals and trends
  const totalFdEarnings = earningsHistory.reduce((sum, item) => sum + item.fdEarning, 0)
  const totalReferralEarnings = earningsHistory.reduce((sum, item) => sum + item.referralEarning, 0)
  const totalEarnings = totalFdEarnings + totalReferralEarnings

  // Calculate trend (compare last 7 days to previous 7 days)
  const recentEarnings = earningsHistory.slice(-7).reduce((sum, item) => sum + item.fdEarning + item.referralEarning, 0)
  const previousEarnings = earningsHistory.slice(-14, -7).reduce((sum, item) => sum + item.fdEarning + item.referralEarning, 0)
  const trend = previousEarnings > 0 ? ((recentEarnings - previousEarnings) / previousEarnings) * 100 : 0
  const isPositiveTrend = trend >= 0

  // Colors
  const fdColor = "#10B981" // emerald-500
  const referralColor = "#3B82F6" // blue-500
  const combinedColor = "#8B5CF6" // violet-500

  const getActiveColor = () => {
    switch (activeChart) {
      case "fd": return fdColor
      case "referral": return referralColor
      default: return combinedColor
    }
  }

  const hasData = earningsHistory.length > 0

  return (
    <Card className="rounded-2xl border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4 border-b border-border">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Earnings Overview</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Track your investment returns over time
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setChartType(chartType === "area" ? "bar" : "area")}
              className="h-8 w-8"
            >
              {chartType === "area" ? <BarChart3 className="h-4 w-4" /> : <LineChart className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div 
            className={`rounded-xl p-3 cursor-pointer transition-all ${activeChart === "fd" ? "bg-emerald-500/20 ring-2 ring-emerald-500" : "bg-secondary/50 hover:bg-secondary"}`}
            onClick={() => setActiveChart("fd")}
          >
            <p className="text-xs text-muted-foreground">FD Earnings</p>
            <p className="text-lg font-bold text-emerald-500">
              ${totalFdEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div 
            className={`rounded-xl p-3 cursor-pointer transition-all ${activeChart === "referral" ? "bg-blue-500/20 ring-2 ring-blue-500" : "bg-secondary/50 hover:bg-secondary"}`}
            onClick={() => setActiveChart("referral")}
          >
            <p className="text-xs text-muted-foreground">Referral Earnings</p>
            <p className="text-lg font-bold text-blue-500">
              ${totalReferralEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div 
            className={`rounded-xl p-3 cursor-pointer transition-all ${activeChart === "combined" ? "bg-violet-500/20 ring-2 ring-violet-500" : "bg-secondary/50 hover:bg-secondary"}`}
            onClick={() => setActiveChart("combined")}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Total</p>
              {hasData && (
                <div className={`flex items-center gap-1 text-xs ${isPositiveTrend ? "text-emerald-500" : "text-red-500"}`}>
                  {isPositiveTrend ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(trend).toFixed(1)}%
                </div>
              )}
            </div>
            <p className="text-lg font-bold text-violet-500">
              ${totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6 pt-4">
        <div className="h-[280px]">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "area" ? (
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorFd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={fdColor} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={fdColor} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorReferral" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={referralColor} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={referralColor} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCombined" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={combinedColor} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={combinedColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    tickFormatter={(value) => `$${value}`}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      color: "hsl(var(--foreground))",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    formatter={(value: number, name: string) => [
                      `$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                      name === "fdEarnings" ? "FD Earnings" : name === "referralEarnings" ? "Referral" : "Total"
                    ]}
                  />
                  {(activeChart === "fd" || activeChart === "combined") && (
                    <Area
                      type="monotone"
                      dataKey="fdEarnings"
                      stroke={fdColor}
                      strokeWidth={2}
                      fill="url(#colorFd)"
                    />
                  )}
                  {(activeChart === "referral" || activeChart === "combined") && (
                    <Area
                      type="monotone"
                      dataKey="referralEarnings"
                      stroke={referralColor}
                      strokeWidth={2}
                      fill="url(#colorReferral)"
                    />
                  )}
                </AreaChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    tickFormatter={(value) => `$${value}`}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      color: "hsl(var(--foreground))",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    formatter={(value: number, name: string) => [
                      `$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                      name === "fdEarnings" ? "FD Earnings" : name === "referralEarnings" ? "Referral" : "Total"
                    ]}
                  />
                  {(activeChart === "fd" || activeChart === "combined") && (
                    <Bar dataKey="fdEarnings" fill={fdColor} radius={[4, 4, 0, 0]} />
                  )}
                  {(activeChart === "referral" || activeChart === "combined") && (
                    <Bar dataKey="referralEarnings" fill={referralColor} radius={[4, 4, 0, 0]} />
                  )}
                </BarChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">No earnings yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start investing to see your earnings chart
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
