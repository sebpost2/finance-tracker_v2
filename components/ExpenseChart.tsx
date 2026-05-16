"use client"

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { formatCurrency } from "@/lib/utils"

interface ChartData {
  name: string
  value: number
  color: string
}

interface Prepared {
  chartData: ChartData[]
  others: ChartData[]
}

const MAX_SLICES = 8 // show all individually up to 8; only group beyond that

function prepareData(raw: ChartData[]): Prepared {
  if (raw.length === 0) return { chartData: [], others: [] }

  const sorted = [...raw].sort((a, b) => b.value - a.value)

  if (sorted.length <= MAX_SLICES) {
    return { chartData: sorted, others: [] }
  }

  const top = sorted.slice(0, MAX_SLICES)
  const others = sorted.slice(MAX_SLICES)
  const othersValue = others.reduce((s, c) => s + c.value, 0)

  return {
    chartData: [...top, { name: "Others", value: othersValue, color: "#94a3b8" }],
    others,
  }
}

interface TooltipPayload {
  name: string
  value: number
  color: string
}

function ChartTooltip({
  active,
  payload,
  others,
}: {
  active?: boolean
  payload?: { payload: TooltipPayload }[]
  others: ChartData[]
}) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload

  if (item.name === "Others" && others.length > 0) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-lg text-xs min-w-[180px]">
        <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Others — {formatCurrency(item.value)}
        </p>
        <div className="space-y-1">
          {others.map((o) => (
            <div key={o.name} className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: o.color }} />
              <span className="flex-1">{o.name}</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {formatCurrency(o.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-medium text-gray-700 dark:text-gray-300">
        {item.name}: {formatCurrency(item.value)}
      </p>
    </div>
  )
}

export default function ExpenseChart({ data }: { data: ChartData[] }) {
  const { chartData, others } = prepareData(data)

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
                content={(props) => (
                  <ChartTooltip
                    active={props.active}
                    payload={props.payload as unknown as { payload: TooltipPayload }[]}
                    others={others}
                  />
                )}
              />
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
