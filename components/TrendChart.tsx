"use client"

import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine,
} from "recharts"
import { useRouter, useSearchParams } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import type { TrendPoint, TrendPeriod } from "@/lib/trendData"

const PERIODS: { key: TrendPeriod; label: string }[] = [
  { key: "1w",  label: "1W"  },
  { key: "1m",  label: "1M"  },
  { key: "6m",  label: "6M"  },
  { key: "1y",  label: "1Y"  },
  { key: "all", label: "All" },
]

// Periods that show cumulative totals instead of per-period amounts
const CUMULATIVE_PERIODS: TrendPeriod[] = ["6m", "1y", "all"]

function fmt(v: number) {
  if (v === 0) return "$0"
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}k`
  return `$${Math.round(v)}`
}

function makeCumulative(data: TrendPoint[]): TrendPoint[] {
  let income = 0
  let expenses = 0
  return data.map((d) => {
    income   += d.income
    expenses += d.expenses
    return { ...d, income, expenses }
  })
}

function CustomTooltip({
  active, payload, label, cumulative,
}: {
  active?: boolean
  payload?: { name: string; value: number }[]
  label?: string
  cumulative: boolean
}) {
  if (!active || !payload?.length) return null
  const income   = payload.find((p) => p.name === "Income")?.value   ?? 0
  const expenses = payload.find((p) => p.name === "Expenses")?.value ?? 0
  const net      = income - expenses

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-lg text-xs space-y-1 min-w-[160px]">
      <p className="font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700 pb-1 mb-1">
        {label}{cumulative ? " (cumulative)" : ""}
      </p>
      <div className="flex justify-between gap-3">
        <span className="text-gray-400">Income</span>
        <span className="font-semibold text-green-600">{formatCurrency(income)}</span>
      </div>
      <div className="flex justify-between gap-3">
        <span className="text-gray-400">Expenses</span>
        <span className="font-semibold text-red-500">{formatCurrency(expenses)}</span>
      </div>
      {cumulative && (
        <div className="flex justify-between gap-3 border-t border-gray-100 dark:border-gray-700 pt-1">
          <span className="text-gray-500 font-medium">Saved so far</span>
          <span className={`font-bold ${net >= 0 ? "text-green-600" : "text-red-500"}`}>
            {net >= 0 ? "+" : ""}{formatCurrency(net)}
          </span>
        </div>
      )}
    </div>
  )
}

export default function TrendChart({ data, period }: { data: TrendPoint[]; period: TrendPeriod }) {
  const router       = useRouter()
  const searchParams = useSearchParams()

  function setPeriod(p: TrendPeriod) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("trend", p)
    router.push(`?${params.toString()}`)
  }

  const isCumulative = CUMULATIVE_PERIODS.includes(period)
  const chartData    = isCumulative ? makeCumulative(data) : data

  const totalIncome   = data.reduce((s, d) => s + d.income, 0)
  const totalExpenses = data.reduce((s, d) => s + d.expenses, 0)
  const hasData       = data.some((d) => d.income > 0 || d.expenses > 0)

  const xInterval = period === "1y" ? 1 : 0

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Income vs Expenses</h2>
          {isCumulative && (
            <p className="text-xs text-gray-400 mt-0.5">Cumulative — bars show running totals</p>
          )}
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-0.5">
          {PERIODS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                period === key
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Period totals */}
      {hasData && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
            <span className="text-gray-400">{isCumulative ? "Total income" : "Income"}</span>
            <span className="font-semibold text-green-600">{formatCurrency(totalIncome)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            <span className="text-gray-400">{isCumulative ? "Total expenses" : "Expenses"}</span>
            <span className="font-semibold text-red-500">{formatCurrency(totalExpenses)}</span>
          </div>
        </div>
      )}

      {!hasData ? (
        <div className="h-52 flex items-center justify-center text-gray-400 text-sm">
          No data for this period
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={chartData} barGap={3} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={xInterval}
            />
            <YAxis
              tickFormatter={fmt}
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={38}
            />
            <Tooltip
              content={(props) => (
                <CustomTooltip
                  active={props.active}
                  payload={props.payload as unknown as { name: string; value: number }[]}
                  label={props.label as string}
                  cumulative={isCumulative}
                />
              )}
            />
            <Legend iconType="circle" iconSize={7} />
            <Bar dataKey="income"   name="Income"   fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
