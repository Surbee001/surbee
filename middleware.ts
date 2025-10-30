import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Simple pass-through middleware without authentication
  // Add any custom middleware logic here if needed

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets|public).*)'],
}

