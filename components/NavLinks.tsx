"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/transactions", label: "Transactions" },
  { href: "/dashboard/categories", label: "Categories" },
]

export default function NavLinks() {
  const pathname = usePathname()

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
                ? "bg-indigo-50 text-indigo-600"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
