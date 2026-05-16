export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  const today = new Date()

  if (d.toDateString() === today.toDateString()) return "Today"

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday"

  const diffDays = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays > 0 && diffDays < 7) return `${diffDays} days ago`

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d)
}

export function formatMonth(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(date)
}

export function getMonthRange(monthParam?: string): { start: Date; end: Date } {
  const now = new Date()
  let start: Date
  if (monthParam) {
    const [year, month] = monthParam.split("-").map(Number)
    start = new Date(year, month - 1, 1)
  } else {
    start = new Date(now.getFullYear(), now.getMonth(), 1)
  }
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59)
  return { start, end }
}
