"use client"

import { formatCurrency } from "@/lib/utils"
import { useLanguage } from "./LanguageProvider"

interface Props {
  balance: number
  income: number
  expenses: number
  allTimeBalance: number
  prevIncome: number
  prevExpenses: number
}

function ChangeTag({
  current,
  previous,
  lowerIsBetter = false,
}: {
  current: number
  previous: number
  lowerIsBetter?: boolean
}) {
  const { t } = useLanguage()
  if (previous === 0 || current === 0) return null
  const diff = current - previous
  const pct = Math.round((diff / Math.abs(previous)) * 100)
  if (pct === 0)
    return (
      <span className="text-xs text-gray-400">{t.balance.eqLastMonth}</span>
    )
  const isUp = diff > 0
  const isGood = lowerIsBetter ? !isUp : isUp
  return (
    <span
      className={`text-xs font-medium ${isGood ? "text-green-500" : "text-red-500"}`}
    >
      {isUp ? "▲" : "▼"} {Math.abs(pct)}% {t.balance.vsLastMonth}
    </span>
  )
}

export default function BalanceCards({
  balance,
  income,
  expenses,
  allTimeBalance,
  prevIncome,
  prevExpenses,
}: Props) {
  const { t } = useLanguage()
  const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : null
  const savingsColor =
    allTimeBalance > 0
      ? "text-green-400"
      : allTimeBalance < 0
        ? "text-red-400"
        : "text-white"

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 dark:from-indigo-700 dark:to-indigo-800 rounded-2xl p-6 text-white">
        <p className="text-sm font-medium text-indigo-200">
          {t.balance.netSavings}
        </p>
        <p className={`text-4xl font-bold mt-1 ${savingsColor}`}>
          {formatCurrency(allTimeBalance)}
        </p>
        <p className="text-xs text-indigo-300 mt-1">{t.balance.netSavingsHint}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {t.balance.monthlyBalance}
          </p>
          <p
            className={`text-2xl font-bold mt-1 ${balance >= 0 ? "text-gray-900 dark:text-white" : "text-red-600"}`}
          >
            {balance >= 0 ? "+" : ""}
            {formatCurrency(balance)}
          </p>
          <div className="flex items-center justify-between mt-1">
            <ChangeTag current={balance} previous={prevIncome - prevExpenses} />
            {savingsRate !== null && (
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  savingsRate >= 20
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                    : savingsRate >= 0
                      ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                      : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                }`}
              >
                {t.balance.saved(savingsRate)}
              </span>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {t.balance.income}
          </p>
          <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(income)}</p>
          <div className="mt-1">
            <ChangeTag current={income} previous={prevIncome} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {t.balance.expenses}
          </p>
          <p className="text-2xl font-bold text-red-500 mt-1">{formatCurrency(expenses)}</p>
          <div className="mt-1">
            <ChangeTag current={expenses} previous={prevExpenses} lowerIsBetter />
          </div>
        </div>
      </div>
    </div>
  )
}
