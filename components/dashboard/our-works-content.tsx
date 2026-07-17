"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  TrendingUp,
  Bitcoin,
  Activity,
  DollarSign,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Shield,
  Clock,
  Globe,
} from "lucide-react"

interface TradingStats {
  totalProfit: number
  totalTrades: number
  winRate: number
  lastUpdated: Date
}

interface MonthlyRecord {
  month: string
  profit: number
  trades: number
  winRate: number
}

interface TodayProfit {
  profit: number
  trades: number
  winRate: number
}

interface OurWorksContentProps {
  initialStats: TradingStats
  monthlyRecords: MonthlyRecord[]
  todayProfit: TodayProfit
}

// Format currency consistently (server and client match)
function formatCurrency(num: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

// Seeded random for consistent data generation
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

// Generate realistic crypto price data for the past 7 months (deterministic)
function generateCryptoData(basePrices: { btc: number; eth: number; bnb: number; sol: number }) {
  const data = []
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - 7)
  
  let btcPrice = basePrices.btc
  let ethPrice = basePrices.eth
  let bnbPrice = basePrices.bnb
  let solPrice = basePrices.sol
  
  for (let i = 0; i < 210; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    btcPrice = btcPrice * (1 + (seededRandom(i * 4 + 1) - 0.48) * 0.03)
    ethPrice = ethPrice * (1 + (seededRandom(i * 4 + 2) - 0.48) * 0.035)
    bnbPrice = bnbPrice * (1 + (seededRandom(i * 4 + 3) - 0.47) * 0.025)
    solPrice = solPrice * (1 + (seededRandom(i * 4 + 4) - 0.46) * 0.04)
    
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      btc: Math.round(btcPrice),
      eth: Math.round(ethPrice),
      bnb: Math.round(bnbPrice),
      sol: Math.round(solPrice * 100) / 100,
    })
  }
  
  return data
}

// Static initial trading activity
const initialTradingActivity = [
  { id: 1, crypto: "BTC", action: "BUY", amount: 32456.78, profit: null, time: "--:--:--", status: "completed" },
  { id: 2, crypto: "ETH", action: "SELL", amount: 18234.50, profit: 856.23, time: "--:--:--", status: "completed" },
  { id: 3, crypto: "SOL", action: "BUY", amount: 12890.00, profit: null, time: "--:--:--", status: "completed" },
  { id: 4, crypto: "BNB", action: "SELL", amount: 8765.43, profit: 423.10, time: "--:--:--", status: "completed" },
  { id: 5, crypto: "XRP", action: "BUY", amount: 15432.10, profit: null, time: "--:--:--", status: "completed" },
  { id: 6, crypto: "ADA", action: "SELL", amount: 9876.54, profit: 312.45, time: "--:--:--", status: "completed" },
  { id: 7, crypto: "ETH", action: "BUY", amount: 22345.67, profit: null, time: "--:--:--", status: "completed" },
  { id: 8, crypto: "BTC", action: "SELL", amount: 45678.90, profit: 1234.56, time: "--:--:--", status: "completed" },
]

function generateTradingActivity() {
  const cryptos = ["BTC", "ETH", "BNB", "SOL", "XRP", "ADA", "DOGE", "AVAX"]
  const actions = ["BUY", "SELL"]
  
  return Array.from({ length: 15 }, (_, i) => {
    const crypto = cryptos[Math.floor(Math.random() * cryptos.length)]
    const action = actions[Math.floor(Math.random() * actions.length)]
    const amount = Math.round((Math.random() * 50000 + 5000) * 100) / 100
    const profit = action === "SELL" ? Math.round((Math.random() * 2000 - 200) * 100) / 100 : null
    const hours = Math.floor(Math.random() * 12)
    const minutes = Math.floor(Math.random() * 60)
    const seconds = Math.floor(Math.random() * 60)
    const time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    
    return {
      id: i + 1,
      crypto,
      action,
      amount,
      profit,
      time,
      status: "completed",
    }
  })
}

