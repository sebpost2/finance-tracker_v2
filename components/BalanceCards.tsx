function fmt(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)
}

interface Props {
  balance: number
  income: number
  expenses: number
}

export default function BalanceCards({ balance, income, expenses }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <p className="text-sm font-medium text-gray-500">Total Balance</p>
        <p className={`text-3xl font-bold mt-1 ${balance >= 0 ? "text-gray-900" : "text-red-600"}`}>
          {fmt(balance)}
        </p>
        <p className="text-xs text-gray-400 mt-1">This month</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <p className="text-sm font-medium text-gray-500">Income</p>
        <p className="text-3xl font-bold text-green-600 mt-1">{fmt(income)}</p>
        <p className="text-xs text-gray-400 mt-1">This month</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <p className="text-sm font-medium text-gray-500">Expenses</p>
        <p className="text-3xl font-bold text-red-500 mt-1">{fmt(expenses)}</p>
        <p className="text-xs text-gray-400 mt-1">This month</p>
      </div>
    </div>
  )
}
