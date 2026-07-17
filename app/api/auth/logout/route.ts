import { NextResponse } from "next/server"

// POST /api/auth/logout
export async function POST() {
  try {
    const response = NextResponse.json({ message: "Logged out successfully" })
    
    // Clear the auth cookie by setting it to expire immediately
    response.cookies.set("auth_token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 0, // Expire immediately
    })
    
    return response
  } catch (error) {
    console.error("[Logout] Error:", error)
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    )
  }
}
