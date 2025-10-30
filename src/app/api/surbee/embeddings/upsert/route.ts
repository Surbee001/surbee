import { NextRequest, NextResponse } from 'next/server'
import { upsertDesignPatternEmbedding } from '@/../lib/ai/embeddings'

export async function POST(req: NextRequest) {
  const { id, text } = await req.json()
  await upsertDesignPatternEmbedding(id, text)
  return NextResponse.json({ success: true })
}

