import { prisma } from "@/lib/db"
import { requireAdminSession } from "@/lib/admin-auth"

export async function POST(request: Request) {
  try {
    await requireAdminSession()

    // Delete all existing data
    await prisma.tradingDailyRecord.deleteMany({})
    await prisma.tradingActivity.deleteMany({})
    await prisma.portfolioAllocation.deleteMany({})
    await prisma.cryptoPrice.deleteMany({})

    return Response.json({
      success: true,
      message: "All old data deleted successfully",
      stats: {
        dailyRecordsDeleted: "all",
        tradingActivityDeleted: "all",
        portfolioDeleted: "all",
        pricesDeleted: "all",
      },
    })
  } catch (error) {
    console.error("Error deleting data:", error)
    return Response.json({ error: "Failed to delete data" }, { status: 500 })
  }
}
