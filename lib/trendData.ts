import { prisma } from "./prisma"

export type TrendPeriod = "1w" | "1m" | "6m" | "1y" | "all"

export interface TrendPoint {
  label: string
  income: number
  expenses: number
}

const MONTHS     = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
const SHORT_DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"]

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

export async function getTrendData(userId: string, period: TrendPeriod): Promise<TrendPoint[]> {
  const now = new Date()

  // ── 1 Week: last 7 days, label = "Mo 12" style ───────────────────────────
  if (period === "1w") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6)
    const txns = await prisma.transaction.findMany({
      where: { userId, date: { gte: start } },
      select: { amount: true, type: true, date: true },
    })
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - i))
      const t = txns.filter((t) => {
        const dt = new Date(t.date)
        return dt.getDate() === d.getDate() && dt.getMonth() === d.getMonth() && dt.getFullYear() === d.getFullYear()
      })
      return {
        label: `${SHORT_DAYS[d.getDay()]} ${d.getDate()}`,
        income:   t.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0),
        expenses: t.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0),
      }
    })
  }

  // ── 1 Month: last 4 weeks, label = "Wk 1" style ──────────────────────────
  if (period === "1m") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 27)
    start.setHours(0, 0, 0, 0)
    const txns = await prisma.transaction.findMany({
      where: { userId, date: { gte: start } },
      select: { amount: true, type: true, date: true },
    })
    return Array.from({ length: 4 }, (_, w) => {
      const wStart = new Date(start.getFullYear(), start.getMonth(), start.getDate() + w * 7)
      const wEnd   = new Date(wStart.getFullYear(), wStart.getMonth(), wStart.getDate() + 6, 23, 59, 59)
      const t = txns.filter((t) => {
        const dt = new Date(t.date)
        return dt >= wStart && dt <= wEnd
      })
      return {
        label: `Wk${w + 1}`,
        income:   t.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0),
        expenses: t.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0),
      }
    })
  }

  if (period === "6m") {
    return buildMonthly(userId, new Date(now.getFullYear(), now.getMonth() - 5, 1), 6)
  }
  if (period === "1y") {
    return buildMonthly(userId, new Date(now.getFullYear(), now.getMonth() - 11, 1), 12)
  }

  // All time
  const first = await prisma.transaction.findFirst({
    where: { userId },
    orderBy: { date: "asc" },
    select: { date: true },
  })
  if (!first) return []
  const firstMonth = new Date(new Date(first.date).getFullYear(), new Date(first.date).getMonth(), 1)
  const months = (now.getFullYear() - firstMonth.getFullYear()) * 12 + (now.getMonth() - firstMonth.getMonth()) + 1
  return buildMonthly(userId, firstMonth, months)
}

async function buildMonthly(userId: string, start: Date, count: number): Promise<TrendPoint[]> {
  const txns = await prisma.transaction.findMany({
    where: { userId, date: { gte: start, lte: new Date() } },
    select: { amount: true, type: true, date: true },
  })

  const map = new Map<string, TrendPoint>()
  for (let i = 0; i < count; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1)
    const key   = monthKey(d)
    const label = count > 13
      ? `${MONTHS[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`
      : MONTHS[d.getMonth()]
    map.set(key, { label, income: 0, expenses: 0 })
  }
  for (const t of txns) {
    const key   = monthKey(new Date(t.date))
    const entry = map.get(key)
    if (entry) {
      if (t.type === "INCOME") entry.income += t.amount
      else entry.expenses += t.amount
    }
  }
  return [...map.values()]
}
