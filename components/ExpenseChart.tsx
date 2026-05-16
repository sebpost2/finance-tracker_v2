"use client"

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { formatCurrency } from "@/lib/utils"

interface ChartData {
  name: string
  value: number
  color: string
}

function prepareData(raw: ChartData[]): ChartData[] {
  const MAX = 8
  if (raw.length <= MAX) return raw
  // Only group into "Others" when there are truly many categories
  const sorted = [...raw].sort((a, b) => b.value - a.value)
  const top = sorted.slice(0, MAX)
  const othersValue = sorted.slice(MAX).reduce((s, c) => s + c.value, 0)
  return [...top, { name: "Others", value: othersValue, color: "#94a3b8" }]
}

export default function ExpenseChart({ data }: { data: ChartData[] }) {
  const chartData = prepareData(data)

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
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span className="text-xs text-gray-600 dark:text-gray-400">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
