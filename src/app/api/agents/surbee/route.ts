/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import { runWorkflow } from "@/lib/agents/surbeeWorkflow";

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
      // Early UX: emit immediate reasoning steps so UI updates right away
      await writeSSE(writer, encoder, { type: "reasoning", id: `s-${Date.now()}`, text: "Analyzing your request..." });
      await writeSSE(writer, encoder, { type: "reasoning", id: `s-${Date.now()}-c`, text: "Classifying intent (ASK vs BUILD)..." });

      // Execute workflow (non-streaming) and then emit SSE events progressively
      const onProgress = async (message: any) => { if (typeof message === "string") { await writeSSE(writer, encoder, { type: "reasoning", id: `prog-${Date.now()}-${Math.random()}`, text: message }); } }; const result = await runWorkflow({ input_as_text: input }, onProgress);
      // Emit coarse stage information to improve perceived progress
      try {
        if (result?.stage === "plan") {
          await writeSSE(writer, encoder, { type: "reasoning", id: `stage-${Date.now()}`, text: "Intent classified as ASK. Preparing plan..." });
        } else if (result?.stage === "build") {
          await writeSSE(writer, encoder, { type: "reasoning", id: `stage-${Date.now()}`, text: "Intent classified as BUILD. Generating HTML..." });
        }
      } catch { /* ignore */ }

      // Emit reasoning/message items first, skipping any HTML-like messages
      for (const item of result.items || []) {
        try {
          if (item?.type === "reasoning" && typeof item?.text === "string" && item.text.trim()) {
            // Break long reasoning into line-sized steps to simulate streaming
            const lines = (item.text as string).split(/\n+/).filter(Boolean);
            for (const line of lines) {
              const id = `r-${Math.random().toString(36).slice(2, 9)}`;
              await writeSSE(writer, encoder, { type: "reasoning", id, text: line });
            }
          } else if (item?.type === "message" && typeof item?.text === "string" && !item?.isHtml) {
            const lines = (item.text as string).split(/\n+/).filter(Boolean);
            for (const line of lines) {
              const id = `m-${Math.random().toString(36).slice(2, 9)}`;
              await writeSSE(writer, encoder, { type: "reasoning", id, text: line });
            }
          }
        } catch {
          // ignore bad item
        }
      }

      // Determine HTML source: prefer tool_result.html; fallback to result.html
      let html: string | undefined = undefined;
      for (const item of result.items || []) {
        if (item?.type === "tool_result" && typeof (item as any)?.html === "string" && (item as any).html.trim()) {
          html = (item as any).html as string;
        }
      }
      if (!html && typeof result.html === "string" && result.html.trim()) {
        html = result.html;
      }

      if (html && html.trim()) {
        // Stream HTML progressively in chunks so the client can render into iframe incrementally
        const chunks = splitIntoChunks(html, 2048);
        for (let i = 0; i < chunks.length; i++) {
          await writeSSE(writer, encoder, { type: "html_chunk", chunk: chunks[i], final: i === chunks.length - 1 });
        }
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

