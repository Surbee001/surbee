import { Worker } from 'bullmq'
import IORedis from 'ioredis'
import { supabase } from '@/lib/supabase'
import { generateSurveyComponents } from '@/lib/ai/survey-generator'
import { queueCreditDistribution } from './setup'
import { processAnalyticsData } from '@/lib/analytics/processor'
import { axiomLogger } from '@/lib/logging/axiom-client'

if (process.env.DISABLE_REDIS === 'true' || !process.env.REDIS_URL) {
  console.warn('Redis disabled or not configured; skipping worker startup')
  // Exit early when invoked directly
  // eslint-disable-next-line no-process-exit
  process.exit(0)
}
const connection = new IORedis(process.env.REDIS_URL as string)

new Worker(
  'survey-generation',
  async (job) => {
    const { userId, prompt, context } = job.data
    const start = Date.now()
    const survey = await generateSurveyComponents({ prompt, context, userId })
    const { data: saved } = await supabase.from('surveys').insert({
      title: survey.title,
      original_prompt: prompt,
      generated_components: survey.components,
      design_theme: survey.theme,
      validation_rules: survey.validation,
      analytics_config: survey.analytics,
      creator_id: userId,
      status: 'DRAFT',
    }).select('id').single()
    await queueCreditDistribution({ userId, action: 'SPENT_GENERATION', amount: -1, metadata: { surveyId: saved.id } })
    await axiomLogger.logBusinessEvent({ eventType: 'survey_created', userId, metadata: { surveyId: saved.id } })
    await axiomLogger.logAIGeneration({ userId, prompt: '', promptHash: 'queued', model: 'pipeline', generationType: 'survey', duration: Date.now() - start, success: true })
    return { surveyId: saved.id, success: true }
  },
  { connection },
)

new Worker(
  'analytics-processing',
  async (job) => {
    const { surveyId, responseId, behavioralData } = job.data
    // Call ML Fraud Detector
    const res = await fetch((process.env.FRAUD_API_URL || 'http://localhost:8000') + '/analyze-behavior', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(behavioralData),
    })
    const fraud = res.ok ? await res.json() : { fraud_probability: 0, is_suspicious: false, risk_factors: [] }
    await supabase.from('survey_responses').update({
      fraud_score: fraud.fraud_probability,
      is_flagged: fraud.is_suspicious,
      flag_reasons: fraud.risk_factors,
    }).eq('id', responseId)
    await processAnalyticsData(surveyId, responseId, behavioralData, fraud)
    return { responseId, fraudScore: fraud.fraud_probability }
  },
  { connection },
)

new Worker(
  'credit-distribution',
  async (job) => {
    const { userId, action, amount, metadata } = job.data
    // Credits via helper or direct write
    const { data: userRow } = await supabase.from('users').select('credits').eq('id', userId).single()
    const newCredits = (userRow?.credits || 0) + amount
    await supabase.from('users').update({ credits: newCredits }).eq('id', userId)
    await supabase.from('credit_logs').insert({ user_id: userId, action, amount, description: action, metadata })
    return { success: true }
  },
  { connection },
)

