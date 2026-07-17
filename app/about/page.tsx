import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Logo } from "@/components/logo"
import { prisma } from "@/lib/db"
import { 
  TrendingUp, 
  Shield, 
  Clock, 
  Users, 
  Globe, 
  Award,
  CheckCircle,
  ArrowRight,
  Mail,
  MapPin,
  GraduationCap,
  Building2
} from "lucide-react"

// Force dynamic rendering to always fetch fresh stats from database
export const dynamic = 'force-dynamic'

async function getSiteStats() {
  try {
    console.log("[AboutPage] Starting: Fetching site stats from database")
    
    let stats = await prisma.siteStats.findUnique({
      where: { id: "main" }
    })
    
    console.log("[AboutPage] Query result:", JSON.stringify(stats, null, 2))
    
    if (!stats) {
      console.log("[AboutPage] No stats found, creating default site stats")
      stats = await prisma.siteStats.create({
        data: {
          id: "main",
          activeUsers: "10,000+",
          totalInvested: "$5M+",
          countries: "50+",
          yearsExp: "3+",
          supportEmail: "support@cryptofdforever.com"
        }
      })
      console.log("[AboutPage] Created new stats:", JSON.stringify(stats, null, 2))
    }
    
    console.log("[AboutPage] SUCCESS - Returning stats with values:", {
      activeUsers: stats?.activeUsers,
      totalInvested: stats?.totalInvested,
      countries: stats?.countries,
      yearsExp: stats?.yearsExp
    })
    return stats
  } catch (error) {
    console.error("[AboutPage] CRITICAL ERROR fetching site stats:", error)
    return null
  }
}

