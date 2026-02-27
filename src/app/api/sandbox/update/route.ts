import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase-server';

async function getUserFromRequest(req: NextRequest) {
  // Try Bearer token first
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

  // Fallback: cookie-based auth
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => req.cookies.getAll() } }
  );
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, files, entry } = await req.json();

    if (!projectId || !files) {
      return NextResponse.json(
        { error: 'projectId and files are required' },
        { status: 400 }
      );
    }

    // Look up sandbox relay URL from DB
    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('sandbox_relay_url')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (!project?.sandbox_relay_url) {
      return NextResponse.json(
        { error: 'No active sandbox for this project. Create one first.' },
        { status: 404 }
      );
    }

    // POST files directly to the sandbox relay (bypass Modal controller for speed)
    const relayResp = await fetch(`${project.sandbox_relay_url}/edit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files, entry }),
      signal: AbortSignal.timeout(10000),
    });

    if (!relayResp.ok) {
      return NextResponse.json(
        { error: 'Failed to update sandbox files' },
        { status: 502 }
      );
    }

    const result = await relayResp.json();

    // Update heartbeat
    await supabaseAdmin
      .from('projects')
      .update({ sandbox_last_heartbeat: new Date().toISOString() })
      .eq('id', projectId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[sandbox/update] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
