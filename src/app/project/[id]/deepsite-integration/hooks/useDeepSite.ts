import { useCallback, useState } from 'react';
import { useEditor } from './useEditor';
import { ChatMessage } from '../types';
import { extractHtmlFromResponse } from '../lib/html-utils';
import { PROVIDERS, MODELS } from '../lib/providers';
import { 
  INITIAL_SYSTEM_PROMPT, 
  FOLLOW_UP_SYSTEM_PROMPT,
  SEARCH_START,
  DIVIDER,
  REPLACE_END 
} from '../lib/constants';

interface UseDeepSiteOptions {
  defaultHtml?: string;
  onMessage?: (message: ChatMessage) => void;
  onError?: (error: string) => void;
  projectId?: string;
}

export const useDeepSite = ({ 
  defaultHtml, 
  onMessage, 
  onError,
  projectId 
}: UseDeepSiteOptions = {}) => {
  const editor = useEditor(defaultHtml, projectId);
  // Track stream text markers and avoid duplicate emissions
  let streamTextRemainder = '';
  const emittedLines = new Set<string>();
  const [phase, setPhase] = useState<'idle'|'reason_plan'|'status'|'html'|'summary'|'error'>('idle');
  const [statusText, setStatusText] = useState<string>('');
  
  // New thinking state management
  const [thinkingContent, setThinkingContent] = useState<string[]>([]);
  const [thinkingStartTime, setThinkingStartTime] = useState<number | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);

  const tryEmitTextMarkers = (incoming: string) => {
    const combined = streamTextRemainder + incoming;
    const parts = combined.split(/\r?\n/);
    streamTextRemainder = parts.pop() || '';
    for (const line of parts) {
      const t = line.trim();
      if (!t) continue;
      // Phase markers
      const phaseMatch = t.match(/^<<<PHASE:([A-Z_]+)>>>(.*)$/);
      if (phaseMatch) {
        const key = phaseMatch[1];
        const rest = phaseMatch[2]?.trim() || '';
        if (key === 'REASON_PLAN') {
          setPhase('reason_plan');
          setIsThinking(true);
          setIsBuilding(false);
          setThinkingStartTime(Date.now());
          setThinkingContent([]);
        }
        else if (key === 'STATUS') { 
          setPhase('status'); 
          setStatusText(rest); 
          setIsThinking(false);
          setIsBuilding(true);
        }
        else if (key === 'HTML') {
          setPhase('html');
          setIsBuilding(true);
        }
        else if (key === 'SUMMARY') {
          setPhase('summary');
          setIsThinking(false);
          setIsBuilding(false);
        }
        else if (key === 'ERROR') { 
          setPhase('error'); 
          setStatusText(rest); 
          setIsThinking(false);
          setIsBuilding(false);
        }
        continue;
      }
      if (/^(REASON|PLAN|THINK):/i.test(t)) {
        // Capture thinking content instead of emitting as messages
        if (phase === 'reason_plan' && !emittedLines.has(t)) {
          emittedLines.add(t);
          setThinkingContent(prev => [...prev, t]);
        }
      } else if (phase === 'reason_plan' && !emittedLines.has(t) && t.length > 0) {
        // Capture any non-prefixed thinking content during reason_plan phase
        emittedLines.add(t);
        setThinkingContent(prev => [...prev, `THINK: ${t}`]);
      } else if (/^(STATUS|DONE|NEXT):/i.test(t)) {
        if (!emittedLines.has(t)) {
          emittedLines.add(t);
          onMessage?.({ id: (Date.now()+Math.floor(Math.random()*1000)).toString(), text: t, isUser: false, timestamp: new Date() });
          }
        }
    }
  };

  /**
   * Call AI API for HTML generation or modification
   */
  const callAi = useCallback(async (
    prompt: string,
    redesignMarkdown?: string,
    isFollowUp: boolean = false,
    reasonOnly: boolean = false,
    projectId?: string,
    useLongContext?: boolean,
    chatSummary?: string
  ) => {
    if (editor.isAiWorking) return;
    if (!redesignMarkdown && !prompt.trim()) return;

    const abortController = editor.startGeneration();

    try {
      if (isFollowUp && editor.html.trim()) {
        // Follow-up modification (PUT request) with streaming
        const request = await fetch("/api/website-builder/ask-ai", {
          method: "PUT",
          body: JSON.stringify({
            prompt,
            provider: editor.provider,
            previousPrompt: editor.previousPrompt,
            model: editor.model,
            html: editor.html,
            reasonOnly,
            projectId,
            useLongContext,
            chatSummary,
          }),
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": window.location.hostname,
          },
          signal: abortController.signal,
        });

        if (request && request.body) {
          const reader = request.body.getReader();
          const decoder = new TextDecoder();
          let result = "";
          let lastPartial = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            result += chunk;
            tryEmitTextMarkers(chunk);
            const partial = extractHtmlFromResponse(result);
            if (!reasonOnly) {
              const improved = partial && partial.length > (lastPartial?.length || 0) + 100;
              if (partial && partial.length > 0 && improved) {
                lastPartial = partial;
                editor.updateHtml(partial);
              }
            }
          }

          const html = extractHtmlFromResponse(result);
          if (!reasonOnly) {
            if (html && html.length > 0) {
              editor.updateHtml(html, prompt);
            } else if (lastPartial && lastPartial.length > 0) {
              // Keep the last good partial without throwing to avoid clearing the UI
              editor.updateHtml(lastPartial, prompt);
            } else {
              throw new Error('No content returned from the model');
            }
            editor.setPreviousPrompt(prompt);
          }

          onMessage?.({
            id: (Date.now() + 1).toString(),
            text: reasonOnly ? 'Brainstorm complete.' : 'Content updated successfully!',
            isUser: false,
            timestamp: new Date()
          });
        } else {
          throw new Error('No response body received');
        }
      } else {
        // Initial generation or redesign (POST request)
        const request = await fetch("/api/website-builder/ask-ai", {
          method: "POST",
          body: JSON.stringify({
            prompt,
            provider: editor.provider,
            model: editor.model,
            html: "",
            redesignMarkdown,
            reasonOnly,
            projectId,
            useLongContext,
            chatSummary,
          }),
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": window.location.hostname,
          },
          signal: abortController.signal,
        });

        if (request && request.body) {
          // Handle streaming response
          const reader = request.body.getReader();
          const decoder = new TextDecoder();
          let result = "";
          let lastPartial = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            result += chunk;
            tryEmitTextMarkers(chunk);
            const partial = extractHtmlFromResponse(result);
            if (!reasonOnly) {
              const improved = partial && partial.length > (lastPartial?.length || 0) + 100;
              if (partial && partial.length > 0 && improved) {
                lastPartial = partial;
                editor.updateHtml(partial);
              }
            }
          }

          // Extract HTML from the result
          const html = extractHtmlFromResponse(result);
          if (!reasonOnly) {
            if (html && html.length > 0) {
              editor.updateHtml(html, prompt);
            } else if (lastPartial && lastPartial.length > 0) {
              editor.updateHtml(lastPartial, prompt);
            } else {
              throw new Error('No content returned from the model');
            }
            editor.setPreviousPrompt(prompt);
          }
          
          onMessage?.({
            id: (Date.now() + 1).toString(),
            text: reasonOnly ? 'Brainstorm complete.' : (redesignMarkdown ? 'Content redesigned successfully!' : 'Content generated successfully!'),
            isUser: false,
            timestamp: new Date()
          });
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error:', error);
        const errorMessage = error.message || 'Sorry, I encountered an error. Please try again.';
        onError?.(errorMessage);
        onMessage?.({
          id: (Date.now() + 1).toString(),
          text: errorMessage,
          isUser: false,
          timestamp: new Date()
        });
      }
    } finally {
      editor.setIsAiWorking(false);
      editor.setIsThinking(false);
    }
  }, [editor, onMessage, onError]);

  /**
   * Redesign from URL
   */
  const redesignFromUrl = useCallback(async (url: string) => {
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
      await callAi("", markdown);
    } catch (error: any) {
      console.error('Error redesigning from URL:', error);
      const errorMessage = 'Failed to redesign from URL. Please try again.';
      onError?.(errorMessage);
      onMessage?.({
        id: (Date.now() + 1).toString(),
        text: errorMessage,
        isUser: false,
        timestamp: new Date()
      });
    }
  }, [callAi, onMessage, onError]);

  /**
   * Process chat message and trigger appropriate AI action
   */
  const processChatMessage = useCallback(async (message: string) => {
    // Detect if this is a URL redesign request
    const urlMatch = message.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      await redesignFromUrl(urlMatch[0]);
    } else {
      // Treat as follow-up only after at least one successful generation (previousPrompt set)
      const isFollowUp = Boolean(editor.previousPrompt?.trim()) && editor.html.trim();
      await callAi(message, undefined, isFollowUp);
    }
  }, [callAi, redesignFromUrl, editor.html]);

  return {
    // Editor state and methods
    ...editor,
    
    // AI methods
    callAi,
    redesignFromUrl,
    processChatMessage,
    
    // Thinking state
    thinkingContent,
    thinkingStartTime,
    isThinking,
    isBuilding,
    
    // Utility methods
    isDefaultHtml: editor.html === defaultHtml,
    phase,
    statusText,
  };
};
