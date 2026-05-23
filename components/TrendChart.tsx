"use client"

import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from "recharts"
import { useRouter, useSearchParams } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import { useLanguage } from "./LanguageProvider"
import type { TrendPoint, TrendPeriod } from "@/lib/trendData"

function fmt(v: number) {
  if (v === 0) return "$0"
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}k`
  return `$${Math.round(v)}`
}

function CustomTooltip({
  active,
  payload,
  label,
  labels,
}: {
  active?: boolean
  payload?: { name: string; value: number }[]
  label?: string
  labels: { income: string; expenses: string; saved: string }
}) {
  if (!active || !payload?.length) return null
  const income   = payload.find((p) => p.name === labels.income)?.value   ?? 0
  const expenses = payload.find((p) => p.name === labels.expenses)?.value ?? 0
  const saved    = income - expenses

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-lg text-xs min-w-[160px]">
      <p className="font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700 pb-1 mb-2">
        {label}
      </p>
      <div className="space-y-1">
        <div className="flex justify-between gap-3">
          <span className="flex items-center gap-1.5 text-gray-400">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> {labels.expenses}
          </span>
          <span className="font-semibold text-red-500">{formatCurrency(expenses)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="flex items-center gap-1.5 text-gray-400">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> {labels.income}
          </span>
          <span className="font-semibold text-green-600">{formatCurrency(income)}</span>
        </div>
        <div className="flex justify-between gap-3 border-t border-gray-100 dark:border-gray-700 pt-1.5 mt-1">
          <span className="text-gray-500 font-medium">{labels.saved}</span>
          <span className={`font-bold ${saved >= 0 ? "text-green-600" : "text-red-500"}`}>
            {saved >= 0 ? "+" : ""}{formatCurrency(saved)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function TrendChart({ data, period }: { data: TrendPoint[]; period: TrendPeriod }) {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const { t } = useLanguage()

  const PERIODS: { key: TrendPeriod; label: string }[] = [
    { key: "1w",  label: t.charts.trend1w  },
    { key: "1m",  label: t.charts.trend1m  },
    { key: "6m",  label: t.charts.trend6m  },
    { key: "1y",  label: t.charts.trend1y  },
    { key: "all", label: t.charts.trendAll },
  ]

  function setPeriod(p: TrendPeriod) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("trend", p)
    router.push(`?${params.toString()}`)
  }

  const totalIncome   = data.reduce((s, d) => s + d.income, 0)
  const totalExpenses = data.reduce((s, d) => s + d.expenses, 0)
  const hasData       = data.some((d) => d.income > 0 || d.expenses > 0)
  const xInterval     = period === "1y" ? 1 : 0

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">{t.charts.trendTitle}</h2>
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

      {/* Totals summary */}
      {hasData && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            <span className="text-gray-400">{t.charts.legendExpenses}</span>
            <span className="font-semibold text-red-500">{formatCurrency(totalExpenses)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
            <span className="text-gray-400">{t.charts.legendIncome}</span>
            <span className="font-semibold text-green-600">{formatCurrency(totalIncome)}</span>
          </div>
        </div>
      )}

      {!hasData ? (
        <div className="h-52 flex items-center justify-center text-gray-400 text-sm">
          {t.charts.trendNoData}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={210}>
          <BarChart
            data={data}
            barCategoryGap="35%"
            margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
          >
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
                  labels={{
                    income: t.charts.legendIncome,
                    expenses: t.charts.legendExpenses,
                    saved: t.charts.trendSaved,
                  }}
                />
              )}
            />
            <Legend iconType="circle" iconSize={7} />
            {/* Expenses at bottom, income stacked on top — taller green = saving money */}
            <Bar dataKey="expenses" name={t.charts.legendExpenses} stackId="a" fill="#ef4444" />
            <Bar dataKey="income"   name={t.charts.legendIncome}   stackId="a" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
