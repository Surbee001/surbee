import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase-server';

const MODAL_CONTROLLER_URL = process.env.MODAL_SANDBOX_CONTROLLER_URL;

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

    const callId = req.nextUrl.searchParams.get('callId');
    const projectId = req.nextUrl.searchParams.get('projectId');

    if (!callId || !projectId) {
      return NextResponse.json(
        { error: 'callId and projectId are required' },
        { status: 400 }
      );
    }

    if (!MODAL_CONTROLLER_URL) {
      return NextResponse.json(
        { error: 'Modal sandbox controller not configured' },
        { status: 503 }
      );
    }

    const pollResp = await fetch(
      `${MODAL_CONTROLLER_URL}/sandbox/poll/${callId}`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (!pollResp.ok) {
      return NextResponse.json(
        { status: 'error', error: 'Poll request failed' },
        { status: 502 }
      );
    }

    const data = await pollResp.json();

    if (data.status === 'ready') {
      // Store sandbox metadata in DB
      await supabaseAdmin
        .from('projects')
        .update({
          sandbox_object_id: data.sandbox_object_id,
          sandbox_relay_url: data.relay_url,
          sandbox_preview_url: data.preview_url,
          sandbox_last_heartbeat: new Date().toISOString(),
        })
        .eq('id', projectId);

      return NextResponse.json({
        status: 'ready',
        previewUrl: data.preview_url,
        relayUrl: data.relay_url,
        sandboxObjectId: data.sandbox_object_id,
      });
    }

    if (data.status === 'error') {
      return NextResponse.json({
        status: 'error',
        error: data.error || 'Sandbox creation failed',
      });
    }

    // Still creating
    return NextResponse.json({ status: 'creating' });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[sandbox/poll] Error:', message);
    return NextResponse.json(
      { status: 'error', error: message },
      { status: 500 }
    );
  }
}
