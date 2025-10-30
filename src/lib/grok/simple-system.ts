import OpenAI from "openai";

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
  onComplete?: (result: { html: string; conversationId: string; usage?: Record<string, unknown> }) => void;
  onError?: (error: Error) => void;
  onUsage?: UsageCallback;
}

export class GrokSurveySystem {
  private client: OpenAI;
  private systemPrompt: string;

  constructor(options?: { apiKey?: string; baseURL?: string; systemPrompt?: string }) {
    const apiKey = options?.apiKey ?? process.env.XAI_API_KEY;
    console.log('[GrokSurveySystem] API Key check:', apiKey ? `Found key: ${apiKey.substring(0, 10)}...` : 'No API key found');
    if (!apiKey) {
      throw new Error("GrokSurveySystem requires an XAI API key (XAI_API_KEY).");
    }

    this.client = new OpenAI({
      apiKey,
      baseURL: options?.baseURL ?? process.env.XAI_API_BASE_URL ?? "https://api.x.ai/v1",
      timeout: 360000,
    });

    this.systemPrompt =
      options?.systemPrompt ??
      [
        "You are Grok Fast Reasoning, building production quality surveys as HTML.",
        "Always return a single complete document that begins with <!DOCTYPE html> and ends with </html>.",
        "Stream your reasoning first, then build the survey and finish with the final HTML only.",
        "Use accessible markup, semantic structure, validation, and pleasing styling.",
      ].join(" ");
  }

  public async run(options: GrokRunOptions): Promise<{ conversationId: string; html: string; usage?: Record<string, unknown> }> {
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
      throw new Error("Prompt is required for GrokSurveySystem.run");
    }

    const messages: Array<{
      role: "system" | "user" | "assistant";
      content:
        | string
        | Array<
            | { type: "text"; text: string }
            | { type: "image_url"; image_url: { url: string; detail?: "low" | "medium" | "high" } }
          >;
    }> = [];

    // Add system message
    messages.push({ role: "system", content: this.systemPrompt });

