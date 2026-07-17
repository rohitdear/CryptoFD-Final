import { Card, CardContent } from "@/components/ui/card"
import { 
  TrendingUp, 
  Shield, 
  Clock, 
  Users, 
  Globe, 
  Award,
  CheckCircle,
  Mail,
  MapPin,
  GraduationCap,
  Building2
} from "lucide-react"
import { prisma } from "@/lib/db"

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getDashboardStats() {
  try {
    console.log("[DashboardAboutPage] Fetching stats from database")
    let stats = await prisma.siteStats.findUnique({
      where: { id: "main" }
    })
    
    if (!stats) {
      console.log("[DashboardAboutPage] Stats not found, using defaults")
      return null
    }
    
    console.log("[DashboardAboutPage] Retrieved stats:", stats)
    return stats
  } catch (error) {
    console.error("[DashboardAboutPage] Error:", error)
    return null
  }
}

export default async function AboutPage() {
  const siteStats = await getDashboardStats()
  
  const stats = [
    { label: "Active Users", value: siteStats?.activeUsers || "10,000+", icon: Users },
    { label: "Total Invested", value: siteStats?.totalInvested || "$5M+", icon: TrendingUp },
    { label: "Countries", value: siteStats?.countries || "50+", icon: Globe },
    { label: "Years Experience", value: siteStats?.yearsExp || "3+", icon: Award },
  ]

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
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          About <span className="text-primary">CryptoFD</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
          A leading cryptocurrency fixed deposit platform helping you grow your USDT with competitive daily returns.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-border/50 bg-card text-center p-3 sm:p-6 rounded-lg sm:rounded-xl">
            <CardContent className="pt-3 sm:pt-6 space-y-2">
              <stat.icon className="h-6 sm:h-8 w-6 sm:w-8 mx-auto text-primary" />
              <div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Our Story */}
      <Card className="border-border/50 bg-card rounded-xl sm:rounded-2xl">
        <CardContent className="pt-4 sm:pt-6 space-y-4 sm:space-y-6">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">Our Story</h2>
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              <p>
                CryptoFD was founded by a team of passionate students from <span className="text-primary font-semibold">Stanford University</span>, 
                who believed that cryptocurrency investing should be simple, secure, and accessible to everyone.
              </p>
              <p>
                Based in <span className="text-primary font-semibold">London, United Kingdom</span>, we combine cutting-edge 
                blockchain technology with traditional financial principles to create a platform that delivers 
                consistent daily returns on your USDT investments.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="bg-secondary/50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                <MapPin className="w-4 sm:w-6 h-4 sm:h-6 text-primary mx-auto mb-2" />
                <p className="font-semibold text-xs sm:text-sm text-foreground">London, UK</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Headquarters</p>
              </div>
              <div className="bg-secondary/50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                <GraduationCap className="w-4 sm:w-6 h-4 sm:h-6 text-primary mx-auto mb-2" />
                <p className="font-semibold text-xs sm:text-sm text-foreground">Stanford</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Founded By</p>
              </div>
              <div className="bg-secondary/50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                <Building2 className="w-4 sm:w-6 h-4 sm:h-6 text-primary mx-auto mb-2" />
                <p className="font-semibold text-xs sm:text-sm text-foreground">2022</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Established</p>
              </div>
              <div className="bg-secondary/50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                <Shield className="w-4 sm:w-6 h-4 sm:h-6 text-primary mx-auto mb-2" />
                <p className="font-semibold text-xs sm:text-sm text-foreground">Bank-Grade</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Security</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
        {features.map((feature, index) => (
          <Card key={index} className="border-border/50 bg-card hover:border-primary/30 transition-colors rounded-lg sm:rounded-xl">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-lg sm:rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trust */}
      <div className="grid md:grid-cols-3 gap-3 sm:gap-4">
        {trustItems.map((item, index) => (
          <Card key={index} className="border-border/50 bg-card rounded-lg sm:rounded-xl">
            <CardContent className="pt-4 sm:pt-6">
              <CheckCircle className="w-5 sm:w-6 h-5 sm:h-6 text-green-500 mb-2 sm:mb-3" />
              <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">{item.name}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contact */}
      <Card className="border-primary/30 bg-primary/5 rounded-lg sm:rounded-xl">
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4 w-full">
              <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-lg sm:rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 sm:w-6 h-5 sm:h-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground">Need Help? Contact Us</p>
                <a href={`mailto:${siteStats?.supportEmail || "support@cryptofdforever.com"}`} className="text-base sm:text-lg font-semibold text-primary hover:underline truncate">
                  {siteStats?.supportEmail || "support@cryptofdforever.com"}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm flex-shrink-0">
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">London, United Kingdom</span>
              <span className="sm:hidden">UK</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
