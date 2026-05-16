import { verifySession } from "@/lib/dal"
import { prisma } from "@/lib/prisma"
import CategoryList from "@/components/CategoryList"

export default async function CategoriesPage() {
  const { userId } = await verifySession()

  const categories = await prisma.category.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  })

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
      <CategoryList categories={categories} />
    </div>
  )
}
