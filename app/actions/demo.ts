"use server"

import { prisma } from "@/lib/prisma"
import { createSession } from "@/lib/session"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

const CATEGORY_SEEDS = [
  { name: "Salary",        color: "#14b8a6", icon: "💼" },
  { name: "Food",          color: "#f97316", icon: "🍔" },
  { name: "Transport",     color: "#3b82f6", icon: "🚗" },
  { name: "Entertainment", color: "#8b5cf6", icon: "🎮" },
  { name: "Health",        color: "#22c55e", icon: "💊" },
  { name: "Shopping",      color: "#ec4899", icon: "🛍️" },
]

async function seedDemoData(userId: string) {
  // createMany then findMany — avoids createManyAndReturn which varies by adapter
  await prisma.category.createMany({
    data: CATEGORY_SEEDS.map((c) => ({ ...c, userId })),
  })

  const categories = await prisma.category.findMany({ where: { userId } })
  const byName = Object.fromEntries(categories.map((c) => [c.name, c.id]))

  const now = new Date()
  const txns = []

  for (let m = 2; m >= 0; m--) {
    const yr = now.getFullYear()
    const mo = now.getMonth() - m
    const d = (day: number) => new Date(yr, mo, day)

    txns.push(
      { amount: 4500,  description: "Monthly salary",       type: "INCOME"  as const, categoryId: byName["Salary"],        userId, date: d(1)  },
      { amount: 85.5,  description: "Grocery run",          type: "EXPENSE" as const, categoryId: byName["Food"],          userId, date: d(3)  },
      { amount: 12,    description: "Netflix",               type: "EXPENSE" as const, categoryId: byName["Entertainment"], userId, date: d(4)  },
      { amount: 45,    description: "Gas station",           type: "EXPENSE" as const, categoryId: byName["Transport"],     userId, date: d(6)  },
      { amount: 62.3,  description: "Restaurant dinner",     type: "EXPENSE" as const, categoryId: byName["Food"],          userId, date: d(8)  },
      { amount: 38,    description: "Gym membership",        type: "EXPENSE" as const, categoryId: byName["Health"],        userId, date: d(9)  },
      { amount: 120,   description: "New shoes",             type: "EXPENSE" as const, categoryId: byName["Shopping"],      userId, date: d(11) },
      { amount: 22,    description: "Bus passes",            type: "EXPENSE" as const, categoryId: byName["Transport"],     userId, date: d(13) },
      { amount: 47,    description: "Supermarket",           type: "EXPENSE" as const, categoryId: byName["Food"],          userId, date: d(15) },
      { amount: 29.99, description: "Spotify + Apple TV",    type: "EXPENSE" as const, categoryId: byName["Entertainment"], userId, date: d(16) },
      { amount: 500,   description: "Freelance project",     type: "INCOME"  as const, categoryId: null,                    userId, date: d(17) },
      { amount: 155,   description: "Clothes shopping",      type: "EXPENSE" as const, categoryId: byName["Shopping"],      userId, date: d(19) },
      { amount: 55,    description: "Pharmacy",              type: "EXPENSE" as const, categoryId: byName["Health"],        userId, date: d(21) },
      { amount: 78.4,  description: "Weekly groceries",      type: "EXPENSE" as const, categoryId: byName["Food"],          userId, date: d(22) },
      { amount: 35,    description: "Uber rides",            type: "EXPENSE" as const, categoryId: byName["Transport"],     userId, date: d(24) },
      { amount: 89,    description: "Concert tickets",       type: "EXPENSE" as const, categoryId: byName["Entertainment"], userId, date: d(26) },
      { amount: 66.2,  description: "Grocery store",         type: "EXPENSE" as const, categoryId: byName["Food"],          userId, date: d(28) },
    )
  }

  await prisma.transaction.createMany({ data: txns })
}

export async function loginAsDemo() {
  // Each click creates a fresh isolated demo — no shared state between visitors
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
