"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLanguage } from "./LanguageProvider"

export default function NavLinks() {
  const pathname = usePathname()
  const { t } = useLanguage()

  const links = [
    { href: "/dashboard", label: t.nav.dashboard },
    { href: "/dashboard/transactions", label: t.nav.transactions },
    { href: "/dashboard/categories", label: t.nav.categories },
    { href: "/dashboard/settings", label: t.nav.settings },
  ]

  return (
    <nav className="flex items-center gap-1">
      {links.map(({ href, label }) => {
        const isActive = href === "/dashboard" ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
