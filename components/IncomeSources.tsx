import { formatCurrency } from "@/lib/utils"

export interface IncomeSource {
  id: string
  name: string
  icon: string
  color: string
  amount: number
}

export default function IncomeSources({ sources }: { sources: IncomeSource[] }) {
  if (sources.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm py-14 flex flex-col items-center gap-3 text-center px-6">
        <span className="text-5xl">💵</span>
        <p className="font-medium text-gray-900 dark:text-white">No income this month</p>
        <p className="text-sm text-gray-400 max-w-xs">
          Add income transactions to see your sources breakdown here.
        </p>
      </div>
    )
  }

  const total = sources.reduce((s, c) => s + c.amount, 0)
  const max = Math.max(...sources.map((s) => s.amount))

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Income by Source</h2>
        <span className="text-sm font-semibold text-green-600">{formatCurrency(total)}</span>
      </div>

      <div className="space-y-4">
        {sources.map((s) => {
          const pct = Math.round((s.amount / total) * 100)
          return (
            <div key={s.id}>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-base">{s.icon}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{s.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">{pct}%</span>
                  <span className="font-semibold text-green-600">{formatCurrency(s.amount)}</span>
                </div>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(s.amount / max) * 100}%`,
                    backgroundColor: s.color,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
