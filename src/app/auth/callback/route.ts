import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const nextParam = requestUrl.searchParams.get('next') ?? '/home'

  // Security: Validate redirect URL to prevent open redirect attacks
  const allowedPaths = ['/home', '/projects', '/settings', '/survey', '/s/', '/project', '/marketplace']
  const isValidRedirect = allowedPaths.some(path => nextParam.startsWith(path)) && !nextParam.includes('//')
  const next = isValidRedirect ? nextParam : '/home'

  if (code) {
    // Create response first - cookies will be set on this response
    const redirectUrl = new URL(next, request.url)
    let response = NextResponse.redirect(redirectUrl)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Ensure cookies are set with proper options for cross-request persistence
              response.cookies.set(name, value, {
                ...options,
                // Ensure cookies work across the site
                path: '/',
                // Allow cookies to be sent with same-site requests
                sameSite: 'lax',
                // In production, ensure secure cookies
                secure: process.env.NODE_ENV === 'production',
              })
            })
          },
        },
      }
    )

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('[Auth Callback] Error exchanging code for session:', error)
        return NextResponse.redirect(new URL('/login?error=auth_failed', request.url))
      }

      console.log('[Auth Callback] Session created successfully for user:', data.user?.id)

      // Return the response with cookies set
      return response
    } catch (error) {
      console.error('[Auth Callback] Exception during code exchange:', error)
      return NextResponse.redirect(new URL('/login?error=auth_failed', request.url))
    }
  }

  // No code provided, redirect to home anyway
  return NextResponse.redirect(new URL('/home', request.url))
}
