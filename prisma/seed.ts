import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Create FD Plans
  const plans = [
    { name: "Starter", minAmount: 100, maxAmount: 499, dailyRoi: 2.0, durationDays: 30, isActive: true },
    { name: "Bronze", minAmount: 500, maxAmount: 1999, dailyRoi: 2.3, durationDays: 30, isActive: true },
    { name: "Silver", minAmount: 2000, maxAmount: 4999, dailyRoi: 2.6, durationDays: 30, isActive: true },
    { name: "Gold", minAmount: 5000, maxAmount: 9999, dailyRoi: 2.9, durationDays: 30, isActive: true },
    { name: "Platinum", minAmount: 10000, maxAmount: 49999, dailyRoi: 3.1, durationDays: 30, isActive: true },
    { name: "Diamond", minAmount: 50000, maxAmount: 500000, dailyRoi: 3.3, durationDays: 30, isActive: true },
  ]

  for (const plan of plans) {
    const existing = await prisma.fdPlan.findFirst({
      where: { name: plan.name }
    })

    if (!existing) {
      await prisma.fdPlan.create({
        data: plan
      })
      console.log(`Created plan: ${plan.name}`)
    } else {
      await prisma.fdPlan.update({
        where: { id: existing.id },
        data: plan
      })
      console.log(`Updated plan: ${plan.name}`)
    }
  }

  // Create admin user if not exists
  const adminEmail = "admin@cryptofd.com"
  const existingAdmin = await prisma.profile.findUnique({
    where: { email: adminEmail }
  })

  if (!existingAdmin) {
    // Create admin with bcrypt hashed password "admin123"
    const bcrypt = await import("bcryptjs")
    const hashedPassword = await bcrypt.hash("admin123", 12)
    
    await prisma.profile.create({
      data: {
        email: adminEmail,
        passwordHash: hashedPassword,
        name: "Admin",
        isAdmin: true,
        isVerified: true,
        referralCode: "ADMIN001",
        walletBalance: 0,
        lockedBalance: 0,
        totalEarnings: 0,
        referralEarnings: 0,
      }
    })
    console.log("Created admin user: admin@cryptofd.com / admin123")
  } else {
    console.log("Admin user already exists")
  }

  console.log("Seeding complete!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
