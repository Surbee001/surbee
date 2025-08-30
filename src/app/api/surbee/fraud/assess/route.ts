import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const input = await req.json()
  // Placeholder assessment until FastAPI client is implemented
  const score = 0.3
  const result = { probability: score, isSuspicious: score >= 0.5, reasons: ['placeholder'] }
  return NextResponse.json(result)
}

