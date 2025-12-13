import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getRateLimitStatus, cleanupRateLimits } from '@/lib/rate-limit';

/**
 * GET /api/surbee/rate-limit
 * Check rate limit status without consuming a request
 */
export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const key = `gen:${ip}`;

  const result = await getRateLimitStatus({ key, limit: 30, windowSec: 60 });

  // Periodically clean up old entries (1% chance per request)
  if (Math.random() < 0.01) {
    cleanupRateLimits().catch(console.error);
  }

  return NextResponse.json({
    allowed: result.allowed,
    remaining: result.remaining,
    limit: result.limit,
    resetAt: result.resetAt,
  });
}

/**
 * POST /api/surbee/rate-limit
 * Check rate limit and record a request
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const body = await req.json().catch(() => ({}));
  const { action = 'default' } = body;

  // Different limits for different actions
  const limits: Record<string, { limit: number; windowSec: number }> = {
    default: { limit: 30, windowSec: 60 },
    generate: { limit: 10, windowSec: 60 },
    ai_chat: { limit: 20, windowSec: 60 },
    auth: { limit: 5, windowSec: 300 }, // Stricter for auth
  };

  const { limit, windowSec } = limits[action] || limits.default;
  const key = `${action}:${ip}`;

  const result = await rateLimit({ key, limit, windowSec });

  if (!result.allowed) {
    return NextResponse.json(
      {
        error: 'rate_limited',
        message: 'Too many requests. Please try again later.',
        retryAt: result.resetAt,
        limit: result.limit,
      },
      { status: 429 }
    );
  }

  return NextResponse.json({
    allowed: result.allowed,
    remaining: result.remaining,
    limit: result.limit,
    resetAt: result.resetAt,
  });
}
