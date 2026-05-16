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
  it("includes the year in the output", () => {
    // Use local-time constructor to avoid UTC timezone shift
    const result = formatDate(new Date(2026, 0, 15)) // Jan 15 local time
    expect(result).toContain("2026")
  })

  it("includes the month name", () => {
    const result = formatDate(new Date(2026, 4, 1)) // May 1 local time
    expect(result).toContain("May")
  })
})

describe("getMonthRange", () => {
  it("returns the correct month for a given param", () => {
    const { start, end } = getMonthRange("2026-03")
    expect(start.getFullYear()).toBe(2026)
    expect(start.getMonth()).toBe(2) // March (0-indexed)
    expect(start.getDate()).toBe(1)
    expect(end.getMonth()).toBe(2)
  })

  it("start is always day 1", () => {
    const { start } = getMonthRange("2026-07")
    expect(start.getDate()).toBe(1)
  })

  it("defaults to current month when no param", () => {
    const now = new Date()
    const { start } = getMonthRange()
    expect(start.getMonth()).toBe(now.getMonth())
    expect(start.getFullYear()).toBe(now.getFullYear())
    expect(start.getDate()).toBe(1)
  })
})
