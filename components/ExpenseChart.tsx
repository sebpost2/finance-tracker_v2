"use client"

import { useState } from "react"
import {
  BarChart, Bar, XAxis, YAxis, Cell, LabelList,
  PieChart, Pie, Tooltip, Legend, ResponsiveContainer,
} from "recharts"
import { formatCurrency } from "@/lib/utils"
import { useLanguage } from "./LanguageProvider"

interface ChartData {
  name: string
  value: number
  color: string
}

const MAX_SLICES = 8

function prepareData(raw: ChartData[], othersLabel: string): { chartData: ChartData[]; others: ChartData[] } {
  if (raw.length === 0) return { chartData: [], others: [] }
  const sorted = [...raw].sort((a, b) => b.value - a.value)
  if (sorted.length <= MAX_SLICES) return { chartData: sorted, others: [] }
  const top = sorted.slice(0, MAX_SLICES)
  const others = sorted.slice(MAX_SLICES)
  return {
    chartData: [...top, { name: othersLabel, value: others.reduce((s, c) => s + c.value, 0), color: "#94a3b8" }],
    others,
  }
}

function HBarView({ chartData, total }: { chartData: ChartData[]; total: number }) {
  const barHeight = 32
  const height = Math.max(160, chartData.length * barHeight + 20)

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        layout="vertical"
        data={chartData.map((d) => ({ ...d, pct: total > 0 ? Math.round((d.value / total) * 100) : 0 }))}
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
            const d = payload[0].payload as ChartData & { pct: number }
            return (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 shadow-lg text-xs">
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {d.name} — {d.pct}% — {formatCurrency(d.value)}
                </p>
              </div>
            )
          }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} isAnimationActive={false}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
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

function PieView({ chartData, others, total, othersLabel }: { chartData: ChartData[]; others: ChartData[]; total: number; othersLabel: string }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={chartData} cx="50%" cy="50%" innerRadius="30%" outerRadius="52%" paddingAngle={2} dataKey="value">
          {chartData.map((_, i) => <Cell key={i} fill={chartData[i].color} />)}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const item = payload[0].payload as ChartData
            const pct = total > 0 ? Math.round((item.value / total) * 100) : 0
            if (item.name === othersLabel && others.length > 0) {
              return (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-lg text-xs min-w-[190px]">
                  <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">{othersLabel} ({pct}%) — {formatCurrency(item.value)}</p>
                  <div className="space-y-1">
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
            {payload?.map((e, i) => {
              const val = chartData.find((c) => c.name === e.value)?.value ?? 0
              return (
                <div key={i} className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: e.color as string }} />
                  <span>{e.value}</span>
                  <span className="text-gray-400">{total > 0 ? Math.round((val / total) * 100) : 0}%</span>
                </div>
              )
            })}
          </div>
        )} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export default function ExpenseChart({ data }: { data: ChartData[] }) {
  const [view, setView] = useState<"bar" | "pie">("bar")
  const { t } = useLanguage()
  const { chartData, others } = prepareData(data, t.charts.othersLabel)
  const total = chartData.reduce((s, c) => s + c.value, 0)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">{t.charts.expenseTitle}</h2>
        <button
          onClick={() => setView((v) => (v === "bar" ? "pie" : "bar"))}
          title={view === "bar" ? t.charts.switchToPie : t.charts.switchToBar}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {view === "bar" ? "🥧" : "📊"}
        </button>
      </div>

      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          {t.charts.expenseEmpty}
        </div>
      ) : view === "bar" ? (
        <div className="flex-1 overflow-y-auto">
          <HBarView chartData={chartData} total={total} />
        </div>
      ) : (
        <div className="flex-1">
          <PieView chartData={chartData} others={others} total={total} othersLabel={t.charts.othersLabel} />
        </div>
      )}
    </div>
  )
}
