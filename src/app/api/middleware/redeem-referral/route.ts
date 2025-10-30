import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// On auth callback, if URL contains ?ref=CODE and user is logged in, auto redeem via TRPC http
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get('ref')
  if (!code) return NextResponse.json({ ok: true })
  try {
    const { data } = await supabase.auth.getSession()
    const token = data?.session?.access_token
    if (!token) return NextResponse.json({ ok: true })
    await fetch(`${url.origin}/api/trpc/user.redeemReferral`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ json: { code } }),
    })
  } catch {}
  return NextResponse.json({ ok: true })
}


