import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { generateOTP, hashPassword } from "@/lib/auth"
import { sendPasswordResetEmail } from "@/lib/email"

// POST /api/auth/forgot-password - Send password reset OTP
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otp, newPassword } = body

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.profile.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      // Don't reveal if email exists
      return NextResponse.json({
        message: "If the email exists, a reset code will be sent"
      })
    }

    // If OTP and new password provided, reset password
    if (otp && newPassword) {
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

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters" },
          { status: 400 }
        )
      }

      // Update password and clear OTP
      const passwordHash = await hashPassword(newPassword)
      await prisma.profile.update({
        where: { id: user.id },
        data: {
          passwordHash,
          otpCode: null,
          otpExpiresAt: null,
        }
      })

      return NextResponse.json({
        message: "Password reset successful. You can now log in."
      })
    }

    // Send OTP for password reset
    const resetOtp = generateOTP()
    await prisma.profile.update({
      where: { id: user.id },
      data: {
        otpCode: resetOtp,
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      }
    })
    await sendPasswordResetEmail(email, resetOtp)

    return NextResponse.json({
      message: "Password reset code sent to your email",
      email: user.email,
    })
  } catch (error) {
    console.error("[Forgot Password] Error:", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
}
