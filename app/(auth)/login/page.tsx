"use client"

import { useActionState, useTransition } from "react"
import { login } from "@/app/actions/auth"
import { loginAsDemo } from "@/app/actions/demo"
import { useLanguage } from "@/components/LanguageProvider"
import Link from "next/link"

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined)
  const [demoPending, startDemo] = useTransition()
  const { t } = useLanguage()

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
      <div className="text-center mb-8">
        <div className="text-4xl mb-3">💰</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Finance Tracker</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{t.auth.loginSubtitle}</p>
      </div>

      <form action={action} className="space-y-4">
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
            <span>⚠️</span>
            <p className="text-sm font-medium">{state.error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={pending || demoPending}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
        >
          {pending ? t.auth.signingIn : t.auth.signIn}
        </button>
      </form>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white dark:bg-gray-900 px-3 text-xs text-gray-400">{t.loginOr}</span>
        </div>
      </div>

      <button
        onClick={() => startDemo(loginAsDemo)}
        disabled={pending || demoPending}
        className="w-full flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium py-2.5 px-4 rounded-lg transition-colors text-sm disabled:opacity-50"
      >
        {demoPending ? (
          t.auth.loadingDemo
        ) : (
          <>
            <span>🚀</span> {t.auth.tryDemo}
          </>
        )}
      </button>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
        {t.auth.noAccount}{" "}
        <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
          {t.auth.signUp}
        </Link>
      </p>
    </div>
  )
}
