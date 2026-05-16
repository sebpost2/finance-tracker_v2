import { formatCurrency } from "@/lib/utils"

interface Props {
  balance: number
  income: number
  expenses: number
  allTimeBalance: number
}

export default function BalanceCards({ balance, income, expenses, allTimeBalance }: Props) {
  const savingsColor =
    allTimeBalance > 0 ? "text-green-400" : allTimeBalance < 0 ? "text-red-400" : "text-white"

  return (
    <div className="space-y-4">
      {/* All-time net savings — most important number */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 dark:from-indigo-700 dark:to-indigo-800 rounded-2xl p-6 text-white">
        <p className="text-sm font-medium text-indigo-200">Net Savings</p>
        <p className={`text-4xl font-bold mt-1 ${savingsColor}`}>
          {formatCurrency(allTimeBalance)}
        </p>
        <p className="text-xs text-indigo-300 mt-1">Total balance across all time</p>
      </div>

      {/* Monthly stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Balance</p>
          <p className={`text-2xl font-bold mt-1 ${balance >= 0 ? "text-gray-900 dark:text-white" : "text-red-600"}`}>
            {balance >= 0 ? "+" : ""}{formatCurrency(balance)}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">This month</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Income</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(income)}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">This month</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Expenses</p>
          <p className="text-2xl font-bold text-red-500 mt-1">{formatCurrency(expenses)}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">This month</p>
        </div>
      </div>
    </div>
  )
}
