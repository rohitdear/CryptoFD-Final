import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyPassword, generateToken, generateOTP } from "@/lib/auth"
import { sendOTPEmail } from "@/lib/email"

// POST /api/auth/login - Login with email/password, then send OTP
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, otp } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.profile.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Check if user is verified
    if (!user.isVerified) {
      // Send new OTP for verification
      const newOtp = generateOTP()
      await prisma.profile.update({
        where: { id: user.id },
        data: {
          otpCode: newOtp,
          otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        }
      })
      await sendOTPEmail(email, newOtp)

      return NextResponse.json({
        requiresVerification: true,
        message: "Please verify your email. A new code has been sent.",
        email: user.email,
      })
    }

    // If OTP provided, verify it and complete login
    if (otp) {
      if (user.otpCode !== otp) {
        return NextResponse.json(
          { error: "Invalid verification code" },
          { status: 400 }
        )
      }

      if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) {
        return NextResponse.json(
          { error: "Verification code has expired" },
          { status: 400 }
        )
      }

      // Clear OTP
      await prisma.profile.update({
        where: { id: user.id },
        data: { otpCode: null, otpExpiresAt: null }
      })

      // Generate JWT token
      const token = await generateToken(user.id)
      console.log("[v0] Login - Token generated for user:", user.id, "Token length:", token.length)

      // Create response with cookie
      const response = NextResponse.json({
        message: "Login successful",
        redirectTo: user.isAdmin ? "/admin" : "/dashboard",
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
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
      
      console.log("[v0] Login - Cookie set with sameSite=none, secure=true")
      return response
    }

    // First step: Send OTP for login
    const loginOtp = generateOTP()
    await prisma.profile.update({
      where: { id: user.id },
      data: {
        otpCode: loginOtp,
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      }
    })
    await sendOTPEmail(email, loginOtp)

    // For debugging: log OTP (remove in production)
    console.log("[v0] Login OTP for", email, ":", loginOtp)

    return NextResponse.json({
      requiresOtp: true,
      message: "Verification code sent to your email",
      email: user.email,
    })
  } catch (error) {
    console.error("[Login] Error:", error)
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    )
  }
}
