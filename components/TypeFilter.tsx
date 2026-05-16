"use client"

import { useRouter, useSearchParams } from "next/navigation"

type TxnType = "all" | "income" | "expense"

const OPTIONS: { value: TxnType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "income", label: "Income" },
  { value: "expense", label: "Expenses" },
]

export default function TypeFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = (searchParams.get("type") ?? "all") as TxnType

  function setType(type: TxnType) {
    const params = new URLSearchParams(searchParams.toString())
    if (type === "all") params.delete("type")
    else params.set("type", type)
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
      {OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => setType(value)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            current === value
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
