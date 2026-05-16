import { describe, it, expect } from "vitest"
import { formatCurrency, formatDate, getMonthRange } from "@/lib/utils"

describe("formatCurrency", () => {
  it("formats positive amounts as USD", () => {
    expect(formatCurrency(1234.56)).toBe("$1,234.56")
  })

  it("formats zero correctly", () => {
    expect(formatCurrency(0)).toBe("$0.00")
  })

  it("formats negative amounts", () => {
    expect(formatCurrency(-500)).toBe("-$500.00")
  })
})

describe("formatDate", () => {
  it("formats a date string", () => {
    const result = formatDate("2026-01-15")
    expect(result).toContain("Jan")
    expect(result).toContain("15")
    expect(result).toContain("2026")
  })

  it("formats a Date object", () => {
    const result = formatDate(new Date("2026-05-01"))
    expect(result).toContain("May")
    expect(result).toContain("2026")
  })
})

describe("getMonthRange", () => {
  it("returns start and end of the given month", () => {
    const { start, end } = getMonthRange("2026-03")
    expect(start.getMonth()).toBe(2) // March (0-indexed)
    expect(start.getDate()).toBe(1)
    expect(end.getMonth()).toBe(2)
    expect(end.getDate()).toBe(31)
  })

  it("defaults to current month when no param", () => {
    const now = new Date()
    const { start, end } = getMonthRange()
    expect(start.getMonth()).toBe(now.getMonth())
    expect(start.getDate()).toBe(1)
    expect(end.getMonth()).toBe(now.getMonth())
  })
})
