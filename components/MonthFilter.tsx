"use client"

import { useRouter, useSearchParams } from "next/navigation"

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

export default function MonthFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const monthParam = searchParams.get("month")

  const now = new Date()
  const current = monthParam ? new Date(monthParam + "-01") : new Date(now.getFullYear(), now.getMonth(), 1)

  function navigate(delta: number) {
    const d = new Date(current)
    d.setMonth(d.getMonth() + delta)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    router.push(`?month=${value}`)
  }

  const label = `${MONTHS[current.getMonth()]} ${current.getFullYear()}`

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => navigate(-1)}
        className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
        aria-label="Previous month"
      >
        ←
      </button>
      <span className="text-sm font-medium text-gray-700 w-36 text-center">{label}</span>
      <button
        onClick={() => navigate(1)}
        className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
        aria-label="Next month"
      >
        →
      </button>
    </div>
  )
}
