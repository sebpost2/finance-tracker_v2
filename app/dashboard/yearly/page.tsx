import type { Metadata } from "next"
import Link from "next/link"
import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/prisma"
import { formatCurrency } from "@/lib/utils"

export const metadata: Metadata = { title: "Yearly Overview | Finance Tracker" }

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
const FULL_MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]

interface PageProps {
  searchParams: Promise<{ year?: string }>
}

export default async function YearlyPage({ searchParams }: PageProps) {
  const { userId } = await verifySession()
  const { year: yearParam } = await searchParams
  const year = yearParam ? parseInt(yearParam) : new Date().getFullYear()

  const start = new Date(year, 0, 1)
  const end = new Date(year, 11, 31, 23, 59, 59)

  const transactions = await prisma.transaction.findMany({
    where: { userId, date: { gte: start, lte: end } },
    select: { amount: true, type: true, date: true },
  })

  const monthly = MONTHS.map((label, i) => {
    const txns = transactions.filter((t) => new Date(t.date).getMonth() === i)
    const income = txns.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0)
    const expenses = txns.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0)
    const balance = income - expenses
    const savingsRate = income > 0 ? Math.round((balance / income) * 100) : null
    return { label, fullLabel: FULL_MONTHS[i], income, expenses, balance, savingsRate }
  })

  const totals = monthly.reduce(
    (acc, m) => ({ income: acc.income + m.income, expenses: acc.expenses + m.expenses }),
    { income: 0, expenses: 0 }
  )
  const totalBalance = totals.income - totals.expenses
  const totalSavingsRate = totals.income > 0 ? Math.round((totalBalance / totals.income) * 100) : null
  const currentYear = new Date().getFullYear()

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{year} Overview</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Annual summary of income, expenses, and savings</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`?year=${year - 1}`}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
          >
            ← {year - 1}
          </Link>
          {year < currentYear && (
            <Link
              href={`?year=${year + 1}`}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
            >
              {year + 1} →
            </Link>
          )}
        </div>
      </div>

      {/* Annual summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Income", value: formatCurrency(totals.income), color: "text-green-600" },
          { label: "Total Expenses", value: formatCurrency(totals.expenses), color: "text-red-500" },
          { label: "Net Balance", value: formatCurrency(totalBalance), color: totalBalance >= 0 ? "text-gray-900 dark:text-white" : "text-red-600" },
          { label: "Savings Rate", value: totalSavingsRate !== null ? `${totalSavingsRate}%` : "—", color: (totalSavingsRate ?? 0) >= 20 ? "text-green-600" : "text-yellow-600 dark:text-yellow-500" },
        ].map((card) => (
          <div key={card.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
            <p className={`text-xl font-bold mt-1 ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Monthly breakdown table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Monthly Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {["Month", "Income", "Expenses", "Balance", "Savings Rate"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {monthly.map((m) => {
                const hasData = m.income > 0 || m.expenses > 0
                return (
                  <tr key={m.label} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${!hasData ? "opacity-40" : ""}`}>
                    <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">{m.fullLabel}</td>
                    <td className="px-6 py-3 text-green-600 font-medium">{hasData ? formatCurrency(m.income) : "—"}</td>
                    <td className="px-6 py-3 text-red-500 font-medium">{hasData ? formatCurrency(m.expenses) : "—"}</td>
                    <td className={`px-6 py-3 font-semibold ${m.balance >= 0 ? "text-gray-900 dark:text-white" : "text-red-600"}`}>
                      {hasData ? `${m.balance >= 0 ? "+" : ""}${formatCurrency(m.balance)}` : "—"}
                    </td>
                    <td className="px-6 py-3">
                      {hasData && m.savingsRate !== null ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          m.savingsRate >= 20 ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" :
                          m.savingsRate >= 0 ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" :
                          "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                        }`}>
                          {m.savingsRate}%
                        </span>
                      ) : "—"}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            {/* Totals row */}
            <tfoot>
              <tr className="border-t-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <td className="px-6 py-3 font-bold text-gray-900 dark:text-white">Total</td>
                <td className="px-6 py-3 font-bold text-green-600">{formatCurrency(totals.income)}</td>
                <td className="px-6 py-3 font-bold text-red-500">{formatCurrency(totals.expenses)}</td>
                <td className={`px-6 py-3 font-bold ${totalBalance >= 0 ? "text-gray-900 dark:text-white" : "text-red-600"}`}>
                  {totalBalance >= 0 ? "+" : ""}{formatCurrency(totalBalance)}
                </td>
                <td className="px-6 py-3 font-bold text-gray-900 dark:text-white">
                  {totalSavingsRate !== null ? `${totalSavingsRate}%` : "—"}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <Link href="/dashboard" className="inline-flex text-sm text-indigo-600 hover:text-indigo-700 font-medium">
        ← Back to Dashboard
      </Link>
    </div>
  )
}
