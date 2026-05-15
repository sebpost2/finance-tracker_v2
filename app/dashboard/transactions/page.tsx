import { Suspense } from "react"
import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/prisma"
import TransactionList from "@/components/TransactionList"
import MonthFilter from "@/components/MonthFilter"

interface PageProps {
  searchParams: Promise<{ month?: string }>
}

export default async function TransactionsPage({ searchParams }: PageProps) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <Suspense>
          <MonthFilter />
        </Suspense>
      </div>

      <TransactionList transactions={transactions} categories={categories} showAdd />
    </div>
  )
}
