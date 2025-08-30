import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { computeSuspicionScore } from '@/features/survey/behavior/scoring'

export async function POST(req: NextRequest) {
  try {
    const { surveyId, respondentId, responses, metrics } = await req.json()
    const { score, flags } = computeSuspicionScore(metrics)

    const { data: created } = await supabase.from('survey_responses').insert({
      survey_id: surveyId,
      respondent_id: respondentId,
      responses,
      completed_at: new Date().toISOString(),
      mouse_data: metrics?.mouseMovements || undefined,
      keystroke_data: metrics?.keystrokeDynamics || undefined,
      timing_data: metrics?.responseTime || [],
      device_data: metrics?.deviceFingerprint || {},
      fraud_score: score,
      is_flagged: score >= 0.5,
      flag_reasons: flags.map((f: any) => f.code),
    }).select('id').single()

    // update analytics aggregates (simple increment)
    const { data: existing } = await supabase.from('survey_analytics').select('*').eq('survey_id', surveyId).single()
    if (existing) {
      await supabase.from('survey_analytics').update({ total_completions: (existing.total_completions || 0) + 1 }).eq('id', existing.id)
    } else {
      await supabase.from('survey_analytics').insert({ survey_id: surveyId, total_completions: 1 })
    }

    return NextResponse.json({ success: true, id: created?.id, fraudScore: score, flags })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'submit_failed' }, { status: 400 })
  }
}

