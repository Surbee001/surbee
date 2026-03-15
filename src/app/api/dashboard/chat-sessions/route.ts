import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/auth-utils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET - List all dashboard chat sessions for the user with pagination
export async function GET(request: NextRequest) {
  try {
    const [user, errorResponse] = await requireAuth();
    if (!user) return errorResponse;

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'updated';

    let query = supabase
      .from('dashboard_chat_sessions')
      .select('id, title, updated_at, created_at, is_starred', { count: 'exact' })
      .eq('user_id', user.id);

    // Apply search filter
    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    // Apply sort
    if (sort === 'created') {
      query = query.order('created_at', { ascending: false });
    } else if (sort === 'title') {
      query = query.order('title', { ascending: true });
    } else {
      // Default: sort by updated_at (most recent first), starred first
      query = query.order('updated_at', { ascending: false });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: sessions, error, count } = await query;

    if (error) {
      // Fallback without is_starred if column doesn't exist
      if (error.message?.includes('is_starred')) {
        const fallbackQuery = supabase
          .from('dashboard_chat_sessions')
          .select('id, title, updated_at, created_at', { count: 'exact' })
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .range(offset, offset + limit - 1);

        const fallbackResult = search
          ? await fallbackQuery.ilike('title', `%${search}%`)
          : await fallbackQuery;

        if (fallbackResult.error) {
          return NextResponse.json({ error: fallbackResult.error.message }, { status: 500 });
        }

        return NextResponse.json({
          sessions: (fallbackResult.data || []).map(s => ({ ...s, is_starred: false })),
          total: fallbackResult.count || 0,
        });
      }

      console.error('Error fetching chat sessions:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      sessions: sessions || [],
      total: count || 0,
    });
  } catch (error: any) {
    console.error('Error in chat-sessions list:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
