import { NextRequest, NextResponse } from 'next/server';
import { checkCredits, deductCredits, CreditAction, getUserCredits } from './credits';
import { checkFeature, checkRateLimit, Feature, RateLimitedFeature } from './feature-gate';

interface WithCreditsOptions {
  action: CreditAction;
  feature?: Feature;
  rateLimitFeature?: RateLimitedFeature;
  /** Function to extract userId from request */
  getUserId: (request: NextRequest) => Promise<string | null>;
  /** Function to calculate dynamic cost (e.g., based on complexity) */
  getDynamicAction?: (request: NextRequest) => Promise<CreditAction>;
  /** Whether to deduct credits before or after the handler */
  deductTiming?: 'before' | 'after';
  /** Function to extract metadata for logging */
  getMetadata?: (request: NextRequest) => Promise<Record<string, unknown>>;
}

type RouteHandler = (
  request: NextRequest,
  context?: { params: Record<string, string> }
) => Promise<Response>;

/**
 * Higher-order function to wrap API routes with credit checking and deduction
 */
export function withCredits(
  handler: RouteHandler,
  options: WithCreditsOptions
): RouteHandler {
  return async (request: NextRequest, context?: { params: Record<string, string> }) => {
    const userId = await options.getUserId(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check feature access if specified
    if (options.feature) {
      const featureCheck = await checkFeature(userId, options.feature);
      if (!featureCheck.allowed) {
        return NextResponse.json(
          {
            error: 'Feature not available',
            message: featureCheck.reason,
            upgradeRequired: featureCheck.upgradeRequired,
          },
          { status: 403 }
        );
      }
    }

    // Check rate limits if specified
    if (options.rateLimitFeature) {
      const rateLimitCheck = await checkRateLimit(userId, options.rateLimitFeature);
      if (!rateLimitCheck.allowed) {
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            message: rateLimitCheck.reason,
            remaining: rateLimitCheck.remaining,
            limit: rateLimitCheck.limit,
          },
          { status: 429 }
        );
      }
    }

    // Determine the action (static or dynamic)
    const action = options.getDynamicAction
      ? await options.getDynamicAction(request)
      : options.action;

    // Check credits
    const creditCheck = await checkCredits(userId, action);
    if (!creditCheck.allowed) {
      const userCredits = await getUserCredits(userId);
      return NextResponse.json(
        {
          error: 'Insufficient credits',
          message: `This action requires ${creditCheck.required} credits, but you have ${creditCheck.remaining}`,
          required: creditCheck.required,
          remaining: creditCheck.remaining,
          plan: userCredits?.plan || 'free',
        },
        { status: 402 }
      );
    }

    // Deduct before if specified
    if (options.deductTiming !== 'after') {
      const metadata = options.getMetadata
        ? await options.getMetadata(request)
        : undefined;

      const deductResult = await deductCredits(userId, action, metadata);
      if (!deductResult.success) {
        return NextResponse.json(
          { error: 'Failed to process credits', message: deductResult.error },
          { status: 500 }
        );
      }

      // Add credit info to response headers
      const response = await handler(request, context);

      // Clone response to add headers
      const newHeaders = new Headers(response.headers);
      newHeaders.set('X-Credits-Remaining', String(deductResult.remaining));
      newHeaders.set('X-Credits-Used', String(creditCheck.required));

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    }

    // Execute handler first, then deduct on success
    const response = await handler(request, context);

    if (response.ok) {
      const metadata = options.getMetadata
        ? await options.getMetadata(request)
        : undefined;

      const deductResult = await deductCredits(userId, action, metadata);

      // Add credit info to response headers
      const newHeaders = new Headers(response.headers);
      newHeaders.set('X-Credits-Remaining', String(deductResult.remaining));
      newHeaders.set('X-Credits-Used', String(creditCheck.required));

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    }

    return response;
  };
}

/**
 * Utility to extract user ID from various auth methods
 */
export async function extractUserId(request: NextRequest): Promise<string | null> {
  // Check for userId in query params
  const url = new URL(request.url);
  const queryUserId = url.searchParams.get('userId');
  if (queryUserId) return queryUserId;

  // Check for userId in request body (for POST requests)
  if (request.method === 'POST') {
    try {
      const clonedRequest = request.clone();
      const body = await clonedRequest.json();
      if (body.userId) return body.userId;
    } catch {
      // Body parsing failed, continue to other methods
    }
  }

  // Check for authorization header (JWT token)
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    // Parse JWT and extract user ID
    // This is a simplified version - you may need to verify the token
    try {
      const token = authHeader.substring(7);
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || payload.user_id || null;
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Create a credit check middleware for streaming responses
 */
export async function checkCreditsForStream(
  userId: string,
  action: CreditAction,
  options?: {
    feature?: Feature;
    rateLimitFeature?: RateLimitedFeature;
  }
): Promise<{ allowed: boolean; error?: Response }> {
  // Check feature access
  if (options?.feature) {
    const featureCheck = await checkFeature(userId, options.feature);
    if (!featureCheck.allowed) {
      return {
        allowed: false,
        error: NextResponse.json(
          {
            error: 'Feature not available',
            message: featureCheck.reason,
            upgradeRequired: featureCheck.upgradeRequired,
          },
          { status: 403 }
        ),
      };
    }
  }

  // Check rate limits
  if (options?.rateLimitFeature) {
    const rateLimitCheck = await checkRateLimit(userId, options.rateLimitFeature);
    if (!rateLimitCheck.allowed) {
      return {
        allowed: false,
        error: NextResponse.json(
          {
            error: 'Rate limit exceeded',
            message: rateLimitCheck.reason,
            remaining: rateLimitCheck.remaining,
            limit: rateLimitCheck.limit,
          },
          { status: 429 }
        ),
      };
    }
  }

  // Check credits
  const creditCheck = await checkCredits(userId, action);
  if (!creditCheck.allowed) {
    const userCredits = await getUserCredits(userId);
    return {
      allowed: false,
      error: NextResponse.json(
        {
          error: 'Insufficient credits',
          message: `This action requires ${creditCheck.required} credits, but you have ${creditCheck.remaining}`,
          required: creditCheck.required,
          remaining: creditCheck.remaining,
          plan: userCredits?.plan || 'free',
        },
        { status: 402 }
      ),
    };
  }

  return { allowed: true };
}

/**
 * Deduct credits after a streaming response completes
 */
export async function deductCreditsAfterStream(
  userId: string,
  action: CreditAction,
  metadata?: Record<string, unknown>
): Promise<void> {
  await deductCredits(userId, action, metadata);
}
