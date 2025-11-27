import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * GET /api/projects/[id]/chat-session
 * Get the active chat session for a project (or create if doesn't exist)
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: projectId } = await context.params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const sessionId = searchParams.get('sessionId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Verify user owns the project
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('id, active_chat_session_id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 403 })
    }

    // If sessionId provided, fetch that specific session
    if (sessionId) {
      const { data: session, error: sessionError } = await supabaseAdmin
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .single()

      if (sessionError) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 })
      }

      return NextResponse.json({ session })
    }

    // Otherwise, get the active session or create new one
    let session

    if (project.active_chat_session_id) {
      // Try to fetch active session
      const { data: activeSession } = await supabaseAdmin
        .from('chat_sessions')
        .select('*')
        .eq('id', project.active_chat_session_id)
        .single()

      if (activeSession) {
        session = activeSession
      }
    }

    // If no active session, create a new one
    if (!session) {
      const { data: newSession, error: createError } = await supabaseAdmin
        .from('chat_sessions')
        .insert({
          project_id: projectId,
          user_id: userId,
          title: 'New Chat',
          status: 'active',
          messages: [],
        })
        .select()
        .single()

      if (createError) {
        return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
      }

      // Update project with active session
      await supabaseAdmin
        .from('projects')
        .update({ active_chat_session_id: newSession.id })
        .eq('id', projectId)

      session = newSession
    }

    return NextResponse.json({ session })
  } catch (error) {
    console.error('Error fetching chat session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/projects/[id]/chat-session
 * Save messages to chat session
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: projectId } = await context.params
    const body = await request.json()
    const { userId, sessionId, messages, title } = body

    if (!userId || !messages) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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

    // Generate title from first user message if not provided
    const sessionTitle = title || messages.find((m: any) => m.role === 'user')?.content?.substring(0, 50) || 'New Chat'

    let updatedSession

    if (sessionId) {
      // Update existing session
      const { data, error } = await supabaseAdmin
        .from('chat_sessions')
        .update({
          messages,
          title: sessionTitle,
          last_message_at: new Date().toISOString(),
        })
        .eq('id', sessionId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: 'Failed to update session' }, { status: 500 })
      }

      updatedSession = data
    } else {
      // Create new session
      const { data, error } = await supabaseAdmin
        .from('chat_sessions')
        .insert({
          project_id: projectId,
          user_id: userId,
          title: sessionTitle,
          messages,
          status: 'active',
          last_message_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
      }

      // Update project with active session
      await supabaseAdmin
        .from('projects')
        .update({ active_chat_session_id: data.id })
        .eq('id', projectId)

      updatedSession = data
    }

    return NextResponse.json({ session: updatedSession })
  } catch (error) {
    console.error('Error saving chat session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/projects/[id]/chat-session
 * Update chat session status (complete, archive, etc.)
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id: projectId } = await context.params
    const body = await request.json()
    const { userId, sessionId, status } = body

    if (!userId || !sessionId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Update session status
    const { data, error } = await supabaseAdmin
      .from('chat_sessions')
      .update({ status })
      .eq('id', sessionId)
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to update session' }, { status: 500 })
    }

    return NextResponse.json({ session: data })
  } catch (error) {
    console.error('Error updating chat session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
