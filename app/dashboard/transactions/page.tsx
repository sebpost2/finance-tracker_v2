import type { Metadata } from "next"
import { Suspense } from "react"
import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/prisma"
import TransactionList from "@/components/TransactionList"
import MonthFilter from "@/components/MonthFilter"
import SearchInput from "@/components/SearchInput"
import ExportButton from "@/components/ExportButton"
import TypeFilter from "@/components/TypeFilter"
import { getMonthRange } from "@/lib/utils"

export const metadata: Metadata = { title: "Transactions | Finance Tracker" }

interface PageProps {
  searchParams: Promise<{ month?: string; q?: string; type?: string }>
}

export default async function TransactionsPage({ searchParams }: PageProps) {
  const { userId } = await verifySession()
  const { month, q, type } = await searchParams
  const { start, end } = getMonthRange(month)

  const typeFilter =
    type === "income" ? "INCOME" as const :
    type === "expense" ? "EXPENSE" as const :
    undefined

  const [transactions, categories] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: start, lte: end },
        ...(typeFilter ? { type: typeFilter } : {}),
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
        <div className="flex items-center gap-2">
          <Suspense><ExportButton /></Suspense>
          <Suspense><MonthFilter /></Suspense>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Suspense><SearchInput /></Suspense>
        </div>
        <Suspense><TypeFilter /></Suspense>
      </div>

      <TransactionList transactions={transactions} categories={categories} showAdd />
    </div>
  )
}
