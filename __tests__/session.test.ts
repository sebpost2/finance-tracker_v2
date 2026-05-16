// @vitest-environment node

import { describe, it, expect, beforeAll } from "vitest"

beforeAll(() => {
  process.env.SESSION_SECRET = "test-secret-that-is-at-least-32-characters-long!!"
})

describe("session encryption", () => {
  it("encrypts and decrypts a payload round-trip", async () => {
    const { encrypt, decrypt } = await import("@/lib/session")
    const userId = "user_test_123"
    const expiresAt = new Date(Date.now() + 60_000)

    const token = await encrypt({ userId, expiresAt })
    expect(typeof token).toBe("string")
    expect(token.split(".").length).toBe(3) // JWT has 3 parts

    const payload = await decrypt(token)
    expect(payload?.userId).toBe(userId)
  })

  it("returns null for an invalid token", async () => {
    const { decrypt } = await import("@/lib/session")
    const result = await decrypt("invalid.token.here")
    expect(result).toBeNull()
  })

  it("returns null for an empty string", async () => {
    const { decrypt } = await import("@/lib/session")
    const result = await decrypt("")
    expect(result).toBeNull()
  })
})
