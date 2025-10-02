import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/surbee/responses/list?surveyId=...
// Returns recent responses for a survey. Falls back to empty list.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const surveyId = searchParams.get('surveyId')
    const limit = Number(searchParams.get('limit') || '50')

    if (!surveyId) {
      return NextResponse.json({ success: false, error: 'missing_surveyId' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('survey_responses')
      .select('*')
      .eq('survey_id', surveyId)
      .order('completed_at', { ascending: false })
      .limit(Math.min(Math.max(limit, 1), 200))

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, responses: data || [] })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'unknown_error' }, { status: 500 })
  }
}

