import type { Metadata } from "next"
import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/prisma"
import CategoryList from "@/components/CategoryList"
import { getMonthRange } from "@/lib/utils"

export const metadata: Metadata = { title: "Categories | Finance Tracker" }

export default async function CategoriesPage() {
  const { userId } = await verifySession()
  const { start } = getMonthRange()

  const [categories, spendingResult] = await Promise.all([
    prisma.category.findMany({ where: { userId }, orderBy: { name: "asc" } }),
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: { userId, type: "EXPENSE", date: { gte: start }, categoryId: { not: null } },
      _sum: { amount: true },
    }),
  ])

  const spendingMap = new Map(spendingResult.map((s) => [s.categoryId, s._sum.amount ?? 0]))

  const categoriesWithSpending = categories.map((c) => ({
    ...c,
    spent: spendingMap.get(c.id) ?? 0,
  }))

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
      <CategoryList categories={categoriesWithSpending} />
    </div>
  )
}
