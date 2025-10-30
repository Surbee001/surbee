import { ChatMessage } from '../types';
import { extractHtmlFromResponse as extractHtmlSafe } from '../lib/html-utils';
import { ThinkingPhase } from '@/components/ui/thinking-chain-ai';

export interface ChatProcessorOptions {
  onMessage: (message: ChatMessage) => void;
  onMessageUpdate?: (id: string, text: string, suggestions?: string[]) => void;
  onError: (error: string) => void;
  onHtmlUpdate: (html: string) => void;
  onStateChange: (state: { isWorking: boolean; isThinking: boolean }) => void;
  onPromptApplied?: (prompt: string) => void;
  onProgressReset?: () => void;
  onProgress?: (step: { id: string; label: string; status: 'pending' | 'done' | 'error' }) => void;
  onUserMessageCreated?: (message: ChatMessage) => void;
  // New thinking chain callbacks
  onThinkingPhaseStart?: (phase: ThinkingPhase) => void;
  onThinkingPhaseUpdate?: (phase: ThinkingPhase) => void;
  onThinkingPhaseComplete?: (phase: ThinkingPhase) => void;
  onCurrentPhaseChange?: (phase: string) => void;
  onHtmlStream?: (html: string) => void;
}

export class ChatProcessor {
  private options: ChatProcessorOptions;
  private currentPhases: Map<string, ThinkingPhase> = new Map();
  private currentPhase: string | null = null;
  private thinkingStartTime: number | null = null;

  constructor(options: ChatProcessorOptions) {
    this.options = options;
  }

  /**
   * Start a new thinking phase
   */
  private startThinkingPhase(type: ThinkingPhase['type'], content: string = '', filename?: string): ThinkingPhase {
    const phase: ThinkingPhase = {
      id: `${type}-${Date.now()}`,
      type,
      content,
      filename,
      timestamp: new Date(),
      isComplete: false
    };

    if (type === 'thinking') {
      this.thinkingStartTime = Date.now();
    }

    this.currentPhases.set(type, phase);
    this.currentPhase = type;
    this.options.onThinkingPhaseStart?.(phase);
    this.options.onCurrentPhaseChange?.(type);
    
    return phase;
  }

  /**
   * Update an existing thinking phase
   */
  private updateThinkingPhase(type: ThinkingPhase['type'], content: string, htmlContent?: string): void {
    const phase = this.currentPhases.get(type);
    if (phase) {
      phase.content = content;
      if (htmlContent) {
        phase.htmlContent = htmlContent;
        this.options.onHtmlStream?.(htmlContent);
      }
      this.options.onThinkingPhaseUpdate?.(phase);
    }
  }

  /**
   * Complete a thinking phase
   */
  private completeThinkingPhase(type: ThinkingPhase['type'], suggestions?: string[]): void {
    const phase = this.currentPhases.get(type);
    if (phase) {
      phase.isComplete = true;
      if (type === 'thinking' && this.thinkingStartTime) {
        phase.duration = (Date.now() - this.thinkingStartTime) / 1000;
      }
      if (suggestions && suggestions.length > 0) {
        phase.suggestions = suggestions;
      }
      this.options.onThinkingPhaseComplete?.(phase);
    }
  }

  /**
   * Reset all thinking phases
   */
  private resetThinkingPhases(): void {
    this.currentPhases.clear();
    this.currentPhase = null;
    this.thinkingStartTime = null;
  }

  /**
   * Process a chat message and determine the appropriate action
   */
  async processMessage(
    message: string,
    currentHtml: string,
    previousPrompt: string,
    provider: string,
    model: string,
    selectedElement?: HTMLElement | null,
    attachedImages?: string[],
    projectId?: string,
    useLongContext?: boolean,
    chatSummary?: string
  ): Promise<void> {
    if (!message.trim() && !(Array.isArray(attachedImages) && attachedImages.length > 0)) return;

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
      timestamp: new Date(),
    };
    this.options.onMessage(userMessage);
    this.options.onUserMessageCreated?.(userMessage);

    // Reset any previous thinking phases and start fresh
    this.resetThinkingPhases();
    
    // Update working state and start thinking phase
    this.options.onStateChange({ isWorking: true, isThinking: true });
    this.startThinkingPhase('thinking', 'Understanding the request and analyzing requirements...');

