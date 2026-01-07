import { NextRequest, NextResponse } from 'next/server'
// Placeholder pipeline: generate basic structure with components using OpenAI
import { generateSurveyComponents } from '@/lib/ai/survey-generator'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { getCachedComponents, cacheGeneratedComponents } from '../../../../../lib/optimization/component-cache'
import { hashString } from '../../../../../lib/utils/hash'
import { metrics } from '../../../../../lib/monitoring/metrics'
import { checkCredits, deductCredits, getSurveyComplexity } from '@/lib/credits'
import { checkRateLimit } from '@/lib/feature-gate'

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

    // Check rate limits for survey generation
    const rateLimitCheck = await checkRateLimit(body.userId, 'surveyGeneration');
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'rate_limited',
          message: rateLimitCheck.reason,
          remaining: rateLimitCheck.remaining,
          limit: rateLimitCheck.limit,
        },
        { status: 429 },
      )
    }

    // Estimate complexity based on prompt length and context
    // This is a heuristic - actual complexity determined after generation
    const estimatedQuestions = Math.min(20, Math.max(3, Math.ceil(body.userPrompt.length / 50)));
    const creditAction = getSurveyComplexity(estimatedQuestions);

    // Check credits
    const creditCheck = await checkCredits(body.userId, creditAction);
    if (!creditCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'insufficient_credits',
          message: `This action requires ${creditCheck.required} credits, but you have ${creditCheck.remaining}`,
          required: creditCheck.required,
          remaining: creditCheck.remaining,
        },
        { status: 402 },
      )
    }

    // Deduct credits upfront
    const deductResult = await deductCredits(body.userId, creditAction, {
      prompt: body.userPrompt.slice(0, 100),
      estimatedQuestions,
    });

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

