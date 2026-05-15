"use server"

import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/dal"
import { revalidatePath } from "next/cache"

function parseTransactionForm(formData: FormData) {
  const amount = parseFloat(formData.get("amount") as string)
  const description = (formData.get("description") as string)?.trim()
  const type = formData.get("type") as string
  const categoryId = (formData.get("categoryId") as string) || null
  const dateStr = formData.get("date") as string

  if (!description) throw new Error("Description is required")
  if (isNaN(amount) || amount <= 0) throw new Error("Amount must be a positive number")
  if (type !== "INCOME" && type !== "EXPENSE") throw new Error("Invalid transaction type")
  if (!dateStr) throw new Error("Date is required")

  return { amount, description, type: type as "INCOME" | "EXPENSE", categoryId, date: new Date(dateStr) }
}

export async function createTransaction(formData: FormData) {
  const { userId } = await verifySession()
  const data = parseTransactionForm(formData)

  await prisma.transaction.create({ data: { ...data, userId } })

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/transactions")
}

export async function updateTransaction(id: string, formData: FormData) {
  const { userId } = await verifySession()
  const data = parseTransactionForm(formData)

  await prisma.transaction.update({ where: { id, userId }, data })

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/transactions")
}

export async function deleteTransaction(id: string) {
  const { userId } = await verifySession()
  if (!id) throw new Error("ID is required")

  await prisma.transaction.delete({ where: { id, userId } })

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/transactions")
}
