import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { cookies } from "next/headers"
import { ToastProvider } from "@/contexts/ToastContext"
import Toaster from "@/components/Toaster"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Finance Tracker",
  description: "Track your income and expenses",
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const theme = cookieStore.get("theme")?.value ?? "light"

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
