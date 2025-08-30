import IORedis from 'ioredis'

const DISABLE_REDIS = process.env.DISABLE_REDIS === 'true'
const useRedis = !DISABLE_REDIS && !!process.env.REDIS_URL
const redis = useRedis ? new IORedis(process.env.REDIS_URL as string) : null

// Simple in-memory fallback when Redis is disabled
const memCounts = new Map<string, { count: number; resetAt: number }>()

export async function rateLimit({
  key,
  limit,
  windowSec,
}: {
  key: string
  limit: number
  windowSec: number
}): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Math.floor(Date.now() / 1000)
  const windowKey = `ratelimit:${key}:${Math.floor(now / windowSec)}`

  if (redis) {
    const count = await redis.incr(windowKey)
    if (count === 1) await redis.expire(windowKey, windowSec)
    const allowed = count <= limit
    const resetAt = (Math.floor(now / windowSec) + 1) * windowSec
    return { allowed, remaining: Math.max(0, limit - count), resetAt }
  }

  // Memory fallback
  const entry = memCounts.get(windowKey)
  if (!entry || entry.resetAt <= now) {
    memCounts.set(windowKey, { count: 1, resetAt: (Math.floor(now / windowSec) + 1) * windowSec })
  } else {
    entry.count += 1
  }
  const curr = memCounts.get(windowKey)!
  return {
    allowed: curr.count <= limit,
    remaining: Math.max(0, limit - curr.count),
    resetAt: curr.resetAt,
  }
}

