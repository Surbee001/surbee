/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
// Note: avoid next/headers() dynamic API inside handlers; use request.headers
import OpenAI from "openai";
import { TransformStream } from "stream/web";
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Redirecting to use DeepSite API implementation
// This disables the original Surbee API calls and uses the imported DeepSite functionality

import {
  ENHANCED_INITIAL_SYSTEM_PROMPT as INITIAL_SYSTEM_PROMPT,
  ENHANCED_FOLLOW_UP_FULL_HTML_PROMPT as FOLLOW_UP_FULL_HTML_PROMPT,
  MAX_REQUESTS_PER_IP,
  VERBOSITY_LEVELS,
  SEARCH_START,
  DIVIDER,
  REPLACE_END,
} from "@/lib/deepsite/constants";
import { extractPatches, applyPatches } from "@/lib/deepsite/patch";
import { packContext, searchProjectContext } from "@/lib/rag";

// Switch to OpenAI for generation (streaming)

// Simple in-memory cache (LRU-ish) to reduce repeated work for common prompts
type CacheValue = { html: string; ts: number; model: string };
const CACHE_MAX = 32;
const promptCache = new Map<string, CacheValue>();

function makeCacheKey(model: string, instruction: string) {
  return `${model}::${instruction.trim().slice(0, 2000)}`; // cap to avoid huge keys
}

function getFromCache(model: string, instruction: string): string | null {
  const k = makeCacheKey(model, instruction);
  const v = promptCache.get(k);
  if (!v) return null;
  // touch for LRU behavior
  promptCache.delete(k);
  promptCache.set(k, v);
  return v.html;
}

function setCache(model: string, instruction: string, html: string) {
  const k = makeCacheKey(model, instruction);
  if (promptCache.size >= CACHE_MAX) {
    // delete oldest
    const firstKey = promptCache.keys().next().value;
    if (firstKey) promptCache.delete(firstKey);
  }
  promptCache.set(k, { html, ts: Date.now(), model });
}

const ipAddresses = new Map();

// Helper: create Responses stream with proper error handling
async function createModelStream(
  openai: OpenAI,
  args: Record<string, any>
) {
  console.log('Creating model stream with args:', {
    model: args.model,
    hasInstructions: !!args.instructions,
    hasInput: !!args.input,
    temperature: args.temperature,
    max_output_tokens: args.max_output_tokens
  });
  
  try {
    // Check if responses API exists
    if (!openai.responses || typeof openai.responses.create !== 'function') {
      console.log('Responses API not available, falling back to chat completions');
      // Fallback to chat completions
      const { instructions, input, reasoning, text, max_output_tokens, ...restArgs } = args;
      
      const messages = [];
      if (instructions) {
        messages.push({ role: 'system', content: instructions });
      }
      if (input) {
        messages.push({ role: 'user', content: input });
      }
      
      return await openai.chat.completions.create({
        ...restArgs,
        messages,
        max_tokens: max_output_tokens,
        stream: true
      });
    }
    
    // For GPT-5, handle parameters properly
    const isGPT5 = args.model && (args.model.includes('gpt-5') || args.model === 'gpt-5');
    if (isGPT5) {
      console.log('GPT-5 detected, configuring parameters');
      const { temperature, reasoning, text, ...baseArgs } = args;
      
      // Add text verbosity if specified (GPT-5 supports this)
      const gpt5Args: any = { ...baseArgs };
      if (text && text.verbosity) {
        gpt5Args.text = { verbosity: text.verbosity };
        console.log('Setting verbosity:', text.verbosity);
      }
      
      return await openai.responses.create(gpt5Args);
    }
    
    // Try Responses API with all parameters for other models
    return await openai.responses.create(args);
  } catch (e: any) {
    console.error('API error details:', {
      message: e?.message,
      status: e?.status,
      code: e?.code,
      type: e?.type,
      error: e?.error,
      hasResponsesAPI: !!openai.responses,
      fullError: JSON.stringify(e, null, 2)
    });
    
    const msg = e?.message || '';
    
    // If responses.create is not a function or doesn't exist
    if (/is not a function|Cannot read|undefined/i.test(msg) && msg.includes('responses')) {
      console.log('Responses API error, falling back to chat completions');
      const { instructions, input, reasoning, text, max_output_tokens, ...restArgs } = args;
      
      const messages = [];
      if (instructions) {
        messages.push({ role: 'system', content: instructions });
      }
      if (input) {
        messages.push({ role: 'user', content: input });
      }
      
      return await openai.chat.completions.create({
        ...restArgs,
        messages,
        max_tokens: max_output_tokens,
        stream: true
      });
    }
    
    // If the error is about unsupported parameters, retry without them
    if (/reasoning|text|verbosity|unknown parameter|unrecognized|invalid_request|temperature|Unsupported parameter/i.test(msg)) {
      console.log('Retrying without unsupported parameters (temperature, reasoning, text)...');
      const { reasoning, text, temperature, ...cleanArgs } = args as any;
      try {
        return await openai.responses.create(cleanArgs);
      } catch (retryError: any) {
        console.error('Retry failed, falling back to chat completions:', retryError?.message);
        // Final fallback to chat completions
        const { instructions, input, max_output_tokens, ...restArgs } = cleanArgs;
        
        const messages = [];
        if (instructions) {
          messages.push({ role: 'system', content: instructions });
        }
        if (input) {
          messages.push({ role: 'user', content: input });
        }
        
        return await openai.chat.completions.create({
          ...restArgs,
          messages,
          max_tokens: max_output_tokens,
          stream: true
        });
      }
    }
    
    // Re-throw other errors
    throw e;
  }
}

