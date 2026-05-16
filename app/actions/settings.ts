"use server"

import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/dal"
import { UpdateProfileSchema, ChangePasswordSchema } from "@/lib/schemas"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

type SettingsState = { error?: string; success?: boolean } | undefined

export async function updateProfile(
  state: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const { userId } = await verifySession()

  const result = UpdateProfileSchema.safeParse({ name: formData.get("name") })
  if (!result.success) return { error: result.error.issues[0].message }

  await prisma.user.update({ where: { id: userId }, data: { name: result.data.name } })
  revalidatePath("/dashboard")
  return { success: true }
}

export async function changePassword(
  state: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const { userId } = await verifySession()

  const result = ChangePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  })
  if (!result.success) return { error: result.error.issues[0].message }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return { error: "User not found" }

  const isValid = await bcrypt.compare(result.data.currentPassword, user.password)
  if (!isValid) return { error: "Current password is incorrect" }

  const hashed = await bcrypt.hash(result.data.newPassword, 10)
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } })
  return { success: true }
}
