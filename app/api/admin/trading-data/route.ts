import { prisma } from "@/lib/db"
import { requireAdminSession } from "@/lib/admin-auth"
import { revalidatePath } from "next/cache"

// Get all trading activity
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "50")
    const type = searchParams.get("type") || "activity" // activity, portfolio, prices

    if (type === "activity") {
      const activities = await prisma.tradingActivity.findMany({
        orderBy: { timestamp: "desc" },
        take: limit,
      })
      return Response.json(activities)
    }

    if (type === "portfolio") {
      const portfolio = await prisma.portfolioAllocation.findMany({
        orderBy: { updatedAt: "desc" },
      })
      return Response.json(portfolio)
    }

    if (type === "prices") {
      const prices = await prisma.cryptoPrice.findMany({
        orderBy: { date: "desc" },
        take: limit,
      })
      return Response.json(prices)
    }

    return Response.json({ error: "Invalid type" }, { status: 400 })
  } catch (error) {
    console.error("Error fetching trading data:", error)
    return Response.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}

// Add trading activity
export async function POST(request: Request) {
  try {
    await requireAdminSession()

    const { type, data } = await request.json()

    if (type === "activity") {
      const { crypto, action, amount, profit } = data

      const activity = await prisma.tradingActivity.create({
        data: {
          crypto,
          action,
          amount,
          profit: profit || null,
          status: "completed",
        },
      })
      return Response.json(activity)
    }

    if (type === "portfolio") {
      const { asset, percentage, value } = data

      const portfolio = await prisma.portfolioAllocation.upsert({
        where: { asset },
        update: { percentage, value, updatedAt: new Date() },
        create: { asset, percentage, value },
      })
      return Response.json(portfolio)
    }

    if (type === "prices") {
      const { crypto, date, price } = data

      const cryptoDate = new Date(date)
      cryptoDate.setHours(0, 0, 0, 0)

      const priceRecord = await prisma.cryptoPrice.upsert({
        where: {
          crypto_date: {
            crypto,
            date: cryptoDate,
          },
        },
        update: { price },
        create: { crypto, date: cryptoDate, price },
      })
      return Response.json(priceRecord)
    }

    return Response.json({ error: "Invalid type" }, { status: 400 })
  } catch (error) {
    console.error("Error creating trading data:", error)
    return Response.json({ error: "Failed to create data" }, { status: 500 })
  }
}
