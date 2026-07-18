// In-memory rate limiter — works for single-instance deployments.
// For multi-instance / serverless at scale, replace with @upstash/ratelimit + Redis.

import { headers } from "next/headers"

export async function getIp(): Promise<string> {
  const h = await headers()
  return h.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown"
}

interface Entry {
  count: number
  resetAt: number
}

const store = new Map<string, Entry>()

const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

export function checkRateLimit(identifier: string): {
  allowed: boolean
  remaining: number
  resetInMs: number
} {
  const now = Date.now()
  const entry = store.get(identifier)

  if (!entry || now > entry.resetAt) {
    store.set(identifier, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, remaining: MAX_ATTEMPTS - 1, resetInMs: WINDOW_MS }
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0, resetInMs: entry.resetAt - now }
  }

  entry.count++
  return { allowed: true, remaining: MAX_ATTEMPTS - entry.count, resetInMs: entry.resetAt - now }
}

export function resetRateLimit(identifier: string) {
  store.delete(identifier)
}
