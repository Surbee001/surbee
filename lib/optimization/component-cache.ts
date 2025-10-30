import IORedis from 'ioredis'

let redis: IORedis | null = null
const memoryCache = new Map<string, { value: string; expiresAt: number }>()
const memRate = new Map<string, { count: number; resetAt: number }>()

try {
  if (process.env.REDIS_URL && process.env.DISABLE_REDIS !== 'true') {
    redis = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null })
  }
} catch {}

export async function cacheGeneratedComponents(
  promptHash: string,
  components: any,
  ttlSeconds = 3600,
) {
  try {
    if (redis) {
      await redis.setex(`components:${promptHash}`, ttlSeconds, JSON.stringify(components))
    } else {
      memoryCache.set(`components:${promptHash}`, { value: JSON.stringify(components), expiresAt: Date.now() + ttlSeconds * 1000 })
    }
  } catch {}
}

export async function getCachedComponents<T = any>(promptHash: string): Promise<T | null> {
  try {
    if (redis) {
      const cached = await redis.get(`components:${promptHash}`)
      return cached ? (JSON.parse(cached) as T) : null
    }
    const item = memoryCache.get(`components:${promptHash}`)
    if (!item) return null
    if (Date.now() > item.expiresAt) {
      memoryCache.delete(`components:${promptHash}`)
      return null
    }
    return JSON.parse(item.value) as T
  } catch {
    return null
  }
}

export const rateLimiter = {
  async checkLimit(userId: string, action: 'generate' | 'analyze') {
    const key = `ratelimit:${action}:${userId}`
    const limits: Record<string, number> = { generate: 10, analyze: 100 }
    if (redis) {
      const current = await redis.incr(key)
      if (current === 1) await redis.expire(key, 3600)
      return current <= (limits[action] || 60)
    }
    // memory fallback (1-hour window)
    const now = Math.floor(Date.now() / 1000)
    const windowKey = `${key}:${Math.floor(now / 3600)}`
    const entry = memRate.get(windowKey)
    if (!entry || entry.resetAt <= now) {
      memRate.set(windowKey, { count: 1, resetAt: (Math.floor(now / 3600) + 1) * 3600 })
      return true
    }
    entry.count += 1
    return entry.count <= (limits[action] || 60)
  },
}
