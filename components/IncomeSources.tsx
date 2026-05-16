"use client"

import { useState } from "react"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { formatCurrency } from "@/lib/utils"

export interface IncomeSource {
  id: string
  name: string
  icon: string
  color: string
  amount: number
}

function BarView({ sources, total }: { sources: IncomeSource[]; total: number }) {
  const max = Math.max(...sources.map((s) => s.amount), 1)
  return (
    <div className="space-y-4">
      {sources.map((s) => {
        const pct = Math.round((s.amount / total) * 100)
        return (
          <div key={s.id} className="group relative">
            <div className="flex items-center justify-between text-sm mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-base">{s.icon}</span>
                <span className="font-medium text-gray-900 dark:text-white">{s.name}</span>
              </div>
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{pct}%</span>
            </div>
            <div title={formatCurrency(s.amount)} className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden cursor-default">
              <div
                className="h-full rounded-full transition-all group-hover:opacity-80"
                style={{ width: `${(s.amount / max) * 100}%`, backgroundColor: s.color }}
              />
            </div>
            {/* hover tooltip */}
            <div className="absolute right-0 -top-8 hidden group-hover:block bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-lg pointer-events-none z-10 whitespace-nowrap">
              {formatCurrency(s.amount)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function PieView({ sources, total }: { sources: IncomeSource[]; total: number }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={sources} cx="50%" cy="50%" innerRadius="30%" outerRadius="52%" paddingAngle={2} dataKey="amount">
          {sources.map((s, i) => <Cell key={i} fill={s.color} />)}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const s = payload[0].payload as IncomeSource
            const pct = Math.round((s.amount / total) * 100)
            return (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 shadow-lg text-xs">
                <p className="font-medium text-gray-700 dark:text-gray-300">{s.icon} {s.name} — {pct}% — {formatCurrency(s.amount)}</p>
              </div>
            )
          }}
        />
        <Legend iconType="circle" iconSize={7} content={({ payload }) => (
          <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-2">
            {payload?.map((e, i) => {
              const src = sources.find((s) => s.name === e.value)
              const pct = src ? Math.round((src.amount / total) * 100) : 0
              return (
                <div key={i} className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: e.color as string }} />
                  <span>{e.value}</span>
                  <span className="text-gray-400">{pct}%</span>
                </div>
              )
            })}
          </div>
        )} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export default function IncomeSources({ sources }: { sources: IncomeSource[] }) {
  const [view, setView] = useState<"bar" | "pie">("bar")

  if (sources.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm py-14 flex flex-col items-center gap-3 text-center px-6">
        <span className="text-5xl">💵</span>
        <p className="font-medium text-gray-900 dark:text-white">No income this month</p>
        <p className="text-sm text-gray-400 max-w-xs">Add income transactions to see your sources here.</p>
      </div>
    )
  }

  const total = sources.reduce((s, c) => s + c.amount, 0)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5 flex-shrink-0">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Income by Source</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-green-600">{formatCurrency(total)}</span>
          <button
            onClick={() => setView((v) => (v === "bar" ? "pie" : "bar"))}
            title={view === "bar" ? "Switch to pie chart" : "Switch to bar chart"}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-base"
          >
            {view === "bar" ? "🥧" : "📊"}
          </button>
        </div>
      </div>

      <div className="flex-1">
        {view === "bar" ? (
          <BarView sources={sources} total={total} />
        ) : (
          <PieView sources={sources} total={total} />
        )}
      </div>
    </div>
  )
}
