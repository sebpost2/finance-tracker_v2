"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"
import { useLanguage } from "./LanguageProvider"

export default function SearchInput() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const { t } = useLanguage()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const params = new URLSearchParams(searchParams.toString())
    if (e.target.value) {
      params.set("q", e.target.value)
    } else {
      params.delete("q")
    }
    startTransition(() => router.replace(`?${params.toString()}`))
  }

  return (
    <input
      type="search"
      placeholder={t.filters.searchPlaceholder}
      defaultValue={searchParams.get("q") ?? ""}
      onChange={handleChange}
      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
    />
  )
}
