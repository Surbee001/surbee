import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export interface AuthenticatedUser {
  id: string;
  email: string | undefined;
  role: string;
}

/**
 * Get the authenticated user from the Supabase session.
 * This verifies the user's session on the server side and should be used
 * instead of trusting client-provided userId.
 *
 * @returns The authenticated user or null if not authenticated
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();

    // Debug: Log cookie names (not values for security)
    const cookieNames = allCookies.map(c => c.name);
    console.log('[Auth] Available cookies:', cookieNames.join(', ') || 'none');

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return allCookies;
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {
              // Ignore - this is called from a Server Component
            }
          },
        },
      }
    );

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.log('[Auth] Supabase auth error:', error.message);
      return null;
    }

    if (!user) {
      console.log('[Auth] No user found in session');
      return null;
    }

    console.log('[Auth] User authenticated:', user.id);
    return {
      id: user.id,
      email: user.email,
      role: user.role || 'authenticated',
    };
  } catch (error) {
    console.error('[Auth] Error getting authenticated user:', error);
    return null;
  }
}

/**
 * Middleware helper to require authentication on API routes.
 * Returns a tuple of [user, errorResponse].
 * If user is null, return the errorResponse immediately.
 *
 * Usage:
 * const [user, errorResponse] = await requireAuth();
 * if (!user) return errorResponse;
 */
export async function requireAuth(): Promise<[AuthenticatedUser | null, NextResponse | null]> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return [
      null,
      NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      ),
    ];
  }

  return [user, null];
}

/**
 * Verify that the authenticated user owns a specific resource.
 * This is used for authorization checks after authentication.
 *
 * @param userId - The user ID from the session
 * @param resourceUserId - The user ID that owns the resource
 * @returns true if the user owns the resource
 */
export function verifyOwnership(userId: string, resourceUserId: string): boolean {
  return userId === resourceUserId;
}

/**
 * Create a 403 Forbidden response for authorization failures.
 */
export function forbiddenResponse(message: string = 'Access denied'): NextResponse {
  return NextResponse.json(
    { error: 'Forbidden', message },
    { status: 403 }
  );
}

/**
 * Create a standardized 401 Unauthorized response.
 */
export function unauthorizedResponse(message: string = 'Authentication required'): NextResponse {
  return NextResponse.json(
    { error: 'Unauthorized', message },
    { status: 401 }
  );
}

/**
 * Sanitize error messages before sending to client.
 * Prevents leaking sensitive information in error responses.
 */
export function sanitizeErrorMessage(error: unknown): string {
  // In production, don't leak internal error details
  if (process.env.NODE_ENV === 'production') {
    return 'An error occurred. Please try again later.';
  }

  // In development, provide more details for debugging
  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred';
}
