
import {
  generateText,
  streamText,
  smoothStream,
  tool,
  type InferUITools,
  type ToolSet,
  type UIDataTypes,
  type UIMessage,
  convertToModelMessages,
} from 'ai';
import { supabaseAdmin } from '@/lib/supabase-server';
import { openai } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createMistral } from '@ai-sdk/mistral';
import { z } from 'zod';
import {
  surbInitSandboxTool,
  surbeWrite,
  surbeQuickEdit,
  surbeBuildPreview,
  surbeLineReplace,
  surbeView,
  surbeDelete,
  surbeRename,
  surbeCopy,
  surbeSearchFiles,
  surbeAddDependency,
  surbeRemoveDependency,
  surbeDownloadToRepo,
  surbeReadConsoleLogs,
  surbeReadNetworkRequests,
  websearchWebSearch,
  surbeFetchWebsite,
  imagegenGenerateImage,
  imagegenEditImage,
  surbeSaveChatImage,
  chatUploadedImages,
  projectFiles,
  blockCreateSurveyTool,
  blockAddPageTool,
  blockAddBlockTool,
  blockUpdateBlockTool,
  blockDeleteBlockTool,
  blockReorderBlocksTool,
  blockSetPageLogicTool,
  blockUpdateThemeTool,
  blockGetSurveyTool,
  blockBuildPreviewTool,
} from './lovableTools';
import { buildSurbeeSystemPrompt } from './surbeeSystemPrompt';

// ============================================================================
// Types
// ============================================================================

/**
 * Image content types supported by Vercel AI SDK
 */
type ImageContent =
  | string              // base64 encoded string or data URL or http(s) URL
  | ArrayBuffer         // binary image data
  | Uint8Array          // binary image data
  | Buffer;             // binary image data (Node.js)

/**
 * Multi-part message content supporting text and images
 */
type MessageContent =
  | string              // Simple text content
  | Array<              // Multi-part content with text and images
      | { type: 'text'; text: string }
      | { type: 'image'; image: ImageContent }
    >;

interface WorkflowContextChatEntry {
  role: 'user' | 'assistant';
  content: MessageContent;
}

interface WorkflowContext {
  selectedRoute?: string;
  pages?: Array<{ path: string; title: string }>;
  device?: string;
  chatSummary?: string;
  chatHistory?: WorkflowContextChatEntry[];
  selectedElement?: {
    outerHTML: string;
    textContent: string;
    selector: string;
  };
  html?: string;
  images?: ImageContent[];  // Optional images attached to the request
}

/**
 * Streaming event types
 */
type StreamEvent =
  | { type: 'text-delta'; textDelta: string; agent?: string }
  | { type: 'reasoning-start'; reasoningDelta: string; agent?: string }
  | { type: 'reasoning-delta'; reasoningDelta: string; agent?: string }
  | { type: 'reasoning-end'; reasoning: string; agent?: string }
  | { type: 'reasoning-complete'; reasoning: string; agent?: string }
  | { type: 'tool-call'; toolName: string; args: unknown; agent?: string }
  | { type: 'tool-result'; toolName: string; result: unknown; agent?: string }
  | { type: 'step-start'; step: string; agent?: string; showReasoning?: boolean }
  | { type: 'step-finish'; step: string; agent?: string; text?: string; reasoning?: string; usage?: any }
  | { type: 'source'; id: string; url: string; title?: string; providerMetadata?: any; agent?: string }
  | { type: 'error'; error: string };

/**
 * Streaming callback function
 */
type StreamCallback = (event: StreamEvent) => void;

interface WorkflowInput {
  input_as_text: string;
  context?: WorkflowContext;
  images?: ImageContent[];  // Optional images for the current message
  onStream?: StreamCallback; // Optional streaming callback
}

interface WorkflowResult {
  output_text: string;
  stage: 'fail' | 'plan' | 'build';
  guardrails: {
    triggered: boolean;
    reason?: string;
  };
  items: any[];
  source_files?: Record<string, string>;
  entry_file?: string;
  dependencies?: string[];
  devDependencies?: string[];
  html?: string;
}

// ============================================================================
// Configuration
// ============================================================================

