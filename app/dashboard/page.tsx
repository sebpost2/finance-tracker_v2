import { Suspense } from "react"
import Link from "next/link"
import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/prisma"
import BalanceCards from "@/components/BalanceCards"
import ExpenseChart from "@/components/ExpenseChart"
import TransactionList from "@/components/TransactionList"
import MonthFilter from "@/components/MonthFilter"

interface PageProps {
  searchParams: Promise<{ month?: string }>
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const { userId } = await verifySession()
  const { month } = await searchParams

  const now = new Date()
  const target = month ? new Date(month + "-01") : new Date(now.getFullYear(), now.getMonth(), 1)
  const start = new Date(target.getFullYear(), target.getMonth(), 1)
  const end = new Date(target.getFullYear(), target.getMonth() + 1, 0, 23, 59, 59)

  const [transactions, categories] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId, date: { gte: start, lte: end } },
      include: { category: true },
      orderBy: { date: "desc" },
    }),
    prisma.category.findMany({ where: { userId }, orderBy: { name: "asc" } }),
  ])

  const income = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((s: number, t) => s + t.amount, 0)
  const expenses = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((s: number, t) => s + t.amount, 0)

  const chartData = categories
    .map((cat) => ({
      name: cat.name,
      value: transactions
        .filter((t) => t.type === "EXPENSE" && t.categoryId === cat.id)
        .reduce((s: number, t) => s + t.amount, 0),
      color: cat.color,
    }))
    .filter((c) => c.value > 0)

  const recent = transactions.slice(0, 5)
  const hasMore = transactions.length > 5

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Suspense>
          <MonthFilter />
        </Suspense>
      </div>

      <BalanceCards balance={income - expenses} income={income} expenses={expenses} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch" style={{ minHeight: "380px" }}>
        <ExpenseChart data={chartData} />

        <div className="flex flex-col gap-3 min-h-0">
          <div className="flex-1 min-h-0">
            <TransactionList transactions={recent} categories={categories} showAdd={false} />
          </div>
          {hasMore && (
            <Link
              href="/dashboard/transactions"
              className="text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View all {transactions.length} transactions →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
