import { NextRequest, NextResponse } from 'next/server'
import { updateUserCredits } from '@/lib/user/credits'

export async function GET(req: NextRequest) {
  const userId = (new URL(req.url)).searchParams.get('userId') || 'anon'
  // Placeholder: return static value or compute from DB in future
  const credits = 100
  return NextResponse.json({ userId, credits })
}

export async function POST(req: NextRequest) {
  const { userId, amount } = await req.json()
  // Negative amount means consumption
  await updateUserCredits(userId || 'anon', 'SPENT_GENERATION', -(Math.abs(amount || 0)))
  return NextResponse.json({ userId, credits: null })
}

