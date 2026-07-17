import { NextResponse } from "next/server"

export async function GET() {
  const dbUrl = process.env.DATABASE_URL
  const host = dbUrl ? new URL(dbUrl).hostname : "unknown"
  
  return NextResponse.json({
    databaseHost: host,
    isDev: process.env.NODE_ENV === "development",
    hasDbUrl: !!dbUrl,
  })
}
