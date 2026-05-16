import { Suspense } from "react"
import Link from "next/link"
import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/prisma"
import BalanceCards from "@/components/BalanceCards"
import ExpenseChart from "@/components/ExpenseChart"
import MonthlyChart from "@/components/MonthlyChart"
import TransactionList from "@/components/TransactionList"
import MonthFilter from "@/components/MonthFilter"
import { getMonthRange } from "@/lib/utils"

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

interface PageProps {
  searchParams: Promise<{ month?: string }>
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const { userId } = await verifySession()
  const { month } = await searchParams
  const { start, end } = getMonthRange(month)

  // 6-month window for trend chart
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  sixMonthsAgo.setDate(1)
  sixMonthsAgo.setHours(0, 0, 0, 0)

  const [transactions, categories, allTransactions] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId, date: { gte: start, lte: end } },
      include: { category: true },
      orderBy: { date: "desc" },
    }),
    prisma.category.findMany({ where: { userId }, orderBy: { name: "asc" } }),
    prisma.transaction.findMany({
      where: { userId, date: { gte: sixMonthsAgo } },
      select: { amount: true, type: true, date: true },
    }),
  ])

  const income = transactions.filter((t) => t.type === "INCOME").reduce((s: number, t) => s + t.amount, 0)
  const expenses = transactions.filter((t) => t.type === "EXPENSE").reduce((s: number, t) => s + t.amount, 0)

  const chartData = categories
    .map((cat) => ({
      name: cat.name,
      value: transactions.filter((t) => t.type === "EXPENSE" && t.categoryId === cat.id).reduce((s: number, t) => s + t.amount, 0),
      color: cat.color,
    }))
    .filter((c) => c.value > 0)

  // Build 6-month trend data
  const monthlyMap: Record<string, { month: string; income: number; expenses: number }> = {}
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    monthlyMap[key] = { month: MONTH_NAMES[d.getMonth()], income: 0, expenses: 0 }
  }
  for (const t of allTransactions) {
    const d = new Date(t.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    if (monthlyMap[key]) {
      if (t.type === "INCOME") monthlyMap[key].income += t.amount
      else monthlyMap[key].expenses += t.amount
    }
  }
  const trendData = Object.values(monthlyMap)

  const recent = transactions.slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <Suspense><MonthFilter /></Suspense>
      </div>

      <BalanceCards balance={income - expenses} income={income} expenses={expenses} />

      <MonthlyChart data={trendData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch" style={{ minHeight: "380px" }}>
        <ExpenseChart data={chartData} />
        <div className="flex flex-col gap-3 min-h-0">
          <div className="flex-1 min-h-0">
            <TransactionList transactions={recent} categories={categories} showAdd={false} />
          </div>
          {transactions.length > 5 && (
            <Link href="/dashboard/transactions" className="text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              View all {transactions.length} transactions →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
