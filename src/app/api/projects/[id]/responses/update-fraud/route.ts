import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

interface RouteContext {
  params: Promise<{ id: string }>
}

interface ContradictionData {
  hasContradictions: boolean;
  count: number;
  contradictions: Array<{
    questionIds: string[];
    type: string;
    description: string;
    severity: string;
    evidence: string[];
  }>;
  consistencyScore: number;
  reasoning?: string;
}

/**
 * POST /api/projects/[id]/responses/update-fraud
 * Update fraud score, flags, and contradictions for a response (called after Cipher analysis)
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: projectId } = await context.params
    const body = await request.json()
    const {
      session_id,
      fraud_score,
      is_flagged,
      flag_reasons,
      contradictions,
      consistency_score
    } = body

    if (!session_id) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    // Build update object
    const updateData: Record<string, any> = {
      fraud_score: fraud_score ?? null,
      is_flagged: is_flagged ?? false,
      flag_reasons: flag_reasons || [],
    }

    // Add contradiction data if provided
    if (contradictions !== undefined) {
      updateData.contradictions = contradictions
    }
    if (consistency_score !== undefined) {
      updateData.consistency_score = consistency_score
    }

    // Update the response with fraud and contradiction data
    const { data: updatedResponse, error: updateError } = await supabaseAdmin
      .from('survey_responses')
      .update(updateData)
      .eq('survey_id', projectId)
      .eq('session_id', session_id)
      .select('id, fraud_score, is_flagged, contradictions, consistency_score')
      .single()

    if (updateError) {
      // If no matching response found, that's okay - it might be a timing issue
      if (updateError.code === 'PGRST116') {
        return NextResponse.json({ success: true, message: 'No matching response found' })
      }
      console.error('Error updating fraud data:', updateError)
      return NextResponse.json({ error: 'Failed to update fraud data' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      response: updatedResponse,
    })
  } catch (error) {
    console.error('Error updating fraud data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
