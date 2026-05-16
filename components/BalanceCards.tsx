import { formatCurrency } from "@/lib/utils"

interface Props {
  balance: number
  income: number
  expenses: number
}

export default function BalanceCards({ balance, income, expenses }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Balance</p>
        <p className={`text-3xl font-bold mt-1 ${balance >= 0 ? "text-gray-900 dark:text-white" : "text-red-600"}`}>
          {formatCurrency(balance)}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">This month</p>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Income</p>
        <p className="text-3xl font-bold text-green-600 mt-1">{formatCurrency(income)}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">This month</p>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Expenses</p>
        <p className="text-3xl font-bold text-red-500 mt-1">{formatCurrency(expenses)}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">This month</p>
      </div>
    </div>
  )
}
