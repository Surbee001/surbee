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

// Helper: create stream with proper API routing for GPT-5 vs GPT-5 mini
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
  
  const isGPT5Mini = args.model && args.model.includes('gpt-5-mini');
  const isGPT5 = args.model && (args.model.includes('gpt-5') && !isGPT5Mini);
  
  console.log('Model detection:', { isGPT5, isGPT5Mini, model: args.model });
  
  if (isGPT5Mini) {
    // GPT-5 mini: Use chat completions API (doesn't support responses API)
    console.log('Using chat completions API for GPT-5 mini');
    const { instructions, input, reasoning, text, max_output_tokens, temperature, ...restArgs } = args;
    
    const messages = [];
    if (instructions) {
      messages.push({ role: 'system', content: instructions });
    }
    if (input) {
      messages.push({ role: 'user', content: input });
    }
    
    // Build clean args for GPT-5 mini (remove unsupported parameters)
    const gpt5MiniArgs: any = {
      model: args.model,
      messages,
      max_completion_tokens: max_output_tokens, // GPT-5 mini uses max_completion_tokens
      stream: true
      // Note: GPT-5 mini only supports default temperature (1), so we don't include it
    };
    
    return await openai.chat.completions.create(gpt5MiniArgs);
  } else if (isGPT5) {
    // GPT-5: Use responses API with reasoning and verbosity
    console.log('Using responses API for GPT-5');
    try {
      const { instructions, input, max_output_tokens, temperature, reasoning, text, ...baseArgs } = args;
      
      // Build clean GPT-5 args (remove all unsupported parameters)
      const gpt5Args: any = { 
        model: args.model,
        input,
        instructions,
        max_output_tokens, // GPT-5 Responses API uses max_output_tokens
        stream: true
      };
      
      // Add reasoning with proper effort values
      if (reasoning && reasoning.effort) {
        // Map our effort levels to GPT-5 supported values
        const effortMap: { [key: string]: string } = {
          'high': 'high',
          'medium': 'medium', 
          'low': 'low',
          'minimal': 'minimal'
        };
        const mappedEffort = effortMap[reasoning.effort] || 'medium';
        gpt5Args.reasoning = { effort: mappedEffort };
        console.log('Setting reasoning effort:', mappedEffort);
      }
      
      // Add text verbosity with proper values  
      if (text && text.verbosity) {
        // Map our verbosity to GPT-5 supported values
        const verbosityMap: { [key: string]: string } = {
          'high': 'high',
          'medium': 'medium',
          'low': 'low'
        };
        const mappedVerbosity = verbosityMap[text.verbosity] || 'medium';
        gpt5Args.text = { verbosity: mappedVerbosity };
        console.log('Setting verbosity:', mappedVerbosity);
      }
      
      console.log('Calling GPT-5 responses API with args:', JSON.stringify(gpt5Args, null, 2));
      const result = await openai.responses.create(gpt5Args);
      console.log('GPT-5 responses API succeeded');
      return result;
    } catch (e: any) {
      console.error('GPT-5 responses API error:', e?.message, 'Full error:', e);
      console.log('Falling back to chat completions for GPT-5');
      // Fallback to chat completions if responses API fails
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
        max_completion_tokens: max_output_tokens,
        stream: true
      });
    }
  } else {
    // Other models: Default to chat completions
    console.log('Using chat completions API for other models');
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
}

// Helper: extract text delta from streaming events (both Responses and Chat Completions API)
function extractTextDelta(event: any): string | null {
  if (!event) return null;
  
  try {
    // Handle string events directly
    if (typeof event === 'string') return event;
    
    // Handle Chat Completions API format (used for GPT-5 mini)
    if (event.choices && Array.isArray(event.choices) && event.choices.length > 0) {
      const choice = event.choices[0];
      if (choice.delta && typeof choice.delta.content === 'string') {
        return choice.delta.content;
      }
      // Handle finish_reason
      if (choice.finish_reason === 'stop') {
        return null;
      }
    }
    
    // Handle Responses API event types (used for GPT-5)
    const eventType = event.type as string | undefined;
    if (eventType) {
      // Handle delta events (streaming chunks from GPT-5 responses API)
      if (eventType === 'response.output_text.delta' || eventType.endsWith('.delta')) {
        if (typeof event.delta === 'string') return event.delta;
        if (event.delta && typeof event.delta.text === 'string') return event.delta.text;
        if (event.delta && Array.isArray(event.delta.text)) return event.delta.text.join('');
        // Handle nested delta structure
        if (event.delta && event.delta.output_text && typeof event.delta.output_text === 'string') {
          return event.delta.output_text;
        }
      }
      
      // Handle completed event from responses API
      if (eventType === 'response.output_text.done' || eventType === 'response.completed') {
        const finalText = event.response?.output_text || event.output_text;
        if (typeof finalText === 'string') return finalText;
      }
      
      // Handle direct text events
      if (typeof event.text === 'string') return event.text;
      if (typeof event.output_text === 'string') return event.output_text;
    }
    
    // Fallback: try to extract any text-like property
    if (event.delta && typeof event.delta === 'string') return event.delta;
    if (event.text && typeof event.text === 'string') return event.text;
    if (event.output_text && typeof event.output_text === 'string') return event.output_text;
    
    // Handle potential nested structures
    if (event.data && typeof event.data === 'string') return event.data;
    if (event.content && typeof event.content === 'string') return event.content;
    
  } catch (err) {
    console.error('Error extracting text delta:', err, 'Event:', JSON.stringify(event, null, 2));
  }
  
  return null;
}

