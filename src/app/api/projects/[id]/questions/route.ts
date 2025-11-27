import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * GET /api/projects/[id]/questions
 * Fetch all questions for a survey/project
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: projectId } = await context.params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

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

    // Fetch questions
    const { data: questions, error: questionsError } = await supabaseAdmin
      .from('survey_questions')
      .select('*')
      .eq('project_id', projectId)
      .order('order_index', { ascending: true })

    if (questionsError) {
      return NextResponse.json({ error: questionsError.message }, { status: 500 })
    }

    return NextResponse.json({ questions: questions || [] })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/projects/[id]/questions
 * Save or update questions for a survey/project
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: projectId } = await context.params
    const body = await request.json()
    const { userId, questions } = body

    console.log('[Questions API] Saving questions for project:', projectId, 'user:', userId)

    if (!userId || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: 'User ID and questions array are required' }, { status: 400 })
    }

    // Verify user owns the project - use less strict check since project might be new
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('id, user_id')
      .eq('id', projectId)
      .single()

    console.log('[Questions API] Project query result:', { project, error: projectError })

    if (projectError) {
      console.error('[Questions API] Project query error:', projectError)
      return NextResponse.json({
        error: 'Project query failed',
        details: projectError.message
      }, { status: 500 })
    }

    if (!project) {
      console.error('[Questions API] Project not found:', projectId)
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Check if user owns the project
    if (project.user_id !== userId) {
      console.error('[Questions API] User mismatch. Expected:', project.user_id, 'Got:', userId)
      return NextResponse.json({ error: 'Unauthorized - user does not own this project' }, { status: 403 })
    }

    // Delete existing questions for this project
    const { error: deleteError } = await supabaseAdmin
      .from('survey_questions')
      .delete()
      .eq('project_id', projectId)

    if (deleteError) {
      console.error('Error deleting old questions:', deleteError)
    }

    // Insert new questions with full metadata
    const questionsToInsert = questions.map((q: any) => ({
      project_id: projectId,
      question_id: q.question_id || `q${q.order_index + 1}`, // Ensure question_id is set
      question_text: q.question_text,
      question_type: q.question_type,
      options: q.options || null,
      required: q.required || false,
      order_index: q.order_index,
      scale_min: q.scale_min || null,
      scale_max: q.scale_max || null,
      metadata: q.metadata || {},
    }))

    const { data: insertedQuestions, error: insertError } = await supabaseAdmin
      .from('survey_questions')
      .insert(questionsToInsert)
      .select()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      questions: insertedQuestions,
      count: insertedQuestions.length
    })
  } catch (error) {
    console.error('Error saving questions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
