# DeepSite Integration Documentation

## Overview

This document outlines the complete integration of DeepSite's functional components into the Surbee project's `project/[id]` page. The integration extracts all backend logic, AI functionality, and rendering capabilities from DeepSite while preserving the existing UI layout.

## ✅ Integration Architecture

### Directory Structure
```
project/[id]/
├── page.tsx                    # Main UI (preserved - uses integration)
├── deepsite-integration/       # All functional components
│   ├── types/
│   │   └── index.ts           # DeepSite type definitions
│   ├── lib/
│   │   ├── constants.ts       # AI prompts and system constants
│   │   ├── providers.ts       # AI provider configurations
│   │   └── html-utils.ts      # HTML processing utilities
│   ├── hooks/
│   │   ├── useEditor.ts       # Editor state management
│   │   └── useDeepSite.ts     # Main integration hook
│   ├── renderer/
│   │   └── DeepSiteRenderer.tsx # HTML rendering component
│   └── editor/
│       └── ChatProcessor.ts   # Chat message processing
```

### API Integration
```
/api/website-builder/
├── ask-ai/route.ts            # AI generation and modification
└── re-design/route.ts         # URL-to-markdown conversion
```

## ✅ Key Features Integrated

### 1. Multi-Provider AI System
- **Provider**: DeepSeek API (direct integration)
- **Model**: DeepSeek V3 O324 (131k context window)
- **Streaming**: Real-time response streaming for initial generation
- **Follow-up**: Intelligent HTML modification using search/replace blocks

### 2. HTML Generation & Modification
- **Initial Generation**: Complete HTML websites from natural language
- **Follow-up Modifications**: Precise edits using DeepSite's search/replace system
- **URL Redesign**: Extract and redesign from existing websites
- **Responsive Design**: Automatic Tailwind CSS integration

### 3. Advanced Editor Features
- **HTML History**: Track all HTML versions with prompts
- **Device Preview**: Desktop, tablet, and phone responsive views
- **Real-time Rendering**: Instant HTML updates in iframe
- **Error Handling**: Comprehensive error management and user feedback

## ✅ How Left Pane (Chat) Connects to DeepSite

### Chat Processing Flow
```typescript
User Input → ChatProcessor.processMessage() → {
  URL Detection → redesignFromUrl()
  Regular Prompt → AI Generation/Modification
} → HTML Update → Right Pane Renderer
```

### Example Usage
```typescript
// Chat input: "Create a modern landing page for a tech startup"
// Result: Complete HTML website generated and displayed in right pane

// Follow-up: "Make the hero section darker"
// Result: Precise modification using DeepSite's search/replace system
```

## ✅ How Right Pane (Renderer) Uses DeepSite

### Rendering Pipeline
```typescript
DeepSite HTML State → DeepSiteRenderer → {
  Device Responsive Sizing
  Safe HTML Rendering
  Error Handling
} → iframe Display
```

### Device Support
- **Desktop**: Full-width responsive layout
- **Tablet**: 768x1024px preview
- **Phone**: 375x667px preview

## ✅ API Routes Integration

### POST /api/website-builder/ask-ai
- **Purpose**: Initial HTML generation or redesign
- **Features**: Streaming responses, multi-provider support
- **Input**: Prompt, model, provider, optional redesign markdown
- **Output**: Complete HTML document

### PUT /api/website-builder/ask-ai
- **Purpose**: Modify existing HTML using search/replace blocks
- **Features**: Precise edits, maintain HTML structure
- **Input**: Modification prompt, current HTML, previous prompt
- **Output**: Updated HTML with diff information

### PUT /api/website-builder/re-design
- **Purpose**: Convert URLs to markdown for redesign
- **Features**: Uses Jina AI reader API
- **Input**: URL to extract
- **Output**: Markdown representation of the webpage

## ✅ Usage Examples

### Basic Website Generation
```typescript
// User types in left pane:
"Create a portfolio website for a photographer"

// DeepSite generates complete HTML with:
// - Responsive design
// - Image galleries
// - Contact forms
// - Modern styling
```

### Follow-up Modifications
```typescript
// User types:
"Change the background color to dark theme"

// DeepSite precisely modifies existing HTML:
// - Identifies background elements
// - Updates color classes
// - Maintains all other content
```

### URL Redesign
```typescript
// User types:
"https://example.com - redesign this with a modern look"

// DeepSite:
// 1. Extracts content as markdown
// 2. Generates new HTML design
// 3. Preserves content, updates styling
```

## ✅ State Management

### Main Hook: useDeepSite
```typescript
const deepSite = useDeepSite({
  defaultHtml: initialTemplate,
  onMessage: handleChatMessage,
  onError: handleError
});

// Provides:
// - html: current HTML content
// - isAiWorking: generation status
// - isThinking: processing status
// - processChatMessage(): main chat handler
// - stopGeneration(): abort current request
```

### Integration Benefits
- **No UI Conflicts**: All DeepSite UI components ignored
- **Modular Design**: Easy to update DeepSite features independently
- **Full Functionality**: Complete AI website generation capabilities
- **Preserved Layout**: Your chat/renderer layout completely intact
- **Type Safety**: Full TypeScript integration

## ✅ Environment Requirements

### Required Environment Variables
```bash
# DeepSeek API Key (required)
DEEPSEEK_API_KEY=your_deepseek_api_key

# Get your API key from: https://platform.deepseek.com/api_keys
```

### Dependencies
```bash
# No additional dependencies required!
# DeepSeek integration uses native fetch API

# Already included in your project:
# - React/Next.js
# - Tailwind CSS
# - TypeScript
```

## ✅ Testing the Integration

### 1. Start the Development Server
```bash
cd surbee-lyra
npm run dev
```

### 2. Navigate to Project Page
```
http://localhost:3000/project/[any-id]
```

### 3. Test Basic Functionality
- Type: "Create a simple landing page"
- Observe: HTML generation in right pane
- Test: Device responsiveness buttons
- Try: Follow-up modifications

### 4. Test URL Redesign
- Type: "https://stripe.com redesign this"
- Observe: Content extraction and new design generation

## ✅ Error Handling

The integration includes comprehensive error handling:
- **Network Errors**: Graceful fallbacks and user notifications
- **AI Service Errors**: Provider switching and retry logic
- **HTML Parsing Errors**: Safe rendering with error boundaries
- **Rate Limiting**: IP-based limits with clear user feedback

## ✅ Performance Optimizations

- **Streaming Responses**: Real-time content generation
- **Efficient Re-rendering**: Only update HTML when changed
- **Memory Management**: Proper cleanup of AbortControllers
- **Responsive Loading**: Device-specific rendering optimizations

---

This integration provides the complete DeepSite experience within your existing UI framework, enabling powerful AI-driven website generation while maintaining your application's design system and user experience.
