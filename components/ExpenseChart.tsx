"use client"

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

export default function ExpenseChart({ data }: { data: ChartData[] }) {
  const { chartData, others } = prepareData(data)
  const total = chartData.reduce((s, c) => s + c.value, 0)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 h-full flex flex-col">
      <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex-shrink-0">
        Expenses by Category
      </h2>

      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          No expenses this month
        </div>
      ) : (
        <div className="flex-1 min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius="30%"
                outerRadius="52%"
                paddingAngle={2}
                dataKey="value"
              >
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
                        <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Others ({pct}%) — {formatCurrency(item.value)}
                        </p>
                        <div className="space-y-1.5">
                          {others.map((o) => {
                            const oPct = total > 0 ? Math.round((o.value / total) * 100) : 0
                            return (
                              <div key={o.name} className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: o.color }} />
                                <span className="flex-1">{o.name}</span>
                                <span className="text-gray-400">{oPct}%</span>
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                  {formatCurrency(o.value)}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 shadow-lg text-xs">
                      <p className="font-medium text-gray-700 dark:text-gray-300">
                        {item.name} — {pct}% — {formatCurrency(item.value)}
                      </p>
                    </div>
                  )
                }}
              />

              <Legend
                iconType="circle"
                iconSize={7}
                content={({ payload }) => (
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
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
