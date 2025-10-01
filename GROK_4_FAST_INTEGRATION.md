# Grok 4 Fast Reasoning Integration

## Overview

Surbee Lyra now uses **Grok 4 Fast Reasoning** by xAI to generate beautiful, market-ready surveys with real-time thinking stream visualization.

## Features

### 🧠 Real-Time Reasoning Stream
- Watch Grok 4 Fast think through survey design decisions
- See reasoning tokens displayed in a beautiful purple-themed panel
- Understand the AI's thought process as it builds

### 🎨 Beautiful Survey Generation
- Production-quality HTML surveys
- Modern, accessible designs
- Responsive and mobile-friendly
- Built-in validation and interactivity

### ⚡ Streaming Architecture
- **Thinking stream**: reasoning_content flows to chat panel
- **HTML stream**: content flows directly to iframe
- **Clean separation**: No contamination between streams
- **Progressive rendering**: Watch the survey build in real-time

## Setup

### 1. Get Your xAI API Key

Visit [console.x.ai](https://console.x.ai/) to get your API key.

### 2. Configure Environment Variables

Create or update `.env.local`:

```env
XAI_API_KEY=your_xai_api_key_here
XAI_API_BASE_URL=https://api.x.ai/v1
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Run Development Server

```bash
pnpm dev
```

## Architecture

### System Components

```
┌─────────────────────────────────────────────────┐
│                Frontend (Next.js)               │
│                                                 │
│  ┌────────────────┐        ┌─────────────────┐ │
│  │  Chat Sidebar  │        │  Preview Iframe │ │
│  │                │        │                 │ │
│  │  • Messages    │        │  • Live HTML    │ │
│  │  • Thinking    │        │  • Survey View  │ │
│  │  • Usage Stats │        │  • Interactive  │ │
│  └────────────────┘        └─────────────────┘ │
│           ▲                         ▲           │
│           │                         │           │
│           └─────────┬───────────────┘           │
│                     │                           │
└─────────────────────┼───────────────────────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │   API Route (/api/     │
         │   grok-survey)         │
         │                        │
         │  • Stream Management   │
         │  • Event Routing       │
         │  • Error Handling      │
         └────────────────────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │  Grok4FastSystem       │
         │                        │
         │  • Model: grok-4-fast- │
         │    reasoning           │
         │  • Timeout: 360s       │
         │  • Max tokens: 60k     │
         └────────────────────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │   xAI API              │
         │   (api.x.ai/v1)        │
         │                        │
         │  • Streaming responses │
         │  • reasoning_content   │
         │  • content (HTML)      │
         └────────────────────────┘
```

### Stream Events

The system uses Server-Sent Events (SSE) with JSON payloads:

#### Event Types

**1. thinking**
```json
{
  "type": "thinking",
  "delta": "Analyzing user requirements..."
}
```

**2. status**
```json
{
  "type": "status",
  "status": "building",
  "detail": "Generating survey HTML..."
}
```

**3. htmlChunk**
```json
{
  "type": "htmlChunk",
  "chunk": "<!DOCTYPE html>..."
}
```

**4. usage**
```json
{
  "type": "usage",
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 2500,
    "reasoning_tokens": 850,
    "total_tokens": 2650
  }
}
```

**5. complete**
```json
{
  "type": "complete",
  "html": "",
  "conversationId": "grok-fast-1696320000000",
  "suggestions": "Survey created! Consider adding..."
}
```

**6. error**
```json
{
  "type": "error",
  "message": "Failed to generate survey"
}
```

## File Structure

```
surbee-lyra/
├── src/
│   ├── lib/
│   │   └── grok/
│   │       ├── grok-4-fast-system.ts    # Core Grok 4 Fast logic
│   │       └── simple-system.ts         # Legacy system (deprecated)
│   ├── app/
│   │   ├── api/
│   │   │   └── grok-survey/
│   │   │       └── route.ts             # API endpoint
│   │   └── project/
│   │       └── [id]/
│   │           └── page.tsx             # Project page with chat & preview
│   └── types/
│       └── database.ts                  # TypeScript types
├── .env.local                           # Environment variables (git-ignored)
├── .env.example                         # Example environment variables
└── GROK_4_FAST_INTEGRATION.md          # This file
```

## Usage Examples

### Basic Survey Generation

```typescript
import { Grok4FastSystem } from "@/lib/grok/grok-4-fast-system";

const system = new Grok4FastSystem();

const result = await system.run({
  prompt: "Create a customer satisfaction survey with 5 questions",
  onThinking: (delta) => {
    console.log("Thinking:", delta);
  },
  onHtmlChunk: (chunk) => {
    console.log("HTML chunk:", chunk);
  },
  onStatus: (status, detail) => {
    console.log(`Status: ${status} - ${detail}`);
  },
  onUsage: (usage) => {
    console.log("Token usage:", usage);
  },
});

