import { prisma } from "@/lib/db"

// Get monthly performance - calculated from TradingDailyRecord
export async function GET(request: Request) {
  try {
    const dailyRecords = await prisma.tradingDailyRecord.findMany({
      orderBy: { date: "asc" },
    })

    if (dailyRecords.length === 0) {
      return Response.json([])
    }

    // Group by month
    const monthlyMap = new Map<string, {
      profit: number
      trades: number
      winRates: number[]
      days: number
    }>()

    for (const record of dailyRecords) {
      const monthKey = record.date.toISOString().slice(0, 7) // YYYY-MM format
      const existing = monthlyMap.get(monthKey) || {
        profit: 0,
        trades: 0,
        winRates: [],
        days: 0,
      }

      existing.profit += Number(record.profit)
      existing.trades += record.trades
      existing.winRates.push(Number(record.winRate))
      existing.days++

      monthlyMap.set(monthKey, existing)
    }

    // Convert to array with proper formatting
    const monthlyData = Array.from(monthlyMap.entries())
      .map(([month, data]) => {
        const [year, monthNum] = month.split("-")
        const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString(
          "en-US",
          { month: "short", year: "numeric" }
        )

        return {
          month: monthName,
          monthKey: month,
          profit: Math.round(data.profit * 100) / 100,
          trades: data.trades,
          winRate: Math.round((data.winRates.reduce((a, b) => a + b, 0) / data.winRates.length) * 10) / 10,
          daysData: data.days,
        }
      })

    return Response.json(monthlyData)
  } catch (error) {
    console.error("Error fetching monthly performance:", error)
    return Response.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}
