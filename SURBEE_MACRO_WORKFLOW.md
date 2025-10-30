# Surbee Macro Workflow - Vercel AI SDK Integration

## Overview

This document outlines the macro-level workflow architecture for Surbee and how to integrate Vercel's AI SDK for flexible model support while maintaining the same workflow structure.

---

## Why Vercel AI SDK?

**Benefits:**
- **Model-agnostic:** Support for OpenAI, Anthropic, XAI, Google, Mistral, and more
- **Consistent API:** Same interface across all providers
- **Built-in streaming:** Native support for SSE and streaming responses
- **Type-safe:** Full TypeScript support with proper types
- **Tool calling:** Unified tool/function calling across models
- **React hooks:** `useChat`, `useCompletion` for easy UI integration

**Current Stack:**
- `ai`: v5.0.81 (core SDK)
- `@ai-sdk/react`: v2.0.81 (React hooks)
- `openai`: v6.3.0 (existing)

---

## Macro Workflow Pattern

### Current OpenAI Agents Pattern

```typescript
// src/lib/agents/surbeeWorkflow.ts (current)
import { Agent, Runner } from "@openai/agents";

const agent = new Agent({
  name: "PromptOptimizer",
  model: "gpt-5-mini",
  instructions: "Enhance user input...",
});

const result = await agent.run(input);
```

### New Vercel AI SDK Pattern

```typescript
// Using generateText for simple responses
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = await generateText({
  model: openai('gpt-5'),
  messages: [
    { role: 'system', content: 'Enhance user input...' },
    { role: 'user', content: input }
  ],
});
```

---

## Workflow Stages with Vercel AI SDK

### Stage 1: Prompt Optimization

**Current:** `PromptOptimizer` agent with gpt-5-mini

**New Implementation:**
```typescript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

async function optimizePrompt(userInput: string) {
  const result = await generateText({
    model: openai('gpt-5-mini'),
    system: `You are a prompt enhancement specialist.
    Your job is to clarify and enhance user prompts
    while maintaining their original intent.`,
    messages: [
      { role: 'user', content: userInput }
    ],
  });

  return result.text;
}
```

### Stage 2: Guardrails Check

**Current:** OpenAI Guardrails API

**New Implementation:**
```typescript
// Keep existing OpenAI Guardrails
// OR implement custom guardrails with generateText
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

async function checkSafety(input: string) {
  const result = await generateText({
    model: openai('gpt-5-mini'),
    system: `Analyze this input for safety concerns:
    - PII (personal identifiable information)
    - Inappropriate content
    - Jailbreak attempts
    Return JSON: { safe: boolean, reason?: string }`,
    messages: [{ role: 'user', content: input }],
  });

  return JSON.parse(result.text);
}
```

### Stage 3: Intent Categorization

**Current:** `Categorize` agent

**New Implementation:**
```typescript
async function categorizeIntent(
  input: string,
  history: Array<{ role: string; content: string }>
) {
  const result = await generateText({
    model: openai('gpt-5-mini'),
    system: `Categorize user intent as either:
    - ASK: Planning, brainstorming, discussion (no code generation)
    - BUILD: Creating actual survey code and components

    Return JSON: { mode: "ASK" | "BUILD", reasoning: string }`,
    messages: [
      ...history,
      { role: 'user', content: input }
    ],
  });

  return JSON.parse(result.text);
}
```

### Stage 4A: Build Planning (BUILD Mode)

**Current:** `SurbeeBuildPlanner` agent

**New Implementation:**
```typescript
async function createBuildPlan(
  input: string,
  context: WorkflowContext,
  history: Array<{ role: string; content: string }>
) {
  const result = await generateText({
    model: openai('gpt-5'),
    system: `You are a survey architecture expert.
    Create a detailed build plan including:
    - Survey type and purpose
    - Questions to include
    - UI/UX requirements
    - shadcn components to use
    - Validation rules`,
    messages: [
      ...history,
      {
        role: 'user',
        content: `Create a build plan for: ${input}\n\nContext:\n${JSON.stringify(context)}`
      }
    ],
  });

  return result.text;
}
```

### Stage 4B: Survey Building with Tools

**Current:** `SurbeeBuilder` agent with custom tools

