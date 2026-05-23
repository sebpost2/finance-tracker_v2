import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { cookies } from "next/headers"
import { ToastProvider } from "@/contexts/ToastContext"
import Toaster from "@/components/Toaster"
import { getLang, getDict } from "@/lib/i18n-server"
import { LanguageProvider } from "@/components/LanguageProvider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

const DEMO_URL = "https://finance-tracker-v2-sebpost2s-projects.vercel.app"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict()
  return {
    title: t.meta.title,
    description: t.meta.description,
    icons: {
      icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💰</text></svg>",
    },
    openGraph: {
      title: t.meta.title,
      description: t.meta.ogDescription,
      url: DEMO_URL,
      siteName: t.meta.title,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: t.meta.title,
      description: t.meta.ogDescription,
    },
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const theme = cookieStore.get("theme")?.value ?? "dark"
  const lang = await getLang()

  return (
    <html lang={lang} className={`h-full ${theme === "dark" ? "dark" : ""}`} suppressHydrationWarning>
      <body className={`${inter.className} h-full bg-gray-50 dark:bg-gray-950 antialiased`}>
        <LanguageProvider lang={lang}>
          <ToastProvider>
            {children}
            <Toaster />
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
