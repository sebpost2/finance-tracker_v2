import type { Metadata } from "next"
import { Suspense } from "react"
import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/prisma"
import CategoryList from "@/components/CategoryList"
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

  const [categories, spendingResult, incomeResult] = await Promise.all([
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
  const incomeMap   = new Map(incomeResult.map((s)   => [s.categoryId, s._sum.amount ?? 0]))

  const isExpenseView = view !== "income"

  const displayCategories = categories
    .map((c) => ({
      ...c,
      spent:    spendingMap.get(c.id) ?? 0,
      received: incomeMap.get(c.id)   ?? 0,
    }))
    .filter((c) =>
      isExpenseView
        ? c.spent > 0 || (c.budget && c.budget > 0)   // expense: has spending or budget
        : c.received > 0                                // income: only show if received something
    )

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
        <Suspense>
          <CategoryViewToggle view={view} />
        </Suspense>
      </div>

      <CategoryList
        categories={displayCategories}
        mode={isExpenseView ? "expense" : "income"}
      />
    </div>
  )
}
