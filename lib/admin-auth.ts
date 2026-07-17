"use server"

import { cookies } from "next/headers"

// Demo admin credentials - in production, use environment variables
const ADMIN_EMAIL = "admin@cryptofd.com"
const ADMIN_PASSWORD = "CryptoFD@2024"

// Simple token for session management
const ADMIN_SESSION_TOKEN = "cryptofd_admin_session"

export async function adminLogin(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  // Validate credentials
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return { success: false, error: "Invalid email or password" }
  }

  // Set admin session cookie
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_SESSION_TOKEN, "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/"
  })

  return { success: true }
}

export async function adminLogout(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_SESSION_TOKEN)
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get(ADMIN_SESSION_TOKEN)
  return session?.value === "authenticated"
}

// Use this in admin server actions to verify admin access
export async function requireAdminSession(): Promise<void> {
  const isAuthenticated = await isAdminAuthenticated()
  if (!isAuthenticated) {
    throw new Error("Admin authentication required")
  }
}
