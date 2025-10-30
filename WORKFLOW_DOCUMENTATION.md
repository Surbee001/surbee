# Surbee Workflow System Documentation

## Overview

Surbee is a sophisticated multi-agent orchestration system that creates surveys through AI-powered workflow execution. It uses OpenAI's Agents framework to coordinate multiple specialized agents, manage tool execution, and provide real-time streaming updates.

---

## Architecture Summary

**Pattern:** Agent-based workflow orchestration with sequential execution and shared context
**Primary File:** `src/lib/agents/surbeeWorkflow.ts` (3251 lines)
**API Endpoint:** `src/app/api/agents/surbee/route.ts`
**UI Entry:** `src/app/project/[id]/page.tsx`

### Core Components

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                       │
│            (Project Page + Chat Interface)              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              API Route (/api/agents/surbee)             │
│         • Input validation                              │
│         • SSE streaming setup                           │
│         • Event batching                                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│          Workflow Orchestrator (runWorkflow)            │
│         • Context building                              │
│         • Agent coordination                            │
│         • History management                            │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌──────────────┐          ┌──────────────┐
│  Multi-Agent │          │   Reasoning  │
│  Execution   │          │    Engine    │
│  Pipeline    │          │              │
└──────────────┘          └──────────────┘
```

---

## Workflow Execution Flow

### Phase 1: Input Enhancement & Safety

**Location:** `src/lib/agents/surbeeWorkflow.ts:2828-2868`

```
User Input
    ↓
1. PromptOptimizer Agent (gpt-5-mini)
   • Enhances clarity and detail
   • Outputs improved prompt
    ↓
2. Guardrails Check (OpenAI API)
   • PII Detection
   • Moderation
   • Jailbreak Detection
   • Hallucination Check
    ↓
   If UNSAFE → SurbeeFail Agent → Return error message
   If SAFE → Continue to categorization
```

### Phase 2: Intent Categorization

**Location:** `src/lib/agents/surbeeWorkflow.ts:2870-2888`

```
3. Categorize Agent (gpt-5-mini)
   Input: Enhanced prompt + full context
   Output: JSON { mode: "ASK" | "BUILD", reasoning: string }

   Decision Point:
   ├─ ASK Mode → Brainstorming/Planning (no code generation)
   └─ BUILD Mode → Create actual survey code
```

### Phase 3A: BUILD Mode Pipeline

**Location:** `src/lib/agents/surbeeWorkflow.ts:2890-3094`

```
4. SurbeeBuildPlanner Agent (gpt-5)
   • Creates structured build plan
   • Defines survey structure
   • Lists required components
   • Emits planner summary to UI
    ↓
5. SurbeeBuilder Agent (gpt-5, high reasoning)
   Tools Available:
   ├─ init_sandbox: Create project environment
   ├─ create_file: Generate survey files
   ├─ create_shadcn_component: Add UI components
   └─ render_preview: Output final files

   Executes:
   • Creates Survey.tsx
   • Generates components
   • Applies styles
   • Builds preview
    ↓
6. Auto-Verification Loop (up to 3 attempts)
   Checks:
   ├─ Shadcn component usage (Button, Input, Card)
   ├─ Proper spacing (px-6 py-12)
   ├─ Centered layout (max-w-2xl mx-auto)
   ├─ Rounded corners (rounded-2xl)
   └─ Font loading

   If errors → Re-run builder with fixes
   If verified → Return results
```

**Output Structure:**
```typescript
{
  output_text: string;           // Summary message
  stage: "build";               // Execution stage
  source_files: {...};          // All generated files
  entry_file: string;           // Main entry point
  dependencies: string[];       // npm packages needed
  html?: string;                // Optional HTML output
  items: SerializedRunItem[];   // Streaming events
}
```

### Phase 3B: ASK Mode Pipeline

**Location:** `src/lib/agents/surbeeWorkflow.ts:3096+`

```
4. SurbeePlanner Agent (gpt-5)
   • Web search capability
   • Provides recommendations
   • Discusses survey best practices
   • Structured planning output
    ↓
   Return: { stage: "plan", output_text: string }
```

---

## Agent Reference

| Agent | Model | Purpose | Key Features |
|-------|-------|---------|--------------|
| **PromptOptimizer** | gpt-5-mini | Enhance user input | Low reasoning, concise |
| **SurbeeFail** | gpt-5-mini | Handle failures | Empathetic error messages |
| **Categorize** | gpt-5-mini | ASK vs BUILD | Step-by-step reasoning, JSON output |
| **SurbeePlanner** | gpt-5 | Planning mode | Web search enabled |
| **SurbeeBuildPlanner** | gpt-5 | Build planning | Structured strategy |
| **SurbeeBuilder** | gpt-5 | Code generation | Sandbox tools, high reasoning |

---

## Reasoning System

**Location:** `src/services/reasoning/`

### Complexity Detection

**File:** `ComplexityAnalyzer.ts`

The system automatically detects query complexity using a 3-stage process:

```
Query Input
    ↓
