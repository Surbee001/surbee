import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      );
    }

    // Look up sandbox from DB
    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('sandbox_relay_url, sandbox_preview_url')
      .eq('id', projectId)
      .single();

    if (!project?.sandbox_relay_url) {
      return NextResponse.json({ alive: false, previewUrl: null });
    }

    // Check relay heartbeat
    try {
      const heartbeat = await fetch(`${project.sandbox_relay_url}/heartbeat`, {
        signal: AbortSignal.timeout(5000),
      });

      if (heartbeat.ok) {
        return NextResponse.json({
          alive: true,
          previewUrl: project.sandbox_preview_url,
        });
      }
    } catch {
      // Sandbox not responding
    }

    return NextResponse.json({ alive: false, previewUrl: null });
  } catch (error) {
    console.error('[sandbox/status] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
