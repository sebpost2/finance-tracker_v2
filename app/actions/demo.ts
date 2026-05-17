"use server"

import { prisma } from "@/lib/prisma"
import { createSession } from "@/lib/session"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

const CATEGORY_SEEDS = [
  { name: "Salary",        color: "#14b8a6", icon: "💼" },
  { name: "Freelance",     color: "#6366f1", icon: "💻" },
  { name: "Investments",   color: "#f59e0b", icon: "📈" },
  { name: "Rent",          color: "#64748b", icon: "🏠", budget: 1200 },
  { name: "Food",          color: "#f97316", icon: "🍔", budget: 450  },
  { name: "Transport",     color: "#3b82f6", icon: "🚗", budget: 180  },
  { name: "Entertainment", color: "#8b5cf6", icon: "🎮", budget: 150  },
  { name: "Health",        color: "#22c55e", icon: "💊", budget: 120  },
  { name: "Shopping",      color: "#ec4899", icon: "🛍️", budget: 300  },
  { name: "Utilities",     color: "#eab308", icon: "⚡", budget: 160  },
]

type T = "INCOME" | "EXPENSE"

interface Txn {
  amount: number
  description: string
  type: T
  categoryId: string | null
  userId: string
  date: Date
}

async function seedDemoData(userId: string) {
  await prisma.category.createMany({
    data: CATEGORY_SEEDS.map((c) => ({ ...c, userId })),
  })
  const cats = await prisma.category.findMany({ where: { userId } })
  const c = Object.fromEntries(cats.map((cat) => [cat.name, cat.id]))

  const now = new Date()
  const txns: Txn[] = []
  const d = (monthOffset: number, day: number) =>
    new Date(now.getFullYear(), now.getMonth() + monthOffset, Math.min(day, 28))

  // ── Month -5: quiet month, just salary, minimal expenses ─────────────────
  txns.push(
    { amount: 4500,  description: "Monthly salary",        type: "INCOME",  categoryId: c["Salary"],        userId, date: d(-5, 1)  },
    { amount: 1200,  description: "Rent",                  type: "EXPENSE", categoryId: c["Rent"],          userId, date: d(-5, 1)  },
    { amount: 78,    description: "Electric + internet",   type: "EXPENSE", categoryId: c["Utilities"],     userId, date: d(-5, 3)  },
    { amount: 38,    description: "Gym membership",        type: "EXPENSE", categoryId: c["Health"],        userId, date: d(-5, 5)  },
    { amount: 24,    description: "Bus monthly pass",      type: "EXPENSE", categoryId: c["Transport"],     userId, date: d(-5, 6)  },
    { amount: 92,    description: "Supermarket",           type: "EXPENSE", categoryId: c["Food"],          userId, date: d(-5, 7)  },
    { amount: 12,    description: "Netflix",               type: "EXPENSE", categoryId: c["Entertainment"], userId, date: d(-5, 8)  },
    { amount: 55,    description: "Grocery run",           type: "EXPENSE", categoryId: c["Food"],          userId, date: d(-5, 14) },
    { amount: 29.99, description: "Spotify + iCloud",      type: "EXPENSE", categoryId: c["Entertainment"], userId, date: d(-5, 16) },
    { amount: 41,    description: "Gas station",           type: "EXPENSE", categoryId: c["Transport"],     userId, date: d(-5, 18) },
    { amount: 67.5,  description: "Weekly groceries",      type: "EXPENSE", categoryId: c["Food"],          userId, date: d(-5, 22) },
    { amount: 52,    description: "Water + gas bill",      type: "EXPENSE", categoryId: c["Utilities"],     userId, date: d(-5, 25) },
  )

  // ── Month -4: normal month + small investment dividend ────────────────────
  txns.push(
    { amount: 4500,  description: "Monthly salary",        type: "INCOME",  categoryId: c["Salary"],        userId, date: d(-4, 1)  },
    { amount: 320,   description: "Dividend payment",      type: "INCOME",  categoryId: c["Investments"],   userId, date: d(-4, 5)  },
    { amount: 1200,  description: "Rent",                  type: "EXPENSE", categoryId: c["Rent"],          userId, date: d(-4, 1)  },
    { amount: 82,    description: "Electric + internet",   type: "EXPENSE", categoryId: c["Utilities"],     userId, date: d(-4, 3)  },
    { amount: 38,    description: "Gym membership",        type: "EXPENSE", categoryId: c["Health"],        userId, date: d(-4, 5)  },
    { amount: 24,    description: "Bus monthly pass",      type: "EXPENSE", categoryId: c["Transport"],     userId, date: d(-4, 6)  },
    { amount: 84,    description: "Weekly groceries",      type: "EXPENSE", categoryId: c["Food"],          userId, date: d(-4, 8)  },
    { amount: 12,    description: "Netflix",               type: "EXPENSE", categoryId: c["Entertainment"], userId, date: d(-4, 9)  },
    { amount: 75,    description: "New sneakers",          type: "EXPENSE", categoryId: c["Shopping"],      userId, date: d(-4, 12) },
    { amount: 29.99, description: "Spotify + iCloud",      type: "EXPENSE", categoryId: c["Entertainment"], userId, date: d(-4, 16) },
    { amount: 61.4,  description: "Supermarket",           type: "EXPENSE", categoryId: c["Food"],          userId, date: d(-4, 19) },
    { amount: 35,    description: "Uber rides",            type: "EXPENSE", categoryId: c["Transport"],     userId, date: d(-4, 21) },
    { amount: 55,    description: "Water + gas bill",      type: "EXPENSE", categoryId: c["Utilities"],     userId, date: d(-4, 25) },
    { amount: 72.3,  description: "Grocery store",         type: "EXPENSE", categoryId: c["Food"],          userId, date: d(-4, 27) },
  )

  // ── Month -3: freelance project month, higher income ─────────────────────
  txns.push(
    { amount: 4500,  description: "Monthly salary",        type: "INCOME",  categoryId: c["Salary"],        userId, date: d(-3, 1)  },
    { amount: 1400,  description: "Freelance — app design", type: "INCOME", categoryId: c["Freelance"],     userId, date: d(-3, 10) },
    { amount: 1200,  description: "Rent",                  type: "EXPENSE", categoryId: c["Rent"],          userId, date: d(-3, 1)  },
    { amount: 85,    description: "Electric + internet",   type: "EXPENSE", categoryId: c["Utilities"],     userId, date: d(-3, 3)  },
    { amount: 38,    description: "Gym membership",        type: "EXPENSE", categoryId: c["Health"],        userId, date: d(-3, 5)  },
    { amount: 24,    description: "Bus monthly pass",      type: "EXPENSE", categoryId: c["Transport"],     userId, date: d(-3, 6)  },
    { amount: 76.8,  description: "Supermarket",           type: "EXPENSE", categoryId: c["Food"],          userId, date: d(-3, 7)  },
    { amount: 12,    description: "Netflix",               type: "EXPENSE", categoryId: c["Entertainment"], userId, date: d(-3, 8)  },
    { amount: 210,   description: "Laptop stand + keyboard", type: "EXPENSE", categoryId: c["Shopping"],    userId, date: d(-3, 11) },
    { amount: 45,    description: "Restaurant celebration", type: "EXPENSE", categoryId: c["Food"],         userId, date: d(-3, 13) },
    { amount: 29.99, description: "Spotify + iCloud",      type: "EXPENSE", categoryId: c["Entertainment"], userId, date: d(-3, 16) },
    { amount: 55,    description: "Doctor checkup",        type: "EXPENSE", categoryId: c["Health"],        userId, date: d(-3, 18) },
    { amount: 62.1,  description: "Weekly groceries",      type: "EXPENSE", categoryId: c["Food"],          userId, date: d(-3, 21) },
    { amount: 42,    description: "Gas station",           type: "EXPENSE", categoryId: c["Transport"],     userId, date: d(-3, 23) },
    { amount: 55,    description: "Water + gas bill",      type: "EXPENSE", categoryId: c["Utilities"],     userId, date: d(-3, 26) },
  )

  // ── Month -2: tight month, medical expenses ───────────────────────────────
  txns.push(
    { amount: 4500,  description: "Monthly salary",        type: "INCOME",  categoryId: c["Salary"],        userId, date: d(-2, 1)  },
    { amount: 1200,  description: "Rent",                  type: "EXPENSE", categoryId: c["Rent"],          userId, date: d(-2, 1)  },
    { amount: 94,    description: "Electric + internet",   type: "EXPENSE", categoryId: c["Utilities"],     userId, date: d(-2, 3)  },
    { amount: 38,    description: "Gym membership",        type: "EXPENSE", categoryId: c["Health"],        userId, date: d(-2, 5)  },
    { amount: 24,    description: "Bus monthly pass",      type: "EXPENSE", categoryId: c["Transport"],     userId, date: d(-2, 6)  },
    { amount: 72.4,  description: "Weekly groceries",      type: "EXPENSE", categoryId: c["Food"],          userId, date: d(-2, 7)  },
    { amount: 12,    description: "Netflix",               type: "EXPENSE", categoryId: c["Entertainment"], userId, date: d(-2, 8)  },
    { amount: 185,   description: "Doctor + bloodwork",    type: "EXPENSE", categoryId: c["Health"],        userId, date: d(-2, 10) },
    { amount: 55.8,  description: "Supermarket run",       type: "EXPENSE", categoryId: c["Food"],          userId, date: d(-2, 12) },
    { amount: 67,    description: "Pharmacy",              type: "EXPENSE", categoryId: c["Health"],        userId, date: d(-2, 13) },
    { amount: 42,    description: "Gas station",           type: "EXPENSE", categoryId: c["Transport"],     userId, date: d(-2, 15) },
    { amount: 29.99, description: "Spotify + iCloud",      type: "EXPENSE", categoryId: c["Entertainment"], userId, date: d(-2, 16) },
    { amount: 48.3,  description: "Grocery store",         type: "EXPENSE", categoryId: c["Food"],          userId, date: d(-2, 18) },
    { amount: 55,    description: "Water + gas bill",      type: "EXPENSE", categoryId: c["Utilities"],     userId, date: d(-2, 25) },
    { amount: 63.5,  description: "Supermarket",           type: "EXPENSE", categoryId: c["Food"],          userId, date: d(-2, 27) },
  )

  // ── Month -1: social month — freelance + concert + travel ────────────────
  txns.push(
    { amount: 4500,  description: "Monthly salary",        type: "INCOME",  categoryId: c["Salary"],        userId, date: d(-1, 1)  },
    { amount: 800,   description: "Freelance — web project", type: "INCOME", categoryId: c["Freelance"],    userId, date: d(-1, 3)  },
    { amount: 1200,  description: "Rent",                  type: "EXPENSE", categoryId: c["Rent"],          userId, date: d(-1, 1)  },
    { amount: 88,    description: "Electric + internet",   type: "EXPENSE", categoryId: c["Utilities"],     userId, date: d(-1, 3)  },
    { amount: 38,    description: "Gym membership",        type: "EXPENSE", categoryId: c["Health"],        userId, date: d(-1, 5)  },
    { amount: 24,    description: "Bus monthly pass",      type: "EXPENSE", categoryId: c["Transport"],     userId, date: d(-1, 6)  },
    { amount: 68.5,  description: "Weekly groceries",      type: "EXPENSE", categoryId: c["Food"],          userId, date: d(-1, 7)  },
    { amount: 145,   description: "Concert tickets x2",   type: "EXPENSE", categoryId: c["Entertainment"], userId, date: d(-1, 9)  },
    { amount: 12,    description: "Netflix",               type: "EXPENSE", categoryId: c["Entertainment"], userId, date: d(-1, 10) },
    { amount: 89,    description: "New jacket",            type: "EXPENSE", categoryId: c["Shopping"],      userId, date: d(-1, 12) },
    { amount: 47.2,  description: "Restaurant — birthday", type: "EXPENSE", categoryId: c["Food"],          userId, date: d(-1, 14) },
    { amount: 29.99, description: "Spotify + iCloud",      type: "EXPENSE", categoryId: c["Entertainment"], userId, date: d(-1, 16) },
    { amount: 165,   description: "New shoes",             type: "EXPENSE", categoryId: c["Shopping"],      userId, date: d(-1, 17) },
    { amount: 210,   description: "Flight tickets",        type: "EXPENSE", categoryId: c["Transport"],     userId, date: d(-1, 18) },
    { amount: 55.9,  description: "Supermarket",           type: "EXPENSE", categoryId: c["Food"],          userId, date: d(-1, 19) },
    { amount: 74,    description: "Grocery run",           type: "EXPENSE", categoryId: c["Food"],          userId, date: d(-1, 22) },
    { amount: 60,    description: "Water + gas bill",      type: "EXPENSE", categoryId: c["Utilities"],     userId, date: d(-1, 25) },
    { amount: 95,    description: "Travel accessories",    type: "EXPENSE", categoryId: c["Shopping"],      userId, date: d(-1, 27) },
  )

  // ── Month 0 (current): progressive — only adds txns up to today ───────────
  const today = now.getDate()
  const d0 = (day: number) =>
    new Date(now.getFullYear(), now.getMonth(), Math.min(day, today))

  txns.push(
    { amount: 4500,  description: "Monthly salary",        type: "INCOME",  categoryId: c["Salary"],        userId, date: d0(1)  },
    { amount: 1200,  description: "Rent",                  type: "EXPENSE", categoryId: c["Rent"],          userId, date: d0(1)  },
    { amount: 82,    description: "Electric + internet",   type: "EXPENSE", categoryId: c["Utilities"],     userId, date: d0(3)  },
    { amount: 38,    description: "Gym membership",        type: "EXPENSE", categoryId: c["Health"],        userId, date: d0(5)  },
    { amount: 24,    description: "Bus monthly pass",      type: "EXPENSE", categoryId: c["Transport"],     userId, date: d0(6)  },
    { amount: 77.3,  description: "Weekly groceries",      type: "EXPENSE", categoryId: c["Food"],          userId, date: d0(7)  },
    { amount: 12,    description: "Netflix",               type: "EXPENSE", categoryId: c["Entertainment"], userId, date: d0(8)  },
  )

  if (today > 10) txns.push(
    { amount: 44,    description: "Gas station",           type: "EXPENSE", categoryId: c["Transport"],     userId, date: d0(11) },
    { amount: 128,   description: "Headphones",            type: "EXPENSE", categoryId: c["Shopping"],      userId, date: d0(12) },
    { amount: 56.8,  description: "Supermarket",           type: "EXPENSE", categoryId: c["Food"],          userId, date: d0(13) },
  )

  if (today > 15) txns.push(
    { amount: 250,   description: "Freelance — logo design", type: "INCOME", categoryId: c["Freelance"],    userId, date: d0(16) },
    { amount: 180,   description: "Dividend payment",       type: "INCOME", categoryId: c["Investments"],   userId, date: d0(17) },
    { amount: 29.99, description: "Spotify + iCloud",       type: "EXPENSE", categoryId: c["Entertainment"], userId, date: d0(16) },
    { amount: 35,    description: "Dinner out",             type: "EXPENSE", categoryId: c["Food"],          userId, date: d0(17) },
  )

  if (today > 20) txns.push(
    { amount: 68.4,  description: "Grocery run",           type: "EXPENSE", categoryId: c["Food"],          userId, date: d0(21) },
    { amount: 85,    description: "New books + desk lamp", type: "EXPENSE", categoryId: c["Shopping"],      userId, date: d0(22) },
    { amount: 28,    description: "Uber rides",            type: "EXPENSE", categoryId: c["Transport"],     userId, date: d0(23) },
  )

  if (today > 25) txns.push(
    { amount: 55,    description: "Water + gas bill",      type: "EXPENSE", categoryId: c["Utilities"],     userId, date: d0(26) },
    { amount: 51.2,  description: "Supermarket",           type: "EXPENSE", categoryId: c["Food"],          userId, date: d0(27) },
  )

  await prisma.transaction.createMany({ data: txns })
}

export async function loginAsDemo() {
  const suffix = Math.random().toString(36).slice(2, 9)
  const email  = `demo_${suffix}@financetracker.dev`

  const hashed = await bcrypt.hash("demo_pass", 10)
  const user   = await prisma.user.create({
    data: { name: "Demo User", email, password: hashed },
  })

  await seedDemoData(user.id)
  await createSession(user.id)
  redirect("/dashboard")
}
