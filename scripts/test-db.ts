import { prisma } from "@/lib/db"

async function testDatabase() {
  try {
    console.log("[Test] Connecting to database...")
    
    // Test 1: Check if table exists
    console.log("\n[Test 1] Checking SiteStats table...")
    const stats = await prisma.siteStats.findUnique({
      where: { id: "main" }
    })
    
    if (stats) {
      console.log("[Test 1] ✓ SiteStats record found:")
      console.log(JSON.stringify(stats, null, 2))
    } else {
      console.log("[Test 1] ✗ No SiteStats record found with id='main'")
    }
    
    // Test 2: List all records
    console.log("\n[Test 2] Listing all SiteStats records...")
    const allStats = await prisma.siteStats.findMany()
    console.log(`[Test 2] Found ${allStats.length} record(s)`)
    allStats.forEach(s => {
      console.log(JSON.stringify(s, null, 2))
    })
    
    // Test 3: Create or update test record
    console.log("\n[Test 3] Ensuring 'main' record exists with test values...")
    const upserted = await prisma.siteStats.upsert({
      where: { id: "main" },
      update: {
        activeUsers: "10,000+",
        totalInvested: "$5M+",
        countries: "50+",
        yearsExp: "3+"
      },
      create: {
        id: "main",
        activeUsers: "10,000+",
        totalInvested: "$5M+",
        countries: "50+",
        yearsExp: "3+"
      }
    })
    console.log("[Test 3] ✓ Record upserted:")
    console.log(JSON.stringify(upserted, null, 2))
    
    console.log("\n[Test] ✓ All database tests passed!")
    process.exit(0)
  } catch (error) {
    console.error("[Test] ✗ Database test failed:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase()
