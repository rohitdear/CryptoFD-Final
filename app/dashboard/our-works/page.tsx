import { OurWorksContent } from "@/components/dashboard/our-works-content"
import { getTradingStats, getMonthlyTradingRecords, getTodayProfit } from "@/lib/trading-stats"

export const metadata = {
  title: "Our Works - CryptoFD",
  description: "See how CryptoFD generates returns through cryptocurrency trading",
}

export const revalidate = 60 // Revalidate every 60 seconds

export default async function OurWorksPage() {
  try {
    const [stats, monthlyRecords, todayProfit] = await Promise.all([
      getTradingStats().catch(() => ({ totalProfit: 0, totalTrades: 0, winRate: 0, lastUpdated: new Date() })),
      getMonthlyTradingRecords().catch(() => []),
      getTodayProfit().catch(() => ({ profit: 0, trades: 0, winRate: 0 })),
    ])
    
    return (
      <OurWorksContent 
        initialStats={stats}
        monthlyRecords={monthlyRecords}
        todayProfit={todayProfit}
      />
    )
  } catch (error) {
    console.error("[OurWorks] Error loading trading stats:", error)
    return (
      <OurWorksContent 
        initialStats={{ totalProfit: 0, totalTrades: 0, winRate: 0, lastUpdated: new Date() }}
        monthlyRecords={[]}
        todayProfit={{ profit: 0, trades: 0, winRate: 0 }}
      />
    )
  }
}
