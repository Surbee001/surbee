import { NextRequest, NextResponse } from 'next/server'
import { upsertChunks } from '@/lib/rag'

export async function POST(req: NextRequest) {
  try {
    const { chunks } = await req.json()
    if (!Array.isArray(chunks) || chunks.length === 0) return NextResponse.json({ ok: false, message: 'No chunks' }, { status: 400 })
    const { count } = await upsertChunks(chunks)
    return NextResponse.json({ ok: true, count })
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || 'Failed to upsert chunks' }, { status: 500 })
  }
}

