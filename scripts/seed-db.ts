import { prisma } from "@/lib/db"

async function main() {
  console.log("[Seed] Starting database seed...")
  
  try {
    // Check if SiteStats record exists
    const existing = await prisma.siteStats.findUnique({
      where: { id: "main" }
    })
    
    if (existing) {
      console.log("[Seed] ✓ SiteStats record already exists with data:", existing)
      return
    }
    
    // Create initial record
    console.log("[Seed] Creating initial SiteStats record...")
    const created = await prisma.siteStats.create({
      data: {
        id: "main",
        activeUsers: "10,000+",
        totalInvested: "$5M+",
        countries: "50+",
        yearsExp: "3+",
        supportEmail: "support@cryptofdforever.com"
      }
    })
    
    console.log("[Seed] ✓ SiteStats record created:", created)
  } catch (error) {
    console.error("[Seed] Error:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
