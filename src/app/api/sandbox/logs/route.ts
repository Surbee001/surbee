import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase-server';

async function getUserFromRequest(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (!error && user) return user;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => req.cookies.getAll() } }
  );
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('sandbox_relay_url')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (!project?.sandbox_relay_url) {
      return NextResponse.json({ error: 'No active sandbox' }, { status: 404 });
    }

    const resp = await fetch(`${project.sandbox_relay_url}/logs?lines=50`, {
      signal: AbortSignal.timeout(5000),
    });

    if (!resp.ok) {
      return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 502 });
    }

    const data = await resp.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[sandbox/logs] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
