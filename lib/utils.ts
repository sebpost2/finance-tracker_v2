export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date))
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
