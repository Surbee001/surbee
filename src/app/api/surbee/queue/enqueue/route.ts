import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { addSurveyJob } from '../../../../../../lib/queue/index'

const Body = z.object({
  userPrompt: z.string().min(4),
  userId: z.string(),
  contextData: z
    .object({
      industry: z.string().optional(),
      targetAudience: z.string().optional(),
      surveyType: z
        .enum(['marketing', 'research', 'feedback', 'academic'])
        .optional(),
      brandColors: z.array(z.string()).optional(),
    })
    .optional(),
  projectId: z.string().optional(),
  conversationId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json()
    const body = Body.parse(raw)
    const job = await addSurveyJob('generate', body)
    return NextResponse.json({ success: true, jobId: job.id })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to enqueue' },
      { status: 400 },
    )
  }
}