    try {
      // Reset progress and start thinking steps
      this.options.onProgressReset?.();
      this.options.onProgress?.({ id: 'understand', label: 'Understanding request', status: 'pending' });

      // Detect if this is a URL redesign request
      const urlMatch = message.match(/https?:\/\/[^\s]+/);
      if (urlMatch) {
        this.options.onProgress?.({ id: 'understand', label: 'Understanding request', status: 'done' });
        this.options.onProgress?.({ id: 'fetch-source', label: 'Fetching source website', status: 'pending' });
        await this.handleUrlRedesign(urlMatch[0], provider, model);
        this.options.onProgress?.({ id: 'fetch-source', label: 'Fetching source website', status: 'done' });
      } else if (Array.isArray(attachedImages) && attachedImages.length > 0) {
        // Vision flow: use images to drive design
        this.options.onProgress?.({ id: 'understand', label: 'Understanding request', status: 'done' });
        this.options.onProgress?.({ id: 'vision', label: 'Interpreting images', status: 'pending' });
        await this.handleVisionDesign(message, attachedImages);
        this.options.onProgress?.({ id: 'vision', label: 'Interpreting images', status: 'done' });
      } else {
        // Determine if this is a follow-up modification
        // Only treat as follow-up if we have a previous prompt (i.e., at least one successful generation)
        const hasPreviousPrompt = Boolean(previousPrompt && previousPrompt.trim().length > 0);
        const hasCurrentHtml = currentHtml.trim().length > 0;
        const isDefaultHtml = this.isDefaultHtml(currentHtml);
        const isFollowUp = Boolean(hasPreviousPrompt && hasCurrentHtml && !isDefaultHtml);
        const selectedElementHtml = selectedElement ? selectedElement.outerHTML : undefined;

        console.log('[ChatProcessor] Route determination:', {
          hasPreviousPrompt,
          hasCurrentHtml,
          htmlLength: currentHtml.length,
          isDefaultHtml,
          isFollowUp,
          endpoint: isFollowUp ? 'PUT (update)' : 'POST (create)',
          htmlPreview: currentHtml.substring(0, 200) + '...',
          previousPromptPreview: previousPrompt ? previousPrompt.substring(0, 100) + '...' : 'none'
        });

        if (selectedElementHtml) {
          this.options.onProgress?.({ id: 'target-selection', label: 'Targeting selected element', status: 'pending' });
        }
        this.options.onProgress?.({ id: 'understand', label: 'Understanding request', status: 'done' });
        
        if (isFollowUp) {
          this.options.onProgress?.({ id: 'compute-changes', label: 'Computing changes', status: 'pending' });
        } else {
          this.options.onProgress?.({ id: 'plan-layout', label: 'Planning layout', status: 'pending' });
        }
        
        await this.handleAiRequest(message, currentHtml, previousPrompt, provider, model, isFollowUp, undefined, selectedElementHtml, projectId, useLongContext, chatSummary);
      }
    } catch (error: any) {
      // Clear any active thinking phases on error
      this.currentPhase = null;
      this.options.onCurrentPhaseChange?.('');
      this.handleError(error);
    } finally {
      this.options.onStateChange({ isWorking: false, isThinking: false });
      // Ensure all phases are marked complete on finish
      if (this.currentPhases.size > 0) {
        for (const phase of this.currentPhases.values()) {
          if (!phase.isComplete) {
            this.completeThinkingPhase(phase.type);
          }
        }
      }
    }
  }

  /**
   * Handle URL redesign requests
   */
  private async handleUrlRedesign(url: string, provider: string, model: string): Promise<void> {
    try {
      // Get markdown from URL
      const redesignResponse = await fetch("/api/website-builder/re-design", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!redesignResponse.ok) {
        throw new Error("Failed to fetch website content");
      }

      const { markdown } = await redesignResponse.json();
      
      // Generate new design based on markdown
      await this.handleAiRequest("", "", "", provider, model, false, markdown);
    } catch (error: any) {
      throw new Error(`Failed to redesign from URL: {error.message}`);
    }
  }

  /**
   * Handle AI generation requests
   */
  private async handleAiRequest(
    prompt: string,
    currentHtml: string,
    previousPrompt: string,
    provider: string,
    model: string,
    isFollowUp: boolean,
    redesignMarkdown?: string,
    selectedElementHtml?: string,
    projectId?: string,
    useLongContext?: boolean,
    chatSummary?: string
  ): Promise<void> {
    const endpoint = "/api/website-builder/ask-ai";
    const method = isFollowUp ? "PUT" : "POST";

    const body = isFollowUp
      ? {
          prompt,
          provider,
          previousPrompt,
          model,
          html: currentHtml,
          selectedElementHtml,
          projectId,
          useLongContext,
          chatSummary,
        }
      : {
          prompt,
          provider,
          model,
          html: "",
          redesignMarkdown,
          projectId,
          useLongContext,
          chatSummary,
        };

    console.log('[ChatProcessor] sending', method, endpoint, { isFollowUp, hasHtml: !!currentHtml, hasPrev: !!previousPrompt });
    const request = await fetch(endpoint, {
      method,
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": window.location.hostname,
      },
    });
    console.log('[ChatProcessor] response status', request?.status);

    if (!request.ok) {
      const errorText = await request.text();
      console.error('API request failed:', request.status, errorText);
      throw new Error(`Request failed with status: {request.status}. Response: {errorText}`);
    }

    if (isFollowUp) {
      // Handle streaming response for follow-ups (server returns full updated HTML as a stream)
      if (request.body) {
        const reader = request.body.getReader();
        const decoder = new TextDecoder();
        let result = '';

        // Real-time THINK/PLAN before HTML, DONE/NEXT after HTML
        let htmlStarted = false;
        let htmlCompleted = false;
        let preHtmlBuffer = '';
        let postHtmlBuffer = '';
        let preRemainder = '';
        let postRemainder = '';

        // Aggregate a single AI message from THINK/PLAN/DONE/NEXT across phases
        let aiMessageId: string | null = null;
        let think: string[] = [];
        let plan: string[] = [];
        let doneText: string | null = null;
        let nextText: string | null = null;

        const buildAggregate = () => {
          const parts: string[] = [];
          if (think.length) parts.push(think.map(l => l.replace(/^THINK:\s*/i, '').trim()).join('\n'));
          if (plan.length) parts.push(plan.map(l => l.replace(/^PLAN:\s*/i, '').trim()).join('\n'));
          if (doneText) parts.push(doneText.replace(/^DONE:\s*/i, '').trim());
          if (nextText) parts.push(nextText);
          return parts.filter(Boolean).join('\n\n');
        };

        const ensureMessage = () => {
          if (!aiMessageId) {
            const msg: ChatMessage = { id: (Date.now() + Math.floor(Math.random() * 1000)).toString(), text: '', isUser: false, timestamp: new Date() };
            aiMessageId = msg.id;
            this.options.onMessage(msg);
          }
        };

        const emitLine = (line: string) => {
          const trimmed = line.trim();
          if (!trimmed) return;
          // Handle server phase/status/error markers
          const phaseMatch = trimmed.match(/^<<<PHASE:(STATUS|REASON_PLAN|HTML|SUMMARY|ERROR)>>>\s*(.*)$/);
          if (phaseMatch) {
            const phase = phaseMatch[1];
            const msg = phaseMatch[2] || '';
            
            // Handle phase transitions
            if (phase === 'REASON_PLAN') {
              // Keep thinking phase active, AI will send THINK: and PLAN: lines
              this.options.onCurrentPhaseChange?.('thinking');
            } else if (phase === 'STATUS') {
              // Complete thinking, start planning with status message
              this.completeThinkingPhase('thinking');
              this.startThinkingPhase('planning', msg || 'Processing your request...');
            } else if (phase === 'HTML') {
              // Complete planning, start building
              this.completeThinkingPhase('planning');
              this.startThinkingPhase('building', '', '/components/GeneratedComponent.tsx');
            } else if (phase === 'SUMMARY') {
              // Complete building, start summary
              this.completeThinkingPhase('building');
              this.startThinkingPhase('summary', 'Generation completed successfully!');
            } else if (phase === 'ERROR' && msg) {
              // Surface error to UI
              this.options.onError(msg);
            }
            return;
          }
          const isThink = /^THINK:\s*/i.test(trimmed) || /^REASON:\s*/i.test(trimmed);
          const isPlan = /^PLAN:\s*/i.test(trimmed);
          const isDone = /^DONE:\s*/i.test(trimmed);
          const isNext = /^NEXT:\s*/i.test(trimmed);
          
          if (isThink) { 
            think.push(trimmed);
            // Update thinking phase content
            const content = think.map(l => l.replace(/^(THINK|REASON):\s*/i, '').trim()).join('\n');
            this.updateThinkingPhase('thinking', content);
          }
          else if (isPlan) { 
            plan.push(trimmed);
            // Update planning phase content
            const content = plan.map(l => l.replace(/^PLAN:\s*/i, '').trim()).join('\n');
            this.updateThinkingPhase('planning', content);
          }
          else if (isDone) { 
            doneText = trimmed;
            // Update summary phase with DONE content
            const summaryContent = trimmed.replace(/^DONE:\s*/i, '').trim();
            this.updateThinkingPhase('summary', summaryContent);
          }
          else if (isNext) {
            nextText = trimmed.replace(/^NEXT:\s*/i, '').trim();
            // Parse comma-separated suggestions
            const suggestions = nextText.split(',').map(s => s.trim()).filter(Boolean);
            // Complete summary phase when we get NEXT suggestions
            this.completeThinkingPhase('summary', suggestions);
          }
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);

          if (!htmlStarted) {
            const lower = chunk.toLowerCase();
            let idx = lower.indexOf('<!doctype html>');
            if (idx === -1) idx = lower.indexOf('<html');
            if (idx === -1) {
              preHtmlBuffer += chunk;
              const parts = (preRemainder + preHtmlBuffer).split('\n');
              preRemainder = parts.pop() || '';
              for (const ln of parts) emitLine(ln);
              preHtmlBuffer = '';
              continue;
            } else {
              // Emit any preface before HTML
              const before = preRemainder + chunk.slice(0, idx);
              const parts = before.split('\n');
              preRemainder = parts.pop() || '';
              for (const ln of parts) emitLine(ln);
              preRemainder = '';
              htmlStarted = true;
              // Complete planning and start building phase
              this.completeThinkingPhase('planning');
              this.startThinkingPhase('building', '', '/components/GeneratedComponent.tsx');
              // fallthrough: append from idx to result for HTML processing
              result += chunk.slice(idx);
            }
          } else if (!htmlCompleted) {
            result += chunk;
          } else {
            // After HTML completed, process status lines
            postHtmlBuffer += chunk;
            const parts = (postRemainder + postHtmlBuffer).split('\n');
            postRemainder = parts.pop() || '';
            for (const ln of parts) emitLine(ln);
            postHtmlBuffer = '';
          }

          // Apply partial HTML to live preview progressively
          if (htmlStarted && !htmlCompleted) {
            const partialHtml = extractHtmlSafe(result);
            if (partialHtml && partialHtml.length > 0) {
              this.options.onHtmlUpdate(partialHtml);
              // Update building phase with HTML content
              this.updateThinkingPhase('building', 'Writing component code...', partialHtml);
              this.options.onProgress?.({ id: 'compute-changes', label: 'Computing changes', status: 'pending' });
              this.options.onProgress?.({ id: 'apply', label: 'Applying updates', status: 'pending' });
              if (/<\/html>/i.test(partialHtml)) {
                htmlCompleted = true;
                this.completeThinkingPhase('building');
              }
            }
          }
        }

        // Process any trailing post-html lines
        const trailing = (postRemainder + postHtmlBuffer).split('\n');
        for (const ln of trailing) emitLine(ln);

        const finalHtml = extractHtmlSafe(result) || '';
        if (finalHtml && finalHtml.length > 0) {
          this.options.onHtmlUpdate(finalHtml);
          if (prompt && this.options.onPromptApplied) {
            this.options.onPromptApplied(prompt);
          }
          this.options.onProgress?.({ id: 'compute-changes', label: 'Computing changes', status: 'done' });
          this.options.onProgress?.({ id: 'apply', label: 'Applying updates', status: 'done' });
          
          // Start summary phase - will be updated by DONE/NEXT lines from AI
          this.startThinkingPhase('summary', 'Generation completed successfully!');
          
          // Suggestions are already streamed as NEXT lines; avoid extra generic message.
        } else {
          // Graceful: keep existing HTML and surface a status line instead of throwing
          this.options.onMessage({ id: (Date.now() + Math.floor(Math.random() * 1000)).toString(), text: 'STATUS: No changes were applied (model returned no HTML).', isUser: false, timestamp: new Date() });
        }
      } else {
        throw new Error('No response body received');
      }
    } else {
      // Handle streaming response for initial generation
      if (request.body) {
        const reader = request.body.getReader();
        const decoder = new TextDecoder();
        let result = "";
        let partialSeen = false;

        let htmlStarted = false;
        let htmlCompleted = false;
        let preHtmlBuffer = '';
        let postHtmlBuffer = '';
        let preRemainder = '';
        let postRemainder = '';

        // Aggregate a single AI message from THINK/PLAN/DONE/NEXT across phases
        let aiMessageId2: string | null = null;
        let think2: string[] = [];
        let plan2: string[] = [];
        let doneText2: string | null = null;
        let nextText2: string | null = null;

        const buildAggregate2 = () => {
          const parts: string[] = [];
          if (think2.length) parts.push(think2.map(l => l.replace(/^THINK:\s*/i, '').trim()).join('\n'));
          if (plan2.length) parts.push(plan2.map(l => l.replace(/^PLAN:\s*/i, '').trim()).join('\n'));
          if (doneText2) parts.push(doneText2.replace(/^DONE:\s*/i, '').trim());
          if (nextText2) parts.push(nextText2);
          return parts.filter(Boolean).join('\n\n');
        };

        const ensureMessage2 = () => {
          if (!aiMessageId2) {
            const msg: ChatMessage = { id: (Date.now() + Math.floor(Math.random() * 1000)).toString(), text: '', isUser: false, timestamp: new Date() };
            aiMessageId2 = msg.id;
            this.options.onMessage(msg);
          }
        };

        const emitLine = (line: string) => {
          const trimmed = line.trim();
          if (!trimmed) return;
          const phaseMatch2 = trimmed.match(/^<<<PHASE:(STATUS|REASON_PLAN|HTML|SUMMARY|ERROR)>>>\s*(.*)$/);
          if (phaseMatch2) {
            const phase = phaseMatch2[1];
            const msg = phaseMatch2[2] || '';
            
            // Handle phase transitions
            if (phase === 'REASON_PLAN') {
              // Keep thinking phase active, AI will send THINK: and PLAN: lines
              this.options.onCurrentPhaseChange?.('thinking');
            } else if (phase === 'STATUS') {
              // Complete thinking, start planning with status message
              this.completeThinkingPhase('thinking');
              this.startThinkingPhase('planning', msg || 'Processing your request...');
            } else if (phase === 'HTML') {
              // Complete planning, start building
              this.completeThinkingPhase('planning');
              this.startThinkingPhase('building', '', '/components/GeneratedComponent.tsx');
            } else if (phase === 'SUMMARY') {
              // Complete building, start summary
              this.completeThinkingPhase('building');
              this.startThinkingPhase('summary', 'Generation completed successfully!');
            } else if (phase === 'ERROR' && msg) {
              this.options.onError(msg);
            }
            return;
          }
          const isThink = /^THINK:\s*/i.test(trimmed) || /^REASON:\s*/i.test(trimmed);
          const isPlan = /^PLAN:\s*/i.test(trimmed);
          const isDone = /^DONE:\s*/i.test(trimmed);
          const isNext = /^NEXT:\s*/i.test(trimmed);
          
          if (isThink) { 
            think2.push(trimmed);
            // Update thinking phase content
            const content = think2.map(l => l.replace(/^(THINK|REASON):\s*/i, '').trim()).join('\n');
            this.updateThinkingPhase('thinking', content);
          }
          else if (isPlan) { 
            plan2.push(trimmed);
            // Update planning phase content
            const content = plan2.map(l => l.replace(/^PLAN:\s*/i, '').trim()).join('\n');
            this.updateThinkingPhase('planning', content);
          }
          else if (isDone) { 
            doneText2 = trimmed;
            // Update summary phase with DONE content
            const summaryContent = trimmed.replace(/^DONE:\s*/i, '').trim();
            this.updateThinkingPhase('summary', summaryContent);
          }
          else if (isNext) {
            nextText2 = trimmed.replace(/^NEXT:\s*/i, '').trim();
            // Parse comma-separated suggestions
            const suggestions = nextText2.split(',').map(s => s.trim()).filter(Boolean);
            // Complete summary phase when we get NEXT suggestions
            this.completeThinkingPhase('summary', suggestions);
          }
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);

          if (!htmlStarted) {
            const lower = chunk.toLowerCase();
            let idx = lower.indexOf('<!doctype html>');
            if (idx === -1) idx = lower.indexOf('<html');
            if (idx === -1) {
              preHtmlBuffer += chunk;
              const parts = (preRemainder + preHtmlBuffer).split('\n');
              preRemainder = parts.pop() || '';
              for (const ln of parts) emitLine(ln);
              preHtmlBuffer = '';
              continue;
            } else {
              const before = preRemainder + chunk.slice(0, idx);
              const parts = before.split('\n');
              preRemainder = parts.pop() || '';
              for (const ln of parts) emitLine(ln);
              preRemainder = '';
              htmlStarted = true;
              // Complete planning and start building phase
              this.completeThinkingPhase('planning');
              this.startThinkingPhase('building', '', '/components/GeneratedComponent.tsx');
              result += chunk.slice(idx);
            }
          } else if (!htmlCompleted) {
            result += chunk;
          } else {
            postHtmlBuffer += chunk;
            const parts = (postRemainder + postHtmlBuffer).split('\n');
            postRemainder = parts.pop() || '';
            for (const ln of parts) emitLine(ln);
            postHtmlBuffer = '';
          }

          // Live build: apply partial HTML when we detect a closing tag progression to avoid flicker
          const partialHtml = extractHtmlSafe(result);
          if (partialHtml && partialHtml.length > 0) {
            partialSeen = true;
            this.options.onHtmlUpdate(partialHtml);
            // Update building phase with HTML content
            this.updateThinkingPhase('building', 'Writing component code...', partialHtml);
            // Mark steps during streaming
            this.options.onProgress?.({ id: 'plan-layout', label: 'Planning layout', status: 'done' });
            this.options.onProgress?.({ id: 'generate', label: 'Generating structure', status: 'pending' });
            if (/<\/html>/i.test(partialHtml)) {
              htmlCompleted = true;
              this.completeThinkingPhase('building');
            }
          }
        }

        // Extract HTML from the result
        const html = extractHtmlSafe(result);
        if (html) {
          this.options.onHtmlUpdate(html);
          if (prompt && this.options.onPromptApplied) {
            this.options.onPromptApplied(prompt);
          }
          this.options.onProgress?.({ id: 'generate', label: 'Generating structure', status: 'done' });
          this.options.onProgress?.({ id: 'finalize', label: 'Finalizing', status: 'done' });
          
          // Start summary phase - will be updated by DONE/NEXT lines from AI
          this.startThinkingPhase('summary', 'Generation completed successfully!');
          
          // Suggestions are already streamed as NEXT lines; avoid extra generic message.
        } else {
          // Check if the AI returned a refusal message
          const lowerResult = result.toLowerCase();
          const isRefusal = lowerResult.includes('survey') || 
                           lowerResult.includes('form') || 
                           lowerResult.includes('questionnaire') ||
                           lowerResult.includes('cannot') ||
                           lowerResult.includes('can\'t') ||
                           lowerResult.includes('unable') ||
                           lowerResult.includes('sorry');
          
          if (isRefusal && result.trim().length > 0) {
            // AI has already provided a refusal message, just display it
            const aiMessage: ChatMessage = {
              id: (Date.now() + 3).toString(),
              text: result.trim(),
              isUser: false,
              timestamp: new Date(),
            };
            this.options.onMessage(aiMessage);
          } else {
            // Unexpected empty response
            const errorMessage: ChatMessage = {
              id: (Date.now() + 3).toString(),
              text: 'Sorry, I encountered an issue generating the content. Please try again.',
              isUser: false,
              timestamp: new Date(),
            };
            this.options.onMessage(errorMessage);
          }
          this.options.onProgress?.({ id: 'generate', label: 'Generating structure', status: 'error' });
        }
      } else {
        throw new Error('No response body received');
      }
    }
  }

  /**
   * Generate Surbee-style summary and suggestion pills using conversational temperature
   */
  private async appendGeneratedSummaryAndSuggestions(currentHtml: string, prompt?: string): Promise<void> {
    // Generate suggestions from existing NEXT lines already streamed; avoid extra network calls for performance.
    const suggestions: string[] = [];
    this.options.onMessage({
      id: (Date.now() + 7).toString(),
      text: 'Generation complete. Explore the NEXT suggestions above or ask for refinements.',
      isUser: false,
      timestamp: new Date(),
      suggestions,
    });
  }

  /**
   * Vision-driven design using OpenAI endpoint
   */
  private async handleVisionDesign(prompt: string, images: string[]): Promise<void> {
    const request = await fetch("/api/website-builder/vision-ask-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, images }),
    });

    if (!request.ok || !request.body) {
      throw new Error("Vision request failed");
    }

    const reader = request.body.getReader();
    const decoder = new TextDecoder();
    let result = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      result += chunk;
      const partial = extractHtmlSafe(result);
      if (partial && partial.length > 0) {
        this.options.onHtmlUpdate(partial);
        this.options.onProgress?.({ id: 'generate', label: 'Generating structure', status: 'pending' });
      }
    }

    const html = extractHtmlSafe(result) || result.trim();
    if (!html) {
      throw new Error('No HTML content returned from vision model');
    }

    this.options.onHtmlUpdate(html);
    this.options.onProgress?.({ id: 'generate', label: 'Generating structure', status: 'done' });
    this.options.onProgress?.({ id: 'finalize', label: 'Finalizing', status: 'done' });

    const summary = [
      'I translated your images into a clean, responsive survey experience:',
      '• Extracted visual hierarchy and typographic rhythm',
      '• Mirrored color, spacing, and component tone where appropriate',
      '• Preserved clarity and accessibility across devices',
      '',
      'Want refinements?'
    ].join('\n');
    const suggestions = [
      'Match brand colors',
      'Increase whitespace',
      'Add section dividers',
      'Introduce subtle motion',
      'Try condensed typography',
    ];
    this.options.onMessage({
      id: (Date.now() + 6).toString(),
      text: summary,
      isUser: false,
      timestamp: new Date(),
      suggestions,
    });
  }

  // Extraction handled via shared helper in ../lib/html-utils

  /**
   * Check if HTML is the default template or minimal/empty
   */
  private isDefaultHtml(html: string): boolean {
    if (!html || html.trim().length === 0) return true;
    
    // Check for minimal HTML structure (just basic elements, no content)
    const cleanHtml = html.replace(/\s+/g, ' ').trim().toLowerCase();
    
    // Default minimal HTML patterns
    const minimalPatterns = [
      // Empty body
      /<body[^>]*>\s*<\/body>/,
      // Only basic HTML structure with no meaningful content
      /<!doctypehtml><html[^>]*><head[^>]*>.*?<\/head><body[^>]*>\s*<\/body><\/html>/,
      // Very short HTML with no survey content
      cleanHtml.length < 200 && !cleanHtml.includes('input') && !cleanHtml.includes('form') && !cleanHtml.includes('button')
    ];
    
    // Check for old default messages (legacy)
    const legacyDefaults = [
      'Ask me anything.',
      'Ready to create',
      'Website Builder', 
      'Ready to build your website'
    ];
    
    // It's default if it matches minimal patterns OR contains legacy defaults
    const isMinimal = minimalPatterns.some(pattern => {
      if (pattern instanceof RegExp) {
        return pattern.test(cleanHtml);
      }
      return pattern; // for boolean expressions
    });
    
    const hasLegacyDefault = legacyDefaults.some(text => html.includes(text));
    
    console.log('[ChatProcessor] isDefaultHtml check:', { 
      htmlLength: html.length, 
      isMinimal, 
      hasLegacyDefault, 
      isDefault: isMinimal || hasLegacyDefault 
    });
    
    return isMinimal || hasLegacyDefault;
  }

  /**
   * Add a success message to the chat
   */
  private addSuccessMessage(text: string): void {
    const successMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text,
      isUser: false,
      timestamp: new Date()
    };
    this.options.onMessage(successMessage);
  }

  /**
   * Handle errors during processing
   */
  private handleError(error: any): void {
    console.error('Chat processing error:', error);
    const errorMessage = error.message || 'Sorry, I encountered an error. Please try again.';
    
    this.options.onError(errorMessage);
    
    const errorChatMessage: ChatMessage = {
      id: (Date.now() + 2).toString(),
      text: errorMessage,
      isUser: false,
      timestamp: new Date()
    };
    this.options.onMessage(errorChatMessage);
  }
}

