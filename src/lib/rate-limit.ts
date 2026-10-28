/**
 * Fixed-window rate limiting.
 *
 * Uses Upstash Redis (REST) when UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
 * (or Vercel's KV_REST_API_URL / KV_REST_API_TOKEN) are set, so limits hold across
 * serverless instances. Without them it falls back to an in-memory counter,
 * which is fine for local development but only per-instance in production.
 */

import { NextResponse } from 'next/server'

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  /** Unix time (ms) when the current window resets */
  reset: number
}

interface RateLimitOptions {
  /** Unique key, e.g. `chat:${userId}` */
  key: string
  limit: number
  windowMs: number
}

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN

const memoryStore = new Map<string, { count: number; reset: number }>()
let warnedAboutMemoryStore = false

function memoryIncrement(key: string, windowMs: number, now: number) {
  const entry = memoryStore.get(key)
  if (!entry || entry.reset <= now) {
    const fresh = { count: 1, reset: now + windowMs }
    memoryStore.set(key, fresh)
    return fresh
  }
  entry.count += 1

  // Keep the map from growing without bound
  if (memoryStore.size > 10_000) {
    memoryStore.forEach((value, k) => {
      if (value.reset <= now) memoryStore.delete(k)
    })
  }
  return entry
}

async function redisIncrement(key: string, windowMs: number, now: number) {
  const response = await fetch(`${REDIS_URL}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([
      ['INCR', key],
      ['PEXPIRE', key, windowMs, 'NX'],
      ['PTTL', key],
    ]),
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Rate limit store returned ${response.status}`)
  }

  const [incr, , pttl] = (await response.json()) as Array<{ result?: number; error?: string }>
  if (typeof incr?.result !== 'number') {
    throw new Error(incr?.error || 'Unexpected rate limit store response')
  }

  const ttl = typeof pttl?.result === 'number' && pttl.result > 0 ? pttl.result : windowMs
  return { count: incr.result, reset: now + ttl }
}

export async function rateLimit({ key, limit, windowMs }: RateLimitOptions): Promise<RateLimitResult> {
  const now = Date.now()
  const namespacedKey = `ratelimit:${key}`

  let entry: { count: number; reset: number }
  if (REDIS_URL && REDIS_TOKEN) {
    try {
      entry = await redisIncrement(namespacedKey, windowMs, now)
    } catch (error) {
      // Fail open: an outage of the limiter shouldn't take the app down
      console.error('Rate limit store error, falling back to memory:', error)
      entry = memoryIncrement(namespacedKey, windowMs, now)
    }
  } else {
    if (process.env.NODE_ENV === 'production' && !warnedAboutMemoryStore) {
      warnedAboutMemoryStore = true
      console.warn('Rate limiting is using in-memory storage; set UPSTASH_REDIS_REST_URL/TOKEN for shared limits.')
    }
    entry = memoryIncrement(namespacedKey, windowMs, now)
  }

  return {
    success: entry.count <= limit,
    limit,
    remaining: Math.max(0, limit - entry.count),
    reset: entry.reset,
  }
}

/** Best-effort client IP for unauthenticated limits */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return headers.get('x-real-ip') || 'unknown'
}

export function rateLimitResponse(
  result: RateLimitResult,
  message = 'Too many requests. Please wait a moment and try again.'
) {
  const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000))
  return NextResponse.json(
    { error: message, retryAfter },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(Math.ceil(result.reset / 1000)),
      },
    }
  )
}

/** Shared limits so they're tuned in one place */
export const LIMITS = {
  signup: { limit: 5, windowMs: 60 * 60 * 1000 },
  login: { limit: 10, windowMs: 15 * 60 * 1000 },
  chatBurst: { limit: 20, windowMs: 60 * 1000 },
  chatDaily: { limit: 400, windowMs: 24 * 60 * 60 * 1000 },
  aiInsight: { limit: 20, windowMs: 60 * 60 * 1000 },
  exerciseSearch: { limit: 60, windowMs: 60 * 1000 },
  export: { limit: 10, windowMs: 60 * 60 * 1000 },
  billing: { limit: 10, windowMs: 60 * 1000 },
} as const