// Helper: extract text delta from streaming events (both Responses and Chat Completions API)
function extractTextDelta(event: any): string | null {
  if (!event) return null;
  
  try {
    // Handle string events directly
    if (typeof event === 'string') return event;
    
    // Handle Chat Completions API format
    if (event.choices && Array.isArray(event.choices) && event.choices.length > 0) {
      const delta = event.choices[0].delta;
      if (delta && delta.content) {
        return delta.content;
      }
      // Handle finish_reason
      if (event.choices[0].finish_reason === 'stop') {
        return null;
      }
    }
    
    // Handle Responses API event types
    const t = event.type as string | undefined;
    if (t) {
      // Handle delta events (streaming chunks)
      if (t === 'response.output_text.delta' || t.endsWith('.delta')) {
        if (typeof event.delta === 'string') return event.delta;
        if (event.delta && typeof event.delta.text === 'string') return event.delta.text;
        if (event.delta && Array.isArray(event.delta.text)) return event.delta.text.join('');
      }
      
      // Handle completed event
      if (t === 'response.output_text.done' || t === 'response.completed') {
        const finalText = event.response?.output_text || event.output_text;
        if (typeof finalText === 'string') return finalText;
      }
      
      // Handle simple text events
      if (typeof event.text === 'string') return event.text;
      if (typeof event.output_text === 'string') return event.output_text;
    }
    
    // Fallback: try to extract any text-like property
    if (event.delta && typeof event.delta === 'string') return event.delta;
    if (event.text && typeof event.text === 'string') return event.text;
    if (event.output_text && typeof event.output_text === 'string') return event.output_text;
  } catch (err) {
    console.error('Error extracting text delta:', err);
  }
  
  return null;
}

