import { NextRequest, NextResponse } from 'next/server';
import { createApiKeyHeaders, getModalEndpoint } from '../_shared';

/**
 * POST /api/sandbox/exec
 *
 * Proxy command execution to a sandbox relay.
 *
 * Request body:
 * { sandbox_id: string, command: string, timeout?: number }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sandbox_id, command, timeout = 30 } = body;

    if (!sandbox_id || !command) {
      return NextResponse.json({ error: 'Missing sandbox_id or command' }, { status: 400 });
    }

    const modalEndpoint = getModalEndpoint();
    if (!modalEndpoint) {
      return NextResponse.json({ error: 'Sandbox service not configured' }, { status: 503 });
    }

    const headers = createApiKeyHeaders();

    const response = await fetch(`${modalEndpoint}/api/sandbox/${sandbox_id}/exec`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ command, timeout }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Exec failed' }, { status: 502 });
    }

    return NextResponse.json(await response.json());
  } catch (error) {
    console.error('[Sandbox Exec] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
