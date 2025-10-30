import { NextRequest, NextResponse } from 'next/server'
import { packContext, searchProjectContext } from '@/lib/rag'

export async function POST(req: NextRequest) {
  try {
    const { projectId, query, topK = 8, capChars = 32000 } = await req.json()
    if (!projectId || !query) return NextResponse.json({ ok: false, message: 'Missing projectId or query' }, { status: 400 })
    const results = await searchProjectContext(projectId, query, topK)
    const context = packContext(results, capChars)
    return NextResponse.json({ ok: true, results, context })
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || 'Search failed' }, { status: 500 })
  }
}