export async function POST(request: NextRequest) {
  const authHeaders = request.headers;

  const body = await request.json();
  const { prompt, redesignMarkdown, html, provider, model, reasonOnly, projectId, useLongContext } = body as any;

  if (!prompt && !redesignMarkdown) {
    return NextResponse.json(
      { ok: false, error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Require OpenAI API key for generation
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    return NextResponse.json(
      { ok: false, error: "OpenAI API key not configured" },
      { status: 500 }
    );
  }

  const xff = authHeaders.get("x-forwarded-for") ?? "";
  const ip = xff.split(",")[0]?.trim() || "unknown";

  // Rate limiting
  const used = ipAddresses.get(ip) ?? 0;
  if (used + 1 > MAX_REQUESTS_PER_IP) {
    return NextResponse.json(
      {
        ok: false,
        message: "Rate limit exceeded. Please try again later.",
      },
      { status: 429 }
    );
  }
  ipAddresses.set(ip, used + 1);

  try {
    // Create a stream response
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Start the response
    const response = new NextResponse(stream.readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });

    (async () => {
      try {
        // Kick off the stream immediately to avoid buffering in some proxies
        await writer.write(encoder.encode(" "));
        const userContent = redesignMarkdown
          ? `Here is my current design as a markdown:\n\n${redesignMarkdown}\n\nPlease create a new survey experience based on this markdown.`
          : html
          ? `Here is my current HTML code:\n\n\`\`\`html\n${html}\n\`\`\`\n\nPlease update or redesign this into a better survey experience.`
          : prompt;

        const openai = new OpenAI({ apiKey: openaiApiKey });
        // Prefer long-context model when available
        const preferred = (useLongContext || reasonOnly) && process.env.OPENAI_LONG_MODEL
          ? process.env.OPENAI_LONG_MODEL!
          : ((typeof model === 'string' && model.startsWith('gpt')) ? model : (process.env.OPENAI_MODEL || 'gpt-5'));
        
        console.log('Using model:', preferred);
        console.log('Environment OPENAI_MODEL:', process.env.OPENAI_MODEL);
        console.log('Request model:', model);

        // Build instruction used for both models; keep concise to reduce tokens
        const buildInstruction = `${userContent}\n\nRequirements (always apply unless overridden): Avoid AI-cliché styles (no neon/purple gradients, sparkles, AI/brain icons). Use neutral background (#f9fafb) and clean typography. Provide: Welcome page, at least 2 question pages (short text, multiple-choice, rating) with client-side validation, a visible progress indicator, smooth transitions, autosave answers to localStorage, and a Thank-you page with a subtle confetti effect. Return a single, complete HTML document only (<!DOCTYPE html> ... </html>). Use Tailwind.`;

        // Cache check
        const cached = getFromCache(preferred, buildInstruction);
        if (cached) {
          await writer.write(encoder.encode(cached));
          await writer.close();
          return;
        }

        // Optional RAG: fetch context for this project
        let ragContext = '';
        try {
          if (projectId && typeof projectId === 'string') {
            const results = await searchProjectContext(projectId, prompt || redesignMarkdown || html || '', 8);
            ragContext = packContext(results, 32000);
          }
        } catch (ragErr) {
          console.warn('RAG search failed:', ragErr);
        }

        // Phase 1: brief reasoning summary and plan (no chain-of-thought)
        await writer.write(encoder.encode("<<<PHASE:REASON_PLAN>>>\n"));
        const rpStream = await createModelStream(openai, {
          model: preferred,
          instructions: `You are a senior, friendly survey builder talking to a human. Write a short, human-facing Markdown planning note with headings and bullets. Do NOT reveal chain-of-thought. Keep it concise and clear.\n\nStructure and tone:\n- Conversational, encouraging, professional.\n- Use Markdown sections and bullets: **bold**, _italics_, lists, and short phrases.\n- Sections to include: \n  • Overview (what you'll build and why)\n  • What I'll Build (bulleted features based on the user's prompt)\n  • Design Approach (colors/spacing/ARIA/responsiveness)\n  • Implementation Plan (steps you will take)\n\nOutput protocol (strict):\n- Emit each line prefixed with THINK: or PLAN: (we use these as markers).\n- You can include Markdown headings/bullets inside those lines.\n- Example:\n  THINK: ## Overview — friendly one-liner\n  THINK: - Key outcome A\n  THINK: - Key outcome B\n  PLAN: ## Implementation Plan\n  PLAN: - Step 1...\n  PLAN: - Step 2...`,
          input: (ragContext ? `Use the following reference context when planning (do not copy verbatim, cite as inspiration):\n\n${ragContext}\n\nUser:` : 'User:') + `\n${userContent}`,
          reasoning: { effort: 'high' },
          text: { verbosity: VERBOSITY_LEVELS.PLANNING }, // Centralized verbosity
          temperature: 0.3,
          max_output_tokens: 400,
          stream: true,
        });
        for await (const event of rpStream as any) {
          const delta = extractTextDelta(event);
          if (!delta) continue;
          await writer.write(encoder.encode(delta));
        }

        // If brainstorming only (Ask mode), skip HTML generation and return summary/suggestions
        if (reasonOnly) {
          await writer.write(encoder.encode("\n<<<PHASE:SUMMARY>>>\n"));
          const tailStream = await createModelStream(openai, {
            model: preferred,
            instructions: 'You are a friendly assistant brainstorming improvements and next steps in Markdown. Do NOT reveal chain-of-thought.',
            input: (ragContext ? `Reference context:\n\n${ragContext}\n\n` : '') + 'Provide a concise brainstorming wrap-up and 3-6 NEXT suggestions. Do not reveal chain-of-thought.\n\nFormat strictly as:\nDONE: <one short sentence>\nNEXT: suggestion 1, suggestion 2, suggestion 3',
            text: { verbosity: VERBOSITY_LEVELS.SUMMARY },
            temperature: 0.3,
            max_output_tokens: 150,
            stream: true,
          });
          for await (const event of tailStream as any) {
            const delta = extractTextDelta(event);
            if (!delta) continue;
            await writer.write(encoder.encode("\n" + delta));
          }
          await writer.close();
          return;
        }

        // Phase 2: status line
        await writer.write(encoder.encode("<<<PHASE:STATUS>>> Building survey...\n"));

        // Phase 3: build full HTML
        let completeResponse = "";
        await writer.write(encoder.encode("<<<PHASE:HTML>>>\n"));
        const htmlStream = await createModelStream(openai, {
          model: preferred,
          instructions: INITIAL_SYSTEM_PROMPT,
          input: buildInstruction + "\n\nImplementation details (unless the user specifies otherwise):\n- Implement as a single-page wizard using <section data-step=\"1..N\"> blocks and toggle visibility.\n- Wire Next/Back with addEventListener after DOMContentLoaded, update a progress bar/steps, and validate before advancing.\n- Use buttons with type=\"button\" for navigation; only the final submit action should use type=\"submit\" (if using a form).\n- Avoid navigation to anchors or external pages; keep all logic in-page.",
          reasoning: { effort: 'low' },
          text: { verbosity: VERBOSITY_LEVELS.GENERATION }, // Centralized verbosity
          temperature: 0.5,
          max_output_tokens: 6144,
          stream: true,
        });
        for await (const event of htmlStream as any) {
          const delta = extractTextDelta(event);
          if (!delta) continue;
          await writer.write(encoder.encode(delta));
          completeResponse += delta;
          if (completeResponse.toLowerCase().includes("</html>")) break;
        }
        if (!completeResponse.trim()) {
          throw new Error('No response from OpenAI');
        }
        setCache(preferred, buildInstruction, completeResponse);

        // Phase 4: friendly completion + suggestions
        await writer.write(encoder.encode("\n<<<PHASE:SUMMARY>>>\n"));
        const tailStream = await createModelStream(openai, {
          model: preferred,
          instructions: 'You are a friendly survey builder presenting the result to a human in Markdown. Do NOT reveal chain-of-thought.',
          input: 'Return a short, human-facing completion message with Markdown sections:\n- Start with: DONE: Perfect! <one friendly sentence about what you created>\n- Then include sections (Markdown):\n  ### Key Features\n  - Bullet list of 3–6 highlights\n  ### Design Highlights\n  - Bullet list of 3–6 visual/UX notes (responsiveness, accessibility, tone)\n  ### Summary\n  - 1–2 sentences summarizing what it includes and the intended use\n- Finally: NEXT: suggestion 1, suggestion 2, suggestion 3 (comma-separated for parsing)\nKeep it concise, upbeat, and helpful.',
          text: { verbosity: VERBOSITY_LEVELS.SUMMARY }, // Centralized verbosity
          temperature: 0.3,
          max_output_tokens: 150,
          stream: true,
        });
        for await (const event of tailStream as any) {
          const delta = extractTextDelta(event);
          if (!delta) continue;
          await writer.write(encoder.encode("\n" + delta));
        }
      } catch (error: any) {
        console.error('Detailed error in POST:', {
          message: error?.message,
          status: error?.status,
          code: error?.code,
          type: error?.type,
          stack: error?.stack,
          response: error?.response?.data
        });
        const msg = error?.message || 'Unknown error';
        await writer.write(encoder.encode(`\n<<<PHASE:ERROR>>> ${msg}\n`));
      } finally {
        await writer?.close();
      }
    })();

    return response;
  } catch (error: any) {
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
  const authHeaders = request.headers;

  const body = await request.json();
  const { prompt, html, previousPrompt, selectedElementHtml, provider, model, reasonOnly, projectId, useLongContext } = body as any;

  if (!prompt || !html) {
    return NextResponse.json(
      { ok: false, error: "Missing required fields" },
      { status: 400 }
    );
  }

  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    return NextResponse.json(
      { ok: false, error: "OpenAI API key not configured" },
      { status: 500 }
    );
  }

  const xff = authHeaders.get("x-forwarded-for") ?? "";
  const ip = xff.split(",")[0]?.trim() || "unknown";

  const used = ipAddresses.get(ip) ?? 0;
  if (used + 1 > MAX_REQUESTS_PER_IP) {
    return NextResponse.json(
      {
        ok: false,
        message: "Rate limit exceeded. Please try again later.",
      },
      { status: 429 }
    );
  }
  ipAddresses.set(ip, used + 1);

  try {
    // Stream a FULL updated HTML document in follow-ups for real-time preview
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const response = new NextResponse(stream.readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });

    (async () => {
      try {
        const openai = new OpenAI({ apiKey: openaiApiKey });
        const preferred = (useLongContext || reasonOnly) && process.env.OPENAI_LONG_MODEL
          ? process.env.OPENAI_LONG_MODEL!
          : ((typeof model === 'string' && model.startsWith('gpt')) ? model : (process.env.OPENAI_MODEL || 'gpt-5'));
        // GPT-5 only for updates as well
        const prior = previousPrompt?.trim() || "Please update the existing document based on the user's request.";
        const followModel = preferred;

        const buildInstruction = `${prior}\n\nUser request: ${prompt}\n\nAvoid AI-cliché styles (no neon/purple gradients, sparkles, AI/brain icons). Maintain neutral background (#f9fafb), accessibility, validation, progress, and autosave. Return a single, complete updated HTML document only (<!DOCTYPE html> ... </html>).`;
        const cacheKeyBase = `${html}\n\n${selectedElementHtml || ''}`;
        const cacheKey = `${followModel}::update::${cacheKeyBase.slice(0, 1500)}::${buildInstruction.slice(0, 500)}`;
        const cached = promptCache.get(cacheKey);
        if (cached?.html) {
          await writer.write(encoder.encode(cached.html));
          await writer.close();
          return;
        }

        // Phase 1: brief reasoning summary and plan for update
        await writer.write(encoder.encode("<<<PHASE:REASON_PLAN>>>\n"));
        const rpStream = await createModelStream(openai, {
          model: followModel,
          instructions: `You are a senior, friendly survey builder talking to a human. Write a short, human-facing Markdown planning note for the requested update. Do NOT reveal chain-of-thought.\n\nStructure and tone:\n- Conversational, encouraging, professional.\n- Use Markdown sections and bullets: **bold**, _italics_, lists.\n- Sections to include: \n  • Overview (what will change and why)\n  • What I'll Update (bulleted feature changes)\n  • Implementation Plan (steps you will take)\n\nOutput protocol (strict):\n- Emit each line prefixed with THINK: or PLAN: (we use these as markers).\n- You can include Markdown headings/bullets inside those lines.\n- Example:\n  THINK: ## Overview — friendly one-liner\n  THINK: - Change A\n  PLAN: ## Implementation Plan\n  PLAN: - Step 1...\n  PLAN: - Step 2...`,
          input: prompt,
          reasoning: { effort: 'high' },
          text: { verbosity: VERBOSITY_LEVELS.PLANNING }, // Centralized verbosity
          temperature: 0.3,
          max_output_tokens: 300,
          stream: true,
        });
        for await (const event of rpStream as any) {
          const delta = extractTextDelta(event);
          if (!delta) continue;
          await writer.write(encoder.encode(delta));
        }

        // RAG for follow-ups
        let ragContext = '';
        try {
          if (projectId && typeof projectId === 'string') {
            const results = await searchProjectContext(projectId, prompt || html || previousPrompt || '', 8);
            ragContext = packContext(results, 32000);
          }
        } catch (ragErr) {
          console.warn('RAG search failed (PUT):', ragErr);
        }

        if (reasonOnly) {
          // Brainstorm-only for follow-ups: emit summary + suggestions then finish
          await writer.write(encoder.encode("\n<<<PHASE:SUMMARY>>>\n"));
          const tailStream = await createModelStream(openai, {
            model: followModel,
            instructions: 'You are a helpful assistant brainstorming update steps. Do NOT reveal chain-of-thought.',
            input: (ragContext ? `Reference context:\n\n${ragContext}\n\n` : '') + 'Provide a brief update plan and 3-6 NEXT suggestions. Do not reveal chain-of-thought.\n\nFormat strictly as:\nDONE: <one short sentence>\nNEXT: suggestion 1, suggestion 2, suggestion 3',
            text: { verbosity: VERBOSITY_LEVELS.SUMMARY },
            temperature: 0.3,
            max_output_tokens: 150,
            stream: true,
          });
          for await (const event of tailStream as any) {
            const delta = extractTextDelta(event);
            if (!delta) continue;
            await writer.write(encoder.encode("\n" + delta));
          }
          await writer.close();
          return;
        }

        await writer.write(encoder.encode("\n<<<PHASE:STATUS>>> Updating survey...\n"));

        // Fast path: minimal SEARCH/REPLACE patches first; fall back to full HTML if needed
        let usedPatched = false;
        try {
            const patchGuide = [
              'Return only minimal patches to update the HTML. Use these exact markers per block:',
              `${SEARCH_START}`,
              `${DIVIDER}`,
              `${REPLACE_END}`,
              'Multiple blocks allowed, consecutively. No extra text.'
            ].join('\n');
          const patchInput = `Current document (HTML):\n\n\`\`\`html\n${html}\n\`\`\`${selectedElementHtml ? `\n\nTarget element/subtree (optional):\n\n\`\`\`html\n${selectedElementHtml}\n\`\`\`` : ''}\n\nUser request: ${prompt}\n\n${patchGuide}`;
          const patchStream = await createModelStream(openai, {
            model: followModel,
            instructions: 'You are a precise code refactorer. Output only the minimal set of SEARCH/REPLACE patches using the provided markers. No extra text.',
            input: patchInput,
            text: { verbosity: VERBOSITY_LEVELS.SUMMARY },
            temperature: 0.2,
            max_output_tokens: 1200,
            stream: true,
          });
          let patchText = '';
          for await (const event of patchStream as any) {
            const delta = extractTextDelta(event);
            if (!delta) continue;
            patchText += delta;
          }
          const blocks = extractPatches(patchText, { searchStart: SEARCH_START, divider: DIVIDER, replaceEnd: REPLACE_END });
          if (blocks.length > 0) {
            const result = applyPatches(html, blocks);
            if (result.applied > 0) {
              await writer.write(encoder.encode("<<<PHASE:HTML>>>\n"));
              await writer.write(encoder.encode(result.html));
              if (promptCache.size >= CACHE_MAX) {
                const firstKey = promptCache.keys().next().value;
                if (firstKey) promptCache.delete(firstKey);
              }
              promptCache.set(cacheKey, { html: result.html, ts: Date.now(), model: followModel });
              usedPatched = true;
            }
          }
        } catch (patchErr) {
          // ignore and fall through
        }

        if (!usedPatched) {
          // Phase 2 fallback: stream new full HTML
          let completeResponse = "";
          await writer.write(encoder.encode("<<<PHASE:HTML>>>\n"));
          const updateStream = await createModelStream(openai, {
            model: followModel,
            instructions: FOLLOW_UP_FULL_HTML_PROMPT,
            input: `Current document (HTML):\n\n\`\`\`html\n${html}\n\`\`\`${selectedElementHtml ? `\n\nIf present, prefer updating this element/subtree: \n\n\`\`\`html\n${selectedElementHtml}\n\`\`\`` : ''}\n\nUser request: ${prompt}\n\n${buildInstruction}`,
            reasoning: { effort: 'low' },
            text: { verbosity: VERBOSITY_LEVELS.GENERATION }, // Centralized verbosity
            temperature: 0.4,
            max_output_tokens: 6144,
            stream: true,
          });
          for await (const event of updateStream as any) {
            const delta = extractTextDelta(event);
            if (!delta) continue;
            await writer.write(encoder.encode(delta));
            completeResponse += delta;
            if (completeResponse.toLowerCase().includes("</html>")) break;
          }
          if (!completeResponse.trim()) {
            throw new Error('No response from OpenAI');
          }
          if (promptCache.size >= CACHE_MAX) {
            const firstKey = promptCache.keys().next().value;
            if (firstKey) promptCache.delete(firstKey);
          }
          promptCache.set(cacheKey, { html: completeResponse, ts: Date.now(), model: followModel });
        }

        // Phase 3: brief completion + suggestions
        await writer.write(encoder.encode("\n<<<PHASE:SUMMARY>>>\n"));
        const tailStream = await createModelStream(openai, {
          model: followModel,
          instructions: 'You are a helpful assistant providing completion summary and suggestions.',
          input: 'Provide a brief completion summary and 3-6 suggestions. Do not reveal chain-of-thought.\n\nFormat strictly as:\nDONE: <one short sentence>\nNEXT: suggestion 1, suggestion 2, suggestion 3',
          text: { verbosity: VERBOSITY_LEVELS.SUMMARY }, // Centralized verbosity
          temperature: 0.3,
          max_output_tokens: 150,
          stream: true,
        });
        for await (const event of tailStream as any) {
          const delta = extractTextDelta(event);
          if (!delta) continue;
          await writer.write(encoder.encode("\n" + delta));
        }
      } catch (err: any) {
        const msg = err?.message || 'stream error';
        await writer.write(encoder.encode(`\n<<<PHASE:ERROR>>> ${msg}\n`));
      } finally {
        await writer.close();
      }
    })();

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, message: error.message || "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}

