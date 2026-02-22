import { NextRequest, NextResponse } from 'next/server';
import { createApiKeyHeaders, getModalEndpoint } from '../_shared';

/**
 * POST /api/sandbox/write
 *
 * Proxy file write(s) to a sandbox relay.
 *
 * Request body (single file):
 * { sandbox_id: string, path: string, content: string }
 *
 * Request body (batch):
 * { sandbox_id: string, files: Record<string, string> }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sandbox_id, path, content, files } = body;

    if (!sandbox_id) {
      return NextResponse.json({ error: 'Missing sandbox_id' }, { status: 400 });
    }

    const modalEndpoint = getModalEndpoint();
    if (!modalEndpoint) {
      return NextResponse.json({ error: 'Sandbox service not configured' }, { status: 503 });
    }

    const headers = createApiKeyHeaders();

    if (files) {
      // Batch write
      const response = await fetch(`${modalEndpoint}/api/sandbox/${sandbox_id}/write`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ files }),
      });
      if (!response.ok) {
        return NextResponse.json({ error: 'Write failed' }, { status: 502 });
      }
      return NextResponse.json(await response.json());
    }

    if (path && content !== undefined) {
      // Single file write
      const response = await fetch(`${modalEndpoint}/api/sandbox/${sandbox_id}/write`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ path, content }),
      });
      if (!response.ok) {
        return NextResponse.json({ error: 'Write failed' }, { status: 502 });
      }
      return NextResponse.json(await response.json());
    }

    return NextResponse.json({ error: 'Missing path/content or files' }, { status: 400 });
  } catch (error) {
    console.error('[Sandbox Write] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
