import { prisma } from "./prisma"

export type TrendPeriod = "1d" | "1w" | "1m" | "6m" | "1y" | "all"

export interface TrendPoint {
  label: string
  income: number
  expenses: number
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

function hourLabel(h: number) {
  if (h === 0) return "12am"
  if (h < 12) return `${h}am`
  if (h === 12) return "12pm"
  return `${h - 12}pm`
}

function dayLabel(d: Date) {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

export async function getTrendData(userId: string, period: TrendPeriod): Promise<TrendPoint[]> {
  const now = new Date()

  if (period === "1d") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const txns = await prisma.transaction.findMany({
      where: { userId, date: { gte: start } },
      select: { amount: true, type: true, date: true },
    })
    return Array.from({ length: 24 }, (_, h) => {
      const t = txns.filter((t) => new Date(t.date).getHours() === h)
      return {
        label: hourLabel(h),
        income: t.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0),
        expenses: t.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0),
      }
    })
  }

  if (period === "1w") {
    const start = new Date(now)
    start.setDate(start.getDate() - 6)
    start.setHours(0, 0, 0, 0)
    const txns = await prisma.transaction.findMany({
      where: { userId, date: { gte: start } },
      select: { amount: true, type: true, date: true },
    })
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now)
      d.setDate(d.getDate() - (6 - i))
      const label = dayLabel(d)
      const t = txns.filter((t) => {
        const dt = new Date(t.date)
        return dt.getDate() === d.getDate() && dt.getMonth() === d.getMonth()
      })
      return {
        label,
        income: t.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0),
        expenses: t.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0),
      }
    })
  }

  if (period === "1m") {
    const start = new Date(now)
    start.setDate(start.getDate() - 29)
    start.setHours(0, 0, 0, 0)
    const txns = await prisma.transaction.findMany({
      where: { userId, date: { gte: start } },
      select: { amount: true, type: true, date: true },
    })
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now)
      d.setDate(d.getDate() - (29 - i))
      const label = i === 0 || d.getDate() === 1 ? dayLabel(d) : `${d.getDate()}`
      const t = txns.filter((t) => {
        const dt = new Date(t.date)
        return dt.getDate() === d.getDate() && dt.getMonth() === d.getMonth()
      })
      return {
        label,
        income: t.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0),
        expenses: t.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0),
      }
    })
  }

  if (period === "6m") {
    const start = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    return buildMonthly(userId, start, 6)
  }

  if (period === "1y") {
    const start = new Date(now.getFullYear(), now.getMonth() - 11, 1)
    return buildMonthly(userId, start, 12)
  }

  // "all"
  const first = await prisma.transaction.findFirst({
    where: { userId },
    orderBy: { date: "asc" },
    select: { date: true },
  })
  if (!first) return []
  const firstDate = new Date(first.date)
  const firstMonth = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1)
  const months = (now.getFullYear() - firstMonth.getFullYear()) * 12 + (now.getMonth() - firstMonth.getMonth()) + 1
  return buildMonthly(userId, firstMonth, months)
}

async function buildMonthly(userId: string, start: Date, count: number): Promise<TrendPoint[]> {
  const end = new Date()
  const txns = await prisma.transaction.findMany({
    where: { userId, date: { gte: start, lte: end } },
    select: { amount: true, type: true, date: true },
  })

  const map = new Map<string, { label: string; income: number; expenses: number }>()
  for (let i = 0; i < count; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1)
    const key = monthKey(d)
    const label = count > 13 ? `${MONTHS[d.getMonth()]} '${String(d.getFullYear()).slice(2)}` : MONTHS[d.getMonth()]
    map.set(key, { label, income: 0, expenses: 0 })
  }

  for (const t of txns) {
    const key = monthKey(new Date(t.date))
    const entry = map.get(key)
    if (entry) {
      if (t.type === "INCOME") entry.income += t.amount
      else entry.expenses += t.amount
    }
  }

  return [...map.values()]
}
