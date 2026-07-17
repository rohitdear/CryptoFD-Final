import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getProfile } from "@/lib/queries"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Navbar } from "@/components/dashboard/navbar"
import { Chatbot } from "@/components/chatbot"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch profile with photo
  const profile = await getProfile()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sidebar - fixed on desktop */}
      <div className="hidden lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-64 lg:block lg:border-r lg:border-border">
        <Sidebar />
      </div>
      
      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Navbar */}
        <Navbar 
          fullName={user.name || null}
          email={user.email || ""}
          avatarUrl={profile?.profilePhoto || null}
        />
        
        {/* Main Content - with proper overflow handling */}
        <main className="flex-1 overflow-y-auto pb-24 lg:pb-4">
          <div className="w-full max-w-full px-3 sm:px-4 md:px-6 py-4 md:py-6">
            {children}
          </div>
        </main>
      </div>
      
      {/* Chatbot - fixed positioning */}
      <Chatbot />
    </div>
  )
}