**New Implementation:**
```typescript
import { generateText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

async function buildSurvey(
  plan: string,
  context: WorkflowContext,
  history: Array<{ role: string; content: string }>
) {
  const result = await generateText({
    model: openai('gpt-5'),
    system: `You are an expert survey builder using React and shadcn/ui.
    Use the provided tools to create the survey files.`,
    messages: [
      ...history,
      { role: 'user', content: `Build this survey:\n${plan}` }
    ],
    tools: {
      init_sandbox: tool({
        description: 'Initialize a new project sandbox',
        parameters: z.object({
          project_name: z.string(),
          initial_files: z.array(z.string()).optional(),
        }),
        execute: async ({ project_name, initial_files }) => {
          // Implementation
          return { rootDir: `/sandbox/${project_name}`, status: 'success' };
        },
      }),
      create_file: tool({
        description: 'Create a new file in the project',
        parameters: z.object({
          project_name: z.string(),
          file_path: z.string(),
          content: z.string(),
        }),
        execute: async ({ project_name, file_path, content }) => {
          // Implementation
          return { status: 'success', file_path, size: content.length };
        },
      }),
      create_shadcn_component: tool({
        description: 'Add a shadcn/ui component to the project',
        parameters: z.object({
          project_name: z.string(),
          component_name: z.enum(['button', 'input', 'card', 'form']),
        }),
        execute: async ({ project_name, component_name }) => {
          // Implementation
          return { status: 'success', component_name };
        },
      }),
      render_preview: tool({
        description: 'Generate preview HTML of the survey',
        parameters: z.object({
          project_name: z.string(),
          entry_file: z.string(),
        }),
        execute: async ({ project_name, entry_file }) => {
          // Implementation
          return {
            files: {},
            entry: entry_file,
            status: 'success'
          };
        },
      }),
    },
    maxSteps: 20, // Allow multiple tool calls
  });

  return result;
}
```

### Stage 5: Planning Mode (ASK Mode)

**Current:** `SurbeePlanner` agent

**New Implementation:**
```typescript
async function planSurvey(
  input: string,
  context: WorkflowContext,
  history: Array<{ role: string; content: string }>
) {
  const result = await generateText({
    model: openai('gpt-5'),
    system: `You are a survey design consultant.
    Provide detailed recommendations, best practices,
    and strategic advice for survey creation.`,
    messages: [
      ...history,
      {
        role: 'user',
        content: `Help me plan: ${input}\n\nContext:\n${JSON.stringify(context)}`
      }
    ],
    tools: {
      web_search: tool({
        description: 'Search the web for survey best practices',
        parameters: z.object({
          query: z.string(),
        }),
        execute: async ({ query }) => {
          // Implement web search
          return { results: [] };
        },
      }),
    },
  });

  return result.text;
}
```

---

## Streaming Implementation

### Server-Side Streaming

```typescript
// src/app/api/agents/surbee-v2/route.ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { messages, context } = await req.json();

  const result = streamText({
    model: openai('gpt-5'),
    system: 'You are Surbee, a survey creation assistant.',
    messages,
    tools: {
      // Define tools here
    },
    onChunk: ({ chunk }) => {
      // Process streaming chunks
      console.log('Received chunk:', chunk);
    },
    onFinish: ({ text, toolCalls }) => {
      // Handle completion
      console.log('Finished:', { text, toolCalls });
    },
  });

  return result.toDataStreamResponse();
}
```

### Client-Side Integration

```typescript
// src/app/project/[id]/page.tsx
'use client';

import { useChat } from '@ai-sdk/react';

export default function ProjectPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/agents/surbee-v2',
    initialMessages: [],
    onToolCall: ({ toolCall }) => {
      console.log('Tool called:', toolCall);
    },
    onFinish: (message) => {
      console.log('Finished:', message);
    },
  });

  return (
    <div>
      {messages.map((message) => (
        <div key={message.id}>
          <strong>{message.role}:</strong> {message.content}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Describe your survey..."
        />
        <button type="submit" disabled={isLoading}>
          Send
        </button>
      </form>
    </div>
  );
}
```

---

## Multi-Model Support

### Easy Model Switching

```typescript
// Switch between providers seamlessly
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { xai } from '@ai-sdk/xai';
import { google } from '@ai-sdk/google';

// Configuration
const MODEL_CONFIG = {
  optimizer: openai('gpt-5-mini'),
  categorizer: openai('gpt-5-mini'),
  planner: anthropic('claude-3-5-sonnet-20241022'), // Use Claude for planning
  builder: openai('gpt-5'), // Use GPT-5 for building
  creative: xai('grok-2'), // Use Grok for creative tasks
};

// Use in workflow
async function optimizePrompt(input: string) {
  const result = await generateText({
    model: MODEL_CONFIG.optimizer,
    messages: [{ role: 'user', content: input }],
  });
  return result.text;
}
```

### Model Selection Strategy

