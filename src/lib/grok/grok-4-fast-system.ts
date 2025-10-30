import OpenAI from "openai";

/**
 * Grok 4 Fast Reasoning System
 * 
 * Handles streaming of reasoning and HTML content separately for survey generation.
 * Uses the grok-4-fast-reasoning model for high-quality, market-ready surveys.
 */

export type ThinkingCallback = (delta: string) => void;
export type StatusCallback = (status: "thinking" | "building" | "complete" | "error", detail?: string) => void;
export type HtmlChunkCallback = (chunk: string) => void;
export type UsageCallback = (usage: Record<string, unknown>) => void;

export interface GrokRunOptions {
  prompt: string;
  conversationId?: string;
  images?: Array<{ url: string; detail?: "low" | "medium" | "high" }>;
  onThinking?: ThinkingCallback;
  onStatus?: StatusCallback;
  onHtmlChunk?: HtmlChunkCallback;
  onComplete?: (result: { html: string; conversationId: string; usage?: Record<string, unknown>; suggestions?: string }) => void;
  onError?: (error: Error) => void;
  onUsage?: UsageCallback;
}

export interface GrokResult {
  conversationId: string;
  html: string;
  usage?: Record<string, unknown>;
  suggestions?: string;
}

export class Grok4FastSystem {
  private client: OpenAI;
  private systemPrompt: string;
  private conversationHistory: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];

  constructor(options?: { apiKey?: string; baseURL?: string; systemPrompt?: string }) {
    const apiKey = options?.apiKey ?? process.env.XAI_API_KEY;
    
    if (!apiKey) {
      throw new Error("Grok4FastSystem requires an XAI API key (XAI_API_KEY environment variable).");
    }

    this.client = new OpenAI({
      apiKey,
      baseURL: options?.baseURL ?? process.env.XAI_API_BASE_URL ?? "https://api.x.ai/v1",
      timeout: 360000, // 6 minutes for reasoning models
    });

    this.systemPrompt = options?.systemPrompt ?? this.getDefaultSystemPrompt();
  }

  private getDefaultSystemPrompt(): string {
    return `You are an expert survey designer using Grok 4 Fast Reasoning to create beautiful, market-ready surveys.

**Your role:**
- Create production-quality HTML surveys that are new to the market
- Design beautiful, precise, and accessible surveys
- Use modern styling (Tailwind-like utilities or embedded CSS)
- Ensure surveys are fully functional with proper validation
- Make surveys responsive and mobile-friendly

**Output format:**
- Return ONLY complete HTML (starting with <!DOCTYPE html> and ending with </html>)
- Include all necessary CSS inline or in <style> tags
- Include any necessary JavaScript for validation and interactivity
- Use semantic HTML5 elements
- Ensure proper ARIA labels for accessibility

**Survey design principles:**
- Clean, modern aesthetic
- Intuitive user flow
- Clear visual hierarchy
- Professional typography
- Smooth interactions and transitions
- Progress indicators for multi-step surveys
- Clear error messages and validation feedback

Think through your design decisions, then generate the complete HTML.`;
  }

  /**
   * Run the Grok 4 Fast Reasoning model with streaming
   */
  public async run(options: GrokRunOptions): Promise<GrokResult> {
    const {
      prompt,
      conversationId,
      images,
      onThinking,
      onStatus,
      onHtmlChunk,
      onComplete,
      onError,
      onUsage,
    } = options;

    if (!prompt || !prompt.trim()) {
      throw new Error("Prompt is required for Grok4FastSystem.run");
    }

    try {
      // Build messages array
      const messages = this.buildMessages(prompt, images);
      
      onStatus?.("thinking", "Analyzing your request...");
      console.log('[Grok4Fast] Starting survey generation');

      // Create streaming completion
      const stream = await this.client.chat.completions.create({
        model: "grok-4-fast-reasoning",
        messages,
        stream: true,
        max_tokens: 60000,
        temperature: 0.7,
      });

      let htmlBuffer = "";
      let reasoningBuffer = "";
      let isHtmlStarted = false;
      const htmlStartPatterns = [
        /<!DOCTYPE html/i,
        /<html[>\s]/i,
        /<head[>\s]/i,
        /<body[>\s]/i,
      ];

      // Process stream
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;

        // Handle reasoning content (thinking process)
        if (delta?.reasoning_content) {
          const reasoningDelta = delta.reasoning_content;
          reasoningBuffer += reasoningDelta;
          
          // Stream thinking to chat
          if (reasoningDelta.trim()) {
            onThinking?.(reasoningDelta);
            console.log('[Grok4Fast] Reasoning:', reasoningDelta.substring(0, 100) + '...');
          }
        }

        // Handle content (HTML output)
        if (delta?.content) {
          const contentDelta = delta.content;
          
          // Check if HTML has started
          if (!isHtmlStarted) {
            for (const pattern of htmlStartPatterns) {
              if (pattern.test(contentDelta)) {
                isHtmlStarted = true;
                onStatus?.("building", "Generating survey HTML...");
                console.log('[Grok4Fast] HTML generation started');
                break;
              }
            }
          }

          // If HTML has started, stream it to the iframe
          if (isHtmlStarted) {
            htmlBuffer += contentDelta;
            onHtmlChunk?.(contentDelta);
          } else {
            // Before HTML starts, treat as additional thinking/commentary
            if (contentDelta.trim()) {
              onThinking?.(contentDelta);
            }
          }
        }
      }

      console.log('[Grok4Fast] Stream completed');
      console.log('[Grok4Fast] HTML buffer length:', htmlBuffer.length);
      console.log('[Grok4Fast] Reasoning buffer length:', reasoningBuffer.length);

      // Extract clean HTML
      const finalHtml = this.extractCleanHtml(htmlBuffer);
      
      if (!finalHtml || finalHtml.length < 100) {
        throw new Error("Failed to generate valid HTML. Please try again.");
      }

      // Generate conversation ID
      const responseId = conversationId || `grok-fast-${Date.now()}`;

      // Create usage stats
      const usage = this.estimateUsage(JSON.stringify(messages), htmlBuffer, reasoningBuffer);
      
      if (onUsage) {
        onUsage(usage);
      }

      onStatus?.("complete", `Generated ${finalHtml.length} characters of HTML`);

      // Generate suggestions for next steps
      const suggestions = await this.generateSuggestions(finalHtml, prompt);

      const result: GrokResult = {
        conversationId: responseId,
        html: finalHtml,
        usage,
        suggestions,
      };

      onComplete?.(result);
      return result;

    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('[Grok4Fast] Error:', error);
      onStatus?.("error", error.message);
      onError?.(error);
      throw error;
    }
  }

  /**
   * Build messages array for the API call
   */
  private buildMessages(prompt: string, images?: Array<{ url: string; detail?: "low" | "medium" | "high" }>): Array<any> {
    const messages: Array<any> = [];

    // Add system prompt
    messages.push({
      role: "system",
      content: this.systemPrompt,
    });

    // Build user message with optional images
    if (images && images.length > 0) {
      const content: Array<any> = [];
      
      // Add images first
      for (const image of images) {
        content.push({
          type: "image_url",
          image_url: {
            url: image.url,
            detail: image.detail ?? "high",
          },
        });
      }
      
      // Add text prompt
      content.push({
        type: "text",
        text: prompt,
      });
      
      messages.push({
        role: "user",
        content,
      });
    } else {
      messages.push({
        role: "user",
        content: prompt,
      });
    }

    return messages;
  }

  /**
   * Extract clean HTML from buffer, removing any markdown or extra text
   */
  private extractCleanHtml(buffer: string): string {
    if (!buffer) return "";

    // Remove markdown code blocks
    let cleaned = buffer.replace(/```html\s*/gi, "").replace(/```\s*$/g, "");

    // Find DOCTYPE or <html> tag
    const doctypeMatch = cleaned.match(/<!DOCTYPE html[\s\S]*?<\/html>/i);
    if (doctypeMatch) {
      return doctypeMatch[0];
    }

    const htmlMatch = cleaned.match(/<html[\s\S]*?<\/html>/i);
    if (htmlMatch) {
      return htmlMatch[0];
    }

    // Look for body content
    const bodyMatch = cleaned.match(/<body[\s\S]*?<\/body>/i);
    if (bodyMatch) {
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Survey</title>
</head>
${bodyMatch[0]}
</html>`;
    }

    // If we have HTML tags, wrap them
    if (cleaned.includes("<") && cleaned.includes(">")) {
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Survey</title>
</head>
<body>
${cleaned}
</body>
</html>`;
    }

    return cleaned;
  }

  /**
   * Estimate token usage for the request
   */
  private estimateUsage(input: string, output: string, reasoning: string): Record<string, unknown> {
    const promptTokens = Math.ceil(input.length / 4);
    const completionTokens = Math.ceil(output.length / 4);
    const reasoningTokens = Math.ceil(reasoning.length / 4);

    return {
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: promptTokens + completionTokens,
      prompt_tokens_details: {
        text_tokens: promptTokens,
        audio_tokens: 0,
        image_tokens: 0,
        cached_tokens: 0,
      },
      completion_tokens_details: {
        reasoning_tokens: reasoningTokens,
        audio_tokens: 0,
        accepted_prediction_tokens: 0,
        rejected_prediction_tokens: 0,
      },
      num_sources_used: 0,
    };
  }

  /**
   * Generate helpful suggestions for survey improvements
   */
  private async generateSuggestions(html: string, originalPrompt: string): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: "grok-4-fast-reasoning",
        messages: [
          {
            role: "system",
            content: "You are a survey design expert. Provide 2-3 concise, actionable suggestions for improving or extending the survey. Be specific and helpful.",
          },
          {
            role: "user",
            content: `I just created a survey for: "${originalPrompt}". The survey has ${Math.ceil(html.length / 1000)}KB of HTML. Suggest 2-3 specific improvements or next steps in a friendly, conversational tone. Keep it under 100 words.`,
          },
        ],
        max_tokens: 200,
        temperature: 0.8,
      });

      return response.choices[0]?.message?.content || "Survey created successfully! Let me know if you need any changes.";
    } catch (error) {
      console.error('[Grok4Fast] Error generating suggestions:', error);
      return "Survey created successfully! Feel free to ask for modifications like adding validation, changing colors, or restructuring the layout.";
    }
  }
}

