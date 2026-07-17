import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { isAdminAuthenticated } from "@/lib/admin-auth"

export async function POST(request: NextRequest) {
  try {
    // Verify admin auth
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if data already exists
    const existing = await prisma.tradingStats.findUnique({
      where: { id: "main" }
    })

    if (existing && existing.totalProfit && Number(existing.totalProfit) > 0) {
      return NextResponse.json({ 
        error: "Data already initialized",
        stats: {
          totalProfit: Number(existing.totalProfit),
          totalTrades: existing.totalTrades,
          winRate: Number(existing.winRate),
        }
      }, { status: 400 })
    }

    // Initialize main trading stats
    const stats = await prisma.tradingStats.upsert({
      where: { id: "main" },
      update: {
        totalProfit: 1247832.45,
        totalTrades: 15432,
        winRate: 76.5,
        lastUpdated: new Date(),
      },
      create: {
        id: "main",
        totalProfit: 1247832.45,
        totalTrades: 15432,
        winRate: 76.5,
      }
    })

    // Create 7 months of historical daily records
    const months = 7
    let cumulativeProfit = 0
    const records = []

    for (let m = months - 1; m >= 0; m--) {
      const daysInMonth = 20 // Trading days per month (approx)
      
      for (let d = 0; d < daysInMonth; d++) {
        const date = new Date()
        date.setMonth(date.getMonth() - m)
        date.setDate(date.getDate() - d)
        
        // Generate realistic daily profit
        const dailyProfit = Math.floor(150000 + Math.random() * 100000 + (m * 20000))
        cumulativeProfit += dailyProfit
        
        const winRate = Math.round(72 + Math.random() * 8)
        const trades = Math.floor(1200 + Math.random() * 800 + (m * 100))

        records.push({
          date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          profit: dailyProfit,
          trades,
          winRate,
        })
      }
    }

    // Batch create daily records
    await prisma.tradingDailyRecord.createMany({
      data: records,
      skipDuplicates: true,
    })

    return NextResponse.json({
      message: "Trading data initialized successfully",
      stats: {
        totalProfit: Number(stats.totalProfit),
        totalTrades: stats.totalTrades,
        winRate: Number(stats.winRate),
        recordsCreated: records.length,
      }
    })

  } catch (error) {
    console.error("[TradingStats Init] Error:", error)
    return NextResponse.json(
      { error: "Failed to initialize trading data" },
      { status: 500 }
    )
  }
}
