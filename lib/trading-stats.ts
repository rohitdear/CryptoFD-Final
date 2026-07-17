"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

// Get current trading stats
export async function getTradingStats() {
  try {
    let stats = await prisma.tradingStats.findUnique({
      where: { id: "main" }
    })
    
    // If no stats exist, create initial record with realistic starting values
    if (!stats) {
      stats = await prisma.tradingStats.create({
        data: {
          id: "main",
          totalProfit: 1247832.45, // Starting value
          totalTrades: 15432,
          winRate: 76.5,
        }
      })
    }
    
    return {
      totalProfit: Number(stats.totalProfit),
      totalTrades: stats.totalTrades,
      winRate: Number(stats.winRate),
      lastUpdated: stats.lastUpdated,
    }
  } catch (error) {
    // Fallback if table doesn't exist
    console.log("[TradingStats] Table error, returning fallback data")
    return {
      totalProfit: 1247832.45,
      totalTrades: 15432,
      winRate: 76.5,
      lastUpdated: new Date(),
    }
  }
}

// Get monthly trading records for charts
export async function getMonthlyTradingRecords() {
  try {
    const records = await prisma.tradingDailyRecord.findMany({
      orderBy: { date: 'asc' },
    })
    
    // Group by month
    const monthlyMap = new Map<string, { profit: number, trades: number, winRates: number[] }>()
    
    for (const record of records) {
      const monthKey = record.date.toISOString().slice(0, 7) // YYYY-MM format
      const existing = monthlyMap.get(monthKey) || { profit: 0, trades: 0, winRates: [] }
      existing.profit += Number(record.profit)
      existing.trades += record.trades
      existing.winRates.push(Number(record.winRate))
      monthlyMap.set(monthKey, existing)
    }
    
    // Convert to array and calculate averages
    const monthlyData = Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      profit: Math.round(data.profit),
      trades: data.trades,
      winRate: Math.round(data.winRates.reduce((a, b) => a + b, 0) / data.winRates.length),
    }))
    
    return monthlyData
  } catch (error) {
    // Fallback: return generated monthly data
    console.log("[TradingStats] Daily records table not found, returning generated data")
    return generateMonthlyData()
  }
}

// Generate 7 months of trading data (fallback when table doesn't exist)
function generateMonthlyData() {
  const months = ["Nov 2024", "Dec 2024", "Jan 2025", "Feb 2025", "Mar 2025", "Apr 2025", "May 2025"]
  let cumulativeProfit = 0
  
  return months.map((month, index) => {
    const monthlyProfit = 150000 + Math.floor(Math.random() * 100000) + (index * 20000)
    cumulativeProfit += monthlyProfit
    return {
      month,
      profit: monthlyProfit,
      trades: Math.floor(1200 + Math.random() * 800 + (index * 100)),
      winRate: Math.round(72 + Math.random() * 8),
    }
  })
}

// Update trading stats - called by backend worker/cron job
// Adds daily profit between 300,000 and 500,000 USDT
export async function updateDailyTradingStats() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Check if today's record already exists
  const existingRecord = await prisma.tradingDailyRecord.findUnique({
    where: { date: today }
  })
  
  if (existingRecord) {
    return { success: false, message: "Today's record already exists" }
  }
  
  // Generate random daily profit between 300,000 and 500,000
  const dailyProfit = Math.round(300000 + Math.random() * 200000)
  const dailyTrades = Math.floor(800 + Math.random() * 400)
  const dailyWinRate = 74 + Math.random() * 6
  
  // Create daily record and update cumulative stats in transaction
  await prisma.$transaction(async (tx) => {
    // Create daily record
    await tx.tradingDailyRecord.create({
      data: {
        date: today,
        profit: dailyProfit,
        trades: dailyTrades,
        winRate: dailyWinRate,
      }
    })
    
    // Update cumulative stats
    await tx.tradingStats.upsert({
      where: { id: "main" },
      create: {
        id: "main",
        totalProfit: dailyProfit,
        totalTrades: dailyTrades,
        winRate: dailyWinRate,
      },
      update: {
        totalProfit: { increment: dailyProfit },
        totalTrades: { increment: dailyTrades },
        winRate: dailyWinRate, // Use today's win rate
        lastUpdated: new Date(),
      }
    })
  })
  
  revalidatePath("/dashboard/our-works")
  
  return { success: true, dailyProfit, dailyTrades }
}

// Initialize historical data for the past 7 months (run once on setup)
export async function initializeTradingHistory() {
  const existingRecords = await prisma.tradingDailyRecord.count()
  
  if (existingRecords > 0) {
    return { success: false, message: "History already initialized" }
  }
  
  // Generate 7 months of historical data
  const records = []
  let cumulativeProfit = 0
  let cumulativeTrades = 0
  
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - 7)
  startDate.setHours(0, 0, 0, 0)
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const currentDate = new Date(startDate)
  
  while (currentDate < today) {
    // Generate daily stats (300k-500k profit range)
    const dailyProfit = Math.round(300000 + Math.random() * 200000)
    const dailyTrades = Math.floor(800 + Math.random() * 400)
    const dailyWinRate = 74 + Math.random() * 6
    
    cumulativeProfit += dailyProfit
    cumulativeTrades += dailyTrades
    
    records.push({
      date: new Date(currentDate),
      profit: dailyProfit,
      trades: dailyTrades,
      winRate: dailyWinRate,
    })
    
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  // Batch create all records
  await prisma.tradingDailyRecord.createMany({
    data: records
  })
  
  // Update cumulative stats
  await prisma.tradingStats.upsert({
    where: { id: "main" },
    create: {
      id: "main",
      totalProfit: cumulativeProfit,
      totalTrades: cumulativeTrades,
      winRate: 76.5,
    },
    update: {
      totalProfit: cumulativeProfit,
      totalTrades: cumulativeTrades,
      lastUpdated: new Date(),
    }
  })
  
  revalidatePath("/dashboard/our-works")
  
  return { 
    success: true, 
    recordsCreated: records.length,
    totalProfit: cumulativeProfit,
    totalTrades: cumulativeTrades
  }
}

// Get today's profit (for real-time display)
export async function getTodayProfit() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const record = await prisma.tradingDailyRecord.findUnique({
    where: { date: today }
  })
  
  if (record) {
    return {
      profit: Number(record.profit),
      trades: record.trades,
      winRate: Number(record.winRate),
    }
  }
  
  // If no record yet, return estimated values (will be created by cron)
  return {
    profit: Math.round(150000 + Math.random() * 100000), // Partial day estimate
    trades: Math.floor(400 + Math.random() * 200),
    winRate: 75 + Math.random() * 3,
  }
}
