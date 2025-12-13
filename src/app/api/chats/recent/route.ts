import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/auth-utils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const [user, errorResponse] = await requireAuth();
    if (!user) return errorResponse;

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Fetch recent projects as "chats"
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, title, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (projectsError) {
      console.error('Error fetching recent projects:', projectsError);
    }

    // Fetch recent dashboard chat sessions
    const { data: dashboardChats, error: dashboardError } = await supabase
      .from('dashboard_chat_sessions')
      .select('id, title, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (dashboardError) {
      console.error('Error fetching dashboard chats:', dashboardError);
    }

    // Combine and format both types of chats
    const projectChats = (projects || []).map(p => ({
      id: p.id,
      title: p.title || 'Untitled Project',
      timestamp: p.updated_at,
      projectId: p.id,
      type: 'project' as const,
    }));

    const dashboardChatsList = (dashboardChats || []).map(c => ({
      id: c.id,
      title: c.title || 'Untitled Chat',
      timestamp: c.updated_at,
      chatId: c.id,
      type: 'dashboard' as const,
    }));

    // Combine, sort by timestamp, and limit
    const allChats = [...projectChats, ...dashboardChatsList]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    return NextResponse.json({ recentChats: allChats });
  } catch (error: any) {
    console.error('Error in recent chats API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
