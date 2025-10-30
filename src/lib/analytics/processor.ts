import { supabase } from '@/lib/supabase'

export async function processAnalyticsData(
  surveyId: string,
  responseId: string,
  behavioralData: any,
  fraudAnalysis: any,
) {
  await updateSurveyAnalytics(surveyId, fraudAnalysis)
  await storeBehavioralPatterns(surveyId, behavioralData, fraudAnalysis)
  if (responseId) await updateUserQualityScore(responseId, fraudAnalysis)
  await generateSurveyInsights(surveyId)
}

async function updateSurveyAnalytics(surveyId: string, fraudAnalysis: any) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  // Upsert-like behavior via two-step
  const { data: existing } = await supabase
    .from('survey_analytics')
    .select('*')
    .eq('survey_id', surveyId)
    .eq('date', today.toISOString())
    .single()
  if (existing) {
    await supabase.from('survey_analytics').update({
      total_completions: (existing.total_completions || 0) + 1,
      fraudulent_responses: (existing.fraudulent_responses || 0) + (fraudAnalysis?.isSuspicious ? 1 : 0),
    }).eq('id', existing.id)
  } else {
    await supabase.from('survey_analytics').insert({
      survey_id: surveyId,
      date: today.toISOString(),
      total_views: 0,
      total_starts: 0,
      total_completions: 1,
      fraudulent_responses: fraudAnalysis?.isSuspicious ? 1 : 0,
    })
  }
}

async function storeBehavioralPatterns(
  surveyId: string,
  behavioralData: any,
  fraudAnalysis: any,
) {
  const pattern = {
    surveyId,
    mouseVelocityAvg: calculateAverageMouseVelocity(behavioralData?.mouseData),
    keystrokeDynamics: analyzeKeystrokeDynamics(behavioralData?.keystrokeData),
    responseTimePattern: analyzeResponseTimes(behavioralData?.timingData),
    fraudScore: fraudAnalysis?.probability ?? fraudAnalysis?.fraud_probability,
    isLegitimate: !(fraudAnalysis?.isSuspicious ?? fraudAnalysis?.is_suspicious),
    timestamp: new Date(),
  }
  await supabase.from('behavioral_patterns').insert(pattern as any)
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { count } = await supabase
    .from('behavioral_patterns')
    .select('*', { count: 'exact', head: true })
    .gte('timestamp', yesterday)
  if (count > 1000) {
    await queueModelRetraining()
  }
}

async function updateUserQualityScore(responseId: string, fraudAnalysis: any) {
  // Placeholder: join respondent via response
  const { data: response } = await supabase.from('survey_responses').select('respondent_id').eq('id', responseId).single()
  if (!response?.respondent_id) return
  const qualityDelta = Math.max(0, 1 - (fraudAnalysis?.probability ?? 0))
  const { data: userRow } = await supabase.from('users').select('credits').eq('id', response.respondent_id).single()
  await supabase.from('users').update({ credits: (userRow?.credits || 0) + Math.round(qualityDelta) }).eq('id', response.respondent_id)
}

export async function generateSurveyInsights(surveyId: string) {
  const { data: analytics } = await supabase.from('survey_analytics').select('*').eq('survey_id', surveyId).order('date', { ascending: false }).limit(30)
  const { data: responses } = await supabase.from('survey_responses').select('*').eq('survey_id', surveyId)
  const insights = {
    completionRate: calculateCompletionRate(analytics),
    averageTime: calculateAverageCompletionTime(responses),
    qualityScore: calculateQualityScore(responses),
    demographicBreakdown: {},
    fraudRate: calculateFraudRate(responses),
    improvementSuggestions: generateImprovementSuggestions(analytics, responses),
  }
  // Upsert via two-step
  const { data: existing } = await supabase.from('survey_insights').select('survey_id').eq('survey_id', surveyId).single()
  if (existing) {
    await supabase.from('survey_insights').update({ insights, generated_at: new Date().toISOString() }).eq('survey_id', surveyId)
  } else {
    await supabase.from('survey_insights').insert({ survey_id: surveyId, insights, generated_at: new Date().toISOString() })
  }
  return insights
}

// Helpers
function calculateAverageMouseVelocity(mouseData: any[] = []) {
  if (!mouseData?.length) return 0
  const v = mouseData.map((m: any, i: number) => (i === 0 ? 0 : Math.hypot(m.x - mouseData[i - 1].x, m.y - mouseData[i - 1].y) / Math.max(1, m.timestamp - mouseData[i - 1].timestamp)))
  const sum = v.reduce((a: number, b: number) => a + (isFinite(b) ? b : 0), 0)
  return sum / Math.max(1, v.length)
}

function analyzeKeystrokeDynamics(keystrokes: any[] = []) {
  const dwell = keystrokes.map((k: any) => k.dwellTime || k.dwell_time).filter(Boolean)
  const flight = keystrokes.map((k: any) => k.flightTime || k.flight_time).filter(Boolean)
  return { dwellAvg: avg(dwell), flightAvg: avg(flight) }
}

function analyzeResponseTimes(times: number[] = []) {
  if (!times.length) return { avg: 0, std: 0 }
  const mean = avg(times)
  const variance = avg(times.map((t) => Math.pow(t - mean, 2)))
  return { avg: mean, std: Math.sqrt(variance) }
}

function calculateCompletionRate(analytics: any[]) {
  const totalStarts = analytics.reduce((s, a) => s + (a.totalStarts || 0), 0)
  const totalCompletions = analytics.reduce((s, a) => s + (a.totalCompletions || 0), 0)
  return totalStarts ? totalCompletions / totalStarts : 0
}

function calculateAverageCompletionTime(responses: any[]) {
  const times = responses.map((r) => {
    if (!r.completedAt || !r.startedAt) return 0
    return (new Date(r.completedAt).getTime() - new Date(r.startedAt).getTime()) / 1000
  })
  return avg(times)
}

function calculateQualityScore(responses: any[]) {
  const valid = responses.filter((r) => !(r.isFlagged || r.fraudScore >= 0.5))
  return responses.length ? valid.length / responses.length : 0
}

function calculateFraudRate(responses: any[]) {
  const fraud = responses.filter((r) => r.isFlagged || r.fraudScore >= 0.5)
  return responses.length ? fraud.length / responses.length : 0
}

function generateImprovementSuggestions(analytics: any[], responses: any[]) {
  const suggestions: string[] = []
  if (calculateFraudRate(responses) > 0.2) suggestions.push('High fraud rate: add CAPTCHA or slow down flow')
  if (calculateCompletionRate(analytics) < 0.3) suggestions.push('Low completion: simplify questions, improve UX')
  if (calculateAverageCompletionTime(responses) > 600) suggestions.push('Long completion time: reduce question count or complexity')
  return suggestions
}

async function queueModelRetraining() {
  // Hook up to your training pipeline or a background job
  return true
}

function avg(arr: number[]) { return arr.length ? arr.reduce((a, b) => a + (isFinite(b) ? b : 0), 0) / arr.length : 0 }

