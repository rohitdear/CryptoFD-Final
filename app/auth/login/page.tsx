"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Shield, TrendingUp, Wallet, Mail, Eye, EyeOff, Users, Gift } from "lucide-react"
import { Logo } from "@/components/logo"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [otp, setOtp] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<"credentials" | "otp">("credentials")
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Ensure router is only used after component is mounted
  useEffect(() => {
    setMounted(true)
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, otp: step === "otp" ? otp : undefined }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Login failed")
        setIsLoading(false)
        return
      }

      if (data.requiresOtp) {
        setStep("otp")
        setIsLoading(false)
        return
      }

      if (data.requiresVerification) {
        // Redirect to verify email
        if (mounted) {
          router.push(`/auth/verify?email=${encodeURIComponent(email)}`)
        }
        return
      }

      // Successful login - redirect based on response
      if (mounted) {
        console.log("[v0] Login successful, redirectTo:", data.redirectTo)
        const redirectTo = data.redirectTo || "/dashboard"
        
        // Use window.location for hard redirect to ensure cookies are sent
        window.location.href = redirectTo
      }
    } catch {
      setError("An error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  async function handleResendOTP() {
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to resend code")
      } else {
        setError(null)
      }
    } catch {
      setError("Failed to resend code")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-primary/10 to-background items-center justify-center p-12">
        <div className="max-w-md">
          <Logo size="xl" />
          <h1 className="mt-8 text-4xl font-bold text-foreground">
            Grow Your Wealth with CryptoFD
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Earn 2% - 3.3% daily returns on your USDT investments with our secure fixed deposit platform.
          </p>
          
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Bank-Grade Security</h3>
                <p className="text-sm text-muted-foreground">Your funds are protected 24/7</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Daily Returns</h3>
                <p className="text-sm text-muted-foreground">Earn up to 3.3% daily ROI</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
                <Wallet className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Instant Withdrawals</h3>
                <p className="text-sm text-muted-foreground">Access your funds anytime</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-12">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center mb-4 lg:hidden">
            <Logo size="lg" />
          </div>

          {/* Mobile Promotional Banners */}
          <div className="lg:hidden space-y-2 mb-6">
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-3 text-center">
              <p className="text-xs font-semibold text-green-600">
                <TrendingUp className="w-4 h-4 inline mr-1" />
                Grow your investment daily 3.3% ROI
              </p>
            </div>
            <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-lg p-3 text-center">
              <p className="text-xs font-semibold text-purple-600">
                <Users className="w-4 h-4 inline mr-1" />
                Refer a friend & get 10% commission
              </p>
            </div>
            <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-lg p-3 text-center">
              <p className="text-xs font-semibold text-amber-600">
                <Gift className="w-4 h-4 inline mr-1" />
                Sign up & get 5 USDT sign-up bonus
              </p>
            </div>
          </div>

          <Card className="border-border/50 bg-card shadow-xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl text-foreground">
                {step === "credentials" ? "Welcome Back" : "Verify Your Identity"}
              </CardTitle>
              <CardDescription>
                {step === "credentials" 
                  ? "Sign in to access your investment dashboard"
                  : "Enter the verification code sent to your email"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {step === "credentials" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        className="h-11"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={isLoading}
                          className="h-11 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <div className="text-right">
                        <Link 
                          href="/auth/forgot-password" 
                          className="text-sm text-primary hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                        <Mail className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <p className="text-center text-sm text-muted-foreground">
                      We sent a 6-digit code to <strong>{email}</strong>
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="otp">Verification Code</Label>
                      <Input
                        id="otp"
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        required
                        disabled={isLoading}
                        className="h-14 text-center text-2xl tracking-widest"
                        maxLength={6}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={handleResendOTP}
                      disabled={isLoading}
                    >
                      Resend Code
                    </Button>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-base"
                  disabled={isLoading || (step === "otp" && otp.length !== 6)}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {step === "credentials" ? "Signing in..." : "Verifying..."}
                    </>
                  ) : (
                    step === "credentials" ? "Sign In" : "Verify & Sign In"
                  )}
                </Button>

                {step === "otp" && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setStep("credentials")
                      setOtp("")
                      setError(null)
                    }}
                  >
                    Back to Login
                  </Button>
                )}
              </form>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Don&apos;t have an account? </span>
                <Link href="/auth/sign-up" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-xs text-center text-muted-foreground">
                  By signing in, you agree to our{" "}
                  <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                </p>
              </div>
            </CardContent>
          </Card>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Need help? Contact us at{" "}
            <a href="mailto:support@cryptofdforever.com" className="text-primary hover:underline">
              support@cryptofdforever.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
