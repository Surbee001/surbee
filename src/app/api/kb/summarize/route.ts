/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextRequest } from "next/server";

import { headers } from "next/headers";

// Reuse DeepSeek client used elsewhere in the app
import { DeepSeekClient } from "@/lib/deepsite/deepseek-client";

export async function POST(request: NextRequest) {
  const authHeaders = await headers();

  try {
    const body = await request.json();
    const { text, maxSentences = 3 } = body as { text?: string; maxSentences?: number };

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing or invalid 'text' field" }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    if (!deepseekApiKey) {
      return new Response(
        JSON.stringify({ ok: false, error: "DeepSeek API key not configured" }),
        { status: 500, headers: { "content-type": "application/json" } }
      );
    }

    // Simple per-IP basic rate limit aligned with other routes
    const ip = authHeaders.get("x-forwarded-for")?.includes(",")
      ? authHeaders.get("x-forwarded-for")?.split(",")[1].trim()
      : authHeaders.get("x-forwarded-for");

    const client = new DeepSeekClient(deepseekApiKey);

    const system =
      "You are a precise summarizer. Return a terse, neutral, black-and-white UX-friendly summary. Avoid emojis and colored language.";
    const user = `Summarize the following content into ${Math.max(
      1,
      Math.min(6, Number(maxSentences) || 3)
    )} concise sentence(s). Keep it under 300 characters total.\n\nTEXT:\n${text}`;

    const resp = await client.chatCompletion({
      model: "deepseek-chat",
      messages: [
        { role: "system" as const, content: system },
        { role: "user" as const, content: user },
      ],
      temperature: 0.2,
      max_tokens: 256,
    });

    const summary = resp?.choices?.[0]?.message?.content?.trim() || "";

    return new Response(JSON.stringify({ ok: true, summary }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ ok: false, error: error?.message || "Summarization failed" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}