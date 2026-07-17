import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import prisma from "./db"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"
)

const COOKIE_NAME = "auth_token"
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
}

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// JWT Token generation
export async function generateToken(userId: string): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET)
}

// JWT Token verification
export async function verifyToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return { userId: payload.userId as string }
  } catch {
    return null
  }
}

// Set auth cookie
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, COOKIE_OPTIONS)
}

// Clear auth cookie
export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

// Get current user from cookie
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    
    if (!token) return null
    
    const payload = await verifyToken(token)
    if (!payload) return null
    
    const user = await prisma.profile.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        referralCode: true,
        referredBy: true,
        walletBalance: true,
        lockedBalance: true,
        totalEarnings: true,
        referralEarnings: true,
        usdtAddress: true,
        isAdmin: true,
        isVerified: true,
        createdAt: true,
      }
    })
    
    return user
  } catch (error) {
    console.error("[v0] Error in getCurrentUser:", error)
    return null
  }
}

// Require authenticated user (throws if not authenticated)
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Unauthorized")
  }
  return user
}

// Require admin user
export async function requireAdmin() {
  const user = await requireAuth()
  if (!user.isAdmin) {
    throw new Error("Forbidden: Admin access required")
  }
  return user
}

// Generate 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Generate unique referral code
export function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Create referral chain (3 levels: 10%, 5%, 2%)
export async function createReferralChain(userId: string, referrerId: string) {
  // Level 1 - Direct referral
  await prisma.referral.create({
    data: {
      referrerId,
      referredId: userId,
      level: 1,
    }
  })

  // Get level 2 referrer (who referred our referrer)
  const level1Referral = await prisma.referral.findFirst({
    where: { referredId: referrerId, level: 1 }
  })

  if (level1Referral) {
    await prisma.referral.create({
      data: {
        referrerId: level1Referral.referrerId,
        referredId: userId,
        level: 2,
      }
    })

    // Get level 3 referrer
    const level2Referral = await prisma.referral.findFirst({
      where: { referredId: level1Referral.referrerId, level: 1 }
    })

    if (level2Referral) {
      await prisma.referral.create({
        data: {
          referrerId: level2Referral.referrerId,
          referredId: userId,
          level: 3,
        }
      })
    }
  }
}
