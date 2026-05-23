"use client"

import { useSearchParams } from "next/navigation"
import { useLanguage } from "./LanguageProvider"

export default function ExportButton() {
  const searchParams = useSearchParams()
  const month = searchParams.get("month")
  const { t } = useLanguage()

  const href = `/api/export${month ? `?month=${month}` : ""}`

  return (
    <a
      href={href}
      download
      className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 hover:border-gray-400 px-3 py-2 rounded-lg transition-colors"
    >
      {t.export.button}
    </a>
  )
}
