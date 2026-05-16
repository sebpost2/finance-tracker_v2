import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/prisma"
import BalanceCards from "@/components/BalanceCards"
import ExpenseChart from "@/components/ExpenseChart"
import MonthlyChart from "@/components/MonthlyChart"
import IncomeSources from "@/components/IncomeSources"
import TransactionList from "@/components/TransactionList"
import MonthFilter from "@/components/MonthFilter"
import BudgetAlerts from "@/components/BudgetAlerts"
import { getMonthRange } from "@/lib/utils"

export const metadata: Metadata = { title: "Dashboard | Finance Tracker" }

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

interface PageProps {
  searchParams: Promise<{ month?: string }>
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const { userId } = await verifySession()
  const { month } = await searchParams
  const { start, end } = getMonthRange(month)

  // Previous month range
  const prevEnd = new Date(start.getFullYear(), start.getMonth(), 0, 23, 59, 59)
  const prevStart = new Date(prevEnd.getFullYear(), prevEnd.getMonth(), 1)

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  sixMonthsAgo.setDate(1)
  sixMonthsAgo.setHours(0, 0, 0, 0)

  const [
    transactions,
    categories,
    allTransactions,
    allTimeIncome,
    allTimeExpenses,
    incomeGrouped,
    prevIncomeAgg,
    prevExpensesAgg,
    spendingResult,
  ] = await Promise.all([
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
    prisma.transaction.aggregate({ where: { userId, type: "INCOME" }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { userId, type: "EXPENSE" }, _sum: { amount: true } }),
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: { userId, type: "INCOME", date: { gte: start, lte: end } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({ where: { userId, type: "INCOME", date: { gte: prevStart, lte: prevEnd } }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { userId, type: "EXPENSE", date: { gte: prevStart, lte: prevEnd } }, _sum: { amount: true } }),
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: { userId, type: "EXPENSE", date: { gte: start, lte: end }, categoryId: { not: null } },
      _sum: { amount: true },
    }),
  ])

  const income = transactions.filter((t) => t.type === "INCOME").reduce((s: number, t) => s + t.amount, 0)
  const expenses = transactions.filter((t) => t.type === "EXPENSE").reduce((s: number, t) => s + t.amount, 0)
  const allTimeBalance = (allTimeIncome._sum.amount ?? 0) - (allTimeExpenses._sum.amount ?? 0)
  const prevIncome = prevIncomeAgg._sum.amount ?? 0
  const prevExpenses = prevExpensesAgg._sum.amount ?? 0

  // Expense chart
  const chartData = categories
    .map((cat) => ({
      name: cat.name,
      value: transactions.filter((t) => t.type === "EXPENSE" && t.categoryId === cat.id).reduce((s: number, t) => s + t.amount, 0),
      color: cat.color,
    }))
    .filter((c) => c.value > 0)

  // Income sources
  const catMap = new Map(categories.map((c) => [c.id, c]))
  const uncategorizedIncome = transactions.filter((t) => t.type === "INCOME" && !t.categoryId).reduce((s: number, t) => s + t.amount, 0)
  const incomeSources = [
    ...incomeGrouped.filter((g) => g.categoryId).map((g) => {
      const cat = catMap.get(g.categoryId!)
      return { id: g.categoryId!, name: cat?.name ?? "Unknown", icon: cat?.icon ?? "💰", color: cat?.color ?? "#6366f1", amount: g._sum.amount ?? 0 }
    }),
    ...(uncategorizedIncome > 0 ? [{ id: "__none", name: "Uncategorized", icon: "💵", color: "#94a3b8", amount: uncategorizedIncome }] : []),
  ].sort((a, b) => b.amount - a.amount)

  // Budget alerts
  const spendMap = new Map(spendingResult.map((s) => [s.categoryId, s._sum.amount ?? 0]))
  const alertCategories = categories
    .filter((c) => c.budget && c.budget > 0)
    .map((c) => ({ id: c.id, name: c.name, icon: c.icon, spent: spendMap.get(c.id) ?? 0, budget: c.budget! }))

  const overBudget = alertCategories.filter((c) => c.spent >= c.budget)
  const nearBudget = alertCategories.filter((c) => c.spent >= c.budget * 0.8 && c.spent < c.budget)

  // 6-month trend
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

  const recent = transactions.slice(0, 5)

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <Suspense><MonthFilter /></Suspense>
      </div>

      <BudgetAlerts overBudget={overBudget} nearBudget={nearBudget} />

      <BalanceCards
        balance={income - expenses}
        income={income}
        expenses={expenses}
        allTimeBalance={allTimeBalance}
        prevIncome={prevIncome}
        prevExpenses={prevExpenses}
      />

      <MonthlyChart data={Object.values(monthlyMap)} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch" style={{ minHeight: "340px" }}>
        <ExpenseChart data={chartData} />
        <IncomeSources sources={incomeSources} />
      </div>

      <div className="flex flex-col gap-3">
        <TransactionList transactions={recent} categories={categories} showAdd={false} />
        <div className="flex items-center justify-between px-1">
          {transactions.length > 5 && (
            <Link href="/dashboard/transactions" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              View all {transactions.length} transactions →
            </Link>
          )}
          <Link href="/dashboard/yearly" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 ml-auto">
            View yearly overview →
          </Link>
        </div>
      </div>
    </div>
  )
}
