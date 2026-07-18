"use server"

import { prisma } from "@/lib/prisma"
import { createSession, deleteSession } from "@/lib/session"
import { checkRateLimit, resetRateLimit, getIp } from "@/lib/rateLimit"
import { LoginSchema, SignupSchema } from "@/lib/schemas"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

type AuthState = { error?: string } | undefined

export async function signup(state: AuthState, formData: FormData): Promise<AuthState> {
  const ip = await getIp()
  const { allowed, resetInMs } = checkRateLimit(`signup:${ip}`)
  if (!allowed) {
    const mins = Math.ceil(resetInMs / 60000)
    return { error: `Too many signup attempts. Try again in ${mins} minute${mins === 1 ? "" : "s"}.` }
  }

  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  }

  const result = SignupSchema.safeParse(raw)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }
  const { name, email, password } = result.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return { error: "Email already in use" }

  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  })

  await prisma.category.createMany({
    data: [
      { name: "Food", color: "#f97316", icon: "🍔", userId: user.id },
      { name: "Transport", color: "#3b82f6", icon: "🚗", userId: user.id },
      { name: "Entertainment", color: "#8b5cf6", icon: "🎮", userId: user.id },
      { name: "Health", color: "#22c55e", icon: "💊", userId: user.id },
      { name: "Shopping", color: "#ec4899", icon: "🛍️", userId: user.id },
      { name: "Salary", color: "#14b8a6", icon: "💼", userId: user.id },
    ],
  })

  await createSession(user.id)
  redirect("/dashboard")
}

export async function login(state: AuthState, formData: FormData): Promise<AuthState> {
  const ip = await getIp()
  const { allowed, resetInMs } = checkRateLimit(ip)

  if (!allowed) {
    const mins = Math.ceil(resetInMs / 60000)
    return { error: `Too many login attempts. Try again in ${mins} minute${mins === 1 ? "" : "s"}.` }
  }

  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  }

  const result = LoginSchema.safeParse(raw)
  if (!result.success) return { error: result.error.issues[0].message }
  const { email, password } = result.data

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return { error: "Invalid email or password" }

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) return { error: "Invalid email or password" }

  resetRateLimit(ip)
  await createSession(user.id)
  redirect("/dashboard")
}

export async function logout() {
  await deleteSession()
  redirect("/login")
}
