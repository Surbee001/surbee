import { NextRequest, NextResponse } from "next/server";
import { Grok4FastSystem } from "@/lib/grok/grok-4-fast-system";
import { getCorsHeaders, handleCorsPreflightRequest } from "@/lib/cors";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes for reasoning models

interface ApiPayload {
  prompt: string;
  conversationId?: string;
  images?: Array<{ url: string; detail?: "low" | "medium" | "high" } | string>;
}

type StreamEvent =
  | { type: "thinking"; delta: string }
  | { type: "status"; status: string; detail?: string }
  | { type: "htmlChunk"; chunk: string }
  | { type: "complete"; html: string; conversationId: string; suggestions?: string }
  | { type: "usage"; usage: Record<string, unknown> }
  | { type: "error"; message: string };

/**
 * POST /api/grok-survey
 * 
 * Streams survey generation using Grok 4 Fast Reasoning
 * 
 * Request body:
 * {
 *   prompt: string;
 *   conversationId?: string;
 *   images?: Array<{ url: string; detail?: "low" | "medium" | "high" } | string>;
 * }
 * 
 * Response: Server-sent events stream with JSON events
 */
export async function POST(req: NextRequest) {
  let payload: ApiPayload;
  
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const prompt = typeof payload.prompt === "string" ? payload.prompt.trim() : "";
  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  // Check for API key
  if (!process.env.XAI_API_KEY) {
    console.error('[Grok API] Missing XAI_API_KEY environment variable');
    return NextResponse.json({ 
      error: "XAI API key not configured. Please set XAI_API_KEY environment variable." 
    }, { status: 500 });
  }

  try {
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Helper to send events
    const sendEvent = async (event: StreamEvent) => {
      try {
        await writer.write(encoder.encode(`${JSON.stringify(event)}\n`));
      } catch (error) {
        console.error('[Grok API] Error writing to stream:', error);
      }
    };

    // Normalize images
    const images = Array.isArray(payload.images)
      ? payload.images
          .map((entry) =>
            typeof entry === "string"
              ? { url: entry, detail: "high" as const }
              : entry && typeof entry.url === "string"
              ? { url: entry.url, detail: entry.detail ?? "high" }
              : null
          )
          .filter((item): item is { url: string; detail?: "low" | "medium" | "high" } => Boolean(item))
      : undefined;

    // Run Grok 4 Fast in background
    (async () => {
      const system = new Grok4FastSystem();
      
      try {
        console.log('[Grok API] Starting survey generation for prompt:', prompt.substring(0, 100) + '...');
        
        const result = await system.run({
          prompt,
          conversationId: payload.conversationId,
          images,
          onThinking: (delta) => {
            if (delta.trim()) {
              void sendEvent({ type: "thinking", delta });
            }
          },
          onStatus: (status, detail) => {
            void sendEvent({ type: "status", status, detail });
          },
          onHtmlChunk: (chunk) => {
            if (chunk && chunk.trim()) {
              void sendEvent({ type: "htmlChunk", chunk });
            }
          },
          onUsage: (usage) => {
            void sendEvent({ type: "usage", usage });
          },
        });

        // Send completion event
        await sendEvent({
          type: "complete",
          html: "", // HTML already streamed via htmlChunk events
          conversationId: result.conversationId,
          suggestions: result.suggestions,
        });

        // Send final usage stats
        if (result.usage) {
          await sendEvent({ type: "usage", usage: result.usage });
        }

        console.log('[Grok API] Survey generation completed successfully');
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error occurred";
        console.error('[Grok API] Error during survey generation:', message);
        await sendEvent({ type: "error", message });
      } finally {
        try {
          await writer.close();
        } catch (error) {
          console.error('[Grok API] Error closing writer:', error);
        }
      }
    })();

    // Return streaming response with proper CORS
    return new NextResponse(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
        ...getCorsHeaders(req),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to initiate Grok stream";
    console.error('[Grok API] Fatal error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS(req: NextRequest) {
  return handleCorsPreflightRequest(req);
}
