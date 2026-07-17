import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { generateToken, createReferralChain } from "@/lib/auth"
import { sendSignupBonusEmail, sendWelcomeEmail } from "@/lib/email"

// POST /api/auth/verify-otp - Verify OTP and complete registration/login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otp } = body

    console.log("[v0] Verify OTP endpoint called with email:", email)

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.profile.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      console.log("[v0] User not found:", email)
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Check OTP
    if (!user.otpCode || user.otpCode !== otp) {
      console.log("[v0] Invalid OTP. Expected:", user.otpCode, "Got:", otp)
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      )
    }

    // Check if OTP expired
    if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) {
      console.log("[v0] OTP expired. Expires at:", user.otpExpiresAt)
      return NextResponse.json(
        { error: "Verification code has expired" },
        { status: 400 }
      )
    }

    // Clear OTP and mark as verified
    const wasVerified = user.isVerified
    console.log("[v0] Marking user as verified. Was verified:", wasVerified)
    
    const SIGNUP_BONUS = 5 // 5 USDT signup bonus
    
    await prisma.profile.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        otpCode: null,
        otpExpiresAt: null,
        // Add 5 USDT signup bonus only for new users
        ...(wasVerified === false && { walletBalance: { increment: SIGNUP_BONUS } }),
      }
    })

    // If this is first verification (registration), create referral chain and record bonus transaction
    if (!wasVerified) {
      console.log("[v0] New user signup - Adding 5 USDT signup bonus for user:", user.id)
      
      // Record the signup bonus as a transaction
      await prisma.transaction.create({
        data: {
          userId: user.id,
          type: "deposit",
          amount: SIGNUP_BONUS,
          status: "completed",
          description: "Sign-up bonus",
          txHash: null,
        }
      })
      
      if (user.referredBy) {
        console.log("[v0] Creating referral chain for user:", user.id)
        await createReferralChain(user.id, user.referredBy)
      }
      
      // Send professional sign-up bonus confirmation email
      await sendSignupBonusEmail(user.email, user.name || undefined)
      // Also send welcome email for general onboarding
      await sendWelcomeEmail(user.email, user.name || undefined)
    }

    // Generate JWT token
    console.log("[v0] Generating token for user:", user.id)
    const token = await generateToken(user.id)

    // Create response with cookie
    const response = NextResponse.json({
      message: "Verification successful",
      redirectTo: "/dashboard",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
      }
    })

    // Set auth cookie on response
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    console.log("[v0] Verify OTP - Cookie set, redirecting to dashboard")
    return response
  } catch (error) {
    console.error("[Verify OTP] Error:", error)
    return NextResponse.json(
      { error: "Verification failed: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    )
  }
}
