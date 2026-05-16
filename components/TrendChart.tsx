"use client"

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts"
import { useRouter, useSearchParams } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import type { TrendPoint, TrendPeriod } from "@/lib/trendData"

const PERIODS: { key: TrendPeriod; label: string }[] = [
  { key: "1d", label: "1D" },
  { key: "1w", label: "1W" },
  { key: "1m", label: "1M" },
  { key: "6m", label: "6M" },
  { key: "1y", label: "1Y" },
  { key: "all", label: "All" },
]

function yFmt(v: number) {
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}k`
  return `$${v}`
}

export default function TrendChart({ data, period }: { data: TrendPoint[]; period: TrendPeriod }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function setPeriod(p: TrendPeriod) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("trend", p)
    router.push(`?${params.toString()}`)
  }

  const hasData = data.some((d) => d.income > 0 || d.expenses > 0)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
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

      {!hasData ? (
        <div className="h-52 flex items-center justify-center text-gray-400 text-sm">
          No data for this period
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={yFmt}
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={42}
            />
            <Tooltip
              formatter={(v) => formatCurrency(Number(v))}
              contentStyle={{ fontSize: 12, borderRadius: 12, border: "1px solid #e5e7eb" }}
            />
            <Legend iconType="circle" iconSize={7} />
            <Line
              type="monotone"
              dataKey="income"
              name="Income"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              name="Expenses"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
