import { NextRequest, NextResponse } from 'next/server'
import { searchDesignPatterns } from '@/../lib/ai/embeddings'

export async function POST(req: NextRequest) {
  const { query, topK } = await req.json()
  const results = await searchDesignPatterns(query, topK)
  return NextResponse.json({ success: true, results })
}

