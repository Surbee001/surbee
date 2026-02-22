import { NextRequest, NextResponse } from 'next/server';
import { createApiKeyHeaders, getModalEndpoint } from '../_shared';

/**
 * POST /api/sandbox/heartbeat
 *
 * Check if a sandbox is alive.
 *
 * Request body:
 * { sandbox_id: string }
 *
 * Returns:
 * { sandbox_id: string, alive: boolean, relay_url?: string, preview_url?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sandbox_id } = body;

    if (!sandbox_id) {
      return NextResponse.json({ error: 'Missing sandbox_id' }, { status: 400 });
    }

    const modalEndpoint = getModalEndpoint();
    if (!modalEndpoint) {
      return NextResponse.json({ error: 'Sandbox service not configured' }, { status: 503 });
    }

    const headers = createApiKeyHeaders();

    const response = await fetch(`${modalEndpoint}/api/sandbox/${sandbox_id}/heartbeat`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      return NextResponse.json({ sandbox_id, alive: false, reason: 'controller_error' });
    }

    return NextResponse.json(await response.json());
  } catch (error) {
    console.error('[Sandbox Heartbeat] Error:', error);
    return NextResponse.json({ sandbox_id: '', alive: false, reason: 'error' });
  }
}