export async function POST(request: NextRequest) {
  const authHeaders = request.headers;

  const body = await request.json();
  const { prompt, redesignMarkdown, html, provider, model, reasonOnly, projectId, useLongContext, chatSummary } = body as any;
  console.log('[ask-ai][POST] received', {
    hasPrompt: !!prompt, hasMarkdown: !!redesignMarkdown, provider, model, reasonOnly, projectId: typeof projectId === 'string', useLongContext,
  });

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
        // Resolve models for planning vs building
        const longModel = process.env.OPENAI_LONG_MODEL || '';
        const planModel = ((useLongContext || reasonOnly) && longModel)
          ? longModel!
          : (process.env.OPENAI_PLAN_MODEL || 'gpt-5');

        // Force GPT-5 mini for building (better rate limits as requested by user)
        // Keep GPT-5 for planning only
        const envBuilderModel = process.env.OPENAI_BUILDER_MODEL;
        const builderModel = envBuilderModel || 'gpt-5-mini'; // Always use mini unless env override

        console.log('[ask-ai][POST] Using models => planModel:', planModel, 'builderModel:', builderModel);
        console.log('[ask-ai][POST] Model selection rationale:', {
          envPlanModel: process.env.OPENAI_PLAN_MODEL,
          envBuilderModel: process.env.OPENAI_BUILDER_MODEL,
          requestModel: model,
          promptLength: prompt?.length || 0,
          builderReason: envBuilderModel ? 'env override' : 'forced mini for better rate limits'
        });

        // Build instruction used for both models; keep concise to reduce tokens
        const buildInstruction = `${userContent}\n\nRequirements (always apply unless overridden): Avoid AI-cliché styles (no neon/purple gradients, sparkles, AI/brain icons). Use neutral background (#f9fafb) and clean typography. Provide: Welcome page, at least 2 question pages (short text, multiple-choice, rating) with client-side validation, a visible progress indicator, smooth transitions, autosave answers to localStorage, and a Thank-you page with a subtle confetti effect. Return a single, complete HTML document only (<!DOCTYPE html> ... </html>). Use Tailwind.`;

        // Cache check
        const cached = getFromCache(builderModel, buildInstruction);
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

        // Bound the chat summary to keep prompts efficient
        const chatSum = (typeof chatSummary === 'string' ? chatSummary.trim() : '');
        const boundedChatSum = chatSum ? chatSum.slice(-4000) : '';

        // Phase 1: brief reasoning summary and plan (no chain-of-thought)
        await writer.write(encoder.encode("<<<PHASE:REASON_PLAN>>>\n"));
        console.log('[ask-ai][POST] starting planning stream');
        let planningNote = "";
        const rpStream = await createModelStream(openai, {
          model: planModel,
          instructions: `You are a senior, friendly survey builder talking to a human. Write a short, human-facing Markdown planning note with headings and bullets. Do NOT reveal chain-of-thought. Keep it concise and clear.\n\nStructure and tone:\n- Conversational, encouraging, professional.\n- Use Markdown sections and bullets: **bold**, _italics_, lists, and short phrases.\n- Sections to include: \n  • Overview (what you'll build and why)\n  • What I'll Build (bulleted features based on the user's prompt)\n  • Design Approach (colors/spacing/ARIA/responsiveness)\n  • Implementation Plan (steps you will take)\n\nOutput protocol (strict):\n- Emit each line prefixed with THINK: or PLAN: (we use these as markers).\n- You can include Markdown headings/bullets inside those lines.\n- Example:\n  THINK: ## Overview — friendly one-liner\n  THINK: - Key outcome A\n  THINK: - Key outcome B\n  PLAN: ## Implementation Plan\n  PLAN: - Step 1...\n  PLAN: - Step 2...`,
          input:
            (ragContext ? `Use the following reference context when planning (do not copy verbatim, cite as inspiration):\n\n${ragContext}\n\n` : '') +
            (boundedChatSum ? `Conversation summary (recent turns):\n${boundedChatSum}\n\n` : '') +
            `User:\n${userContent}`,
          reasoning: { effort: 'high' },
          text: { verbosity: VERBOSITY_LEVELS.PLANNING }, // Centralized verbosity
          temperature: 0.2,
          max_output_tokens: 800,
          stream: true,
        });
        for await (const event of rpStream as any) {
          const delta = extractTextDelta(event);
          if (!delta) continue;
          await writer.write(encoder.encode(delta));
          planningNote += delta;
        }

        // If brainstorming only (Ask mode), skip HTML generation and return summary/suggestions
        if (reasonOnly) {
          await writer.write(encoder.encode("\n<<<PHASE:SUMMARY>>>\n"));
          const tailStream = await createModelStream(openai, {
            model: planModel,
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
        console.log('[ask-ai][POST] starting HTML build stream');
        const htmlStream = await createModelStream(openai, {
          model: builderModel,
          instructions: INITIAL_SYSTEM_PROMPT,
          input: `User request:\n${userContent}\n\nReference plan (do not repeat; follow it):\n${planningNote.slice(0, 4000)}\n${boundedChatSum ? `\nConversation summary (optional):\n${boundedChatSum}\n` : ''}\nImplementation details (unless the user specifies otherwise):\n- Implement as a single-page wizard using <section data-step=\"1..N\"> blocks and toggle visibility.\n- Wire Next/Back with addEventListener after DOMContentLoaded, update a progress bar/steps, and validate before advancing.\n- Use buttons with type=\"button\" for navigation; only the final submit action should use type=\"submit\" (if using a form).\n- Avoid navigation to anchors or external pages; keep all logic in-page.`,
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
          // Fallback: try rendering with the planning model if builder returned nothing
          console.warn('Builder model returned empty response; retrying with planModel for HTML');
          let fallbackResponse = "";
          const htmlStream2 = await createModelStream(openai, {
            model: planModel,
            instructions: INITIAL_SYSTEM_PROMPT,
            input: `User request:\n${userContent}\n\nReference plan (do not repeat; follow it):\n${planningNote.slice(0, 4000)}\n${boundedChatSum ? `\nConversation summary (optional):\n${boundedChatSum}\n` : ''}\nImplementation details (unless the user specifies otherwise):\n- Implement as a single-page wizard using <section data-step=\"1..N\"> blocks and toggle visibility.\n- Wire Next/Back with addEventListener after DOMContentLoaded, update a progress bar/steps, and validate before advancing.\n- Use buttons with type=\"button\" for navigation; only the final submit action should use type=\"submit\" (if using a form).\n- Avoid navigation to anchors or external pages; keep all logic in-page.`,
            text: { verbosity: VERBOSITY_LEVELS.GENERATION },
            temperature: 0.4,
            max_output_tokens: 6144,
            stream: true,
          });
          for await (const event of htmlStream2 as any) {
            const delta = extractTextDelta(event);
            if (!delta) continue;
            await writer.write(encoder.encode(delta));
            fallbackResponse += delta;
            if (fallbackResponse.toLowerCase().includes("</html>")) break;
          }
          completeResponse = fallbackResponse;
        }
        if (!completeResponse.trim()) throw new Error('No response from OpenAI');
        setCache(builderModel, buildInstruction, completeResponse);

        // Phase 4: friendly completion + suggestions
        await writer.write(encoder.encode("\n<<<PHASE:SUMMARY>>>\n"));
        const tailStream = await createModelStream(openai, {
          model: builderModel,
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
  const { prompt, html, previousPrompt, selectedElementHtml, provider, model, reasonOnly, projectId, useLongContext, chatSummary } = body as any;
  console.log('[ask-ai][PUT] received', {
    hasPrompt: !!prompt, hasHtml: !!html, hasPrev: !!previousPrompt, hasSel: !!selectedElementHtml, provider, model, reasonOnly, projectId: typeof projectId === 'string', useLongContext,
  });

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
        // Resolve models for updates: plan vs build
        const longModel2 = process.env.OPENAI_LONG_MODEL || '';
        const followPlanModel = ((useLongContext || reasonOnly) && longModel2)
          ? longModel2!
          : (process.env.OPENAI_PLAN_MODEL || 'gpt-5');

        // Force GPT-5 mini for building updates (better rate limits as requested by user)
        // Keep GPT-5 for planning only
        const envBuilderModel = process.env.OPENAI_BUILDER_MODEL;
        const followBuildModel = envBuilderModel || 'gpt-5-mini'; // Always use mini unless env override
        const prior = previousPrompt?.trim() || "Please update the existing document based on the user's request.";
        const followModel = followBuildModel;

        console.log('[ask-ai][PUT] Using models => planModel:', followPlanModel, 'builderModel:', followBuildModel);
        console.log('[ask-ai][PUT] Model selection rationale:', {
          envPlanModel: process.env.OPENAI_PLAN_MODEL,
          envBuilderModel: process.env.OPENAI_BUILDER_MODEL,
          promptLength: prompt?.length || 0,
          builderReason: envBuilderModel ? 'env override' : 'forced mini for better rate limits'
        });

        const buildInstruction = `${prior}\n\nUser request: ${prompt}\n\nAvoid AI-cliché styles (no neon/purple gradients, sparkles, AI/brain icons). Maintain neutral background (#f9fafb), accessibility, validation, progress, and autosave. Return a single, complete updated HTML document only (<!DOCTYPE html> ... </html>).`;
        const cacheKeyBase = `${html}\n\n${selectedElementHtml || ''}`;
        const cacheKey = `${followModel}::update::${cacheKeyBase.slice(0, 1500)}::${buildInstruction.slice(0, 500)}`;
        const cached = promptCache.get(cacheKey);
        if (cached?.html) {
          await writer.write(encoder.encode(cached.html));
          await writer.close();
          return;
        }

        // RAG for follow-ups - initialize before use
        let ragContext = '';
        try {
          if (projectId && typeof projectId === 'string') {
            const results = await searchProjectContext(projectId, prompt || html || previousPrompt || '', 8);
            ragContext = packContext(results, 32000);
          }
        } catch (ragErr) {
          console.warn('RAG search failed (PUT):', ragErr);
        }

        // Phase 1: brief reasoning summary and plan for update
        await writer.write(encoder.encode("<<<PHASE:REASON_PLAN>>>\n"));
        let planningNote2 = "";
        console.log('[ask-ai][PUT] starting update planning stream');
        const rpStream = await createModelStream(openai, {
          model: followPlanModel,
          instructions: `You are a senior, friendly survey builder talking to a human. Write a short, human-facing Markdown planning note for the requested update. Do NOT reveal chain-of-thought.\n\nStructure and tone:\n- Conversational, encouraging, professional.\n- Use Markdown sections and bullets: **bold**, _italics_, lists.\n- Sections to include: \n  • Overview (what will change and why)\n  • What I'll Update (bulleted feature changes)\n  • Implementation Plan (steps you will take)\n\nOutput protocol (strict):\n- Emit each line prefixed with THINK: or PLAN: (we use these as markers).\n- You can include Markdown headings/bullets inside those lines.\n- Example:\n  THINK: ## Overview — friendly one-liner\n  THINK: - Change A\n  PLAN: ## Implementation Plan\n  PLAN: - Step 1...\n  PLAN: - Step 2...`,
          input:
            (ragContext ? `Reference context (for updates):\n\n${ragContext}\n\n` : '') +
            ((typeof chatSummary === 'string' && chatSummary.trim()) ? `Conversation summary (recent turns):\n${chatSummary.trim().slice(-4000)}\n\n` : '') +
            `User request: ${prompt}`,
          reasoning: { effort: 'high' },
          text: { verbosity: VERBOSITY_LEVELS.PLANNING }, // Centralized verbosity
          temperature: 0.2,
          max_output_tokens: 600,
          stream: true,
        });
        for await (const event of rpStream as any) {
          const delta = extractTextDelta(event);
          if (!delta) continue;
          await writer.write(encoder.encode(delta));
          planningNote2 += delta;
        }

        if (reasonOnly) {
          // Brainstorm-only for follow-ups: emit summary + suggestions then finish
          await writer.write(encoder.encode("\n<<<PHASE:SUMMARY>>>\n"));
          const tailStream = await createModelStream(openai, {
            model: followPlanModel,
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

        // Skip patches for complex requests - go straight to full HTML
        const isComplexRequest = prompt && (
          prompt.length > 1000 || 
          prompt.toLowerCase().includes('create a new') ||
          prompt.toLowerCase().includes('build a new') ||
          prompt.toLowerCase().includes('design a new') ||
          prompt.toLowerCase().includes('completely redesign') ||
          prompt.toLowerCase().includes('start over') ||
          prompt.toLowerCase().includes('from scratch')
        );
        
        console.log('[ask-ai][PUT] Request complexity check:', { 
          promptLength: prompt?.length, 
          isComplexRequest, 
          strategy: isComplexRequest ? 'full HTML' : 'patches first' 
        });

        // Fast path: minimal SEARCH/REPLACE patches first; fall back to full HTML if needed
        let usedPatched = false;
        if (!isComplexRequest) {
          try {
            const patchGuide = [
              'Return only minimal patches to update the HTML. Use these exact markers per block:',
              `${SEARCH_START}`,
              `${DIVIDER}`,
              `${REPLACE_END}`,
              'Multiple blocks allowed, consecutively. No extra text.'
            ].join('\n');
          const patchInput = `Current document (HTML):\n\n\`\`\`html\n${html}\n\`\`\`${selectedElementHtml ? `\n\nTarget element/subtree (optional):\n\n\`\`\`html\n${selectedElementHtml}\n\`\`\`` : ''}\n\nUser request: ${prompt}\n${(typeof chatSummary === 'string' && chatSummary.trim()) ? `\nConversation summary (optional):\n${chatSummary.trim().slice(-2000)}\n` : ''}\nReference plan:\n${planningNote2.slice(0,1200)}\n\n${patchGuide}`;
          console.log('[ask-ai][PUT] attempting minimal patch stream');
          const patchStream = await createModelStream(openai, {
            model: followBuildModel,
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
              promptCache.set(cacheKey, { html: result.html, ts: Date.now(), model: followBuildModel });
              usedPatched = true;
            }
          }
          } catch (patchErr) {
            // ignore and fall through
          }
        } // end if (!isComplexRequest)

        if (!usedPatched) {
          // Phase 2 fallback: stream new full HTML
          let completeResponse = "";
          await writer.write(encoder.encode("<<<PHASE:HTML>>>\n"));
          console.log('[ask-ai][PUT] starting full HTML update stream');
          const updateStream = await createModelStream(openai, {
            model: followBuildModel,
            instructions: FOLLOW_UP_FULL_HTML_PROMPT,
            input: `Current document (HTML):\n\n\`\`\`html\n${html}\n\`\`\`${selectedElementHtml ? `\n\nIf present, prefer updating this element/subtree: \n\n\`\`\`html\n${selectedElementHtml}\n\`\`\`` : ''}\n\nUser request: ${prompt}\n\nPrior instruction: ${prior}\n${(typeof chatSummary === 'string' && chatSummary.trim()) ? `\nConversation summary (optional):\n${chatSummary.trim().slice(-4000)}\n` : ''}\nReference plan:\n${planningNote2.slice(0, 4000)}`,
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
            // Fallback: retry full HTML with planning model if builder returned nothing
            console.warn('Follow-up build returned empty; retrying with plan model');
            let fallback2 = "";
            const updateStream2 = await createModelStream(openai, {
              model: followPlanModel,
              instructions: FOLLOW_UP_FULL_HTML_PROMPT,
              input: `Current document (HTML):\n\n\`\`\`html\n${html}\n\`\`\`${selectedElementHtml ? `\n\nIf present, prefer updating this element/subtree: \n\n\`\`\`html\n${selectedElementHtml}\n\`\`\`` : ''}\n\nUser request: ${prompt}\n\nPrior instruction: ${prior}\n${(typeof chatSummary === 'string' && chatSummary.trim()) ? `\nConversation summary (optional):\n${chatSummary.trim().slice(-4000)}\n` : ''}\nReference plan:\n${planningNote2.slice(0, 4000)}`,
              text: { verbosity: VERBOSITY_LEVELS.GENERATION },
              temperature: 0.3,
              max_output_tokens: 6144,
              stream: true,
            });
            for await (const event of updateStream2 as any) {
              const delta = extractTextDelta(event);
              if (!delta) continue;
              await writer.write(encoder.encode(delta));
              fallback2 += delta;
              if (fallback2.toLowerCase().includes("</html>")) break;
            }
            completeResponse = fallback2;
            if (!completeResponse.trim()) throw new Error('No response from OpenAI');
          }
          if (promptCache.size >= CACHE_MAX) {
            const firstKey = promptCache.keys().next().value;
            if (firstKey) promptCache.delete(firstKey);
          }
          promptCache.set(cacheKey, { html: completeResponse, ts: Date.now(), model: followBuildModel });
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


