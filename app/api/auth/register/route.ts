import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { generateOTP, generateReferralCode, hashPassword } from "@/lib/auth"
import { sendOTPEmail } from "@/lib/email"

// POST /api/auth/register - Start registration with email OTP
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, referralCode } = body

    console.log("[v0] Register endpoint called with email:", email)

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.profile.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser && existingUser.isVerified) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      )
    }

    // Find referrer if code provided
    let referrerId: string | null = null
    if (referralCode) {
      const referrer = await prisma.profile.findUnique({
        where: { referralCode: referralCode.toUpperCase() }
      })
      if (referrer) {
        referrerId = referrer.id
      }
    }

    // Generate OTP
    const otp = generateOTP()
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Hash password
    const passwordHash = await hashPassword(password)

    if (existingUser && !existingUser.isVerified) {
      // Update existing unverified user
      console.log("[v0] Updating existing unverified user:", existingUser.id)
      await prisma.profile.update({
        where: { id: existingUser.id },
        data: {
          passwordHash,
          name,
          referredBy: referrerId,
          otpCode: otp,
          otpExpiresAt,
        }
      })
    } else {
      // Create new user
      console.log("[v0] Creating new user with email:", email.toLowerCase())
      await prisma.profile.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          name,
          referralCode: generateReferralCode(),
          referredBy: referrerId,
          otpCode: otp,
          otpExpiresAt,
          isVerified: false,
        }
      })
    }

    // Send OTP email (will log in dev mode if no API key)
    console.log("[v0] Sending OTP email to:", email)
    const emailSent = await sendOTPEmail(email, otp)
    console.log("[v0] OTP Email sent status:", emailSent)

    // For debugging: log OTP (remove in production)
    console.log("[v0] Register OTP for", email, ":", otp)

    return NextResponse.json({
      message: "Verification code sent to your email",
      email: email.toLowerCase(),
      // In development, include OTP for testing (remove in production)
      ...(process.env.NODE_ENV !== "production" && { otp }),
    })
  } catch (error) {
    console.error("[Register] Error:", error)
    return NextResponse.json(
      { error: "Registration failed: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    )
  }
}
