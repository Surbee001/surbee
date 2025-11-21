import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * GET /api/projects/[id]/responses
 * Fetch all responses for a survey/project
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: projectId } = await context.params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '100', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Verify user owns the project
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 403 })
    }

    // Fetch responses
    const { data: responses, error: responsesError, count } = await supabaseAdmin
      .from('survey_responses')
      .select('*', { count: 'exact' })
      .eq('survey_id', projectId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (responsesError) {
      return NextResponse.json({ error: responsesError.message }, { status: 500 })
    }

    return NextResponse.json({
      responses: responses || [],
      totalCount: count || 0,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching responses:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
