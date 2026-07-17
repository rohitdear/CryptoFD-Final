"use server"

import { prisma } from "@/lib/db"
import { requireAdminSession } from "@/lib/admin-auth"
import { revalidatePath } from "next/cache"

// Get trading stats
export async function GET() {
  try {
    let stats = await prisma.tradingStats.findUnique({
      where: { id: "main" }
    })
    
    // Initialize if doesn't exist
    if (!stats) {
      stats = await prisma.tradingStats.create({
        data: {
          id: "main",
          totalProfit: 1247832.45,
          totalTrades: 15432,
          todayProfit: 45832.50,
          activeTrades: 24,
          winRate: 76.5,
          dailyTarget: 400000,
          dailyTargetMin: 300000,
          dailyTargetMax: 500000,
        }
      })
    }
    
    // Convert Decimal to number
    return Response.json({
      totalProfit: Number(stats.totalProfit),
      totalTrades: stats.totalTrades,
      todayProfit: Number(stats.todayProfit),
      activeTrades: stats.activeTrades,
      winRate: Number(stats.winRate),
      dailyTarget: Number(stats.dailyTarget),
      dailyTargetMin: Number(stats.dailyTargetMin),
      dailyTargetMax: Number(stats.dailyTargetMax),
      lastUpdated: stats.lastUpdated,
    })
  } catch (error) {
    console.error("Error fetching trading stats:", error)
    return Response.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}

// Update trading stats (admin only)
export async function POST(request: Request) {
  try {
    await requireAdminSession()
    
    const { totalProfit, totalTrades, todayProfit, activeTrades, winRate, dailyTarget, dailyTargetMin, dailyTargetMax } = await request.json()
    
    // Validate inputs
    if (typeof totalProfit !== "number" || totalProfit < 0) {
      return Response.json({ error: "Invalid totalProfit" }, { status: 400 })
    }
    if (typeof totalTrades !== "number" || totalTrades < 0) {
      return Response.json({ error: "Invalid totalTrades" }, { status: 400 })
    }
    if (typeof todayProfit !== "number" || todayProfit < 0) {
      return Response.json({ error: "Invalid todayProfit" }, { status: 400 })
    }
    if (typeof activeTrades !== "number" || activeTrades < 0) {
      return Response.json({ error: "Invalid activeTrades" }, { status: 400 })
    }
    if (typeof winRate !== "number" || winRate < 0 || winRate > 100) {
      return Response.json({ error: "Invalid winRate (0-100)" }, { status: 400 })
    }
    if (typeof dailyTarget !== "number" || dailyTarget < 0) {
      return Response.json({ error: "Invalid dailyTarget" }, { status: 400 })
    }
    if (typeof dailyTargetMin !== "number" || dailyTargetMin < 0) {
      return Response.json({ error: "Invalid dailyTargetMin" }, { status: 400 })
    }
    if (typeof dailyTargetMax !== "number" || dailyTargetMax < dailyTargetMin) {
      return Response.json({ error: "Invalid dailyTargetMax" }, { status: 400 })
    }
    
    // Update or create
    const stats = await prisma.tradingStats.upsert({
      where: { id: "main" },
      update: {
        totalProfit,
        totalTrades,
        todayProfit,
        activeTrades,
        winRate,
        dailyTarget,
        dailyTargetMin,
        dailyTargetMax,
        lastUpdated: new Date(),
      },
      create: {
        id: "main",
        totalProfit,
        totalTrades,
        todayProfit,
        activeTrades,
        winRate,
        dailyTarget,
        dailyTargetMin,
        dailyTargetMax,
      }
    })
    
    revalidatePath("/dashboard/our-works")
    revalidatePath("/admin/trading-control")
    
    // Convert Decimal to number in response
    return Response.json({
      totalProfit: Number(stats.totalProfit),
      totalTrades: stats.totalTrades,
      todayProfit: Number(stats.todayProfit),
      activeTrades: stats.activeTrades,
      winRate: Number(stats.winRate),
      dailyTarget: Number(stats.dailyTarget),
      dailyTargetMin: Number(stats.dailyTargetMin),
      dailyTargetMax: Number(stats.dailyTargetMax),
      lastUpdated: stats.lastUpdated,
    })
  } catch (error) {
    console.error("Error updating trading stats:", error)
    return Response.json({ error: "Failed to update stats" }, { status: 500 })
  }
}