console.log("Final HTML:", result.html);
console.log("Suggestions:", result.suggestions);
```

### With Images

```typescript
const result = await system.run({
  prompt: "Create a survey based on this design mockup",
  images: [
    {
      url: "https://example.com/mockup.png",
      detail: "high"
    }
  ],
  // ... callbacks
});
```

## API Reference

### `Grok4FastSystem`

#### Constructor Options

```typescript
interface ConstructorOptions {
  apiKey?: string;         // Override XAI_API_KEY env var
  baseURL?: string;        // Override API base URL
  systemPrompt?: string;   // Custom system prompt
}
```

#### `run(options: GrokRunOptions)`

```typescript
interface GrokRunOptions {
  prompt: string;                        // Required: User's survey request
  conversationId?: string;               // Optional: For multi-turn conversations
  images?: Array<{                       // Optional: Image references
    url: string;
    detail?: "low" | "medium" | "high";
  }>;
  onThinking?: (delta: string) => void;  // Reasoning stream callback
  onStatus?: (status, detail?) => void;  // Status updates
  onHtmlChunk?: (chunk: string) => void; // HTML stream callback
  onUsage?: (usage) => void;             // Token usage stats
  onComplete?: (result) => void;         // Completion callback
  onError?: (error: Error) => void;      // Error callback
}
```

#### Return Type

```typescript
interface GrokResult {
  conversationId: string;
  html: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    completion_tokens_details: {
      reasoning_tokens: number;
    };
  };
  suggestions?: string;
}
```

## Model Details

### grok-4-fast-reasoning

- **Context Window**: 2 million tokens
- **Timeout**: 360 seconds (6 minutes)
- **Max Tokens**: 60,000 per response
- **Temperature**: 0.7 (for suggestions)
- **Features**:
  - Extended reasoning via `reasoning_content`
  - Streaming support
  - Multi-modal (text + images)

### Token Usage

Grok 4 Fast provides detailed token usage:

```typescript
{
  prompt_tokens: 150,              // Input tokens
  completion_tokens: 2500,         // Output tokens
  total_tokens: 2650,             // Sum
  prompt_tokens_details: {
    text_tokens: 150,
    image_tokens: 0,
    audio_tokens: 0,
    cached_tokens: 0
  },
  completion_tokens_details: {
    reasoning_tokens: 850,         // Thinking process tokens
    audio_tokens: 0,
    accepted_prediction_tokens: 0,
    rejected_prediction_tokens: 0
  }
}
```

## UI Components

### Thinking Panel

The purple-themed panel shows:
- Real-time reasoning stream
- Status indicators (thinking, building, complete)
- Token usage statistics
- Execution duration

### Preview Iframe

- Renders HTML in real-time as it streams
- Device size controls (desktop, tablet, mobile)
- Clean HTML rendering (no thinking text contamination)
- Full interactivity and validation

## Best Practices

### 1. Prompt Engineering

```typescript
// ✅ Good: Specific and clear
"Create a 5-question employee feedback survey with:
- Multiple choice for overall satisfaction
- Rating scales for specific aspects
- Open-ended feedback field
- Modern blue color scheme"

// ❌ Bad: Too vague
"Make a survey"
```

### 2. Error Handling

```typescript
try {
  const result = await system.run({
    prompt,
    onError: (error) => {
      // Handle streaming errors
      console.error("Stream error:", error);
      showUserError(error.message);
    }
  });
} catch (error) {
  // Handle fatal errors
  console.error("Fatal error:", error);
  showUserError("Failed to generate survey");
}
```

### 3. Token Management

Monitor token usage to stay within limits:

```typescript
let totalTokens = 0;

const result = await system.run({
  prompt,
  onUsage: (usage) => {
    totalTokens = usage.total_tokens;
    if (totalTokens > 1_900_000) { // Near 2M limit
      console.warn("Approaching context limit");
    }
  }
});
```

## Troubleshooting

### Issue: "XAI API key not configured"

**Solution**: Set `XAI_API_KEY` in `.env.local`

```bash
XAI_API_KEY=xai-your-key-here
```

### Issue: Thinking stream not displaying

**Solution**: Check that `onThinking` callback is properly connected and the thinking panel state is managed correctly.

### Issue: HTML not rendering in iframe

**Solution**: Verify that:
1. `onHtmlChunk` callback is receiving data
2. HTML extraction is working (`extractCleanHtml`)
3. DeepSiteRenderer is receiving updates

### Issue: Timeout errors

**Solution**: Grok 4 Fast can take time for complex surveys. The timeout is set to 360s (6 minutes). For faster responses, simplify your prompt or reduce survey complexity.

## Performance

### Typical Generation Times

| Survey Complexity | Reasoning Time | Total Time |
|------------------|----------------|------------|
| Simple (3-5 questions) | 2-5s | 5-10s |
| Medium (6-10 questions) | 5-10s | 15-30s |
| Complex (10+ questions) | 10-20s | 30-60s |

### Token Usage Estimates

| Survey Type | Prompt Tokens | Completion Tokens | Reasoning Tokens |
|-------------|---------------|-------------------|------------------|
| Simple | 100-200 | 1,000-2,000 | 300-800 |
| Medium | 200-400 | 2,000-5,000 | 800-2,000 |
| Complex | 400-800 | 5,000-15,000 | 2,000-5,000 |

## Migration from Old System

If you're migrating from the old `GrokSurveySystem`:

### Old Code
```typescript
import { GrokSurveySystem } from "@/lib/grok/simple-system";
const system = new GrokSurveySystem();
```

### New Code
```typescript
import { Grok4FastSystem } from "@/lib/grok/grok-4-fast-system";
const system = new Grok4FastSystem();
```

The API is compatible, but the new system provides:
- ✅ Better reasoning separation
- ✅ Cleaner HTML extraction
- ✅ More reliable streaming
- ✅ Better error handling

## Support

For issues or questions:
1. Check console logs for detailed error messages
2. Verify API key is valid at [console.x.ai](https://console.x.ai/)
3. Review the examples in this document
4. Check xAI's [official documentation](https://docs.x.ai/)

## License

This integration is part of Surbee Lyra. See project LICENSE for details.

