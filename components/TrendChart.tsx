"use client"

import {
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
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

const USE_BAR: TrendPeriod[] = ["1w", "1m"]

function fmt(v: number) {
  if (v === 0) return "$0"
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}k`
  return `$${Math.round(v)}`
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { name: string; value: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  const income   = payload.find((p) => p.name === "Income")?.value   ?? 0
  const expenses = payload.find((p) => p.name === "Expenses")?.value ?? 0
  const net      = income - expenses

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-lg text-xs space-y-1 min-w-[150px]">
      <p className="font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700 pb-1 mb-1">{label}</p>
      <div className="flex justify-between gap-3">
        <span className="text-gray-400">Income</span>
        <span className="font-semibold text-green-600">{formatCurrency(income)}</span>
      </div>
      <div className="flex justify-between gap-3">
        <span className="text-gray-400">Expenses</span>
        <span className="font-semibold text-red-500">{formatCurrency(expenses)}</span>
      </div>
      <div className="flex justify-between gap-3 border-t border-gray-100 dark:border-gray-700 pt-1">
        <span className="text-gray-500 font-medium">Net</span>
        <span className={`font-bold ${net >= 0 ? "text-green-600" : "text-red-500"}`}>
          {net >= 0 ? "+" : ""}{formatCurrency(net)}
        </span>
      </div>
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

  const totalIncome   = data.reduce((s, d) => s + d.income, 0)
  const totalExpenses = data.reduce((s, d) => s + d.expenses, 0)
  const net           = totalIncome - totalExpenses
  const hasData       = data.some((d) => d.income > 0 || d.expenses > 0)
  const isBar         = USE_BAR.includes(period)

  // For long periods (1Y/All), skip every other label to avoid crowding
  const xInterval = period === "1y" ? 1 : 0

  const axisProps = { tick: { fontSize: 10 }, axisLine: false as const, tickLine: false as const }

  const chart = isBar ? (
    <BarChart data={data} barGap={3} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
      <XAxis dataKey="label" {...axisProps} interval={0} />
      <YAxis tickFormatter={fmt} {...axisProps} width={38} />
      <Tooltip content={<CustomTooltip />} />
      <Legend iconType="circle" iconSize={7} />
      <Bar dataKey="income"   name="Income"   fill="#22c55e" radius={[4, 4, 0, 0]} />
      <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
    </BarChart>
  ) : (
    <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
      <defs>
        <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.25} />
          <stop offset="95%" stopColor="#22c55e" stopOpacity={0}    />
        </linearGradient>
        <linearGradient id="gExpenses" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.2} />
          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}   />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
      <XAxis dataKey="label" {...axisProps} interval={xInterval} />
      <YAxis tickFormatter={fmt} {...axisProps} width={38} />
      <Tooltip content={<CustomTooltip />} />
      <Legend iconType="circle" iconSize={7} />
      <Area type="monotone" dataKey="income"   name="Income"   stroke="#22c55e" strokeWidth={2.5} fill="url(#gIncome)"   dot={false} activeDot={{ r: 4 }} />
      <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={2.5} fill="url(#gExpenses)" dot={false} activeDot={{ r: 4 }} />
    </AreaChart>
  )

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Income vs Expenses</h2>
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

      {/* Period summary — wraps on mobile so Net stays inside the card */}
      {hasData && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
            <span className="text-gray-400">Income</span>
            <span className="font-semibold text-green-600">{formatCurrency(totalIncome)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            <span className="text-gray-400">Expenses</span>
            <span className="font-semibold text-red-500">{formatCurrency(totalExpenses)}</span>
          </div>
        </div>
      )}

      {!hasData ? (
        <div className="h-52 flex items-center justify-center text-gray-400 text-sm">
          No data for this period
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          {chart}
        </ResponsiveContainer>
      )}
    </div>
  )
}