1. Pattern Analysis
   • Regex for keywords (math, code, logic, creative)
   • Assigns category scores
    ↓
2. LLM Assessment (gpt-5-mini)
   • Nuanced classification
   • Context-aware analysis
    ↓
3. Ensemble Scoring
   • Combines pattern + LLM results
   • Calculates confidence level
    ↓
Output: SIMPLE | MODERATE | COMPLEX | CREATIVE
```

### Reasoning Strategies

**File:** `ReasoningEngine.ts`

| Complexity | Phases | Model Config | Use Case |
|-----------|--------|--------------|----------|
| **SIMPLE** | 0 (direct) | Low reasoning | Straightforward questions |
| **MODERATE** | 3 phases | Medium reasoning | Typical dev tasks |
| **COMPLEX** | 7 phases | High reasoning | Multi-step problems |
| **CREATIVE** | 2 phases | High reasoning | Brainstorming |

**MODERATE Phases:**
1. Understanding → 2. Planning Approach → 3. Executing Solution

**COMPLEX Phases:**
1. Problem Decomposition → 2. Knowledge Gathering → 3. Approach Planning → 4. Detailed Reasoning → 5. Self-Critique → 6. Alternative Exploration → 7. Synthesis

**CREATIVE Phases:**
1. Brainstorming (divergent) → 2. Convergence (selection)

### Self-Correction Detection

**File:** `ReasoningEngine.ts:54-64`

Monitors for phrases like:
- "actually, wait"
- "on second thought"
- "let me reconsider"
- "i need to revise"

Logs corrections with confidence levels for quality tracking.

---

## Context Management

### Context Building

**Location:** `surbeeWorkflow.ts:2558-2630`

The workflow builds comprehensive context from:

```typescript
WorkflowInput {
  input_as_text: string;
  context?: {
    selectedRoute?: string;          // Active route
    pages?: Array<{...}>;           // Known routes
    device?: string;                // Desktop/mobile
    chatHistory?: Array<{...}>;     // Last 6 messages
    selectedElement?: {             // Highlighted element
      outerHTML: string;
      selector: string;
    };
    html?: string;                  // Current survey HTML
  };
}
```

### Memory Management

**File:** `MemoryManager.ts`

- **Short-term:** Session-based (last 10 messages), max 8000 tokens
- **Long-term:** User preferences from Supabase
- **Semantic caching:** Uses text-embedding-3-small for similarity
- **Relevance scoring:** Combines recency + semantic similarity

---

## Streaming & Real-Time Updates

### SSE Event System

**Location:** `src/app/api/agents/surbee/route.ts:30-88`

Event batching strategy:
- Critical events flush immediately: `html_chunk`, `complete`, `error`, `start`
- Other events batch every 50ms for efficiency

**Stream Event Types:**
```typescript
type StreamEvent =
  | { type: "start" }
  | { type: "reasoning"; text: string; agent?: string }
  | { type: "message"; text: string; isSummary?: boolean }
  | { type: "tool_call"; name: string; arguments: unknown }
  | { type: "thinking_control"; action: "open" | "close" }
  | { type: "html_chunk"; chunk: string; final?: boolean }
  | { type: "code_bundle"; files: {...}; entry: string }
  | { type: "complete" }
  | { type: "error"; message: string }
```

---

## Sandbox IDE Tools

**Location:** `surbeeWorkflow.ts:407-1284`

| Tool | Purpose | Returns |
|------|---------|---------|
| `init_sandbox` | Initialize project | rootDir, files_created |
| `create_file` | Create new file | status, file_path, size |
| `read_file` | Read file contents | content, size |
| `update_file` | Modify existing file | status, message |
| `list_files` | List project files | files[], directories[] |
| `create_shadcn_component` | Add UI component | component_name, file_path |
| `render_preview` | Generate output | files, entry, dependencies |

Each tool has:
- Zod validation schema
- JSON schema for OpenAI
- Execute function with error handling
- State management via `sandboxStates` Map

---

## Verification & Quality Assurance

### Auto-Fix System

**Location:** `surbeeWorkflow.ts:3001-3053`

Runs up to 3 verification loops checking:

1. **Component Verification**
   - Uses shadcn components (Button, Input, Card)
   - Not raw HTML elements

2. **Spacing Standards**
   - Padding: `px-6 py-12`
   - Margins and gaps

3. **Layout Requirements**
   - Centered: `max-w-2xl mx-auto`
   - Card padding: `p-12`
   - Corners: `rounded-2xl`

4. **Font & CSS**
   - Proper font loading
   - Valid CSS structure

**Process:**
```
Builder Output
    ↓
