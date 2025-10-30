/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

import {
  DIVIDER,
  FOLLOW_UP_SYSTEM_PROMPT,
  FOLLOW_UP_FULL_HTML_PROMPT,
  INITIAL_SYSTEM_PROMPT,
  MAX_REQUESTS_PER_IP,
  REPLACE_END,
  SEARCH_START,
} from "@/lib/prompts";

const ipAddresses = new Map();

export async function POST(request: NextRequest) {
  const authHeaders = await headers();

  const body = await request.json();
  const { prompt, redesignMarkdown, html } = body;

  if (!prompt && !redesignMarkdown) {
    return NextResponse.json(
      { ok: false, error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Check for DeepSeek API key
  const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
  console.log('DeepSeek API Key exists:', !!deepseekApiKey);
  console.log('DeepSeek API Key length:', deepseekApiKey?.length);
  console.log('DeepSeek API Key prefix:', deepseekApiKey?.substring(0, 10));
  
  if (!deepseekApiKey) {
    return NextResponse.json(
      { ok: false, error: "DeepSeek API key not configured" },
      { status: 500 }
    );
  }

  const ip = authHeaders.get("x-forwarded-for")?.includes(",")
    ? authHeaders.get("x-forwarded-for")?.split(",")[1].trim()
    : authHeaders.get("x-forwarded-for");

  // Rate limiting
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
    // Create a stream response
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Start the response
    const response = new NextResponse(stream.readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });

    (async () => {
      try {
        const userContent = redesignMarkdown
          ? `Here is my current design as a markdown:\n\n${redesignMarkdown}\n\nNow, please create a new design based on this markdown.`
          : html
          ? `Here is my current HTML code:\n\n\`\`\`html\n${html}\n\`\`\`\n\nNow, please create a new design based on this HTML.`
          : prompt;

        const deepseekResponse = await fetch("https://api.deepseek.com/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${deepseekApiKey}`,
          },
          body: JSON.stringify({
            model: "deepseek-coder",
            messages: [
              {
                role: "system",
                content: INITIAL_SYSTEM_PROMPT,
              },
              {
                role: "user",
                content: userContent,
              },
            ],
            stream: true,
            max_tokens: 4000,
            temperature: 0.0,
          }),
        });

        if (!deepseekResponse.ok) {
          const errorData = await deepseekResponse.text();
          console.error('DeepSeek API Error:', deepseekResponse.status, errorData);
          throw new Error(`DeepSeek API error: ${deepseekResponse.status} - ${errorData}`);
        }

        const reader = deepseekResponse.body?.getReader();
        if (!reader) {
          throw new Error("Failed to get response reader");
        }

        const decoder = new TextDecoder();
        let completeResponse = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const jsonStr = line.slice(6);
                const data = JSON.parse(jsonStr);
                const content = data.choices?.[0]?.delta?.content;
                
                if (content) {
                  await writer.write(encoder.encode(content));
                  completeResponse += content;

                  // Stop if we've generated a complete HTML document
                  if (completeResponse.includes("</html>")) {
                    break;
                  }
                }
              } catch (e) {
                // Skip invalid JSON lines
                continue;
              }
            }
          }

          if (completeResponse.includes("</html>")) {
            break;
          }
        }
      } catch (error: any) {
        console.error('Stream error:', error);
        await writer.write(
          encoder.encode(
            JSON.stringify({
              ok: false,
              message:
                error.message ||
                "An error occurred while processing your request.",
            })
          )
        );
      } finally {
        await writer?.close();
      }
    })();

    return response;
  } catch (error: any) {
    console.error('Route error:', error);
    return NextResponse.json(
      {
        ok: false,
        message:
          error?.message || "An error occurred while processing your request.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const authHeaders = await headers();

  const body = await request.json();
  const { prompt, html, previousPrompt, selectedElementHtml } = body;

  if (!prompt || !html) {
    return NextResponse.json(
      { ok: false, error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Check for DeepSeek API key
  const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
  console.log('DeepSeek API Key exists:', !!deepseekApiKey);
  console.log('DeepSeek API Key length:', deepseekApiKey?.length);
  console.log('DeepSeek API Key prefix:', deepseekApiKey?.substring(0, 10));
  
  if (!deepseekApiKey) {
    return NextResponse.json(
      { ok: false, error: "DeepSeek API key not configured" },
      { status: 500 }
    );
  }

  const ip = authHeaders.get("x-forwarded-for")?.includes(",")
    ? authHeaders.get("x-forwarded-for")?.split(",")[1].trim()
    : authHeaders.get("x-forwarded-for");

  // Rate limiting
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
    // Stream a FULL updated HTML document in follow-ups for real-time preview
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
        const deepseekResponse = await fetch("https://api.deepseek.com/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${deepseekApiKey}`,
          },
          body: JSON.stringify({
            model: "deepseek-coder",
            stream: true,
            messages: [
              { role: "system", content: FOLLOW_UP_FULL_HTML_PROMPT },
              {
                role: "user",
                content: previousPrompt
                  ? previousPrompt
                  : "You are modifying the HTML file based on the user's request.",
              },
              {
                role: "assistant",
                content: `Current document (HTML):\n\n\`\`\`html\n${html}\n\`\`\`${
                  selectedElementHtml
                    ? `\n\nONLY update this element if present: \n\n\`\`\`html\n${selectedElementHtml}\n\`\`\``
                    : ""
                }`,
              },
              { role: "user", content: prompt },
            ],
            max_tokens: 8192,
            temperature: 0.0,
          }),
        });

        if (!deepseekResponse.ok) {
          const errorData = await deepseekResponse.text();
          throw new Error(`DeepSeek API error: ${deepseekResponse.status} - ${errorData}`);
        }

        const reader = deepseekResponse.body?.getReader();
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
                const content = data.choices?.[0]?.delta?.content;
                if (content) {
                  await writer.write(encoder.encode(content));
                  completeResponse += content;
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
            JSON.stringify({ ok: false, message: err?.message || "stream error" })
          )
        );
      } finally {
        await writer.close();
      }
    })();

    return response;
  } catch (error: any) {
    console.error('PUT Route error:', error);
    return NextResponse.json(
      { ok: false, message: error.message || "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}