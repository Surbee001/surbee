import { NextRequest, NextResponse } from 'next/server'
// Placeholder pipeline: generate basic structure with components using OpenAI
import { generateSurveyComponents } from '@/lib/ai/survey-generator'
import { z } from 'zod'
const rateLimit = async ({ key, limit, windowSec }: { key: string; limit: number; windowSec: number }) => ({ allowed: true, resetAt: Date.now() + windowSec * 1000 })
import { updateUserCredits } from '@/lib/user/credits'
import { supabase } from '@/lib/supabase'
import { getCachedComponents, cacheGeneratedComponents } from '../../../../../lib/optimization/component-cache'
import { hashString } from '../../../../../lib/utils/hash'
import { metrics } from '../../../../../lib/monitoring/metrics'

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
    // rate limit by ip
    const ip = req.headers.get('x-forwarded-for') || 'local'
    const rl = await rateLimit({ key: `gen:${ip}`, limit: 60, windowSec: 60 })
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: 'rate_limited', retryAt: rl.resetAt },
        { status: 429 },
      )
    }
    // credits
    // Placeholder credits gate
    const credits = 100
    if (credits <= 0) {
      return NextResponse.json(
        { success: false, error: 'no_credits' },
        { status: 402 },
      )
    }
    await updateUserCredits(body.userId, 'SPENT_GENERATION', -1)

    const start = Date.now()
    const promptHash = hashString(`${body.userPrompt}:${JSON.stringify(body.contextData || {})}`)
    const cached = await getCachedComponents<any>(promptHash)
    let survey
    if (cached) {
      survey = cached
    } else {
      const gen = await generateSurveyComponents({ prompt: body.userPrompt, context: body.contextData || {}, userId: body.userId })
      survey = { components: gen.components, theme: {}, validation: {}, analytics: {}, metadata: { intent: body.userPrompt, tone: 'auto' } }
      await cacheGeneratedComponents(promptHash, survey)
    }
    metrics.generationDuration.observe({ model: 'pipeline', complexity: 'n/a' }, (Date.now() - start) / 1000)
    metrics.generationSuccess.inc({ model: 'pipeline', survey_type: body.contextData?.surveyType || 'unknown' })

    // optional: persist survey metadata (best-effort)
    try {
      await supabase.from('surveys').insert({
        title: survey.metadata.intent.slice(0, 100),
        description: survey.metadata.tone || undefined,
        original_prompt: body.userPrompt,
        generated_components: survey.components,
        design_theme: survey.theme,
        validation_rules: survey.validation,
        analytics_config: survey.analytics,
        status: 'DRAFT',
        creator_id: body.userId,
      })
    } catch {}

    return NextResponse.json({ success: true, survey }, { status: 200 })
  } catch (error: any) {
    console.error('generate-survey error', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal error' },
      { status: 500 },
    )
  }
}

