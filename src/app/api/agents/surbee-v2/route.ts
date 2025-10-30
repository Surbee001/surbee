/**
 * Surbee Workflow V2 API Route
 *
 * This endpoint uses Vercel AI SDK for flexible model support
 * while maintaining compatibility with the existing workflow structure.
 */

import { NextRequest, NextResponse } from 'next/server';
import { runWorkflowV2, cleanupSandboxes } from '@/lib/agents/surbeeWorkflowV2';

// Enable edge runtime for better performance (optional)
// export const runtime = 'edge';

// Set max duration for this endpoint
export const maxDuration = 300; // 5 minutes

/**
 * POST /api/agents/surbee-v2
 *
 * Executes the Surbee workflow using Vercel AI SDK with streaming support
 *
 * Request body can include:
 * - input_as_text: string (required)
 * - context: WorkflowContext (optional)
 * - images: Array of images as base64, URLs, or data URIs (optional)
 * - stream: boolean (optional, default: false) - Enable SSE streaming
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse request body
    const body = await req.json();
    const { input_as_text, context, images, stream = false } = body;

    // Validate input
    if (!input_as_text || typeof input_as_text !== 'string') {
      return NextResponse.json(
        {
          error: 'Invalid input: input_as_text is required and must be a string',
        },
        { status: 400 }
      );
    }

    // Validate images if provided
    if (images && !Array.isArray(images)) {
      return NextResponse.json(
        {
          error: 'Invalid input: images must be an array',
        },
        { status: 400 }
      );
    }

    console.log('🚀 Surbee V2 API: Starting workflow');
    console.log('📝 Input:', input_as_text.slice(0, 100) + '...');
    if (images && images.length > 0) {
      console.log(`🖼️ Images: ${images.length} provided`);
    }

    // If streaming is enabled, use SSE
    if (stream) {
      console.log('📡 Streaming enabled');

      const encoder = new TextEncoder();
      const customReadable = new ReadableStream({
        async start(controller) {
          try {
            // Send initial event
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'start' })}\n\n`));

            // Run workflow with streaming callback
            const result = await runWorkflowV2({
              input_as_text,
              context,
              images,
              onStream: (event) => {
                // Stream each event to the client
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
              },
            });

            const duration = Date.now() - startTime;

            // Send final result
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'complete',
              result: {
                ...result,
                metadata: {
                  duration,
                  timestamp: new Date().toISOString(),
                  version: 'v2',
                },
              },
            })}\n\n`));

            controller.close();
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'error',
              error: errorMessage,
            })}\n\n`));
            controller.close();
          }
        },
      });

      return new Response(customReadable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Non-streaming mode: return complete result
    const result = await runWorkflowV2({
      input_as_text,
      context,
      images,
    });

    const duration = Date.now() - startTime;
    console.log(`✅ Workflow completed in ${duration}ms`);
    console.log(`📊 Stage: ${result.stage}`);

    // Return result
    return NextResponse.json(
      {
        ...result,
        metadata: {
          duration,
          timestamp: new Date().toISOString(),
          version: 'v2',
        },
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ Workflow error:', error);

    // Log error details
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error('Error message:', errorMessage);
    if (errorStack) {
      console.error('Error stack:', errorStack);
    }

    // Return error response
    return NextResponse.json(
      {
        error: 'Workflow execution failed',
        message: errorMessage,
        stage: 'error',
        metadata: {
          duration,
          timestamp: new Date().toISOString(),
          version: 'v2',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/agents/surbee-v2
 *
 * Health check endpoint
 */
export async function GET(req: NextRequest) {
  // Clean up old sandboxes (older than 1 hour)
  const cleaned = cleanupSandboxes(3600000);

  return NextResponse.json({
    status: 'healthy',
    version: 'v2',
    timestamp: new Date().toISOString(),
    sandboxes_cleaned: cleaned,
  });
}
