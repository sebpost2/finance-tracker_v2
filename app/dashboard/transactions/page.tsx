import { Suspense } from "react"
import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/prisma"
import TransactionList from "@/components/TransactionList"
import MonthFilter from "@/components/MonthFilter"
import SearchInput from "@/components/SearchInput"
import ExportButton from "@/components/ExportButton"
import { getMonthRange } from "@/lib/utils"

interface PageProps {
  searchParams: Promise<{ month?: string; q?: string }>
}

export default async function TransactionsPage({ searchParams }: PageProps) {
  const { userId } = await verifySession()
  const { month, q } = await searchParams
  const { start, end } = getMonthRange(month)

  const [transactions, categories] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: start, lte: end },
        ...(q ? {
          OR: [
            { description: { contains: q, mode: "insensitive" } },
            { category: { name: { contains: q, mode: "insensitive" } } },
          ],
        } : {}),
      },
      include: { category: true },
      orderBy: { date: "desc" },
    }),
    prisma.category.findMany({ where: { userId }, orderBy: { name: "asc" } }),
  ])

  return (
    <div className="space-y-4">
      {/* Header — stacks vertically on mobile */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
        <div className="flex items-center gap-2">
          <Suspense><ExportButton /></Suspense>
          <Suspense><MonthFilter /></Suspense>
        </div>
      </div>

      <Suspense>
        <SearchInput />
      </Suspense>

      <TransactionList transactions={transactions} categories={categories} showAdd />
    </div>
  )
}
