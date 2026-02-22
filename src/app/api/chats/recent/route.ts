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

    // Fetch recent dashboard chat sessions - try with is_starred, fall back without
    let dashboardChats: any[] | null = null;
    let dashboardError: any = null;

    // Try fetching with is_starred column
    const result = await supabase
      .from('dashboard_chat_sessions')
      .select('id, title, updated_at, is_starred')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (result.error && result.error.message?.includes('is_starred')) {
      // Column doesn't exist, fetch without it
      const fallbackResult = await supabase
        .from('dashboard_chat_sessions')
        .select('id, title, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(limit);

      dashboardChats = fallbackResult.data;
      dashboardError = fallbackResult.error;
    } else {
      dashboardChats = result.data;
      dashboardError = result.error;
    }

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
      isStarred: c.is_starred || false,
    }));

    // Combine, sort by starred first then by timestamp, and limit
    const allChats = [...projectChats, ...dashboardChatsList]
      .sort((a, b) => {
        // Starred items first
        const aStarred = (a as any).isStarred ? 1 : 0;
        const bStarred = (b as any).isStarred ? 1 : 0;
        if (bStarred !== aStarred) return bStarred - aStarred;
        // Then by timestamp
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      })
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
