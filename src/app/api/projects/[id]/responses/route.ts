import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { v4 as uuidv4 } from 'uuid'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * POST /api/projects/[id]/responses
 * Save a new survey response (public endpoint for respondents)
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: projectId } = await context.params
    const body = await request.json()
    const { responses, completed_at, device_data, timing_data, is_preview, user_id } = body

    if (!responses) {
      return NextResponse.json({ error: 'Responses data is required' }, { status: 400 })
    }

    // Verify the project exists and is published (public endpoint, no user auth needed)
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('id, status')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
    }

    // Insert the response
    const { data: newResponse, error: insertError } = await supabaseAdmin
      .from('survey_responses')
      .insert({
        id: uuidv4(),
        survey_id: projectId,
        responses,
        completed_at: completed_at || new Date().toISOString(),
        device_data: device_data || null,
        timing_data: timing_data || null,
        user_id: user_id || null, // Associate with user if logged in
        is_preview: is_preview || false, // Mark as preview response
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting response:', insertError)
      return NextResponse.json({ error: 'Failed to save response' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      response: newResponse,
    }, { status: 201 })
  } catch (error) {
    console.error('Error saving response:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
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
