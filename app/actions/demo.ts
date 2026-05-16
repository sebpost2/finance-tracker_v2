"use server"

import { prisma } from "@/lib/prisma"
import { createSession } from "@/lib/session"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

const CATEGORY_SEEDS = [
  { name: "Salary",        color: "#14b8a6", icon: "💼" },
  { name: "Rent",          color: "#64748b", icon: "🏠", budget: 1200 },
  { name: "Food",          color: "#f97316", icon: "🍔", budget: 450  },
  { name: "Transport",     color: "#3b82f6", icon: "🚗", budget: 180  },
  { name: "Entertainment", color: "#8b5cf6", icon: "🎮", budget: 150  },
  { name: "Health",        color: "#22c55e", icon: "💊", budget: 120  },
  { name: "Shopping",      color: "#ec4899", icon: "🛍️", budget: 300  },
  { name: "Utilities",     color: "#0ea5e9", icon: "⚡", budget: 160  },
]

type TxnType = "INCOME" | "EXPENSE"

interface TxnSeed {
  amount: number
  description: string
  type: TxnType
  categoryId: string | null
  userId: string
  date: Date
}

async function seedDemoData(userId: string) {
  await prisma.category.createMany({
    data: CATEGORY_SEEDS.map((c) => ({ ...c, userId })),
  })

  const categories = await prisma.category.findMany({ where: { userId } })
  const c = Object.fromEntries(categories.map((cat) => [cat.name, cat.id]))

  const now = new Date()
  const txns: TxnSeed[] = []

  // ── Month -2: tight month, medical expenses, no extras ────────────────────
  const [yr0, mo0] = [now.getFullYear(), now.getMonth() - 2]
  const d0 = (day: number) => new Date(yr0, mo0, day)

  txns.push(
    { amount: 4500,   description: "Monthly salary",         type: "INCOME",  categoryId: c["Salary"],        userId, date: d0(1)  },
    { amount: 1200,   description: "Rent — February",        type: "EXPENSE", categoryId: c["Rent"],          userId, date: d0(1)  },
    { amount: 94,     description: "Electric + internet",    type: "EXPENSE", categoryId: c["Utilities"],     userId, date: d0(3)  },
    { amount: 72.4,   description: "Weekly groceries",       type: "EXPENSE", categoryId: c["Food"],          userId, date: d0(4)  },
    { amount: 38,     description: "Gym membership",         type: "EXPENSE", categoryId: c["Health"],        userId, date: d0(5)  },
    { amount: 24,     description: "Bus monthly pass",       type: "EXPENSE", categoryId: c["Transport"],     userId, date: d0(6)  },
    { amount: 12,     description: "Netflix",                type: "EXPENSE", categoryId: c["Entertainment"], userId, date: d0(7)  },
    { amount: 185,    description: "Doctor + bloodwork",     type: "EXPENSE", categoryId: c["Health"],        userId, date: d0(10) },
    { amount: 55.8,   description: "Supermarket run",        type: "EXPENSE", categoryId: c["Food"],          userId, date: d0(12) },
    { amount: 67,     description: "Pharmacy",               type: "EXPENSE", categoryId: c["Health"],        userId, date: d0(13) },
    { amount: 42,     description: "Gas station",            type: "EXPENSE", categoryId: c["Transport"],     userId, date: d0(15) },
    { amount: 48.3,   description: "Grocery store",          type: "EXPENSE", categoryId: c["Food"],          userId, date: d0(18) },
    { amount: 29.99,  description: "Spotify + iCloud",       type: "EXPENSE", categoryId: c["Entertainment"], userId, date: d0(20) },
    { amount: 63.5,   description: "Supermarket",            type: "EXPENSE", categoryId: c["Food"],          userId, date: d0(24) },
    { amount: 18,     description: "Uber to hospital",       type: "EXPENSE", categoryId: c["Transport"],     userId, date: d0(25) },
    { amount: 55,     description: "Water + gas bill",       type: "EXPENSE", categoryId: c["Utilities"],     userId, date: d0(27) },
  )

  // ── Month -1: social month, vacation prep, higher entertainment ───────────
  const [yr1, mo1] = [now.getFullYear(), now.getMonth() - 1]
  const d1 = (day: number) => new Date(yr1, mo1, day)

  txns.push(
    { amount: 4500,   description: "Monthly salary",         type: "INCOME",  categoryId: c["Salary"],        userId, date: d1(1)  },
    { amount: 1200,   description: "Rent — March",           type: "EXPENSE", categoryId: c["Rent"],          userId, date: d1(1)  },
    { amount: 800,    description: "Freelance — web project", type: "INCOME", categoryId: null,               userId, date: d1(3)  },
    { amount: 88,     description: "Electric + internet",    type: "EXPENSE", categoryId: c["Utilities"],     userId, date: d1(4)  },
    { amount: 38,     description: "Gym membership",         type: "EXPENSE", categoryId: c["Health"],        userId, date: d1(5)  },
    { amount: 145,    description: "Concert tickets",        type: "EXPENSE", categoryId: c["Entertainment"], userId, date: d1(6)  },
    { amount: 68.5,   description: "Weekly groceries",       type: "EXPENSE", categoryId: c["Food"],          userId, date: d1(7)  },
    { amount: 24,     description: "Bus monthly pass",       type: "EXPENSE", categoryId: c["Transport"],     userId, date: d1(8)  },
    { amount: 89,     description: "New jacket",             type: "EXPENSE", categoryId: c["Shopping"],      userId, date: d1(10) },
    { amount: 47.2,   description: "Restaurant — birthday",  type: "EXPENSE", categoryId: c["Food"],          userId, date: d1(12) },
    { amount: 12,     description: "Netflix",                type: "EXPENSE", categoryId: c["Entertainment"], userId, date: d1(13) },
    { amount: 165,    description: "New sneakers",           type: "EXPENSE", categoryId: c["Shopping"],      userId, date: d1(14) },
    { amount: 55.9,   description: "Supermarket",            type: "EXPENSE", categoryId: c["Food"],          userId, date: d1(16) },
    { amount: 38,     description: "Uber rides",             type: "EXPENSE", categoryId: c["Transport"],     userId, date: d1(18) },
    { amount: 29.99,  description: "Spotify + iCloud",       type: "EXPENSE", categoryId: c["Entertainment"], userId, date: d1(20) },
    { amount: 210,    description: "Flight tickets",         type: "EXPENSE", categoryId: c["Transport"],     userId, date: d1(21) },
    { amount: 74,     description: "Grocery run",            type: "EXPENSE", categoryId: c["Food"],          userId, date: d1(23) },
    { amount: 48,     description: "Weekend brunch x2",      type: "EXPENSE", categoryId: c["Food"],          userId, date: d1(25) },
    { amount: 60,     description: "Water + gas bill",       type: "EXPENSE", categoryId: c["Utilities"],     userId, date: d1(27) },
    { amount: 95,     description: "Accessories",            type: "EXPENSE", categoryId: c["Shopping"],      userId, date: d1(28) },
  )

  // ── Month 0: current month, back to normal, some shopping ─────────────────
  const [yr2, mo2] = [now.getFullYear(), now.getMonth()]
  const today = now.getDate()
  const d2 = (day: number) => new Date(yr2, mo2, Math.min(day, today))

  txns.push(
    { amount: 4500,   description: "Monthly salary",         type: "INCOME",  categoryId: c["Salary"],        userId, date: d2(1)  },
    { amount: 1200,   description: "Rent — current month",   type: "EXPENSE", categoryId: c["Rent"],          userId, date: d2(1)  },
    { amount: 82,     description: "Electric + internet",    type: "EXPENSE", categoryId: c["Utilities"],     userId, date: d2(3)  },
    { amount: 38,     description: "Gym membership",         type: "EXPENSE", categoryId: c["Health"],        userId, date: d2(5)  },
    { amount: 24,     description: "Bus monthly pass",       type: "EXPENSE", categoryId: c["Transport"],     userId, date: d2(6)  },
    { amount: 77.3,   description: "Weekly groceries",       type: "EXPENSE", categoryId: c["Food"],          userId, date: d2(7)  },
    { amount: 12,     description: "Netflix",                type: "EXPENSE", categoryId: c["Entertainment"], userId, date: d2(8)  },
    ...(today > 10 ? [
      { amount: 44,     description: "Gas station",           type: "EXPENSE" as TxnType, categoryId: c["Transport"],     userId, date: d2(11) },
      { amount: 128,    description: "Headphones",            type: "EXPENSE" as TxnType, categoryId: c["Shopping"],      userId, date: d2(12) },
      { amount: 56.8,   description: "Supermarket",           type: "EXPENSE" as TxnType, categoryId: c["Food"],          userId, date: d2(13) },
    ] : []),
    ...(today > 15 ? [
      { amount: 29.99,  description: "Spotify + iCloud",      type: "EXPENSE" as TxnType, categoryId: c["Entertainment"], userId, date: d2(16) },
      { amount: 35,     description: "Dinner out",            type: "EXPENSE" as TxnType, categoryId: c["Food"],          userId, date: d2(17) },
      { amount: 250,    description: "Side project income",   type: "INCOME"  as TxnType, categoryId: null,               userId, date: d2(18) },
    ] : []),
    ...(today > 20 ? [
      { amount: 68.4,   description: "Grocery run",           type: "EXPENSE" as TxnType, categoryId: c["Food"],          userId, date: d2(21) },
      { amount: 85,     description: "New books + desk lamp", type: "EXPENSE" as TxnType, categoryId: c["Shopping"],      userId, date: d2(22) },
      { amount: 28,     description: "Uber rides",            type: "EXPENSE" as TxnType, categoryId: c["Transport"],     userId, date: d2(23) },
    ] : []),
    ...(today > 25 ? [
      { amount: 55,     description: "Water + gas bill",      type: "EXPENSE" as TxnType, categoryId: c["Utilities"],     userId, date: d2(26) },
      { amount: 51.2,   description: "Supermarket",           type: "EXPENSE" as TxnType, categoryId: c["Food"],          userId, date: d2(27) },
    ] : []),
  )

  await prisma.transaction.createMany({ data: txns })
}

export async function loginAsDemo() {
  const suffix = Math.random().toString(36).slice(2, 9)
  const email = `demo_${suffix}@financetracker.dev`

  const hashed = await bcrypt.hash("demo_pass", 10)
  const user = await prisma.user.create({
    data: { name: "Demo User", email, password: hashed },
  })

  await seedDemoData(user.id)
  await createSession(user.id)
  redirect("/dashboard")
}
