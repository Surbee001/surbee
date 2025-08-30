/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { INITIAL_SYSTEM_PROMPT, MAX_REQUESTS_PER_IP } from "@/lib/deepsite/constants";

const ipAddresses = new Map();

export async function POST(request: NextRequest) {
  const authHeaders = await headers();

  const body = await request.json();
  const { prompt, images } = body as { prompt?: string; images?: string[] };

  if ((!prompt || !prompt.trim()) && (!images || images.length === 0)) {
    return NextResponse.json(
      { ok: false, error: "Missing prompt or images" },
      { status: 400 }
    );
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return NextResponse.json(
      { ok: false, error: "OPENAI_API_KEY not configured" },
      { status: 500 }
    );
  }

  const ip = authHeaders.get("x-forwarded-for")?.includes(",")
    ? authHeaders.get("x-forwarded-for")?.split(",")[1].trim()
    : authHeaders.get("x-forwarded-for");

  // Simple IP rate-limit
  ipAddresses.set(ip, (ipAddresses.get(ip) || 0) + 1);
  if (ipAddresses.get(ip) > MAX_REQUESTS_PER_IP) {
    return NextResponse.json(
      {
        ok: false,
        message: "Rate limit exceeded. Please try again later.",
      },
      { status: 429 }
    );
  }

  try {
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    const response = new NextResponse(stream.readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });

    (async () => {
      try {
        const contentParts: any[] = [];
        if (prompt && prompt.trim()) {
          contentParts.push({ type: "text", text: prompt });
        }
        if (Array.isArray(images)) {
          for (const dataUrl of images) {
            if (typeof dataUrl === "string" && dataUrl.startsWith("data:")) {
              contentParts.push({
                type: "image_url",
                image_url: { url: dataUrl },
              });
            }
          }
        }

        const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            stream: true,
            temperature: 0.0, // coding determinism
            messages: [
              { role: "system", content: INITIAL_SYSTEM_PROMPT },
              { role: "user", content: contentParts },
            ],
            max_tokens: 8192,
          }),
        });

        if (!openaiResponse.ok) {
          const errorText = await openaiResponse.text();
          throw new Error(`OpenAI error: ${openaiResponse.status} - ${errorText}`);
        }

        const reader = openaiResponse.body?.getReader();
        if (!reader) throw new Error("Failed to get response reader");

        const decoder = new TextDecoder();
        let completeResponse = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try {
                const data = JSON.parse(line.slice(6));
                const delta = data.choices?.[0]?.delta?.content;
                if (delta) {
                  await writer.write(encoder.encode(delta));
                  completeResponse += delta;
                  if (completeResponse.toLowerCase().includes("</html>")) break;
                }
              } catch {}
            }
          }
          if (completeResponse.toLowerCase().includes("</html>")) break;
        }
      } catch (err: any) {
        await writer.write(
          encoder.encode(
            JSON.stringify({ ok: false, message: err?.message || "vision stream error" })
          )
        );
      } finally {
        await writer.close();
      }
    })();

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, message: error?.message || "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}
