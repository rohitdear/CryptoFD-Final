import { Card } from "@/components/ui/card"
import { Logo } from "@/components/logo"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Privacy Policy | CryptoFD",
  description: "Privacy policy for CryptoFD platform",
}

export default function PrivacyPolicyPage() {
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
          <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
          <p className="mt-2 text-muted-foreground">Last updated: January 2024</p>

          <div className="mt-8 space-y-8 text-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground">1. Introduction</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                CryptoFD (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy 
                explains how we collect, use, disclose, and safeguard your information when you use our 
                cryptocurrency fixed deposit platform. Please read this policy carefully.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">2. Information We Collect</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                We collect information that you provide directly to us:
              </p>
              <ul className="mt-3 list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Account Information:</strong> Email address, name, phone number (optional), and password</li>
                <li><strong>Financial Information:</strong> USDT wallet addresses, transaction history, and investment details</li>
                <li><strong>Referral Information:</strong> Referral codes and relationship data</li>
                <li><strong>Communication Data:</strong> Support tickets, feedback, and correspondence</li>
              </ul>
              
              <p className="mt-4 text-muted-foreground leading-relaxed">
                We automatically collect certain information:
              </p>
              <ul className="mt-3 list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Device Information:</strong> Browser type, operating system, and device identifiers</li>
                <li><strong>Usage Data:</strong> Pages visited, features used, and interaction patterns</li>
                <li><strong>Log Data:</strong> IP addresses, access times, and referral URLs</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">3. How We Use Your Information</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                We use the collected information for:
              </p>
              <ul className="mt-3 list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Providing and maintaining our services</li>
                <li>Processing deposits, withdrawals, and investments</li>
                <li>Calculating and distributing daily earnings and referral bonuses</li>
                <li>Communicating with you about your account and transactions</li>
                <li>Detecting and preventing fraud, abuse, and security incidents</li>
                <li>Complying with legal obligations and regulatory requirements</li>
                <li>Improving our platform and developing new features</li>
                <li>Sending important notifications and updates</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">4. Information Sharing</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>
              <ul className="mt-3 list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Service Providers:</strong> Third-party services that help us operate our platform</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
                <li><strong>Protection:</strong> To protect our rights, privacy, safety, or property</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">5. Data Security</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="mt-3 list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure password hashing using bcrypt</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Secure wallet management for cryptocurrency holdings</li>
              </ul>
              <div className="mt-4 rounded-xl bg-primary/10 border border-primary/20 p-4">
                <p className="text-primary leading-relaxed">
                  While we strive to protect your information, no method of transmission over the Internet 
                  or electronic storage is 100% secure. We cannot guarantee absolute security.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">6. Data Retention</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                We retain your personal information for as long as necessary to:
              </p>
              <ul className="mt-3 list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Provide our services and maintain your account</li>
                <li>Comply with legal and regulatory obligations</li>
                <li>Resolve disputes and enforce our agreements</li>
                <li>Support business operations and analytics</li>
              </ul>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Transaction records may be retained for extended periods to comply with financial regulations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">7. Your Rights and Choices</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="mt-3 list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
                <li><strong>Portability:</strong> Receive your data in a portable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              </ul>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                To exercise these rights, please contact us at privacy@cryptofd.com
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">8. Cookies and Tracking</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                We use cookies and similar technologies to:
              </p>
              <ul className="mt-3 list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Maintain your login session</li>
                <li>Remember your preferences</li>
                <li>Analyze platform usage and performance</li>
                <li>Enhance security and prevent fraud</li>
              </ul>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                You can control cookies through your browser settings, but some features may not function properly without them.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">9. International Data Transfers</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of residence. 
                We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">10. Children&apos;s Privacy</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Our services are not intended for individuals under 18 years of age. We do not knowingly collect 
                personal information from children. If you believe we have collected information from a child, 
                please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">11. Changes to This Policy</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of significant changes 
                by posting the new policy on this page and updating the &quot;Last updated&quot; date. We encourage you 
                to review this policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">12. Contact Us</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="mt-4 rounded-xl bg-secondary/50 p-4">
                <p className="text-foreground">
                  <strong>Email:</strong> privacy@cryptofdforever.com<br />
                  <strong>Support:</strong> support@cryptofdforever.com
                </p>
              </div>
            </section>
          </div>

          {/* Footer Links */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4 border-t border-border pt-8">
            <Link href="/terms" className="text-sm text-primary hover:underline">
              Terms of Service
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
