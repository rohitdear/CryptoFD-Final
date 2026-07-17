import { NextResponse } from "next/server"
import { initializeTradingHistory, updateDailyTradingStats } from "@/lib/trading-stats"

// GET - Initialize trading history (run once)
// POST - Update daily stats (run via cron)
export async function GET() {
  try {
    const result = await initializeTradingHistory()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error initializing trading history:", error)
    return NextResponse.json({ error: "Failed to initialize" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const result = await updateDailyTradingStats()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating trading stats:", error)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}
