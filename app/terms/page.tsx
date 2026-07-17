import { Card } from "@/components/ui/card"
import { Logo } from "@/components/logo"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Terms of Service | CryptoFD",
  description: "Terms and conditions for using CryptoFD platform",
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Logo size="sm" />
              <span className="text-xl font-bold text-foreground">CryptoFD</span>
            </Link>
            <Button asChild variant="ghost" size="sm">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12">
        <Card className="mx-auto max-w-4xl rounded-2xl border-border bg-card p-8 md:p-12">
          <h1 className="text-3xl font-bold text-foreground">Terms of Service</h1>
          <p className="mt-2 text-muted-foreground">Last updated: January 2024</p>

          <div className="mt-8 space-y-8 text-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                By accessing and using CryptoFD (&quot;the Platform&quot;), you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our services. These terms apply to all users, 
                including visitors, registered users, and investors.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">2. Description of Services</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                CryptoFD provides a cryptocurrency fixed deposit platform that allows users to:
              </p>
              <ul className="mt-3 list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Deposit USDT (Tether) cryptocurrency into fixed deposit plans</li>
                <li>Earn daily interest on their deposits based on selected plans</li>
                <li>Withdraw their principal and earnings after the lock period</li>
                <li>Participate in referral programs to earn additional bonuses</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">3. Eligibility</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                To use CryptoFD, you must:
              </p>
              <ul className="mt-3 list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Be at least 18 years of age or the legal age of majority in your jurisdiction</li>
                <li>Have the legal capacity to enter into binding contracts</li>
                <li>Not be prohibited from using cryptocurrency services under applicable laws</li>
                <li>Provide accurate and complete registration information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">4. Account Registration and Security</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                You are responsible for maintaining the confidentiality of your account credentials. 
                You agree to notify us immediately of any unauthorized access or use of your account. 
                CryptoFD is not liable for any loss or damage arising from your failure to protect your account information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">5. Investment Plans and Returns</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Our fixed deposit plans offer daily returns based on the plan selected. Key terms include:
              </p>
              <ul className="mt-3 list-disc pl-6 space-y-2 text-muted-foreground">
                <li>All investments are locked for the specified duration (typically 30 days)</li>
                <li>Daily earnings are credited to your available balance</li>
                <li>Principal is returned after the lock period ends</li>
                <li>Minimum and maximum investment amounts vary by plan</li>
                <li>Past performance does not guarantee future results</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">6. Deposits and Withdrawals</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Deposits must be made in USDT on supported blockchain networks. Withdrawals are processed 
                to the wallet address you provide. You are responsible for ensuring the accuracy of withdrawal addresses. 
                Transactions sent to incorrect addresses cannot be recovered.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">7. Referral Program</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Our multi-level referral program allows you to earn commissions on your referrals&apos; investments. 
                Referral bonuses are credited to your available balance. Abuse of the referral system, 
                including self-referrals or fraudulent referrals, will result in account termination.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">8. Risk Disclosure</h2>
              <div className="mt-3 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
                <p className="text-amber-600 dark:text-amber-400 leading-relaxed">
                  <strong>Important:</strong> Cryptocurrency investments carry inherent risks including market volatility, 
                  regulatory changes, and potential loss of capital. You should only invest what you can afford to lose. 
                  CryptoFD does not provide financial advice, and you should consult a financial advisor before investing.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">9. Prohibited Activities</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                You agree not to:
              </p>
              <ul className="mt-3 list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Use the platform for money laundering or illegal activities</li>
                <li>Attempt to manipulate or exploit the platform</li>
                <li>Create multiple accounts or use false information</li>
                <li>Interfere with the platform&apos;s security or operation</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">10. Limitation of Liability</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                To the maximum extent permitted by law, CryptoFD shall not be liable for any indirect, incidental, 
                special, consequential, or punitive damages, including loss of profits, data, or other intangible losses, 
                resulting from your use of or inability to use the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">11. Modifications to Terms</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of significant changes 
                via email or platform notification. Continued use of the platform after changes constitutes acceptance 
                of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">12. Contact Information</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at support@cryptofdforever.com
              </p>
            </section>
          </div>

          {/* Footer Links */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4 border-t border-border pt-8">
            <Link href="/privacy" className="text-sm text-primary hover:underline">
              Privacy Policy
            </Link>
            <span className="text-muted-foreground">|</span>
            <Link href="/auth/login" className="text-sm text-primary hover:underline">
              Sign In
            </Link>
            <span className="text-muted-foreground">|</span>
            <Link href="/auth/signup" className="text-sm text-primary hover:underline">
              Create Account
            </Link>
          </div>
        </Card>
      </main>
    </div>
  )
}