export default async function AboutPage() {
  console.log("[AboutPage] ===== PAGE RENDER START =====")
  const siteStats = await getSiteStats()
  
  console.log("[AboutPage] siteStats value:", JSON.stringify(siteStats, null, 2))
  console.log("[AboutPage] siteStats is null?", siteStats === null)
  console.log("[AboutPage] siteStats is undefined?", siteStats === undefined)
  
  const stats = [
    { label: "Active Users", value: siteStats?.activeUsers || "10,000+", icon: Users },
    { label: "Total Invested", value: siteStats?.totalInvested || "$5M+", icon: TrendingUp },
    { label: "Countries", value: siteStats?.countries || "50+", icon: Globe },
    { label: "Years Experience", value: siteStats?.yearsExp || "3+", icon: Award },
  ]
  
  console.log("[AboutPage] stats array:", stats)
  
  const supportEmail = siteStats?.supportEmail || "support@cryptofdforever.com"
  
  console.log("[AboutPage] PAGE RENDER COMPLETE =====")

  const features = [
    {
      title: "Secure Investments",
      description: "Your funds are protected with industry-leading security measures including cold storage and multi-signature wallets.",
      icon: Shield,
    },
    {
      title: "Daily Returns",
      description: "Earn competitive daily interest on your USDT deposits with our fixed deposit plans ranging from Starter to Diamond tier.",
      icon: TrendingUp,
    },
    {
      title: "Instant Withdrawals",
      description: "Withdraw your earnings anytime to your BEP-20 wallet. No lock-in period for your earned interest.",
      icon: Clock,
    },
    {
      title: "Referral Program",
      description: "Earn up to 10% commission on your referrals' investments through our multi-level referral system.",
      icon: Users,
    },
  ]

  const plans = [
    { name: "Starter", color: "bg-slate-500", amount: "$50 - $499", roi: "0.5%" },
    { name: "Bronze", color: "bg-amber-700", amount: "$500 - $1,999", roi: "0.8%" },
    { name: "Silver", color: "bg-slate-400", amount: "$2,000 - $4,999", roi: "1.0%" },
    { name: "Gold", color: "bg-yellow-500", amount: "$5,000 - $9,999", roi: "1.2%" },
    { name: "Platinum", color: "bg-slate-300", amount: "$10,000 - $49,999", roi: "1.5%" },
    { name: "Diamond", color: "bg-cyan-400", amount: "$50,000+", roi: "2.0%" },
  ]

  const trustItems = [
    {
      name: "Investment Security",
      description: "All deposits are held in secure cold wallets with multi-signature protection.",
    },
    {
      name: "Transparent Operations",
      description: "All transactions are recorded on the blockchain for complete transparency.",
    },
    {
      name: "24/7 Support",
      description: "Our dedicated support team is available around the clock to assist you.",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <Logo size="md" />
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button className="bg-primary hover:bg-primary/90">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            About <span className="text-primary">CryptoFD</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            CryptoFD is a leading cryptocurrency fixed deposit platform that helps you grow your USDT 
            with competitive daily returns. Our mission is to make crypto investing accessible, 
            secure, and profitable for everyone.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
              <p className="text-muted-foreground mb-4">
                CryptoFD was founded by a team of passionate students from <span className="text-primary font-semibold">Stanford University</span>, 
                who believed that cryptocurrency investing should be simple, secure, and accessible to everyone.
              </p>
              <p className="text-muted-foreground mb-4">
                Based in <span className="text-primary font-semibold">London, United Kingdom</span>, we combine cutting-edge 
                blockchain technology with traditional financial principles to create a platform that delivers 
                consistent daily returns on your USDT investments.
              </p>
              <p className="text-muted-foreground">
                Our team brings together expertise in fintech, blockchain development, and quantitative finance 
                to ensure your investments are both profitable and secure.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-border/50 bg-card p-6 text-center">
                <MapPin className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground">Headquarters</h3>
                <p className="text-sm text-muted-foreground">London, UK</p>
              </Card>
              <Card className="border-border/50 bg-card p-6 text-center">
                <GraduationCap className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground">Founded By</h3>
                <p className="text-sm text-muted-foreground">Stanford Students</p>
              </Card>
              <Card className="border-border/50 bg-card p-6 text-center">
                <Building2 className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground">Established</h3>
                <p className="text-sm text-muted-foreground">2022</p>
              </Card>
              <Card className="border-border/50 bg-card p-6 text-center">
                <Shield className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground">Security</h3>
                <p className="text-sm text-muted-foreground">Bank-Grade</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="border-border/50 bg-card text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Plans */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-4">
            Investment Plans
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Choose from our 6 carefully designed investment tiers, each offering competitive daily returns
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {plans.map((plan, index) => (
              <Card key={index} className="border-border/50 bg-card text-center hover:border-primary/50 transition-all hover:scale-105">
                <CardContent className="pt-6 pb-6">
                  <div className={`w-12 h-12 rounded-full ${plan.color} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                    <span className="text-white font-bold text-lg">{index + 1}</span>
                  </div>
                  <h3 className="font-semibold text-foreground">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{plan.amount}</p>
                  <p className="text-sm font-semibold text-primary mt-2">{plan.roi} Daily</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Why Choose CryptoFD?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-border/50 bg-card hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Create Account</h3>
              <p className="text-muted-foreground">
                Sign up with your email and complete verification to get started.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Deposit USDT</h3>
              <p className="text-muted-foreground">
                Deposit USDT (BEP-20) to your unique wallet address. Auto-detected and credited.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Earn Daily</h3>
              <p className="text-muted-foreground">
                Choose a plan and start earning daily interest. Withdraw earnings anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Built on Trust
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {trustItems.map((item, index) => (
              <Card key={index} className="border-border/50 bg-card">
                <CardContent className="pt-6">
                  <CheckCircle className="w-8 h-8 text-green-500 mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">{item.name}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Contact Us
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Have questions? Our support team is here to help you 24/7.
          </p>
          <Card className="border-border/50 bg-card p-8">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email Support</p>
                <a href={`mailto:${supportEmail}`} className="text-xl font-semibold text-primary hover:underline">
                  {supportEmail}
                </a>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground mt-4">
                <MapPin className="w-4 h-4" />
                <span>London, United Kingdom</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Start Earning?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of investors who are already earning daily returns with CryptoFD.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/sign-up">
              <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2">
                Create Free Account
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline">
                Login to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-primary">About</Link>
            <Link href="/auth/login" className="hover:text-primary">Login</Link>
            <Link href="/auth/sign-up" className="hover:text-primary">Sign Up</Link>
            <a href={`mailto:${supportEmail}`} className="hover:text-primary">Contact</a>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} CryptoFD. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
