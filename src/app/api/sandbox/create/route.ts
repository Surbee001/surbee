import { NextRequest, NextResponse } from 'next/server';
import { createSignedHeaders, getModalEndpoint } from '../_shared';

/**
 * POST /api/sandbox/create
 *
 * Creates a Modal sandbox for a project with dual tunnels:
 * - relay_url (port 8000): FastAPI relay for agent file operations
 * - preview_url (port 3000): Next.js dev server for live preview
 *
 * Request body:
 * {
 *   files?: { [path: string]: string },
 *   sandbox_id: string,
 *   project_id?: string
 * }
 *
 * Returns:
 * {
 *   sandbox_id: string,
 *   relay_url: string,
 *   preview_url: string,
 *   status: 'running' | 'error'
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { files, sandbox_id, project_id } = body;

    if (!sandbox_id) {
      return NextResponse.json(
        { error: 'Missing sandbox_id' },
        { status: 400 }
      );
    }

    const modalEndpoint = getModalEndpoint();
    if (!modalEndpoint) {
      return NextResponse.json(
        { error: 'Sandbox service not configured' },
        { status: 503 }
      );
    }

    console.log(`[Sandbox] Creating sandbox ${sandbox_id}...`);

    const requestBody = JSON.stringify({ files: files || {}, sandbox_id });
    const headers = createSignedHeaders(requestBody);

    // 5-minute timeout — first creation builds the sandbox image
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 300_000);

    let response: Response;
    try {
      response = await fetch(`${modalEndpoint}/api/sandbox/create`, {
        method: 'POST',
        headers,
        body: requestBody,
        signal: controller.signal,
      });
    } catch (err: unknown) {
      clearTimeout(timeout);
      if (err instanceof Error && err.name === 'AbortError') {
        console.error(`[Sandbox] Modal request timed out after 5 minutes`);
        return NextResponse.json(
          { error: 'Sandbox creation timed out. The image may still be building — try again in a minute.' },
          { status: 504 }
        );
      }
      throw err;
    }
    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Sandbox] Modal error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: `Failed to create sandbox: ${errorText}` },
        { status: 502 }
      );
    }

    const result = await response.json();
    console.log(`[Sandbox] Created:`, {
      sandbox_id: result.sandbox_id,
      relay_url: result.relay_url ? '(set)' : '(missing)',
      preview_url: result.preview_url ? '(set)' : '(missing)',
      status: result.status,
    });

    // Persist sandbox URLs to project if project_id provided
    if (project_id && result.status === 'running') {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
        );
        await supabase
          .from('projects')
          .update({
            sandbox_object_id: result.sandbox_id,
            sandbox_relay_url: result.relay_url,
            sandbox_preview_url: result.preview_url,
            sandbox_last_heartbeat: new Date().toISOString(),
          })
          .eq('id', project_id);
      } catch (dbError) {
        console.error('[Sandbox] Failed to persist URLs to DB:', dbError);
        // Non-fatal — sandbox still works
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Sandbox] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
