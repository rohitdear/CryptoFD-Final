import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"
)

// User protected routes (require user JWT token)
const userProtectedRoutes = ["/dashboard"]
// Admin protected routes (require admin session cookie)
const adminProtectedRoutes = ["/admin"]
const authRoutes = ["/auth/login", "/auth/sign-up", "/auth/forgot-password"]
const publicRoutes = ["/admin-login", "/", "/about"] // Admin login page is public

async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, JWT_SECRET)
    return true
  } catch {
    return false
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const userToken = request.cookies.get("auth_token")?.value
  const adminSession = request.cookies.get("cryptofd_admin_session")?.value

  // Skip middleware for public routes (like admin-login)
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Check route types
  const isUserProtectedRoute = userProtectedRoutes.some(route => pathname.startsWith(route))
  const isAdminProtectedRoute = adminProtectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // Handle admin routes - check admin session cookie
  if (isAdminProtectedRoute) {
    if (adminSession !== "authenticated") {
      return NextResponse.redirect(new URL("/admin-login", request.url))
    }
    return NextResponse.next()
  }

  // Handle user protected routes - check user JWT token
  if (isUserProtectedRoute) {
    if (!userToken) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    const isValid = await verifyToken(userToken)
    if (!isValid) {
      const response = NextResponse.redirect(new URL("/auth/login", request.url))
      response.cookies.delete("auth_token")
      return response
    }
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && userToken) {
    const isValid = await verifyToken(userToken)
    if (isValid) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
