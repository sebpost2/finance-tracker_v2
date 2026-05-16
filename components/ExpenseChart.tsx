"use client"

import { useState } from "react"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { formatCurrency } from "@/lib/utils"

interface ChartData {
  name: string
  value: number
  color: string
}

const MAX_SLICES = 8

function prepareData(raw: ChartData[]): { chartData: ChartData[]; others: ChartData[] } {
  if (raw.length === 0) return { chartData: [], others: [] }
  const sorted = [...raw].sort((a, b) => b.value - a.value)
  if (sorted.length <= MAX_SLICES) return { chartData: sorted, others: [] }
  const top = sorted.slice(0, MAX_SLICES)
  const others = sorted.slice(MAX_SLICES)
  const othersValue = others.reduce((s, c) => s + c.value, 0)
  return { chartData: [...top, { name: "Others", value: othersValue, color: "#94a3b8" }], others }
}

function BarView({ data, total }: { data: ChartData[]; total: number }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="space-y-3">
      {data.map((d) => {
        const pct = total > 0 ? Math.round((d.value / total) * 100) : 0
        return (
          <div key={d.name}>
            <div className="flex items-center justify-between text-xs mb-1">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="font-medium text-gray-800 dark:text-gray-200">{d.name}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                <span>{pct}%</span>
                <span className="font-semibold text-gray-700 dark:text-gray-300 w-20 text-right">
                  {formatCurrency(d.value)}
                </span>
              </div>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${(d.value / max) * 100}%`, backgroundColor: d.color }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function PieView({ chartData, others, total }: { chartData: ChartData[]; others: ChartData[]; total: number }) {
  return (
    <div className="min-h-[200px]">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" innerRadius="30%" outerRadius="52%" paddingAngle={2} dataKey="value">
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const item = payload[0].payload as ChartData
              const pct = total > 0 ? Math.round((item.value / total) * 100) : 0
              if (item.name === "Others" && others.length > 0) {
                return (
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-lg text-xs min-w-[190px]">
                    <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Others ({pct}%) — {formatCurrency(item.value)}</p>
                    <div className="space-y-1.5">
                      {others.map((o) => (
                        <div key={o.name} className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: o.color }} />
                          <span className="flex-1">{o.name}</span>
                          <span className="text-gray-400">{Math.round((o.value / total) * 100)}%</span>
                          <span className="font-medium text-gray-700 dark:text-gray-300">{formatCurrency(o.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }
              return (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 shadow-lg text-xs">
                  <p className="font-medium text-gray-700 dark:text-gray-300">{item.name} — {pct}% — {formatCurrency(item.value)}</p>
                </div>
              )
            }}
          />
          <Legend iconType="circle" iconSize={7} content={({ payload }) => (
            <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-2">
              {payload?.map((entry, i) => {
                const val = chartData.find((c) => c.name === entry.value)?.value ?? 0
                const pct = total > 0 ? Math.round((val / total) * 100) : 0
                return (
                  <div key={i} className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color as string }} />
                    <span>{entry.value}</span>
                    <span className="text-gray-400 dark:text-gray-500">{pct}%</span>
                  </div>
                )
              })}
            </div>
          )} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function ExpenseChart({ data }: { data: ChartData[] }) {
  const [view, setView] = useState<"bar" | "pie">("bar")
  const { chartData, others } = prepareData(data)
  const total = chartData.reduce((s, c) => s + c.value, 0)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Expenses by Category</h2>
        <button
          onClick={() => setView((v) => (v === "bar" ? "pie" : "bar"))}
          title={view === "bar" ? "Switch to pie chart" : "Switch to bar chart"}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-base"
        >
          {view === "bar" ? "🥧" : "📊"}
        </button>
      </div>

      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          No expenses this month
        </div>
      ) : view === "bar" ? (
        <div className="flex-1 overflow-y-auto">
          <BarView data={chartData} total={total} />
        </div>
      ) : (
        <div className="flex-1">
          <PieView chartData={chartData} others={others} total={total} />
        </div>
      )}
    </div>
  )
}