    // Build user message content
    const userContent: Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string; detail?: "low" | "medium" | "high" } }
    > = [];

    // Add images if provided
    if (Array.isArray(images)) {
      for (const image of images) {
        if (image?.url) {
          userContent.push({
            type: "image_url",
            image_url: { url: image.url, detail: image.detail ?? "high" },
          });
        }
      }
    }

    // Add text prompt
    userContent.push({
      type: "text",
      text: prompt,
    });

    messages.push({ role: "user", content: userContent });

    let htmlBuffer = "";

    try {
      onStatus?.("thinking", "Analyzing request...");
      console.log('[GrokSurveySystem] Starting chat completion stream');

      const stream = await this.client.chat.completions.create({
        model: "grok-4-fast-reasoning",
        messages: messages,
        stream: true,
        max_tokens: 60000
      });

      console.log('[GrokSurveySystem] Stream created, processing chunks');

      const flattenDeltaContent = (input: unknown): string => {
        if (!input) return '';
        if (typeof input === 'string') return input;
        if (Array.isArray(input)) {
          return input.map(flattenDeltaContent).join('');
        }
        if (typeof input === 'object') {
          const maybeText = (input as any).text;
          if (typeof maybeText === 'string') return maybeText;
          const maybeContent = (input as any).content;
          if (typeof maybeContent === 'string') return maybeContent;
          if (Array.isArray(maybeContent)) {
            return flattenDeltaContent(maybeContent);
          }
        }
        return '';
      };

      const sanitizeChunk = (value: string) =>
        value.replace(/```(?:html)?/gi, '').replace(/\r/g, '\n');

      const emitThinkingLines = (payload: string) => {
        const normalized = sanitizeChunk(payload);
        for (const piece of normalized.split(/\r?\n/)) {
          const line = piece.trim();
          if (line) {
            onThinking?.(line);
          }
        }
      };

      const htmlStartRegex = /<!DOCTYPE html|<html\b|<head\b|<body\b/i;
      let htmlStreamStarted = false;

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;

        const rawReasoning = flattenDeltaContent(delta?.reasoning_content);
        if (rawReasoning) {
          console.log('[GrokSurveySystem] Reasoning chunk:', rawReasoning.substring(0, 50) + '...');
          emitThinkingLines(rawReasoning);
        }

        const rawContent = flattenDeltaContent(delta?.content);
        if (!rawContent) {
          continue;
        }

        let cleaned = sanitizeChunk(rawContent);
        if (rawReasoning) {
          const normalizedReasoning = sanitizeChunk(rawReasoning);
          if (normalizedReasoning) {
            cleaned = cleaned.split(normalizedReasoning).join('');
          }
        }

        if (!cleaned.trim()) {
          continue;
        }

        if (!htmlStreamStarted) {
          const match = cleaned.match(htmlStartRegex);
          if (match) {
            const index = match.index ?? 0;
            const reasoningPrefix = cleaned.slice(0, index);
            if (reasoningPrefix.trim()) {
              emitThinkingLines(reasoningPrefix);
            }

            const htmlPart = cleaned.slice(index).trimStart();
            if (htmlPart) {
              htmlStreamStarted = true;
              console.log('[GrokSurveySystem] HTML stream start chunk:', htmlPart.substring(0, 50) + '...');
              htmlBuffer += htmlPart;
              onHtmlChunk?.(htmlPart);
              onStatus?.("building", "Generating survey HTML...");
            }
            continue;
          }

          const trimmedLeading = cleaned.trimStart();
          if (trimmedLeading.startsWith('<')) {
            htmlStreamStarted = true;
            console.log('[GrokSurveySystem] HTML stream start chunk:', trimmedLeading.substring(0, 50) + '...');
            htmlBuffer += cleaned;
            onHtmlChunk?.(cleaned);
            onStatus?.("building", "Generating survey HTML...");
            continue;
          }

          emitThinkingLines(cleaned);
          continue;
        }

        if (!cleaned.trim()) {
          continue;
        }

        let htmlChunk = cleaned;
        const firstTagIndex = htmlChunk.indexOf('<');
        if (firstTagIndex > 0) {
          const prefix = htmlChunk.slice(0, firstTagIndex);
          if (prefix.trim()) {
            emitThinkingLines(prefix);
          }
          htmlChunk = htmlChunk.slice(firstTagIndex);
        }

        const closingTag = '</html>';
        const closingIndex = htmlChunk.toLowerCase().lastIndexOf(closingTag);
        if (closingIndex !== -1 && closingIndex + closingTag.length < htmlChunk.length) {
          const suffix = htmlChunk.slice(closingIndex + closingTag.length);
          if (suffix.trim()) {
            emitThinkingLines(suffix);
          }
          htmlChunk = htmlChunk.slice(0, closingIndex + closingTag.length);
        }

        if (!htmlChunk.trim()) {
          continue;
        }

        console.log('[GrokSurveySystem] HTML chunk:', htmlChunk.substring(0, 50) + '...');
        htmlBuffer += htmlChunk;
        onHtmlChunk?.(htmlChunk);
        onStatus?.("building", "Generating survey HTML...");
      }

      console.log('[GrokSurveySystem] Stream completed, buffer length:', htmlBuffer.length);

      // For chat completions, we don't have a final response object
      // Generate a conversation ID and simulate usage
      const responseId = conversationId || `grok-${Date.now()}`;
      const usage = {
        prompt_tokens: Math.ceil(JSON.stringify(messages).length / 4),
        completion_tokens: Math.ceil(htmlBuffer.length / 4),
        total_tokens: Math.ceil((JSON.stringify(messages).length + htmlBuffer.length) / 4),
        completion_tokens_details: {
          reasoning_tokens: Math.ceil(htmlBuffer.length * 0.3), // Estimate reasoning tokens
        }
      };

      console.log('[GrokSurveySystem] Final response:', { responseId, usage, htmlBufferLength: htmlBuffer.length });

      if (usage) {
        onUsage(usage);
      }

      const finalHtml = this.extractHtmlFromText(htmlBuffer);
      console.log('[GrokSurveySystem] Extracted HTML length:', finalHtml.length);

      if (!finalHtml) {
        throw new Error("Grok did not return HTML content.");
      }

      console.log('[GrokSurveySystem] Sending completion status');
      onStatus?.("complete", "Survey HTML ready");

      // Generate follow-up suggestions after survey completion
      const suggestions = await this.generateSuggestions(finalHtml, prompt, responseId, onStatus);

      onComplete?.({ html: finalHtml, conversationId: responseId, usage, suggestions });
      return { conversationId: responseId, html: finalHtml, usage, suggestions };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('[GrokSurveySystem] Error:', error.message);
      onStatus?.("error", error.message);
      onError?.(error);
      throw error;
    }
  }

  private extractHtmlFromText(text: string): string {
    if (!text) return "";

    // First try to find a complete HTML document
    const docMatch = text.match(/<!DOCTYPE html>[\s\S]*?<\/html>/i);
    if (docMatch) return docMatch[0];

    // Try to find HTML tags
    const htmlIndex = text.toLowerCase().indexOf("<html");
    if (htmlIndex !== -1) {
      const end = text.toLowerCase().lastIndexOf("</html>");
      if (end !== -1) {
        return text.slice(htmlIndex, end + "</html>".length);
      }
      return text.slice(htmlIndex);
    }

    // If no HTML tags found, return the entire text (Grok might have generated just the HTML)
    return text.trim();
  }

  private extractHtml(final: any, fallback: string): string {
    const outputs = Array.isArray(final?.output) ? final.output : [];
    const textFragments: string[] = [];

    for (const item of outputs) {
      if (item?.type === "message" && Array.isArray(item.content)) {
        for (const content of item.content) {
          if (content?.type === "output_text" && typeof content.text === "string") {
            textFragments.push(content.text);
          }
        }
      }
    }

    const combined = (textFragments.join("\n") || fallback || "").trim();
    return this.extractHtmlFromText(combined);
  }

  private async generateSuggestions(
    html: string,
    originalPrompt: string,
    conversationId: string,
    onStatus?: StatusCallback
  ): Promise<string> {
    try {
      onStatus?.("thinking", "Generating suggestions...");
      console.log('[GrokSurveySystem] Generating follow-up suggestions');

      const suggestionPrompt = `Based on the survey I just created for the request "${originalPrompt}", provide a brief summary of what was built and suggest 3-4 specific improvements or next steps. Keep the response under 150 words and format as:

**Survey Created:** [Brief description]

**Suggested improvements:**
- [Improvement 1]
- [Improvement 2]
- [Improvement 3]`;

      const response = await this.client.chat.completions.create({
        model: "grok-4-fast-reasoning",
        messages: [
          {
            role: "system",
            content: "You are a survey design expert. Provide concise, actionable feedback on surveys."
          },
          {
            role: "user",
            content: suggestionPrompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      const suggestions = response.choices[0]?.message?.content || "Survey completed successfully!";
      console.log('[GrokSurveySystem] Generated suggestions:', suggestions.length, 'characters');

      return suggestions;
    } catch (error) {
      console.error('[GrokSurveySystem] Error generating suggestions:', error);
      return "Survey completed successfully! Consider adding validation, improving accessibility, or customizing the styling.";
    }
  }
}
