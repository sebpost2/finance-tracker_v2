"use client"

import { useState } from "react"
import { useLanguage } from "./LanguageProvider"

export default function ThemeToggle({ initialDark }: { initialDark: boolean }) {
  const [isDark, setIsDark] = useState(initialDark)
  const { t } = useLanguage()

  function toggle() {
    const next = !isDark
    setIsDark(next)
    if (next) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    // Cookie persists across page loads — server reads it and applies class on SSR
    document.cookie = `theme=${next ? "dark" : "light"}; path=/; max-age=31536000; SameSite=Lax`
  }

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label={t.theme.toggleAria}
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  )
}
