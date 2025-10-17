/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import { runWorkflow, type SerializedRunItem } from "@/lib/agents/surbeeWorkflow";

// Increase max listeners to prevent warnings during streaming
import { EventEmitter } from 'events';
EventEmitter.defaultMaxListeners = 20;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type StreamEvent =
  | { type: "start" }
  | { type: "reasoning"; id: string; text: string }
  | { type: "message"; id: string; text: string }
  | { type: "tool_call"; name: string; arguments: unknown }
  | { type: "thinking_control"; action: "open" | "close" }
  | { type: "html_chunk"; chunk: string; final?: boolean }
  | { type: "complete" }
  | { type: "error"; message: string }
  | { type: "batch"; events: StreamEvent[] };

function writeSSE(writer: WritableStreamDefaultWriter<Uint8Array>, encoder: TextEncoder, event: StreamEvent) {
  const line = `data: ${JSON.stringify(event)}\n\n`;
  return writer.write(encoder.encode(line));
}

// Batching for performance optimization
class SSEBatcher {
  private eventBuffer: StreamEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private readonly batchDelay = 50; // ms
  private isClosed = false;

  constructor(
    private writer: WritableStreamDefaultWriter<Uint8Array>,
    private encoder: TextEncoder
  ) {}

  async addEvent(event: StreamEvent) {
    if (this.isClosed) return; // Don't add events after closing

    try {
      // Critical events flush immediately
      if (event.type === 'html_chunk' || event.type === 'complete' || event.type === 'error' || event.type === 'start') {
        await this.flush();
        await writeSSE(this.writer, this.encoder, event);
        return;
      }

      // Batch reasoning and message events
      this.eventBuffer.push(event);

      if (!this.flushTimer) {
        this.flushTimer = setTimeout(() => {
          this.flush().catch(() => {
            // Flush errors are already handled in flush() method
          });
        }, this.batchDelay);
      }
    } catch (error: any) {
      // Check if it's an abort/close error
      const isAbortError = error?.name === 'AbortError' || 
                          error?.code === 'ERR_INVALID_STATE' ||
                          error?.message?.includes('aborted') ||
                          error?.message?.includes('closed');
      
      if (!isAbortError) {
        console.error('[Batcher addEvent error]:', error?.message || error);
      }
      this.isClosed = true;
    }
  }

  async flush() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.eventBuffer.length === 0 || this.isClosed) return;

    try {
      // Send batch
      if (this.eventBuffer.length === 1) {
        // Single event, send directly
        await writeSSE(this.writer, this.encoder, this.eventBuffer[0]);
      } else {
        // Multiple events, send as batch
        await writeSSE(this.writer, this.encoder, {
          type: 'batch',
          events: this.eventBuffer,
        });
      }

      this.eventBuffer = [];
    } catch (error: any) {
      // Mark as closed if we can't write
      this.isClosed = true;
      
      // Only log non-abort errors (abort errors are expected when client disconnects)
      const isAbortError = error?.name === 'AbortError' || 
                          error?.code === 'ERR_INVALID_STATE' ||
                          error?.message?.includes('aborted') ||
                          error?.message?.includes('closed');
      
      if (!isAbortError) {
        console.error('[Batcher flush error]:', error?.message || error);
      }
      // Don't re-throw - just mark as closed and continue
    }
  }

  async close() {
    if (this.isClosed) return;
    
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    
    try {
      await this.flush();
    } catch (error: any) {
      // All errors are already handled in flush() - just mark as closed
    } finally {
      this.isClosed = true;
    }
  }
}

function splitIntoChunks(input: string, size = 2048): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < input.length; i += size) {
    chunks.push(input.slice(i, i + size));
  }
  return chunks;
}

