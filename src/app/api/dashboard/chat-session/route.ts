import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/auth-utils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET - Load a chat session
export async function GET(request: NextRequest) {
  try {
    const [user, errorResponse] = await requireAuth();
    if (!user) return errorResponse;

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Fetch the chat session
    const { data: session, error } = await supabase
      .from('dashboard_chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      // Session might not exist yet
      if (error.code === 'PGRST116') {
        return NextResponse.json({ session: null });
      }
      console.error('Error fetching chat session:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ session });
  } catch (error: any) {
    console.error('Error in chat session GET:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST - Create or update a chat session
export async function POST(request: NextRequest) {
  try {
    const [user, errorResponse] = await requireAuth();
    if (!user) return errorResponse;

    const body = await request.json();
    const { sessionId, title, messages } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Check if session exists
    const { data: existingSession } = await supabase
      .from('dashboard_chat_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (existingSession) {
      // Update existing session
      const { data: session, error } = await supabase
        .from('dashboard_chat_sessions')
        .update({
          title: title || 'Untitled Chat',
          messages: messages || [],
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating chat session:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ session });
    } else {
      // Create new session
      const { data: session, error } = await supabase
        .from('dashboard_chat_sessions')
        .insert({
          id: sessionId,
          user_id: user.id,
          title: title || 'Untitled Chat',
          messages: messages || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating chat session:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ session });
    }
  } catch (error: any) {
    console.error('Error in chat session POST:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a chat session
export async function DELETE(request: NextRequest) {
  try {
    const [user, errorResponse] = await requireAuth();
    if (!user) return errorResponse;

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Delete the chat session
    const { error } = await supabase
      .from('dashboard_chat_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting chat session:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in chat session DELETE:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

