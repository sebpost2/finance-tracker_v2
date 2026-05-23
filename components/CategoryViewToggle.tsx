"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useLanguage } from "./LanguageProvider"

export default function CategoryViewToggle({ view }: { view: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useLanguage()

  function setView(v: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("view", v)
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
      {(["expense", "income"] as const).map((v) => (
        <button
          key={v}
          onClick={() => setView(v)}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            view === v
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          {v === "expense" ? t.categoryView.expenses : t.categoryView.income}
        </button>
      ))}
    </div>
  )
}
