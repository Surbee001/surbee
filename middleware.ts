import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking attacks
  response.headers.set('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection in older browsers
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Restrict browser features
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');

  // Content Security Policy - adjust as needed for your app
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://cdn.tailwindcss.com https://unpkg.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://*.surbee.dev https://*.supabase.co wss://*.supabase.co https://api.openai.com https://api.anthropic.com https://api.deepseek.com https://vercel.live; frame-src 'self' https://form.surbee.dev; frame-ancestors 'none';"
  );

  // Strict Transport Security (HTTPS only)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Handle form.surbee.dev subdomain - serve published surveys
  if (hostname.startsWith('form.') || hostname === 'form.surbee.dev' || hostname === 'form.localhost:3000') {
    // Rewrite requests to the /s/[url] route
    // form.surbee.dev/abc123 -> /s/abc123
    if (pathname === '/' || pathname === '') {
      // Root of form subdomain - could show a landing or 404
      return NextResponse.rewrite(new URL('/s/index', request.url));
    }

    // Skip static assets and API routes
    if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
      return NextResponse.next();
    }

    // Rewrite to /s/[surveyId]
    const surveyId = pathname.replace(/^\//, '');
    if (surveyId) {
      const response = NextResponse.rewrite(new URL(`/s/${surveyId}`, request.url));
      // Allow iframe embedding for form subdomain
      response.headers.delete('X-Frame-Options');
      response.headers.set('Content-Security-Policy', "frame-ancestors *;");
      return response;
    }
  }

  // Create an unmodified response
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    },
  );

  // IMPORTANT: This refreshes the auth token and must be called
  // for server-side auth to work properly
  const { data: { user } } = await supabase.auth.getUser();

  // Handle root path - redirect based on Supabase auth status
  if (pathname === '/') {
    if (user) {
      // Logged in users go to home
      return NextResponse.redirect(new URL('/home', request.url));
    } else {
      // Not logged in users go to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redirect logged-in users away from login page
  if (pathname === '/login' && user) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // Add security headers to all responses
  addSecurityHeaders(supabaseResponse);

  return supabaseResponse
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
