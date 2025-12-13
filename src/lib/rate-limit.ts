import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
}

/**
 * Simple sliding window rate limiter using Supabase.
 * For production with high traffic, consider using Redis instead.
 *
 * @param key - Unique identifier for rate limiting (e.g., IP address, user ID)
 * @param limit - Maximum number of requests allowed in the window
 * @param windowSec - Time window in seconds
 */
export async function rateLimit({
  key,
  limit,
  windowSec,
}: {
  key: string;
  limit: number;
  windowSec: number;
}): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = now - windowSec * 1000;
  const resetAt = now + windowSec * 1000;

  try {
    // Count recent requests within the sliding window
    const { count, error: countError } = await supabase
      .from('rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('key', key)
      .gte('created_at', new Date(windowStart).toISOString());

    if (countError) {
      console.error('Rate limit count error:', countError);
      // On error, allow the request but log the issue
      return { allowed: true, remaining: limit, resetAt, limit };
    }

    const currentCount = count || 0;

    if (currentCount >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt,
        limit,
      };
    }

    // Record this request
    const { error: insertError } = await supabase.from('rate_limits').insert({
      key,
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error('Rate limit insert error:', insertError);
      // On error, allow the request but log the issue
      return { allowed: true, remaining: limit - currentCount - 1, resetAt, limit };
    }

    return {
      allowed: true,
      remaining: limit - currentCount - 1,
      resetAt,
      limit,
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    // On error, allow the request to prevent service disruption
    return { allowed: true, remaining: limit, resetAt, limit };
  }
}

/**
 * Clean up old rate limit entries to prevent table bloat.
 * Should be called periodically (e.g., via cron job or after rate limit checks).
 *
 * @param maxAgeSeconds - Delete entries older than this many seconds
 */
export async function cleanupRateLimits(maxAgeSeconds: number = 3600): Promise<void> {
  try {
    const cutoff = new Date(Date.now() - maxAgeSeconds * 1000).toISOString();
    await supabase.from('rate_limits').delete().lt('created_at', cutoff);
  } catch (error) {
    console.error('Rate limit cleanup error:', error);
  }
}

/**
 * Get rate limit status without recording a new request.
 * Useful for checking limits before expensive operations.
 */
export async function getRateLimitStatus({
  key,
  limit,
  windowSec,
}: {
  key: string;
  limit: number;
  windowSec: number;
}): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = now - windowSec * 1000;
  const resetAt = now + windowSec * 1000;

  try {
    const { count, error } = await supabase
      .from('rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('key', key)
      .gte('created_at', new Date(windowStart).toISOString());

    if (error) {
      console.error('Rate limit status error:', error);
      return { allowed: true, remaining: limit, resetAt, limit };
    }

    const currentCount = count || 0;

    return {
      allowed: currentCount < limit,
      remaining: Math.max(0, limit - currentCount),
      resetAt,
      limit,
    };
  } catch (error) {
    console.error('Rate limit status error:', error);
    return { allowed: true, remaining: limit, resetAt, limit };
  }
}
