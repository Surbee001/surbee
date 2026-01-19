import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/sandbox/create
 *
 * Creates a Modal sandbox for survey preview.
 *
 * Request body:
 * {
 *   files: { [path: string]: string },
 *   sandbox_id: string
 * }
 *
 * Returns:
 * {
 *   sandbox_id: string,
 *   preview_url: string,
 *   edit_url: string,
 *   status: 'running' | 'error'
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { files, sandbox_id } = body;

    if (!files || !sandbox_id) {
      return NextResponse.json(
        { error: 'Missing files or sandbox_id' },
        { status: 400 }
      );
    }

    // Get Modal endpoint URL from environment
    const modalEndpoint = process.env.MODAL_SANDBOX_ENDPOINT;

    if (!modalEndpoint) {
      console.error('[Sandbox] MODAL_SANDBOX_ENDPOINT not configured');
      return NextResponse.json(
        { error: 'Sandbox service not configured. Please deploy Modal app first.' },
        { status: 503 }
      );
    }

    console.log(`[Sandbox] Creating sandbox ${sandbox_id}...`);
    console.log(`[Sandbox] Modal endpoint: ${modalEndpoint}`);

    // Call Modal sandbox endpoint
    const response = await fetch(`${modalEndpoint}/api/sandbox/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files,
        sandbox_id,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Sandbox] Modal error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: `Failed to create sandbox: ${errorText}` },
        { status: 502 }
      );
    }

    const result = await response.json();
    console.log(`[Sandbox] Created successfully:`, result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Sandbox] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