```typescript
type ModelProvider = 'openai' | 'anthropic' | 'xai' | 'google';
type TaskType = 'optimize' | 'categorize' | 'plan' | 'build';

const MODEL_STRATEGY: Record<TaskType, { provider: ModelProvider; model: string }> = {
  optimize: { provider: 'openai', model: 'gpt-5-mini' },
  categorize: { provider: 'openai', model: 'gpt-5-mini' },
  plan: { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022' },
  build: { provider: 'openai', model: 'gpt-5' },
};

function getModel(taskType: TaskType) {
  const { provider, model } = MODEL_STRATEGY[taskType];

  switch (provider) {
    case 'openai':
      return openai(model);
    case 'anthropic':
      return anthropic(model);
    case 'xai':
      return xai(model);
    case 'google':
      return google(model);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

// Usage
const result = await generateText({
  model: getModel('plan'),
  messages: [{ role: 'user', content: input }],
});
```

---

## Complete Workflow Implementation

### Full runWorkflow Function with Vercel AI SDK

```typescript
// src/lib/agents/surbeeWorkflowV2.ts
import { generateText, streamText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

interface WorkflowInput {
  input_as_text: string;
  context?: WorkflowContext;
}

interface WorkflowResult {
  output_text: string;
  stage: 'fail' | 'plan' | 'build';
  items: any[];
  source_files?: Record<string, string>;
  entry_file?: string;
  html?: string;
}

export async function runWorkflowV2(
  input: WorkflowInput
): Promise<WorkflowResult> {

  // Build conversation history
  const history = buildConversationHistory(input.context?.chatHistory || []);

  // STEP 1: Optimize Prompt
  console.log('Step 1: Optimizing prompt...');
  const optimizedPrompt = await generateText({
    model: openai('gpt-5-mini'),
    system: `Enhance user prompts for clarity while maintaining intent.`,
    messages: [
      { role: 'user', content: input.input_as_text }
    ],
  });

  // STEP 2: Guardrails Check (keep existing or implement with AI)
  console.log('Step 2: Running guardrails...');
  const safetyCheck = await checkGuardrails(optimizedPrompt.text);

  if (!safetyCheck.safe) {
    const failMessage = await generateText({
      model: openai('gpt-5-mini'),
      system: `Provide empathetic error message for guardrail failure.`,
      messages: [
        {
          role: 'user',
          content: `Guardrail triggered: ${safetyCheck.reason}`
        }
      ],
    });

    return {
      output_text: failMessage.text,
      stage: 'fail',
      items: [],
    };
  }

  // STEP 3: Categorize Intent
  console.log('Step 3: Categorizing intent...');
  const categoryResult = await generateText({
    model: openai('gpt-5-mini'),
    system: `Categorize as ASK (planning) or BUILD (code generation).
    Return JSON: { mode: "ASK" | "BUILD", reasoning: string }`,
    messages: [
      ...history,
      { role: 'user', content: optimizedPrompt.text }
    ],
  });

  const category = JSON.parse(categoryResult.text);

  // BRANCH: BUILD MODE
  if (category.mode === 'BUILD') {
    console.log('Step 4A: Creating build plan...');

    // Build Planning
    const buildPlan = await generateText({
      model: openai('gpt-5'),
      system: `Create detailed survey build plan with structure,
      questions, components, and validation rules.`,
      messages: [
        ...history,
        { role: 'user', content: optimizedPrompt.text }
      ],
    });

    console.log('Step 5A: Building survey...');

    // Survey Building with Tools
    const buildResult = await generateText({
      model: openai('gpt-5'),
      system: `Build survey using React, TypeScript, and shadcn/ui.
      Use tools to create files and components.`,
      messages: [
        ...history,
        { role: 'assistant', content: buildPlan.text },
        { role: 'user', content: 'Build this survey now.' }
      ],
      tools: {
        init_sandbox: tool({
          description: 'Initialize project sandbox',
          parameters: z.object({
            project_name: z.string(),
          }),
          execute: async ({ project_name }) => {
            return { status: 'success', rootDir: `/sandbox/${project_name}` };
          },
        }),
        create_file: tool({
          description: 'Create a file',
          parameters: z.object({
            project_name: z.string(),
            file_path: z.string(),
            content: z.string(),
          }),
          execute: async ({ project_name, file_path, content }) => {
            // Store file
            return { status: 'success', file_path };
          },
        }),
        create_shadcn_component: tool({
          description: 'Add shadcn component',
          parameters: z.object({
            project_name: z.string(),
            component_name: z.string(),
          }),
          execute: async ({ project_name, component_name }) => {
            return { status: 'success', component_name };
          },
        }),
        render_preview: tool({
          description: 'Generate preview',
          parameters: z.object({
            project_name: z.string(),
            entry_file: z.string(),
          }),
          execute: async ({ project_name, entry_file }) => {
            return {
              files: {},
              entry: entry_file,
              status: 'success'
            };
          },
        }),
      },
      maxSteps: 20,
    });

    console.log('Step 6A: Verifying output...');

    // Auto-verification (up to 3 attempts)
    let verificationAttempts = 0;
    let finalResult = buildResult;

    while (verificationAttempts < 3) {
      const verification = verifyBuildOutput(finalResult);

      if (verification.passed) {
        break;
      }

      console.log(`Attempt ${verificationAttempts + 1}: Fixing issues...`);

      // Re-run with error feedback
      finalResult = await generateText({
        model: openai('gpt-5'),
        system: `Fix the following issues in the survey code.`,
        messages: [
          ...history,
          { role: 'assistant', content: buildPlan.text },
          { role: 'assistant', content: buildResult.text },
          {
            role: 'user',
            content: `Fix these issues:\n${verification.errors.join('\n')}`
          }
        ],
        tools: buildResult.tools,
        maxSteps: 20,
      });

      verificationAttempts++;
    }

    return {
      output_text: finalResult.text,
      stage: 'build',
      items: [],
      source_files: extractSourceFiles(finalResult),
      entry_file: extractEntryFile(finalResult),
    };
  }

  // BRANCH: ASK MODE
  else {
    console.log('Step 4B: Planning mode...');

    const planResult = await generateText({
      model: openai('gpt-5'),
      system: `Provide survey design recommendations, best practices,
      and strategic advice.`,
      messages: [
        ...history,
        { role: 'user', content: optimizedPrompt.text }
      ],
      tools: {
        web_search: tool({
          description: 'Search for survey best practices',
          parameters: z.object({
            query: z.string(),
          }),
          execute: async ({ query }) => {
            // Implement search
            return { results: [] };
          },
        }),
      },
      maxSteps: 10,
    });

    return {
      output_text: planResult.text,
      stage: 'plan',
      items: [],
    };
  }
}

// Helper functions
function buildConversationHistory(chatHistory: any[]) {
  return chatHistory.map((entry) => ({
    role: entry.role as 'user' | 'assistant',
    content: entry.content,
  }));
}

async function checkGuardrails(text: string) {
  // Implement guardrails check
  return { safe: true };
}

function verifyBuildOutput(result: any) {
  // Implement verification logic
  return { passed: true, errors: [] };
}

function extractSourceFiles(result: any): Record<string, string> {
  // Extract files from tool calls
  return {};
}

function extractEntryFile(result: any): string {
  // Extract entry file from tool calls
  return 'Survey.tsx';
}
```

