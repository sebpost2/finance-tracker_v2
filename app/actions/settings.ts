"use server"

import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/dal"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

type SettingsState = { error?: string; success?: boolean } | undefined

export async function updateProfile(
  state: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const { userId } = await verifySession()
  const name = (formData.get("name") as string)?.trim()

  if (!name) return { error: "Name is required" }
  if (name.length < 2) return { error: "Name must be at least 2 characters" }

  await prisma.user.update({ where: { id: userId }, data: { name } })
  revalidatePath("/dashboard")

  return { success: true }
}

export async function changePassword(
  state: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const { userId } = await verifySession()
  const current = formData.get("currentPassword") as string
  const next = formData.get("newPassword") as string
  const confirm = formData.get("confirmPassword") as string

  if (!current || !next || !confirm) return { error: "All fields are required" }
  if (next.length < 6) return { error: "New password must be at least 6 characters" }
  if (next !== confirm) return { error: "New passwords do not match" }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return { error: "User not found" }

  const isValid = await bcrypt.compare(current, user.password)
  if (!isValid) return { error: "Current password is incorrect" }

  const hashed = await bcrypt.hash(next, 10)
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } })

  return { success: true }
}
