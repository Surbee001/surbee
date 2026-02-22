"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect, useRef, memo, useMemo } from "react";
import { 
  ChevronDownIcon, 
  BrainIcon, 
  SearchIcon, 
  FileTextIcon, 
  DatabaseIcon,
  SparklesIcon,
  GlobeIcon,
  WrenchIcon,
  CodeIcon,
  MessageSquareIcon,
  type LucideIcon
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import type React from "react";

// ============================================================================
// Types - Compatible with AI SDK message parts
// ============================================================================

// Step status types
type StepStatus = "complete" | "active" | "pending";

// Step type for chain of thought - compatible with AI SDK reasoning parts
export interface ReasoningStep {
  id: string;
  label: string;
  description?: string;
  status: StepStatus;
  icon?: LucideIcon;
  searchResults?: string[];
  toolName?: string;
  toolArgs?: Record<string, unknown>;
}

// Legacy ThinkingStep format (for backwards compatibility)
export interface ThinkingStep {
  id: string;
  content: string;
  status: "thinking" | "complete";
}

// AI SDK UIMessage part types we handle
export interface ReasoningPart {
  type: "reasoning";
  text: string;
}

export interface ToolPart {
  type: string; // 'tool-{name}'
  state: "input-streaming" | "input-available" | "output-streaming" | "output-available";
  input?: unknown;
  output?: unknown;
}

export interface TextPart {
  type: "text";
  text: string;
}

export type MessagePart = ReasoningPart | ToolPart | TextPart | { type: string; [key: string]: unknown };

// Props for the main component
interface ReasoningDisplayProps {
  steps: ReasoningStep[];
  duration?: number;
  isThinking?: boolean;
  className?: string;
  defaultOpen?: boolean;
}

// ============================================================================
// Shimmer Effect Component
// ============================================================================

const ShimmerText = memo(({ text, className }: { text: string; className?: string }) => (
  <span
    className={cn(
      "inline-block bg-gradient-to-r from-muted-foreground/70 via-foreground/90 to-muted-foreground/70",
      "bg-[length:200%_100%] bg-clip-text text-transparent animate-shine",
      className
    )}
  >
    {text}
  </span>
));
ShimmerText.displayName = "ShimmerText";

// ============================================================================
// Individual Step Component
// ============================================================================

const ReasoningStepItem = memo(({
  label,
  description,
  status,
  searchResults,
  toolName,
  isLast,
}: ReasoningStep & { isLast: boolean }) => {
  const statusStyles = {
    complete: "text-muted-foreground/60",
    active: "text-muted-foreground/80",
    pending: "text-muted-foreground/40",
  };

  return (
    <div
      className={cn(
        "text-sm",
        statusStyles[status],
        "fade-in-0 slide-in-from-top-2 animate-in duration-300"
      )}
    >
      <div className="space-y-1 overflow-hidden pb-2 min-w-0">
        {/* Just show the description/content - no labels or icons */}
        {description && (
          <div className={cn(
            "text-[13px] leading-relaxed whitespace-pre-wrap break-words",
            status === "active" ? "text-muted-foreground/70" : "text-muted-foreground/50"
          )}>
            {status === "active" ? (
              <ShimmerText text={description} className="text-[13px]" />
            ) : (
              description
            )}
          </div>
        )}
        {/* Tool badge - only show if there's a tool */}
        {toolName && (
          <Badge
            className="gap-1 px-2 py-0.5 font-normal text-xs bg-blue-500/10 text-blue-400 border-blue-500/20"
            variant="outline"
          >
            <WrenchIcon className="size-3" />
            {toolName}
          </Badge>
        )}
        {/* Search results badges */}
        {searchResults && searchResults.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {searchResults.map((result, idx) => (
              <Badge
                key={idx}
                className="gap-1 px-2 py-0.5 font-normal text-xs bg-secondary/50 text-secondary-foreground/80 hover:bg-secondary/70"
                variant="secondary"
              >
                <GlobeIcon className="size-3" />
                {result}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
ReasoningStepItem.displayName = "ReasoningStepItem";

// ============================================================================
// Main Reasoning Display Component
// ============================================================================

export const ReasoningDisplay = memo(({
  steps,
  duration = 0,
  isThinking = false,
  className,
  defaultOpen = true, // Default to open so reasoning is visible
}: ReasoningDisplayProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [wasThinking, setWasThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-open when reasoning starts, keep open when it ends (don't auto-close)
  useEffect(() => {
    if (isThinking && !wasThinking) {
      setIsOpen(true);
      setWasThinking(true);
    } else if (!isThinking && wasThinking) {
      // Keep it open when thinking completes - user can manually close
      setWasThinking(false);
    }
  }, [isThinking, wasThinking]);

  // Auto-scroll to bottom when content updates
  useEffect(() => {
    if (isOpen && scrollRef.current && isThinking) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [steps, isOpen, isThinking]);

  // Don't render if no steps and not thinking
  if (!isThinking && steps.length === 0) {
    return null;
  }

  // Format duration
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className={cn("not-prose max-w-prose", className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger
          className={cn(
            "flex w-full items-center gap-2 text-sm transition-colors",
            "text-muted-foreground hover:text-foreground",
            "py-1.5 px-0"
          )}
        >
          {/* No icon - just text */}
          <span className="flex-1 text-left">
            {isThinking ? (
              <ShimmerText text="Thinking..." className="text-sm" />
            ) : (
              <span className="text-muted-foreground/70">
                Thinking {duration > 0 && `· ${formatDuration(duration)}`}
              </span>
            )}
          </span>
          <ChevronDownIcon
            className={cn(
              "size-4 transition-transform duration-200",
              isOpen ? "rotate-0" : "-rotate-90"
            )}
          />
        </CollapsibleTrigger>

        <CollapsibleContent
          className={cn(
            "mt-2 overflow-hidden",
            "data-[state=closed]:animate-out data-[state=open]:animate-in",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2"
          )}
        >
          <div className="relative pl-1">
            {/* Scrollable content with fade gradients */}
            <div className="relative">
              {/* Top fade */}
              <div
                className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-4"
                style={{
                  background: 'linear-gradient(to bottom, var(--surbee-bg-primary) 0%, transparent 100%)',
                }}
              />

              {/* Scrollable area */}
              <div
                ref={scrollRef}
                className="max-h-[280px] overflow-y-auto pr-2 py-2"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(128,128,128,0.2) transparent',
                }}
              >
                <div className="space-y-0">
                  {steps.map((step, idx) => (
                    <ReasoningStepItem
                      key={step.id}
                      {...step}
                      isLast={idx === steps.length - 1}
                    />
                  ))}
                </div>
              </div>

              {/* Bottom fade */}
              <div
                className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-4"
                style={{
                  background: 'linear-gradient(to top, var(--surbee-bg-primary) 0%, transparent 100%)',
                }}
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
});
ReasoningDisplay.displayName = "ReasoningDisplay";

// ============================================================================
// Conversion Utilities - For AI SDK Compatibility
// ============================================================================

/**
 * Detect the type of reasoning step from content and return appropriate icon and label
 */
function detectStepType(content: string): { icon: LucideIcon; label: string } {
  const lowerContent = content.toLowerCase();
  
  // Search/web related
  if (lowerContent.includes("search") || lowerContent.includes("looking") || lowerContent.includes("finding") || lowerContent.includes("browsing")) {
    return { icon: SearchIcon, label: "Searching..." };
  }
  
  // Survey/question related (Surbee specific)
  if (lowerContent.includes("survey") || lowerContent.includes("question") || lowerContent.includes("form")) {
    return { icon: FileTextIcon, label: "Analyzing survey..." };
  }
  
  // Data/database related
  if (lowerContent.includes("data") || lowerContent.includes("database") || lowerContent.includes("query") || lowerContent.includes("fetch")) {
    return { icon: DatabaseIcon, label: "Querying data..." };
  }
  
  // Code related
  if (lowerContent.includes("code") || lowerContent.includes("implement") || lowerContent.includes("function") || lowerContent.includes("build")) {
    return { icon: CodeIcon, label: "Writing code..." };
  }
  
  // Thinking/reasoning related
  if (lowerContent.includes("think") || lowerContent.includes("consider") || lowerContent.includes("reason") || lowerContent.includes("analyze")) {
    return { icon: BrainIcon, label: "Reasoning..." };
  }
  
  // Communication related
  if (lowerContent.includes("respond") || lowerContent.includes("answer") || lowerContent.includes("explain")) {
    return { icon: MessageSquareIcon, label: "Composing response..." };
  }
  
  // Default
  return { icon: SparklesIcon, label: "Processing..." };
}

/**
 * Convert legacy ThinkingStep format to ReasoningStep format
 * Works with the old format used in ThinkingDisplay
 */
export function convertToReasoningSteps(
  oldSteps: ThinkingStep[],
  isThinking: boolean
): ReasoningStep[] {
  return oldSteps.map((step, idx) => {
    const { icon, label } = detectStepType(step.content);
    const isLastStep = idx === oldSteps.length - 1;

    return {
      id: step.id,
      label: label,
      description: step.content,
      status: step.status === "thinking" ? "active" : "complete",
      icon,
    };
  });
}

/**
 * Convert AI SDK message parts to ReasoningSteps
 * Handles reasoning parts and tool parts from UIMessage
 */
export function convertMessagePartsToSteps(
  parts: MessagePart[],
  isStreaming: boolean = false
): ReasoningStep[] {
  const steps: ReasoningStep[] = [];
  let stepIndex = 0;

  for (const part of parts) {
    // Handle reasoning parts (from models like Claude with extended thinking)
    if (part.type === "reasoning" && "text" in part) {
      const { icon, label } = detectStepType(part.text);
      steps.push({
        id: `reasoning-${stepIndex++}`,
        label,
        description: part.text,
        status: isStreaming && stepIndex === parts.filter(p => p.type === "reasoning").length ? "active" : "complete",
        icon,
      });
    }
    
    // Handle tool parts (tool-{name} format from AI SDK)
    if (typeof part.type === "string" && part.type.startsWith("tool-")) {
      const toolName = part.type.replace("tool-", "");
      const toolPart = part as ToolPart;
      
      // Determine status based on tool state
      let status: StepStatus = "pending";
      if (toolPart.state === "output-available") {
        status = "complete";
      } else if (toolPart.state === "input-available" || toolPart.state === "output-streaming") {
        status = "active";
      } else if (toolPart.state === "input-streaming") {
        status = "active";
      }

      // Format tool name for display
      const displayName = toolName
        .replace(/_/g, " ")
        .replace(/\b\w/g, c => c.toUpperCase());

      steps.push({
        id: `tool-${stepIndex++}`,
        label: `Using ${displayName}`,
        description: toolPart.input ? JSON.stringify(toolPart.input, null, 2).slice(0, 200) : undefined,
        status,
        icon: WrenchIcon,
        toolName: displayName,
        toolArgs: toolPart.input as Record<string, unknown>,
      });
    }
  }

  return steps;
}

/**
 * Hook to extract reasoning steps from AI SDK useChat messages
 * Use this in components that use the AI SDK useChat hook
 */
export function useReasoningFromMessages(
  messages: Array<{ id: string; role: string; parts?: MessagePart[] }>,
  isLoading: boolean
): { steps: ReasoningStep[]; isThinking: boolean; duration: number } {
  const [startTime] = useState(() => Date.now());
  
  const result = useMemo(() => {
    // Find the last assistant message with parts
    const lastAssistantMessage = [...messages]
      .reverse()
      .find(m => m.role === "assistant" && m.parts && m.parts.length > 0);

    if (!lastAssistantMessage?.parts) {
      return { steps: [], isThinking: isLoading, duration: 0 };
    }

    const steps = convertMessagePartsToSteps(lastAssistantMessage.parts, isLoading);
    const hasActiveSteps = steps.some(s => s.status === "active");
    const duration = isLoading ? Date.now() - startTime : 0;

    return {
      steps,
      isThinking: isLoading && (hasActiveSteps || steps.length === 0),
      duration,
    };
  }, [messages, isLoading, startTime]);

  return result;
}

// ============================================================================
// Exports
// ============================================================================

export { 
  SearchIcon, 
  FileTextIcon, 
  DatabaseIcon, 
  BrainIcon, 
  SparklesIcon, 
  GlobeIcon,
  WrenchIcon,
  CodeIcon,
  MessageSquareIcon,
};
