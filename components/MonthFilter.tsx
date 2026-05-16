"use client"

import { useRouter, useSearchParams } from "next/navigation"

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

function parseMonthParam(param: string): Date {
  const [year, month] = param.split("-").map(Number)
  return new Date(year, month - 1, 1) // local time — avoids UTC parsing bug
}

function toMonthParam(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

export default function MonthFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const monthParam = searchParams.get("month")

  const now = new Date()
  const current = monthParam
    ? parseMonthParam(monthParam)
    : new Date(now.getFullYear(), now.getMonth(), 1)

  function navigate(delta: number) {
    const next = new Date(current.getFullYear(), current.getMonth() + delta, 1)
    const params = new URLSearchParams(searchParams.toString())
    params.set("month", toMonthParam(next))
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => navigate(-1)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
        aria-label="Previous month"
      >
        ←
      </button>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-36 text-center tabular-nums">
        {MONTHS[current.getMonth()]} {current.getFullYear()}
      </span>
      <button
        onClick={() => navigate(1)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
        aria-label="Next month"
      >
        →
      </button>
    </div>
  )
}