---

## Migration Strategy

### Phase 1: Parallel Implementation
1. ✅ Keep existing `surbeeWorkflow.ts` intact
2. ✅ Create new `surbeeWorkflowV2.ts` with Vercel AI SDK
3. ✅ Add new API route `/api/agents/surbee-v2`
4. ✅ Test both implementations side-by-side

### Phase 2: Feature Parity
1. Implement all agents with Vercel AI SDK
2. Migrate all tools to Vercel's tool interface
3. Ensure verification loops work
4. Match streaming behavior

### Phase 3: Gradual Rollout
1. Add feature flag for V2 workflow
2. Route 10% of traffic to V2
3. Monitor performance and results
4. Gradually increase percentage
5. Full cutover when confident

### Phase 4: Cleanup
1. Remove old `surbeeWorkflow.ts`
2. Remove OpenAI Agents dependency
3. Update documentation
4. Celebrate! 🎉

---

## Benefits of Migration

1. **Model Flexibility:** Easy switching between OpenAI, Claude, Grok, etc.
2. **Cost Optimization:** Use cheaper models for simple tasks
3. **Better Streaming:** Native streaming support with proper types
4. **React Integration:** `useChat` hook for seamless UI
5. **Tool Standardization:** Unified tool interface across models
6. **Type Safety:** Better TypeScript support
7. **Future-Proof:** Active maintenance and new features

---

## Example: Complete API Route

```typescript
// src/app/api/agents/surbee-v2/route.ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { runWorkflowV2 } from '@/lib/agents/surbeeWorkflowV2';

export const runtime = 'edge'; // Optional: use edge runtime

export async function POST(req: Request) {
  try {
    const { input_as_text, context } = await req.json();

    // Run workflow
    const result = await runWorkflowV2({
      input_as_text,
      context,
    });

    // Return as streaming response
    return new Response(
      JSON.stringify(result),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Workflow error:', error);
    return new Response(
      JSON.stringify({ error: 'Workflow failed' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
```

---

## Next Steps

1. Create `src/lib/agents/surbeeWorkflowV2.ts`
2. Implement core workflow with Vercel AI SDK
3. Create `src/app/api/agents/surbee-v2/route.ts`
4. Test with sample inputs
5. Compare results with existing workflow
6. Iterate and improve

---

*Ready to build the future of Surbee with flexible, model-agnostic AI! 🚀*
