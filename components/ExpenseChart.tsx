"use client"

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface ChartData {
  name: string
  value: number
  color: string
}

export default function ExpenseChart({ data }: { data: ChartData[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-full flex flex-col">
      <h2 className="text-base font-semibold text-gray-900 mb-4 flex-shrink-0">
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
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="35%"
                outerRadius="55%"
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) =>
                  new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(Number(value))
                }
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
