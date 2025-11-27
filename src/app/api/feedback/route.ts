import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Save user feedback on AI responses for training
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, projectId, messageId, feedbackType, messageContent, context } = body;

    if (!userId || !feedbackType) {
      return NextResponse.json({ error: 'userId and feedbackType are required' }, { status: 400 });
    }

    // Insert feedback into database
    const { data, error } = await supabaseAdmin
      .from('ai_feedback')
      .insert({
        user_id: userId,
        project_id: projectId || null,
        message_id: messageId || null,
        feedback_type: feedbackType, // 'thumbs_up' or 'thumbs_down'
        message_content: messageContent || null,
        context: context || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      // If table doesn't exist, log and return success anyway
      if (error.code === '42P01') {
        console.log('ai_feedback table does not exist yet, skipping save');
        return NextResponse.json({ success: true, message: 'Feedback acknowledged (table not set up)' });
      }
      console.error('Error saving feedback:', error);
      return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in feedback API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
