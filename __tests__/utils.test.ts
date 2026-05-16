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

describe("formatDate — relative dates", () => {
  it("returns 'Today' for today", () => {
    expect(formatDate(new Date())).toBe("Today")
  })

  it("returns 'Yesterday' for yesterday", () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    expect(formatDate(yesterday)).toBe("Yesterday")
  })

  it("returns 'X days ago' for recent dates", () => {
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
    expect(formatDate(threeDaysAgo)).toBe("3 days ago")
  })

  it("returns full date for dates older than 7 days", () => {
    const result = formatDate(new Date(2020, 0, 1))
    expect(result).toContain("2020")
    expect(result).toContain("Jan")
  })
})

describe("getMonthRange", () => {
  it("returns the correct month for a given param", () => {
    const { start, end } = getMonthRange("2026-03")
    expect(start.getFullYear()).toBe(2026)
    expect(start.getMonth()).toBe(2)
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
