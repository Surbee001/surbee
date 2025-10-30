import IORedis from 'ioredis'

export const CacheKeys = {
  SURVEY: (id: string) => `survey:${id}`,
  USER_SURVEYS: (userId: string) => `user:${userId}:surveys`,
  SURVEY_COMPONENTS: (promptHash: string) => `components:${promptHash}`,
  FRAUD_MODEL: 'fraud:model:latest',
  ANALYTICS: (surveyId: string) => `analytics:${surveyId}`,
  COMMUNITY_FEED: (userId: string) => `community:feed:${userId}`,
} as const

const memStore = new Map<string, { value: string; expiresAt: number }>()

export class CacheManager {
  private redis: IORedis | null
  constructor() {
    if (process.env.REDIS_URL && process.env.DISABLE_REDIS !== 'true') {
      this.redis = new IORedis(process.env.REDIS_URL)
    } else {
      this.redis = null
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (this.redis) {
        const cached = await this.redis.get(key)
        return cached ? (JSON.parse(cached) as T) : null
      }
      const item = memStore.get(key)
      if (!item) return null
      if (Date.now() > item.expiresAt) {
        memStore.delete(key)
        return null
      }
      return JSON.parse(item.value) as T
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error)
      return null
    }
  }

  async set<T>(key: string, value: T, ttlSeconds = 3600): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.setex(key, ttlSeconds, JSON.stringify(value))
      } else {
        memStore.set(key, { value: JSON.stringify(value), expiresAt: Date.now() + ttlSeconds * 1000 })
      }
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error)
    }
  }

  async invalidate(pattern: string): Promise<void> {
    if (this.redis) {
      const keys = await this.redis.keys(pattern)
      if (keys.length > 0) await this.redis.del(...keys)
      return
    }
    // naive pattern invalidation for memory store
    const regex = new RegExp('^' + pattern.replace('*', '.*') + '$')
    for (const k of memStore.keys()) {
      if (regex.test(k)) memStore.delete(k)
    }
  }

  async cacheWithInvalidation<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds = 3600,
    invalidationKeys: string[] = [],
  ): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached) return cached
    const fresh = await fetchFn()
    await this.set(key, fresh, ttlSeconds)
    if (this.redis) {
      for (const inv of invalidationKeys) {
        await this.redis.sadd(`invalidation:${inv}`, key)
      }
    }
    return fresh
  }
}

export const cache = new CacheManager()