Verify Files
    ↓
Errors Found? ──No──> Return Success
    │
    Yes
    ↓
Format Error Details
    ↓
Re-run Builder with Fixes
    ↓
Attempt < 3? ──Yes──> Loop
    │
    No
    ↓
Return Current State
```

---

## Current AI/LLM Integrations

### Primary

1. **OpenAI Agents Framework** (`@openai/agents`)
   - Models: gpt-5, gpt-5-mini
   - Tools: Custom + webSearchTool
   - Streaming execution

2. **OpenAI API** (Reasoning)
   - Extended thinking with reasoning effort levels
   - Parameters: reasoning_effort, verbosity

3. **OpenAI Embeddings** (`text-embedding-3-small`)
   - Semantic similarity matching
   - Context relevance scoring
   - Memory retrieval

### Secondary

4. **OpenAI Guardrails**
   - PII, Moderation, Jailbreak, Hallucination

5. **Surbee SDK** (`surbee-sdk/`)
   - Multi-provider support: OpenAI, XAI (Grok), Anthropic Claude
   - `SurveyOrchestrator`: Coordinates survey generation
   - `AccuracyDetector`: Analyzes response quality

---

## Key File Reference

### Core Workflow
- `src/lib/agents/surbeeWorkflow.ts` - Main orchestration (3251 lines)
- `src/app/api/agents/surbee/route.ts` - API endpoint with SSE
- `src/app/project/[id]/page.tsx` - Main UI component

### Reasoning Services
- `src/services/reasoning/ReasoningEngine.ts` - Orchestrates thinking process
- `src/services/reasoning/ComplexityAnalyzer.ts` - Detects complexity level
- `src/services/reasoning/MemoryManager.ts` - Context & cache management
- `src/services/reasoning/ReasoningTemplates.ts` - Pre-built patterns
- `src/services/reasoning/StreamingService.ts` - SSE management

### Types
- `src/types/reasoning.types.ts` - Reasoning system types
- `src/lib/agents/surbeeWorkflow.ts:2500-2632` - Workflow types

### UI Components
- `src/components/ai-elements/reasoning.tsx` - Reasoning display
- `components/ThinkingUi/components/thinking-display.tsx` - Thinking visualization

### SDK
- `surbee-sdk/src/generators/orchestrator.ts` - Survey orchestration
- `surbee-sdk/src/client.ts` - Main SDK client

---

## Data Flow Summary

```
User Input → API Route → runWorkflow()
                              ↓
        ┌─────────────────────┴─────────────────────┐
        ▼                                           ▼
Context Building                            Prompt Enhancement
  • Route info                                (PromptOptimizer)
  • Chat history                                    ↓
  • HTML context                              Guardrails Check
  • Selected element                                ↓
        │                                    Categorization
        │                                    (ASK vs BUILD)
        │                                           │
        └─────────────────┬─────────────────────────┘
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
         ASK Mode               BUILD Mode
              │                       │
              ▼                       ▼
      SurbeePlanner          SurbeeBuildPlanner
              │                       │
              │                       ▼
              │                 SurbeeBuilder
              │                 (with tools)
              │                       │
              │                       ▼
              │              Auto-Verification
              │              (up to 3 loops)
              │                       │
              └───────────┬───────────┘
                          ▼
                  Format Results
                          ↓
                   Stream to Client
                   (SSE with batching)
                          ↓
                   Update UI
```

---

## Technical Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **AI SDK:** OpenAI Agents + OpenAI API
- **Streaming:** Server-Sent Events (SSE)
- **UI Components:** shadcn/ui
- **Database:** Supabase (for memory/history)
- **Embeddings:** text-embedding-3-small
- **Models:** gpt-5, gpt-5-mini

---

## Performance Characteristics

- **Average BUILD execution:** 15-45 seconds
- **Average ASK execution:** 5-15 seconds
- **Auto-verification loops:** Up to 3 retries
- **Context window:** 8000 tokens max
- **SSE batch interval:** 50ms
- **Memory cache:** Short-term (session), Long-term (persistent)

---

## Future Integration Points

Ready for integration with:
- Vercel AI SDK (streaming utilities, UI helpers)
- Alternative LLM providers (Anthropic, XAI)
- Custom reasoning templates
- Extended tool ecosystem
- Multi-modal inputs

---

*Documentation generated for Surbee v1.0*
*Last updated: 2025-10-28*
