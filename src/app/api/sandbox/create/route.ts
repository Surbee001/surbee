import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase-server';

const MODAL_CONTROLLER_URL = process.env.MODAL_SANDBOX_CONTROLLER_URL;

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

    const { projectId, files, entry, dependencies } = await req.json();

    if (!projectId || !files) {
      return NextResponse.json(
        { error: 'projectId and files are required' },
        { status: 400 }
      );
    }

    // Check if sandbox already exists in DB and is alive
    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('sandbox_object_id, sandbox_relay_url, sandbox_preview_url')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (project?.sandbox_relay_url) {
      try {
        const heartbeat = await fetch(`${project.sandbox_relay_url}/heartbeat`, {
          signal: AbortSignal.timeout(5000),
        });
        if (heartbeat.ok) {
          // Sandbox is alive — send updated files directly to relay
          await fetch(`${project.sandbox_relay_url}/edit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ files, entry }),
            signal: AbortSignal.timeout(10000),
          });

          await supabaseAdmin
            .from('projects')
            .update({ sandbox_last_heartbeat: new Date().toISOString() })
            .eq('id', projectId);

          return NextResponse.json({
            status: 'ready',
            previewUrl: project.sandbox_preview_url,
            relayUrl: project.sandbox_relay_url,
            sandboxObjectId: project.sandbox_object_id,
          });
        }
      } catch {
        // Sandbox is dead, create a new one
      }
    }

    // Spawn new sandbox via Modal controller (non-blocking)
    if (!MODAL_CONTROLLER_URL) {
      return NextResponse.json(
        { error: 'Modal sandbox controller not configured' },
        { status: 503 }
      );
    }

    const createResp = await fetch(`${MODAL_CONTROLLER_URL}/sandbox/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: projectId,
        files,
        entry,
        dependencies,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!createResp.ok) {
      const errData = await createResp.json().catch(() => ({}));
      return NextResponse.json(
        { error: errData.error || 'Failed to create sandbox' },
        { status: 502 }
      );
    }

    const data = await createResp.json();

    // If the controller returned an existing ready sandbox
    if (data.status === 'ready') {
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

    // Otherwise, it's a spawn response with a call_id for polling
    return NextResponse.json({
      status: 'creating',
      callId: data.call_id,
      projectId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[sandbox/create] Error:', message, error);

    if (message.includes('abort') || message.includes('timeout')) {
      return NextResponse.json(
        { error: 'Sandbox creation timed out. Please retry.' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: `Internal server error: ${message}` },
      { status: 500 }
    );
  }
}