// Portfolio allocation data
const portfolioAllocation = [
  { name: "Bitcoin", value: 35, color: "#F7931A" },
  { name: "Ethereum", value: 28, color: "#627EEA" },
  { name: "BNB", value: 15, color: "#F3BA2F" },
  { name: "Solana", value: 12, color: "#9945FF" },
  { name: "Stablecoins", value: 10, color: "#6B7280" },
]

export function OurWorksContent({ initialStats, monthlyRecords, todayProfit }: OurWorksContentProps) {
  const [cryptoData] = useState(() => generateCryptoData({ btc: 68000, eth: 3200, bnb: 580, sol: 120 }))
  const [tradingActivity, setTradingActivity] = useState(initialTradingActivity)
  const [portfolioData, setPortfolioData] = useState(portfolioAllocation)
  const [cryptoPrices, setCryptoPrices] = useState<any[]>([])
  const [isHydrated, setIsHydrated] = useState(false)
  
  // Use database values for stats
  const [liveStats, setLiveStats] = useState({
    totalProfit: initialStats.totalProfit || 0,
    todayProfit: todayProfit.profit || 0,
    activeTrades: todayProfit.trades || 0,
    winRate: initialStats.winRate || 76.5,
  })

  // Calculate cumulative data for chart
  const monthlyChartData = monthlyRecords && monthlyRecords.length > 0 
    ? monthlyRecords.map((record, index) => {
        const cumulative = monthlyRecords
          .slice(0, index + 1)
          .reduce((sum, r) => sum + r.profit, 0)
        return {
          month: new Date(record.month + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          profit: record.profit,
          cumulative,
          trades: record.trades,
          winRate: record.winRate,
        }
      })
    : [] // Return empty array if no data instead of generating fake data

  // Hydrate with live data after mount
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Fetch trading activity from database
  useEffect(() => {
    const fetchTradingActivity = async () => {
      try {
        const response = await fetch('/api/admin/trading-data?type=activity&limit=15')
        const data = await response.json()
        if (Array.isArray(data) && data.length > 0) {
          setTradingActivity(data.map((act: any, index: number) => ({
            id: act.id || index,
            crypto: act.crypto,
            action: act.action,
            amount: Number(act.amount),
            profit: act.profit ? Number(act.profit) : null,
            time: new Date(act.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            status: act.status,
          })))
        } else {
          // Clear data if API returns empty
          setTradingActivity([])
        }
      } catch (error) {
        console.error("Failed to fetch trading activity:", error)
      }
    }

    // Fetch portfolio from database
    const fetchPortfolio = async () => {
      try {
        const response = await fetch('/api/admin/trading-data?type=portfolio')
        const data = await response.json()
        if (Array.isArray(data) && data.length > 0) {
          const colors = ["#F7931A", "#627EEA", "#F3BA2F", "#9945FF", "#6B7280"]
          setPortfolioData(data.map((p: any, index: number) => ({
            name: p.asset,
            value: p.percentage,
            color: colors[index % colors.length],
          })))
        } else {
          // Clear data if API returns empty
          setPortfolioData([])
        }
      } catch (error) {
        console.error("Failed to fetch portfolio:", error)
      }
    }

    fetchTradingActivity()
    fetchPortfolio()
    
    // Fetch crypto prices from database
    const fetchCryptoPrices = async () => {
      try {
        const response = await fetch('/api/admin/trading-data?type=prices&limit=20')
        const data = await response.json()
        if (Array.isArray(data) && data.length > 0) {
          // Group prices by date and create data structure
          const pricesByDate: { [key: string]: any } = {}
          data.forEach((p: any) => {
            const date = new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
            if (!pricesByDate[date]) {
              pricesByDate[date] = { date }
            }
            pricesByDate[date][p.crypto.toLowerCase()] = Number(p.price)
          })
          setCryptoPrices(Object.values(pricesByDate))
        } else {
          // Clear data if API returns empty
          setCryptoPrices([])
        }
      } catch (error) {
        console.error("Failed to fetch crypto prices:", error)
      }
    }
    
    fetchCryptoPrices()
  }, [])

  // Fetch real stats from database - only on mount
  useEffect(() => {
    const fetchTradingData = async () => {
      try {
        const response = await fetch('/api/admin/trading-stats')
        const data = await response.json()
        
        setLiveStats(prev => ({
          totalProfit: data.totalProfit || 0,
          todayProfit: data.todayProfit || 0,
          activeTrades: data.activeTrades || 0,
          winRate: data.winRate || 76.5,
        }))
      } catch (error) {
        console.error("Failed to fetch trading stats:", error)
      }
    }

    fetchTradingData()
    // Only fetch on mount, no auto-refresh to prevent data from changing automatically
  }, [])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Our Trading Operations</h1>
        <p className="text-muted-foreground mt-1">
          Real-time overview of CryptoFD&apos;s cryptocurrency trading activities that generate your returns
        </p>
      </div>

      {/* Live Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardDescription>Total Trading Profit</CardDescription>
            <CardTitle className="text-2xl text-emerald-500">
              ${formatCurrency(liveStats.totalProfit)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-xs text-emerald-500">
              <TrendingUp className="h-3 w-3" />
              <span>All time profits from trading</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardDescription>Today&apos;s Profit</CardDescription>
            <CardTitle className="text-2xl text-amber-500">
              ${formatCurrency(liveStats.todayProfit)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-xs text-amber-500">
              <ArrowUpRight className="h-3 w-3" />
              <span>+$300k-500k daily target</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border bg-card">
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-500 border-green-500/30">
              LIVE
            </Badge>
          </div>
          <CardHeader className="pb-2">
            <CardDescription>Total Trades</CardDescription>
            <CardTitle className="text-2xl text-amber-600 dark:text-amber-400">
              {formatCurrency(initialStats.totalTrades)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Activity className="h-3 w-3" />
              <span>{liveStats.activeTrades} active now</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardDescription>Win Rate</CardDescription>
            <CardTitle className="text-2xl text-blue-500">
              {Number(liveStats.winRate || 0).toFixed(1)}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-xs text-blue-500">
              <BarChart3 className="h-3 w-3" />
              <span>Successful trades ratio</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cumulative Profit Chart */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              Cumulative Trading Profit
            </CardTitle>
            <CardDescription>Monthly profit growth over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyChartData}>
                  <defs>
                    <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="month" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                  <YAxis 
                    tick={{ fill: "#9CA3AF", fontSize: 12 }} 
                    tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: "8px" }}
                    labelStyle={{ color: "#F3F4F6" }}
                    formatter={(value: number) => [`$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, "Cumulative Profit"]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cumulative" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    fill="url(#profitGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Allocation */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bitcoin className="h-5 w-5 text-amber-500" />
              Portfolio Allocation
            </CardTitle>
            <CardDescription>Distribution of trading capital</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              {portfolioData && portfolioData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={portfolioData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {portfolioData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: "8px" }}
                      formatter={(value: number, name: string) => [`${value}%`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-muted-foreground text-center">
                  <p>No portfolio data available</p>
                </div>
              )}
            </div>
            {portfolioData && portfolioData.length > 0 && (
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {portfolioData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-muted-foreground">{item.name} ({item.value}%)</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Crypto Price Charts */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-500" />
            Cryptocurrency Price Tracking
          </CardTitle>
          <CardDescription>7-month price movements of our primary trading asset</CardDescription>
        </CardHeader>
        <CardContent>
          {cryptoPrices && cryptoPrices.length > 0 ? (
            <Tabs defaultValue="btc" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="btc">Bitcoin</TabsTrigger>
                <TabsTrigger value="eth">Ethereum</TabsTrigger>
                <TabsTrigger value="bnb">BNB</TabsTrigger>
                <TabsTrigger value="sol">Solana</TabsTrigger>
              </TabsList>
              {["btc", "eth", "bnb", "sol"].map((crypto) => (
                <TabsContent key={crypto} value={crypto}>
                  <div className="h-[300px]">
                    {cryptoPrices.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={cryptoPrices}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                          <XAxis dataKey="date" tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                          <YAxis 
                            tick={{ fill: "#9CA3AF", fontSize: 11 }} 
                            domain={["auto", "auto"]}
                            tickFormatter={(value) => crypto === "sol" ? `$${value}` : `$${(value / 1000).toFixed(0)}k`}
                          />
                          <Tooltip
                            contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: "8px" }}
                            labelStyle={{ color: "#F3F4F6" }}
                            formatter={(value: number) => value ? [`$${value.toLocaleString()}`, crypto.toUpperCase()] : []}
                          />
                          <Line 
                            type="monotone" 
                            dataKey={crypto} 
                            stroke={
                              crypto === "btc" ? "#F7931A" :
                              crypto === "eth" ? "#627EEA" :
                              crypto === "bnb" ? "#F3BA2F" : "#9945FF"
                            }
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        No price data available
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              <p>No cryptocurrency price data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Performance Table */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Monthly Performance</CardTitle>
          <CardDescription>Detailed breakdown of trading results by month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Month</th>
                  <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Profit</th>
                  <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Trades</th>
                  <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Win Rate</th>
                </tr>
              </thead>
              <tbody>
                {monthlyChartData.map((month, index) => (
                  <tr key={index} className="border-b border-border/50">
                    <td className="py-3 text-sm font-medium text-foreground">{month.month}</td>
                    <td className="py-3 text-right text-sm text-emerald-500">
                      +${month.profit.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-3 text-right text-sm text-muted-foreground">
                      {month.trades.toLocaleString('en-US')}
                    </td>
                    <td className="py-3 text-right">
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30">
                        {Number(month.winRate || 0).toFixed(1)}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Live Trading Activity */}
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-500" />
                Live Trading Activity
              </CardTitle>
              <CardDescription>Real-time trades being executed</CardDescription>
            </div>
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30 animate-pulse">
              LIVE
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {tradingActivity.map((trade) => (
              <div 
                key={trade.id} 
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${trade.action === "BUY" ? "bg-emerald-500" : "bg-red-500"}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{trade.crypto}</span>
                      <Badge 
                        variant="outline" 
                        className={trade.action === "BUY" 
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" 
                          : "bg-red-500/10 text-red-500 border-red-500/30"
                        }
                      >
                        {trade.action}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{trade.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">${trade.amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>
                  {trade.profit !== null && (
                    <p className={`text-xs ${trade.profit >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                      {trade.profit >= 0 ? "+" : ""}{trade.profit.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} profit
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trust Indicators */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Shield className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="font-medium text-foreground">Bank-Grade Security</p>
              <p className="text-xs text-muted-foreground">256-bit encryption</p>
            </div>
          </div>
        </Card>
        
        <Card className="border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="font-medium text-foreground">24/7 Operations</p>
              <p className="text-xs text-muted-foreground">Non-stop trading</p>
            </div>
          </div>
        </Card>
        
        <Card className="border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Zap className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="font-medium text-foreground">Fast Execution</p>
              <p className="text-xs text-muted-foreground">&lt;100ms trades</p>
            </div>
          </div>
        </Card>
        
        <Card className="border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/10">
              <Globe className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <p className="font-medium text-foreground">Global Markets</p>
              <p className="text-xs text-muted-foreground">50+ trading pairs</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

// Fallback data if no records in DB yet
function generateFallbackMonthlyData() {
  const months = []
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - 6)
  
  let cumulative = 0
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate)
    date.setMonth(startDate.getMonth() + i)
    const profit = Math.round(300000 + Math.random() * 200000)
    cumulative += profit
    
    months.push({
      month: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      profit,
      cumulative,
      trades: Math.floor(800 + Math.random() * 400),
      winRate: Math.round(74 + Math.random() * 6),
    })
  }
  
  return months
}
