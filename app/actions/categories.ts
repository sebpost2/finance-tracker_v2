"use server"

import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/dal"
import { CategorySchema } from "@/lib/schemas"
import { revalidatePath } from "next/cache"

function revalidate() {
  revalidatePath("/dashboard/categories")
  revalidatePath("/dashboard")
}

export async function createCategory(formData: FormData) {
  const { userId } = await verifySession()

  const result = CategorySchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color"),
    icon: formData.get("icon"),
    budget: formData.get("budget") || null,
  })
  if (!result.success) throw new Error(result.error.issues[0].message)

  await prisma.category.create({ data: { ...result.data, userId } })
  revalidate()
}

export async function updateCategory(id: string, formData: FormData) {
  const { userId } = await verifySession()

  const result = CategorySchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color"),
    icon: formData.get("icon"),
    budget: formData.get("budget") || null,
  })
  if (!result.success) throw new Error(result.error.issues[0].message)

  await prisma.category.update({ where: { id, userId }, data: result.data })
  revalidate()
}

export async function deleteCategory(id: string) {
  const { userId } = await verifySession()
  if (!id) throw new Error("ID is required")
  await prisma.category.delete({ where: { id, userId } })
  revalidatePath("/dashboard/categories")
  revalidatePath("/dashboard/transactions")
  revalidatePath("/dashboard")
}
