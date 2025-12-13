import { NextRequest } from 'next/server';

/**
 * Allowed origins for CORS.
 * Add your production domains here.
 */
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'https://surbee.vercel.app',
  'https://surbee.co',
  'https://www.surbee.co',
  // Add more production domains as needed
];

// Allow additional origins from environment variable
if (process.env.ALLOWED_ORIGINS) {
  ALLOWED_ORIGINS.push(...process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()));
}

/**
 * Get the appropriate CORS origin header value based on the request origin.
 * Returns the origin if it's in the allowlist, otherwise returns the first allowed origin.
 *
 * @param request - The incoming request
 * @returns The origin to use in Access-Control-Allow-Origin header
 */
export function getCorsOrigin(request: NextRequest): string {
  const origin = request.headers.get('origin');

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return origin;
  }

  // Return the first allowed origin as default (safer than '*')
  return ALLOWED_ORIGINS[0];
}

/**
 * Get standard CORS headers for API responses.
 *
 * @param request - The incoming request
 * @returns Headers object with CORS configuration
 */
export function getCorsHeaders(request: NextRequest): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': getCorsOrigin(request),
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400', // 24 hours
    'Access-Control-Allow-Credentials': 'true',
  };
}

/**
 * Handle OPTIONS preflight requests.
 *
 * @param request - The incoming request
 * @returns Response with appropriate CORS headers
 */
export function handleCorsPreflightRequest(request: NextRequest): Response {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}

/**
 * Check if the origin is allowed.
 *
 * @param request - The incoming request
 * @returns True if origin is allowed
 */
export function isOriginAllowed(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true; // Same-origin requests don't have origin header
  return ALLOWED_ORIGINS.includes(origin);
}
