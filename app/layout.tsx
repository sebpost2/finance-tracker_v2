import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { cookies } from "next/headers"
import { ToastProvider } from "@/contexts/ToastContext"
import Toaster from "@/components/Toaster"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

const DEMO_URL = "https://finance-tracker-v2-sebpost2s-projects.vercel.app"

export const metadata: Metadata = {
  title: "Finance Tracker",
  description: "Full-stack personal finance app — track income, expenses, and budgets with charts and analytics.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💰</text></svg>",
  },
  openGraph: {
    title: "Finance Tracker",
    description: "Full-stack personal finance app built with Next.js 16, Prisma, and Supabase.",
    url: DEMO_URL,
    siteName: "Finance Tracker",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Finance Tracker",
    description: "Full-stack personal finance app built with Next.js 16, Prisma, and Supabase.",
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const theme = cookieStore.get("theme")?.value ?? "dark"

  return (
    <html lang="en" className={`h-full ${theme === "dark" ? "dark" : ""}`} suppressHydrationWarning>
      <body className={`${inter.className} h-full bg-gray-50 dark:bg-gray-950 antialiased`}>
        <ToastProvider>
          {children}
          <Toaster />
        </ToastProvider>
      </body>
    </html>
  )
}
