"use client"

import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import { useLanguage } from "./LanguageProvider"

interface CategoryAlert {
  id: string
  name: string
  icon: string
  spent: number
  budget: number
}

interface Props {
  overBudget: CategoryAlert[]
  nearBudget: CategoryAlert[]
}

export default function BudgetAlerts({ overBudget, nearBudget }: Props) {
  const { t } = useLanguage()
  if (overBudget.length === 0 && nearBudget.length === 0) return null

  return (
    <div className="space-y-2">
      {overBudget.length > 0 && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-2xl px-5 py-4">
          <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">
            {t.budgetAlerts.overTitle(overBudget.length)}
          </p>
          <div className="flex flex-wrap gap-2">
            {overBudget.map((c) => (
              <Link
                key={c.id}
                href="/dashboard/categories"
                className="flex items-center gap-1.5 text-xs bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 px-2.5 py-1.5 rounded-lg hover:bg-red-200 dark:hover:bg-red-900 transition-colors"
              >
                <span>{c.icon}</span>
                <span className="font-medium">{c.name}</span>
                <span className="text-red-500 dark:text-red-400">
                  {formatCurrency(c.spent)} / {formatCurrency(c.budget)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {nearBudget.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-900 rounded-2xl px-5 py-4">
          <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-400 mb-2">
            {t.budgetAlerts.nearTitle(nearBudget.length)}
          </p>
          <div className="flex flex-wrap gap-2">
            {nearBudget.map((c) => (
              <Link
                key={c.id}
                href="/dashboard/categories"
                className="flex items-center gap-1.5 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2.5 py-1.5 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
              >
                <span>{c.icon}</span>
                <span className="font-medium">{c.name}</span>
                <span className="text-yellow-600 dark:text-yellow-400">
                  {Math.round((c.spent / c.budget) * 100)}%
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
