import OpenAI from 'openai'
import { generateSurveyComponents } from '@/lib/ai/survey-generator'
import { NextRequest, NextResponse } from 'next/server'

type GenerateRequest = {
  prompt: string
  imageDataUrl?: string
  imageDataUrls?: string[]
  context?: Record<string, any>
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateRequest
    const { prompt, imageDataUrl, imageDataUrls, context } = body
    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 })
    }

    // Delegate to generator that can also include TSX components
    const gen = await generateSurveyComponents({ prompt, context, userId: 'anon' })
    return NextResponse.json(gen)
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Generation failed' }, { status: 500 })
  }
}

