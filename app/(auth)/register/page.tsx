"use client"

import { useActionState } from "react"
import { signup } from "@/app/actions/auth"
import { useLanguage } from "@/components/LanguageProvider"
import Link from "next/link"

export default function RegisterPage() {
  const [state, action, pending] = useActionState(signup, undefined)
  const { t } = useLanguage()

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
      <div className="text-center mb-8">
        <div className="text-4xl mb-3">💰</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.auth.registerTitle}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{t.auth.registerSubtitle}</p>
      </div>

      <form action={action} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.auth.name}</label>
          <input
            name="name"
            type="text"
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.auth.email}</label>
          <input
            name="email"
            type="email"
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.auth.password}</label>
          <input
            name="password"
            type="password"
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            placeholder="••••••••"
          />
        </div>

        {state?.error && (
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg px-3 py-2.5">
            <span className="text-base">⚠️</span>
            <p className="text-sm font-medium">{state.error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
        >
          {pending ? t.auth.signingUp : t.auth.signUp}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
        {t.auth.haveAccount}{" "}
        <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
          {t.auth.signIn}
        </Link>
      </p>
    </div>
  )
}
