"use server"

import { prisma } from "@/lib/prisma"
import { createSession, deleteSession } from "@/lib/session"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

type AuthState = { error?: string } | undefined

export async function signup(state: AuthState, formData: FormData): Promise<AuthState> {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!name || !email || !password) return { error: "All fields are required" }
  if (password.length < 6) return { error: "Password must be at least 6 characters" }

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
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) return { error: "All fields are required" }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return { error: "Invalid email or password" }

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) return { error: "Invalid email or password" }

  await createSession(user.id)
  redirect("/dashboard")
}

export async function logout() {
  await deleteSession()
  redirect("/login")
}
