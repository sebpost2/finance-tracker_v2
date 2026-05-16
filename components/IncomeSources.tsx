"use client"

import { useState } from "react"
import {
  BarChart, Bar, XAxis, YAxis, Cell, LabelList,
  PieChart, Pie, Tooltip, Legend, ResponsiveContainer,
} from "recharts"
import { formatCurrency } from "@/lib/utils"

export interface IncomeSource {
  id: string
  name: string
  icon: string
  color: string
  amount: number
}

function HBarView({ sources, total }: { sources: IncomeSource[]; total: number }) {
  const barHeight = 36
  const height = Math.max(120, sources.length * barHeight + 20)

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        layout="vertical"
        data={sources.map((s) => ({ ...s, pct: total > 0 ? Math.round((s.amount / total) * 100) : 0 }))}
        margin={{ left: 0, right: 50, top: 4, bottom: 4 }}
      >
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 11, fill: "currentColor" }}
          axisLine={false}
          tickLine={false}
          width={95}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const s = payload[0].payload as IncomeSource & { pct: number }
            return (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 shadow-lg text-xs">
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {s.icon} {s.name} — {formatCurrency(s.amount)}
                </p>
              </div>
            )
          }}
        />
        <Bar dataKey="amount" radius={[0, 4, 4, 0]} isAnimationActive={false}>
          {sources.map((s, i) => (
            <Cell key={i} fill={s.color} />
          ))}
          <LabelList
            dataKey="pct"
            position="right"
            formatter={(v) => `${v}%`}
            style={{ fontSize: 11, fill: "#9ca3af" }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function PieView({ sources, total }: { sources: IncomeSource[]; total: number }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={sources} cx="50%" cy="50%" innerRadius="30%" outerRadius="52%" paddingAngle={2} dataKey="amount">
          {sources.map((_, i) => <Cell key={i} fill={sources[i].color} />)}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const s = payload[0].payload as IncomeSource
            const pct = total > 0 ? Math.round((s.amount / total) * 100) : 0
            return (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 shadow-lg text-xs">
                <p className="font-medium text-gray-700 dark:text-gray-300">
                  {s.icon} {s.name} — {pct}% — {formatCurrency(s.amount)}
                </p>
              </div>
            )
          }}
        />
        <Legend iconType="circle" iconSize={7} content={({ payload }) => (
          <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-2">
            {payload?.map((e, i) => {
              const src = sources.find((s) => s.name === e.value)
              const pct = src && total > 0 ? Math.round((src.amount / total) * 100) : 0
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
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {view === "bar" ? "🥧" : "📊"}
          </button>
        </div>
      </div>

      <div className="flex-1">
        {view === "bar" ? (
          <HBarView sources={sources} total={total} />
        ) : (
          <PieView sources={sources} total={total} />
        )}
      </div>
    </div>
  )
}
