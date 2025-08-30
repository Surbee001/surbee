import { NextRequest, NextResponse } from 'next/server'
const rateLimit = async ({ key, limit, windowSec }: { key: string; limit: number; windowSec: number }) => ({ allowed: true, resetAt: Date.now() + windowSec * 1000 })

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'local'
  const res = await rateLimit({ key: `gen:${ip}`, limit: 30, windowSec: 60 })
  return NextResponse.json(res)
}

