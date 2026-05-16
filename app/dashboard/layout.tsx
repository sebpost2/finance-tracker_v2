import Navbar from "@/components/Navbar"
import BottomNav from "@/components/BottomNav"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full">
      <Navbar />
      {/* pb-20 on mobile gives space above the fixed bottom nav */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
