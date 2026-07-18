"use server"

import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/dal"
import { TransactionSchema } from "@/lib/schemas"
import { revalidatePath } from "next/cache"

function revalidate() {
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/transactions")
}

async function assertOwnsCategory(categoryId: string | null | undefined, userId: string) {
  if (!categoryId) return
  const category = await prisma.category.findUnique({ where: { id: categoryId, userId } })
  if (!category) throw new Error("Invalid category")
}

export async function createTransaction(formData: FormData) {
  const { userId } = await verifySession()

  const result = TransactionSchema.safeParse({
    amount: formData.get("amount"),
    description: formData.get("description"),
    type: formData.get("type"),
    categoryId: formData.get("categoryId") || null,
    date: formData.get("date"),
  })
  if (!result.success) throw new Error(result.error.issues[0].message)
  await assertOwnsCategory(result.data.categoryId, userId)

  await prisma.transaction.create({ data: { ...result.data, userId } })
  revalidate()
}

export async function updateTransaction(id: string, formData: FormData) {
  const { userId } = await verifySession()

  const result = TransactionSchema.safeParse({
    amount: formData.get("amount"),
    description: formData.get("description"),
    type: formData.get("type"),
    categoryId: formData.get("categoryId") || null,
    date: formData.get("date"),
  })
  if (!result.success) throw new Error(result.error.issues[0].message)
  await assertOwnsCategory(result.data.categoryId, userId)

  await prisma.transaction.update({ where: { id, userId }, data: result.data })
  revalidate()
}

export async function deleteTransaction(id: string) {
  const { userId } = await verifySession()
  if (!id) throw new Error("ID is required")
  await prisma.transaction.delete({ where: { id, userId } })
  revalidate()
}
