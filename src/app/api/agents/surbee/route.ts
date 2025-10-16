/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import { runWorkflow, type SerializedRunItem } from "@/lib/agents/surbeeWorkflow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type StreamEvent =
  | { type: "start" }
  | { type: "reasoning"; id: string; text: string }
  | { type: "html_chunk"; chunk: string; final?: boolean }
  | { type: "complete" }
  | { type: "error"; message: string };

function writeSSE(writer: WritableStreamDefaultWriter<Uint8Array>, encoder: TextEncoder, event: StreamEvent) {
  const line = `data: ${JSON.stringify(event)}\n\n`;
  return writer.write(encoder.encode(line));
}

function splitIntoChunks(input: string, size = 2048): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < input.length; i += size) {
    chunks.push(input.slice(i, i + size));
  }
  return chunks;
}

export async function POST(request: NextRequest) {
  const { input, images } = await request.json().catch(() => ({ input: "", images: undefined }));

  if (!input || typeof input !== "string") {
    return new Response("Missing required field 'input'", { status: 400 });
  }

  const { readable, writable } = new TransformStream();
  const encoder = new TextEncoder();
  const writer = writable.getWriter();

  (async () => {
    try {
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
      await writeSSE(writer, encoder, { type: "start" });

      // Execute workflow with live streaming callbacks - no hardcoded steps
      let streamedAny = false;
      let htmlSent = false;
      let latestHtml: string | undefined;

      const sendReasoningLines = async (text: string, prefix: string = "r") => {
        const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
        for (const line of lines) {
          const id = `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
          await writeSSE(writer, encoder, { type: "reasoning", id, text: line });
        }
      };

      const handleStreamItem = async (item: SerializedRunItem) => {
        streamedAny = true;
        if (!item) return;

        if (item.type === "reasoning" && typeof item.text === "string") {
          await sendReasoningLines(item.text, "reason");
          return;
        }

        if (item.type === "message" && typeof item.text === "string" && !item.isHtml) {
          await sendReasoningLines(item.text, "msg");
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
              await writeSSE(writer, encoder, {
                type: "html_chunk",
                chunk: chunks[i],
                final: i === chunks.length - 1,
              });
            }
            htmlSent = true;
          }
        }
      };

      const result = await runWorkflow(
        { input_as_text: input },
        {
          onProgress: async (message) => {
            if (typeof message === "string" && message.trim()) {
              streamedAny = true;
              await writeSSE(writer, encoder, {
                type: "reasoning",
                id: `prog-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                text: message.trim(),
              });
            }
          },
          onItemStream: handleStreamItem,
        }
      );

      if (!streamedAny) {
        for (const item of result.items || []) {
          try {
            if (item?.type === "reasoning" && typeof item?.text === "string" && item.text.trim()) {
              await sendReasoningLines(item.text, "reason-fallback");
            } else if (item?.type === "message" && typeof item?.text === "string" && !item?.isHtml) {
              await sendReasoningLines(item.text, "msg-fallback");
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
          await writeSSE(writer, encoder, {
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

      await writeSSE(writer, encoder, { type: "complete" });
    } catch (err: any) {
      const message = err?.message || "Agent execution error";
      await writeSSE(writer, encoder, { type: "error", message });
    } finally {
      try { await writer.close(); } catch { /* no-op */ }
    }
  })();

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

