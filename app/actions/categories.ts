"use server"

import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/dal"
import { revalidatePath } from "next/cache"

function parseCategoryForm(formData: FormData) {
  const name = (formData.get("name") as string)?.trim()
  const color = formData.get("color") as string
  const icon = formData.get("icon") as string

  if (!name) throw new Error("Name is required")
  if (!color?.startsWith("#")) throw new Error("Invalid color")
  if (!icon) throw new Error("Icon is required")

  return { name, color, icon }
}

export async function createCategory(formData: FormData) {
  const { userId } = await verifySession()
  const data = parseCategoryForm(formData)

  await prisma.category.create({ data: { ...data, userId } })

  revalidatePath("/dashboard/categories")
}

export async function updateCategory(id: string, formData: FormData) {
  const { userId } = await verifySession()
  const data = parseCategoryForm(formData)

  await prisma.category.update({ where: { id, userId }, data })

  revalidatePath("/dashboard/categories")
}

export async function deleteCategory(id: string) {
  const { userId } = await verifySession()
  if (!id) throw new Error("ID is required")

  await prisma.category.delete({ where: { id, userId } })

  revalidatePath("/dashboard/categories")
  revalidatePath("/dashboard/transactions")
  revalidatePath("/dashboard")
}