export async function POST(request: NextRequest) {
  console.log('[API] POST request received');
  const { input, images } = await request.json().catch(() => ({ input: "", images: undefined }));
  console.log('[API] Input:', input?.substring(0, 100));

  if (!input || typeof input !== "string") {
    console.log('[API] Missing input, returning 400');
    return new Response("Missing required field 'input'", { status: 400 });
  }

  const { readable, writable } = new TransformStream();
  const encoder = new TextEncoder();
  const writer = writable.getWriter();

  // Track if request was aborted
  let isAborted = false;
  const abortController = new AbortController();

  // Listen for client disconnect
  request.signal.addEventListener('abort', () => {
    isAborted = true;
    abortController.abort();
    console.log('[Client disconnected - aborting workflow]');
  });
  
  console.log('[API] Starting workflow execution...');

  // Execute workflow in async IIFE with proper error handling
  const workflowPromise = (async () => {
    const batcher = new SSEBatcher(writer, encoder);
    
    try {
      // Check if already aborted
      if (isAborted) {
        console.log('[Request already aborted before start]');
        return;
      }

      console.log('[API] Sending start event...');
      // Kick off stream and send a start event immediately
      await writer.write(
        encoder.encode(
          [
            "retry: 1500\n",
            "event: open\n",
            `data: ${JSON.stringify({ ok: true })}\n\n`,
          ].join("")
        )
      );
      await batcher.addEvent({ type: "start" });
      console.log('[API] Start event sent');

      // Execute workflow with live streaming callbacks - no hardcoded steps
      let streamedAny = false;
      let htmlSent = false;
      let latestHtml: string | undefined;

      const sendReasoningLines = async (text: string, prefix: string = "r") => {
        if (isAborted) return; // Don't send if aborted
        console.log('[API] Sending reasoning lines:', text.substring(0, 50));
        const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
        for (const line of lines) {
          if (isAborted) break; // Stop mid-iteration if aborted
          const id = `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
          await batcher.addEvent({ type: "reasoning", id, text: line });
        }
      };

      const handleStreamItem = async (item: SerializedRunItem) => {
        if (isAborted) return; // Don't process if aborted
        streamedAny = true;
        if (!item) return;

        if (item.type === "reasoning" && typeof item.text === "string") {
          await sendReasoningLines(item.text, "reason");
          return;
        }

        if (item.type === "message" && typeof item.text === "string" && !item.isHtml) {
          // Send messages as proper message events, not reasoning
          const id = `msg-${Math.random().toString(36).slice(2, 9)}`;
          await batcher.addEvent({ type: "message", id, text: item.text });
          return;
        }

        if (item.type === "tool_call") {
          // Send tool_call events so UI knows when building starts
          await batcher.addEvent({ 
            type: "tool_call", 
            name: item.name,
            arguments: item.arguments 
          });
          return;
        }

        if ((item as any).type === "thinking_control") {
          // Send thinking control events to manage UI state
          await batcher.addEvent({ 
            type: "thinking_control", 
            action: (item as any).action 
          } as any);
          return;
        }

        if (item.type === "tool_result") {
          const htmlCandidate =
            typeof item.html === "string" && item.html.trim()
              ? item.html
              : typeof item.output === "string" && item.output.trim()
                ? item.output
                : undefined;
          if (htmlCandidate && !htmlSent) {
            latestHtml = htmlCandidate;
            const chunks = splitIntoChunks(htmlCandidate, 2048);
            for (let i = 0; i < chunks.length; i++) {
              await batcher.addEvent({
                type: "html_chunk",
                chunk: chunks[i],
                final: i === chunks.length - 1,
              });
            }
            htmlSent = true;
          }
        }
      };

      console.log('[API] Calling runWorkflow...');
      let result;
      try {
        result = await runWorkflow(
          { input_as_text: input },
          {
            onProgress: async (message) => {
              if (isAborted) return; // Don't process if aborted
              console.log('[API] onProgress:', message?.substring(0, 50));
              if (typeof message === "string" && message.trim()) {
                streamedAny = true;
                await batcher.addEvent({
                  type: "reasoning",
                  id: `prog-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                  text: message.trim(),
                });
              }
            },
            onItemStream: handleStreamItem,
          }
        );
      } catch (workflowError: any) {
        console.error('[API] Workflow execution error:', workflowError);
        console.error('[API] Error message:', workflowError?.message);
        console.error('[API] Error code:', workflowError?.code);
        console.error('[API] Error type:', workflowError?.type);
        throw workflowError;
      }
      
      console.log('[API] Workflow completed. Stage:', result?.stage, 'StreamedAny:', streamedAny);
      
      // Check if aborted after workflow completes
      if (isAborted) {
        console.log('[Workflow completed but request was aborted - skipping post-processing]');
        return;
      }

      if (!streamedAny) {
        for (const item of result.items || []) {
          try {
            if (item?.type === "reasoning" && typeof item?.text === "string" && item.text.trim()) {
              await sendReasoningLines(item.text, "reason-fallback");
            } else if (item?.type === "message" && typeof item?.text === "string" && !item?.isHtml) {
              const id = `msg-fallback-${Math.random().toString(36).slice(2, 9)}`;
              await batcher.addEvent({ type: "message", id, text: item.text });
            }
          } catch {
            // ignore bad item
          }
        }
      }

      // Determine HTML source: prefer tool_result.html; fallback to result.html
      let html: string | undefined = latestHtml;
      if (!html) {
        for (const item of result.items || []) {
          if (item?.type === "tool_result" && typeof (item as any)?.html === "string" && (item as any).html.trim()) {
            html = (item as any).html as string;
          }
        }
      }
      if (!html && typeof result.html === "string" && result.html.trim()) {
        html = result.html;
      }

      if (html && !htmlSent) {
        const chunks = splitIntoChunks(html, 2048);
        for (let i = 0; i < chunks.length; i++) {
          await batcher.addEvent({
            type: "html_chunk",
            chunk: chunks[i],
            final: i === chunks.length - 1,
          });
        }
        htmlSent = true;
        latestHtml = html;
      } else if (!latestHtml && html) {
        latestHtml = html;
      }

      // Only send complete event if not aborted
      if (!isAborted) {
        console.log('[API] Sending complete event...');
        await batcher.addEvent({ type: "complete" });
        console.log('[API] Complete event sent');
      }
    } catch (err: any) {
      // Check if it's an abort error
      const isAbortError = err?.name === 'AbortError' || 
                          err?.code === 'ERR_INVALID_STATE' ||
                          err?.message?.includes('aborted') ||
                          err?.message?.includes('closed') ||
                          isAborted;
      
      if (!isAbortError) {
        const message = err?.message || "Agent execution error";
        console.error('[API Route Error]', err);
        console.error('[API Route Error Stack]', err?.stack);
        try {
          await batcher.addEvent({ type: "error", message });
        } catch (sendError) {
          // Connection may already be closed - ignore
          console.log('[Could not send error event - connection closed]');
        }
      } else {
        console.log('[Workflow aborted by client disconnect]');
      }
    } finally {
      console.log('[API] Cleaning up...');
      await batcher.close();
      try { 
        await writer.close(); 
      } catch (closeError) { 
        // Ignore all close errors - connection may already be closed
      }
      console.log('[API] Cleanup complete');
    }
  })();
  
  // Handle any unhandled rejections from the workflow (shouldn't happen, but just in case)
  workflowPromise.catch(() => {
    // Errors are already handled in the try-catch above
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

