import type { Metadata } from "next"
import { Suspense } from "react"
import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/prisma"
import CategoryList from "@/components/CategoryList"
import IncomeSources from "@/components/IncomeSources"
import CategoryViewToggle from "@/components/CategoryViewToggle"
import { getMonthRange } from "@/lib/utils"

export const metadata: Metadata = { title: "Categories | Finance Tracker" }

interface PageProps {
  searchParams: Promise<{ view?: string }>
}

export default async function CategoriesPage({ searchParams }: PageProps) {
  const { userId } = await verifySession()
  const { view = "expense" } = await searchParams
  const { start } = getMonthRange()

  const [categories, spendingResult, incomeGrouped] = await Promise.all([
    prisma.category.findMany({ where: { userId }, orderBy: { name: "asc" } }),
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: { userId, type: "EXPENSE", date: { gte: start }, categoryId: { not: null } },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: { userId, type: "INCOME", date: { gte: start }, categoryId: { not: null } },
      _sum: { amount: true },
    }),
  ])

  const spendingMap = new Map(spendingResult.map((s) => [s.categoryId, s._sum.amount ?? 0]))
  const incomeMap = new Map(incomeGrouped.map((s) => [s.categoryId, s._sum.amount ?? 0]))

  const categoriesWithSpending = categories.map((c) => ({
    ...c,
    spent: spendingMap.get(c.id) ?? 0,
  }))

  const incomeSources = categories
    .map((c) => ({
      id: c.id,
      name: c.name,
      icon: c.icon,
      color: c.color,
      amount: incomeMap.get(c.id) ?? 0,
    }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount)

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
        <Suspense>
          <CategoryViewToggle view={view} />
        </Suspense>
      </div>

      {view === "income" ? (
        <IncomeSources sources={incomeSources} />
      ) : (
        <CategoryList categories={categoriesWithSpending} />
      )}
    </div>
  )
}
