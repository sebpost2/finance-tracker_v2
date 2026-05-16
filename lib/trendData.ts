import { prisma } from "./prisma"

export type TrendPeriod = "1w" | "1m" | "6m" | "1y" | "all"

export interface TrendPoint {
  label: string
  income: number
  expenses: number
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
const SHORT_DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

export async function getTrendData(userId: string, period: TrendPeriod): Promise<TrendPoint[]> {
  const now = new Date()

  // ── 1 Week: last 7 days grouped by day ───────────────────────────────────
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

  // ── 1 Month: last 4-5 weeks grouped by week ───────────────────────────────
  if (period === "1m") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 27)
    start.setHours(0, 0, 0, 0)
    const txns = await prisma.transaction.findMany({
      where: { userId, date: { gte: start } },
      select: { amount: true, type: true, date: true },
    })

    // Build 4 week buckets
    const weeks: TrendPoint[] = Array.from({ length: 4 }, (_, w) => {
      const weekStart = new Date(start.getFullYear(), start.getMonth(), start.getDate() + w * 7)
      const weekEnd   = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6, 23, 59, 59)
      const t = txns.filter((t) => {
        const dt = new Date(t.date)
        return dt >= weekStart && dt <= weekEnd
      })
      const mo = MONTHS[weekStart.getMonth()]
      return {
        label: `${mo} ${weekStart.getDate()}`,
        income:   t.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0),
        expenses: t.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0),
      }
    })
    return weeks
  }

  // ── 6 Months: 6 monthly buckets ───────────────────────────────────────────
  if (period === "6m") {
    const start = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    return buildMonthly(userId, start, 6)
  }

  // ── 1 Year: 12 monthly buckets ────────────────────────────────────────────
  if (period === "1y") {
    const start = new Date(now.getFullYear(), now.getMonth() - 11, 1)
    return buildMonthly(userId, start, 12)
  }

  // ── All time: monthly from first transaction ──────────────────────────────
  const first = await prisma.transaction.findFirst({
    where: { userId },
    orderBy: { date: "asc" },
    select: { date: true },
  })
  if (!first) return []
  const firstDate = new Date(first.date)
  const firstMonth = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1)
  const months =
    (now.getFullYear() - firstMonth.getFullYear()) * 12 +
    (now.getMonth() - firstMonth.getMonth()) + 1
  return buildMonthly(userId, firstMonth, months)
}

async function buildMonthly(userId: string, start: Date, count: number): Promise<TrendPoint[]> {
  const end = new Date()
  const txns = await prisma.transaction.findMany({
    where: { userId, date: { gte: start, lte: end } },
    select: { amount: true, type: true, date: true },
  })

  const map = new Map<string, TrendPoint>()
  for (let i = 0; i < count; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1)
    const key = monthKey(d)
    const label =
      count > 13
        ? `${MONTHS[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`
        : MONTHS[d.getMonth()]
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