// Create Anthropic provider with explicit API key
const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Create Mistral provider with explicit API key
const mistral = createMistral({
  apiKey: process.env.MISTRAL_API_KEY || '',
});

const getModelConfig = (modelName: string = 'gpt-5') => {
  const normalizedModel = modelName.trim().toLowerCase();

  if (normalizedModel === 'claude-haiku' || normalizedModel.includes('haiku')) {
    return anthropic('claude-haiku-4-5-20251001');
  }
  if (normalizedModel === 'mistral' || normalizedModel.includes('mistral')) {
    return mistral('ft:mistral-medium-latest:0684c8ef:20251105:324d634c');
  }
  if (normalizedModel === 'gpt-5.2' || normalizedModel.includes('gpt-5.2')) {
    return openai('gpt-5.2-2025-12-11');
  }
  if (normalizedModel === 'gpt-5-mini' || normalizedModel.includes('gpt-5-mini')) {
    return openai('gpt-5-mini-2025-08-07');
  }
  if (normalizedModel === 'gpt-5.1-codex' || normalizedModel.includes('codex')) {
    return openai('gpt-5.1-codex-max');
  }
  return openai('gpt-5');
};

// Single agent always shows reasoning
const SHOW_REASONING = true;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Build conversation history from chat entries
 * Supports both simple text and multi-part content (text + images)
 */
function buildConversationHistory(
  chatHistory: WorkflowContextChatEntry[] = []
): Array<{ role: 'user' | 'assistant'; content: MessageContent }> {
  return chatHistory
    .slice(-6)
    .filter((entry) => {
      // Filter out entries with empty content
      if (typeof entry.content === 'string') {
        return entry.content.trim() !== '';
      }
      // For multi-part content, check if there's any actual content
      if (Array.isArray(entry.content)) {
        return entry.content.length > 0;
      }
      // Keep assistant messages (they may have tool calls)
      if (entry.role === 'assistant') {
        return true;
      }
      return entry.content != null;
    })
    .map((entry) => {
      // If content is a string, limit its length
      if (typeof entry.content === 'string') {
        return {
          role: entry.role,
          content: entry.content.slice(0, 4000),
        };
      }

      // If content is multi-part, pass through (images are already processed)
      return {
        role: entry.role,
        content: entry.content,
      };
    });
}

/**
 * Build user message with optional images
 * Creates a multi-part message if images are provided
 */
function buildUserMessage(text: string, images?: ImageContent[]): MessageContent {
  if (!images || images.length === 0) {
    return text;
  }

  // Build multi-part content with text and images
  const parts: Array<
    | { type: 'text'; text: string }
    | { type: 'image'; image: ImageContent }
  > = [
    { type: 'text', text },
  ];

  // Add each image
  images.forEach((image) => {
    parts.push({ type: 'image', image });
  });

  return parts;
}

/**
 * Build context preface from workflow context
 */
function buildContextPreface(context?: WorkflowContext): string {
  if (!context) return '';

  let preface = '';

  // Add route context
  if (context.selectedRoute) {
    preface += `Current route: ${context.selectedRoute}\n`;
  }

  // Add known pages
  if (context.pages && context.pages.length > 0) {
    preface += `Known pages:\n${context.pages.map(p => `- ${p.path}: ${p.title}`).join('\n')}\n`;
  }

  // Add device context
  if (context.device) {
    preface += `Device: ${context.device}\n`;
  }

  // Add chat summary
  if (context.chatSummary) {
    preface += `\nConversation summary: ${context.chatSummary}\n`;
  }

  // Add selected element
  if (context.selectedElement) {
    preface += `\nSelected element:\n`;
    preface += `Selector: ${context.selectedElement.selector}\n`;
    preface += `HTML: ${context.selectedElement.outerHTML.slice(0, 500)}\n`;
  }

  // Add current HTML
  if (context.html) {
    preface += `\nCurrent survey HTML:\n${context.html.slice(0, 1000)}\n`;
  }

  return preface;
}

/**
 * Check guardrails (safety checks)
 * For now, using a simple implementation. Can integrate OpenAI Guardrails API.
 */
