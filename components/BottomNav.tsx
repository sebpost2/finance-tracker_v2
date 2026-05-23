"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLanguage } from "./LanguageProvider"

export default function BottomNav() {
  const pathname = usePathname()
  const { t } = useLanguage()

  const links = [
    { href: "/dashboard", label: t.nav.dashboard, icon: "📊" },
    { href: "/dashboard/transactions", label: t.nav.transactions, icon: "💳" },
    { href: "/dashboard/categories", label: t.nav.categories, icon: "🏷️" },
    { href: "/dashboard/settings", label: t.nav.settings, icon: "⚙️" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 md:hidden">
      <div className="flex">
        {links.map(({ href, label, icon }) => {
          const isActive = href === "/dashboard" ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 text-xs font-medium transition-colors ${
                isActive ? "text-indigo-600" : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <span className="text-lg leading-none">{icon}</span>
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