async function checkGuardrails(text: string): Promise<{
  safe: boolean;
  reason?: string;
}> {
  try {
    const result = await generateText({
      model: openai('gpt-5'),
      system: `Analyze the following text for safety concerns.
      Check for:
      1. Personal Identifiable Information (PII) like SSN, credit cards
      2. Inappropriate or offensive content
      3. Jailbreak attempts or prompt injection
      4. Requests to generate harmful content

      Return JSON: { safe: boolean, reason?: string }
      If safe, return { safe: true }
      If unsafe, return { safe: false, reason: "brief explanation" }`,
      messages: [
        { role: 'user', content: text }
      ],
    });

    return JSON.parse(result.text);
  } catch (error) {
    console.error('Guardrails check failed:', error);
    // Fail safe - allow the request but log the error
    return { safe: true };
  }
}

/**
 * Verify build output for quality standards
 */
function verifyBuildOutput(files: Map<string, string>): {
  passed: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check if files exist
  if (files.size === 0) {
    errors.push('No files were created');
    return { passed: false, errors };
  }

  // Check each file for standards
  for (const [filePath, content] of files.entries()) {
    // Check for shadcn component usage
    if (content.includes('<button') && !content.includes('Button')) {
      errors.push(`${filePath}: Use shadcn Button component instead of <button>`);
    }

    if (content.includes('<input') && !content.includes('Input')) {
      errors.push(`${filePath}: Use shadcn Input component instead of <input>`);
    }

    // Check for proper spacing
    if (!content.includes('px-') || !content.includes('py-')) {
      errors.push(`${filePath}: Missing proper padding (px-6 py-12)`);
    }

    // Check for centered layout
    if (!content.includes('mx-auto')) {
      errors.push(`${filePath}: Missing centered layout (mx-auto)`);
    }

    // Check for rounded corners
    if (!content.includes('rounded-')) {
      errors.push(`${filePath}: Missing rounded corners (rounded-2xl)`);
    }
  }

  return {
    passed: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Project Management Tools
// ============================================================================

const todoWriteTool = tool({
  description: 'Create and manage structured task lists for complex coding sessions. Use this to break down work into steps and track progress.',
  inputSchema: z.object({
    project_name: z.string().describe('Project identifier'),
    todos: z.array(z.object({
      task: z.string().describe('Task description'),
      status: z.enum(['pending', 'in_progress', 'completed']).describe('Task status'),
      priority: z.enum(['low', 'medium', 'high']).optional().describe('Task priority'),
    })).describe('List of todo items'),
  }),
  execute: async ({ project_name, todos }) => {
    const files = projectFiles.get(project_name);

    if (!files) {
      return {
        status: 'error',
        message: 'Project not found',
      };
    }

    // Store todos in a special tracking structure
    const todoContent = todos.map(todo =>
      `[${todo.status === 'completed' ? 'x' : ' '}] ${todo.task} ${todo.priority ? `(${todo.priority})` : ''}`
    ).join('\n');

    return {
      status: 'success',
      todos,
      total_tasks: todos.length,
      completed_tasks: todos.filter(t => t.status === 'completed').length,
      pending_tasks: todos.filter(t => t.status === 'pending').length,
      in_progress_tasks: todos.filter(t => t.status === 'in_progress').length,
    };
  },
});

// ============================================================================
// Set Status Tool - lets the agent name its current process group in the UI
// ============================================================================

const setStatusTool = tool({
  description: 'Call this BEFORE each group of related tool calls to label what you are doing. The label appears as a shimmer title in the UI while the sub-tasks run underneath it. Write descriptive, contextual titles (6-14 words) that tell the user exactly what is happening and why. Include specifics like component names, feature names, or what you are fixing. Examples: "Setting up the Next.js project with Tailwind CSS", "Building the multi-step feedback form with progress bar", "Fixing the missing onClick handler on the submit button", "Adding smooth fade-in animations to question cards", "Checking the console for rendering errors in SurveyPage". Call this every time you start a new logical phase of work.',
  inputSchema: z.object({
    status: z.string().describe('Descriptive title for the current phase of work (6-14 words). Be specific — include component names, feature details, or the reason for the action. E.g. "Building the NPS rating scale with star icons", "Fixing the broken import in QuestionCard component"')
  }),
  execute: async ({ status }) => {
    return { status };
  },
});

// ============================================================================
// Suggest Followups Tool - provides structured suggestions to the client
// ============================================================================

const suggestFollowupsTool = tool({
  description: 'REQUIRED: Call this at the END of every response to provide exactly 3 follow-up suggestions. These appear as clickable pills for the user. Each suggestion should be a specific, actionable prompt that the user might want to try next. Make suggestions contextually relevant to what was just discussed or built.',
  inputSchema: z.object({
    suggestions: z.array(z.string().describe('A follow-up prompt the user might want to try'))
      .length(3)
      .describe('Exactly 3 follow-up suggestions, each 10-60 characters')
  }),
  execute: async ({ suggestions }) => {
    // This tool just returns the suggestions - the client reads them from toolInvocations
    return {
      suggestions,
    };
  },
});

// ============================================================================
// Set Checkpoint Title Tool - provides a descriptive title for version history
// ============================================================================

const setCheckpointTitleTool = tool({
  description: 'REQUIRED: Call this AFTER making any code changes to set a descriptive checkpoint title. This appears in the version history dropdown. Provide a concise 3-6 word title that summarizes what was changed (e.g., "Added progress bar", "Fixed mobile layout", "Updated color scheme").',
  inputSchema: z.object({
    title: z.string().describe('A concise 3-6 word title describing the changes made (e.g., "Added progress bar", "Fixed button styling")')
  }),
  execute: async ({ title }) => {
    // This tool just returns the title - the client reads it from toolInvocations
    return {
      checkpoint_title: title,
    };
  },
});

// ============================================================================
// Tool Set Definition (for useChat pattern)
// ============================================================================

const tools = {
  // Sandbox initialization & preview
  surb_init_sandbox: surbInitSandboxTool,
  surbe_build_preview: surbeBuildPreview,

  // Core file operations (surbe- prefix)
  surbe_write: surbeWrite,
  surbe_quick_edit: surbeQuickEdit,
  surbe_line_replace: surbeLineReplace,
  surbe_view: surbeView,
  surbe_delete: surbeDelete,
  surbe_rename: surbeRename,
  surbe_copy: surbeCopy,
  surbe_save_chat_image: surbeSaveChatImage,

  // Search & Analysis
  surbe_search_files: surbeSearchFiles,

  // Dependencies & Assets
  surbe_add_dependency: surbeAddDependency,
  surbe_remove_dependency: surbeRemoveDependency,
  surbe_download_to_repo: surbeDownloadToRepo,

  // Debugging
  surbe_read_console_logs: surbeReadConsoleLogs,
  surbe_read_network_requests: surbeReadNetworkRequests,

  // Web & Documents
  websearch_web_search: websearchWebSearch,
  surbe_fetch_website: surbeFetchWebsite,

  // Image Generation
  imagegen_generate_image: imagegenGenerateImage,
  imagegen_edit_image: imagegenEditImage,

  // Project Management
  todo_write: todoWriteTool,

  // Follow-up Suggestions
  suggest_followups: suggestFollowupsTool,

  // Checkpoint Title for version history
  set_checkpoint_title: setCheckpointTitleTool,

  // Status labels for UI process groups
  set_status: setStatusTool,

  // Block Editor Tools (preferred for standard surveys)
  block_create_survey: blockCreateSurveyTool,
  block_add_page: blockAddPageTool,
  block_add_block: blockAddBlockTool,
  block_update_block: blockUpdateBlockTool,
  block_delete_block: blockDeleteBlockTool,
  block_reorder_blocks: blockReorderBlocksTool,
  block_set_page_logic: blockSetPageLogicTool,
  block_update_theme: blockUpdateThemeTool,
  block_get_survey: blockGetSurveyTool,
  block_build_preview: blockBuildPreviewTool,
} satisfies ToolSet;

export type ChatTools = InferUITools<typeof tools>;
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;

/**
 * Convert ChatMessages to model-compatible messages with proper image/file handling
 * This handles both legacy 'image' parts and new AI SDK 'file' parts
 */
function convertMessagesWithImages(messages: ChatMessage[]): any[] {
  return messages.map((msg, idx) => {
    const imageParts = msg.parts?.filter((p: any) => p.type === 'image') || [];
    const fileParts = msg.parts?.filter((p: any) =>
      p.type === 'file' && p.mediaType?.startsWith('image/')
    ) || [];
    const textParts = msg.parts?.filter((p: any) => p.type === 'text') || [];
    const hasImages = imageParts.length > 0 || fileParts.length > 0;

    if (msg.role === 'user' && hasImages) {
      const content: any[] = [];

      textParts.forEach((p: any) => {
        content.push({ type: 'text', text: p.text || '' });
      });

      imageParts.forEach((p: any) => {
        if (p.image) {
          if (typeof p.image === 'string' && p.image.startsWith('data:')) {
            content.push({ type: 'image', image: p.image });
          } else if (typeof p.image === 'string') {
            content.push({ type: 'image', image: new URL(p.image) });
          }
        }
      });

      fileParts.forEach((p: any) => {
        if (p.url) {
          content.push({ type: 'image', image: p.url });
        }
      });

      return { role: 'user', content };
    }

    // For non-image messages, use convertToModelMessages format
    // Extract text from parts
    const textContent = textParts.map((p: any) => p.text || '').join('\n') || '';

    if (msg.role === 'user') {
      return {
        role: 'user',
        content: textContent
      };
    }

    if (msg.role === 'assistant') {
      // Handle assistant messages - may have tool calls
      const toolParts = msg.parts?.filter((p: any) => p.type === 'tool-invocation') || [];

      if (toolParts.length > 0) {
        // Return assistant message with tool calls
        return {
          role: 'assistant',
          content: textContent,
          toolCalls: toolParts.map((p: any) => ({
            id: p.toolInvocationId || p.toolCallId,
            type: 'function',
            function: {
              name: p.toolName,
              arguments: JSON.stringify(p.args || {})
            }
          }))
        };
      }

      return {
        role: 'assistant',
        content: textContent
      };
    }

    // Fallback
    return {
      role: msg.role,
      content: textContent
    };
  });
}

// ============================================================================
// New Streaming Workflow (useChat pattern)
// ============================================================================

interface DesignThemeData {
  id: string;
  name: string;
  colors: string[];
  description: string;
}

interface UserPreferences {
  name?: string;
  tone?: string;
  workFunction?: string;
  personalPreferences?: string;
}

export function streamWorkflowV3({ messages: rawMessages, model = 'gpt-5', projectId, userId, designTheme, userPreferences, thinking = false, existingBlockSurvey }: { messages: ChatMessage[], model?: string, projectId?: string, userId?: string, designTheme?: DesignThemeData | null, userPreferences?: UserPreferences, thinking?: boolean, existingBlockSurvey?: any }) {

  // CRITICAL: Filter out messages with empty or null content before processing
  // This prevents "messages.0: all messages must have non-empty content" error
  const messages = rawMessages.filter((msg) => {
    if (msg.role === 'assistant') return true;

    if (!msg.parts || msg.parts.length === 0) return false;

    const hasContent = msg.parts.some((part: any) => {
      if (part.type === 'text') return part.text && part.text.trim() !== '';
      if (part.type === 'image') return !!part.image;
      if (part.type === 'file') return !!part.url || !!part.data;
      return true;
    });

    return hasContent;
  });

  const totalImages = messages.reduce((count, msg) => {
    const imageParts = msg.parts?.filter((p: any) => p.type === 'image') || [];
    const fileParts = msg.parts?.filter((p: any) =>
      p.type === 'file' && p.mediaType?.startsWith('image/')
    ) || [];
    return count + imageParts.length + fileParts.length;
  }, 0);

  // Generate unique project name
  const projectName = `survey-${Date.now()}`;

  // Pre-load existing block survey if provided (from database restore)
  if (existingBlockSurvey) {
    const { blockSurveys } = require('./lovableTools');
    blockSurveys.set(existingBlockSurvey.id, existingBlockSurvey);
  }

  // Store uploaded images from messages in the shared chatUploadedImages map
  // This makes them accessible to the surbe_save_chat_image tool
  if (totalImages > 0) {
    const uploadedImages: { index: number; dataUrl: string; filename?: string; mediaType?: string }[] = [];
    let imageIndex = 0;

    messages.forEach((msg) => {
      if (msg.parts) {
        // Collect legacy image parts
        msg.parts.filter((p: any) => p.type === 'image').forEach((p: any) => {
          if (p.image && typeof p.image === 'string') {
            uploadedImages.push({
              index: imageIndex++,
              dataUrl: p.image,
              filename: `uploaded-image-${imageIndex}`,
              mediaType: p.image.startsWith('data:') ? p.image.split(';')[0].replace('data:', '') : 'image/png'
            });
          }
        });

        // Collect new AI SDK file parts (images only)
        msg.parts.filter((p: any) => p.type === 'file' && p.mediaType?.startsWith('image/')).forEach((p: any) => {
          if (p.url && typeof p.url === 'string') {
            uploadedImages.push({
              index: imageIndex++,
              dataUrl: p.url,
              filename: p.filename || `uploaded-image-${imageIndex}`,
              mediaType: p.mediaType || 'image/png'
            });
          }
        });
      }
    });

    chatUploadedImages.set(projectName, uploadedImages);
  }

  const selectedModel = getModelConfig(model);

  // Build system prompt using consolidated prompt from surbeeSystemPrompt.ts
  const finalSystemPrompt = buildSurbeeSystemPrompt({
    projectName,
    hasImages: totalImages > 0,
    designTheme: designTheme || undefined,
    userPreferences: userPreferences || undefined,
  });

  const isClaudeModel = model === 'claude-haiku' || model.includes('haiku') || model.includes('claude');
  const isMistralModel = model === 'mistral' || model.includes('mistral');
  const isReasoningModel = model.includes('o3') || model.includes('o4') || model === 'gpt-5';

  // Define save_survey_questions tool with context
  const saveSurveyQuestionsTool = tool({
    description: 'REQUIRED: Save the structured survey questions metadata to the database. Call this AFTER generating or modifying the survey code. This enables the Insights tab to track responses. MUST be called for every survey generation.',
    inputSchema: z.object({
      questions: z.array(z.object({
        question_id: z.string().describe('Unique ID matching data-question-id in code (q1, q2, etc.)'),
        question_text: z.string().describe('The exact question text shown to user'),
        question_type: z.enum(['text', 'email', 'multiple_choice', 'checkbox', 'rating_scale', 'nps', 'matrix', 'date', 'number', 'textarea', 'select', 'radio', 'range', 'other']).describe('Type of question - use "other" for custom/creative question types not in the list'),
        options: z.array(z.string()).optional().describe('Options for multiple choice/checkbox/select'),
        required: z.boolean().default(false),
        order_index: z.number().describe('Order in the survey (0-based)'),
        scale_min: z.number().optional().describe('Min value for rating_scale/nps/range'),
        scale_max: z.number().optional().describe('Max value for rating_scale/nps/range'),
        metadata: z.record(z.any()).optional().describe('Additional metadata (matrix rows/cols, validation rules, etc.)'),
      })).describe('List of ALL questions in the survey - must match code exactly'),
    }),
    execute: async ({ questions }) => {
      if (!projectId || !userId) {
        return {
          status: 'error',
          message: 'Internal context missing.'
        };
      }

      try {
        // Delete existing questions
        const { error: deleteError } = await supabaseAdmin
          .from('survey_questions')
          .delete()
          .eq('project_id', projectId);

        if (deleteError) {
          console.error('Error deleting old questions:', deleteError);
        }

        // Insert new questions with full metadata
        const questionsToInsert = questions.map((q: any) => {
          return {
            project_id: projectId,
            question_id: q.question_id, // Store the agent-generated ID (q1, q2, etc.)
            question_text: q.question_text,
            question_type: q.question_type, // Keep original type (schema now supports all)
            options: q.options || null,
            required: q.required || false,
            order_index: q.order_index,
            scale_min: q.scale_min || null,
            scale_max: q.scale_max || null,
            metadata: q.metadata || {},
          };
        });

        const { data, error } = await supabaseAdmin
          .from('survey_questions')
          .insert(questionsToInsert)
          .select();

        if (error) {
          console.error('Error inserting questions:', error);
          return { status: 'error', message: error.message };
        }

        return {
          status: 'success',
          count: data.length,
          message: 'Questions saved successfully to database'
        };
      } catch (err: any) {
        console.error('Exception saving questions:', err);
        return { status: 'error', message: err.message };
      }
    },
  });

  // Define read_console_logs tool that fetches from sandbox relay
  const readConsoleLogs = tool({
    description: 'REQUIRED after every surbe_build_preview: Read console logs and compilation errors from the sandbox. Returns Next.js compilation errors, warnings, and recent stdout. If errors are found, you MUST fix them before finishing.',
    inputSchema: z.object({
      search: z.string().optional().describe('Optional search term to filter logs'),
    }),
    execute: async ({ search }) => {
      if (!projectId || !userId) {
        return { status: 'info', message: 'No project context.', errors: [], warnings: [], stdout: [], error_count: 0 };
      }

      try {
        // Look up sandbox relay URL from DB
        const { data: project } = await supabaseAdmin
          .from('projects')
          .select('sandbox_relay_url')
          .eq('id', projectId)
          .eq('user_id', userId)
          .single();

        if (!project?.sandbox_relay_url) {
          return { status: 'info', message: 'No sandbox running.', errors: [], warnings: [], stdout: [], error_count: 0 };
        }

        const resp = await fetch(`${project.sandbox_relay_url}/logs?lines=100`, {
          signal: AbortSignal.timeout(5000),
        });

        if (!resp.ok) {
          return { status: 'error', message: 'Failed to fetch logs.', errors: [], warnings: [], stdout: [], error_count: 0 };
        }

        const data = await resp.json();
        let errors: string[] = data.errors || [];
        let warnings: string[] = data.warnings || [];

        // Apply search filter if provided
        if (search) {
          const term = search.toLowerCase();
          errors = errors.filter((e: string) => e.toLowerCase().includes(term));
          warnings = warnings.filter((w: string) => w.toLowerCase().includes(term));
        }

        return {
          status: 'success',
          error_count: errors.length,
          warning_count: warnings.length,
          errors,
          warnings,
          stdout: (data.stdout || []).slice(-15),
        };
      } catch (err: any) {
        return { status: 'error', message: err.message, errors: [], warnings: [], stdout: [], error_count: 0 };
      }
    },
  });

  const streamConfig: any = {
    model: selectedModel,
    experimental_transform: smoothStream(),
    stopWhen: (result: any) => {
      const stepCount = result.steps?.length || 0;
      if (stepCount >= 50) return true;

      const lastStep = result.steps?.[result.steps.length - 1];
      if (lastStep?.toolCalls && lastStep.toolCalls.length > 0) return false;

      return false;
    },
    system: finalSystemPrompt,
    // Use custom converter that handles images properly, then filter out any empty messages
    messages: (totalImages > 0 ? convertMessagesWithImages(messages) : convertToModelMessages(messages))
      .filter((msg: any) => {
        // Filter out messages with empty/null/undefined content
        if (msg.role === 'assistant') {
          // Assistant messages with tool calls are valid even with empty text content
          if (msg.toolCalls && msg.toolCalls.length > 0) return true;
          // Otherwise, keep if has content
          if (!msg.content) return false;
          if (typeof msg.content === 'string' && msg.content.trim() === '') return false;
        }
        if (msg.role === 'user') {
          // User messages must have content
          if (!msg.content) return false;
          if (typeof msg.content === 'string' && msg.content.trim() === '') return false;
          if (Array.isArray(msg.content) && msg.content.length === 0) return false;
        }
        return true;
      }),
    tools: {
      ...tools,
      surbe_read_console_logs: readConsoleLogs,
      save_survey_questions: saveSurveyQuestionsTool,
    },
  };

  if (isClaudeModel && thinking) {
    streamConfig.providerOptions = {
      anthropic: {
        thinking: {
          type: 'enabled',
          budgetTokens: 10000,
        },
      },
    };
  } else if (isMistralModel) {
    streamConfig.providerOptions = {
      mistral: {
        safePrompt: false,
      },
    };
  } else if (isReasoningModel && thinking) {
    // Enable reasoning when user explicitly toggles thinking on
    streamConfig.providerOptions = {
      openai: {
        reasoningEffort: 'medium',
      },
    };
  }

  return streamText(streamConfig);
}
