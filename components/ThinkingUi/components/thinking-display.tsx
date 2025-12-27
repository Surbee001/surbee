"use client"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { ChevronRight } from "lucide-react"

import { ShiningText } from "./shining-text"
import { TextShimmer } from "./text-shimmer"
import type React from "react"

interface ThinkingStep {
  id: string
  content: string
  status: "thinking" | "complete"
}

interface ThinkingDisplayProps {
  steps: ThinkingStep[]
  duration?: number
  isThinking?: boolean
  className?: string
}

export function ThinkingDisplay({ steps, duration = 0, isThinking = false, className }: ThinkingDisplayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [wasThinking, setWasThinking] = useState(false);

  // Auto-open when reasoning starts, auto-close when it ends
  useEffect(() => {
    if (isThinking && !wasThinking) {
      // Reasoning just started - open the dropdown
      setIsOpen(true);
      setWasThinking(true);
    } else if (!isThinking && wasThinking) {
      // Reasoning just ended - close the dropdown
      setIsOpen(false);
      setWasThinking(false);
    }
  }, [isThinking, wasThinking]);

  // Always show if we have steps OR if thinking is active
  const shouldShow = isThinking || steps.length > 0;

  if (!shouldShow) {
    return null;
  }

  // Combine all step content into paragraphs
  const combinedContent = steps.map(s => s.content).join('\n\n');

  return (
    <div className={cn("relative my-1.5 min-h-6", className)}>
      <div className="relative flex origin-top-left flex-col gap-0 overflow-x-clip">
        {/* Clickable header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-fit items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground/80 transition-colors cursor-pointer"
        >
          <ChevronRight
            className={cn(
              "w-3.5 h-3.5 transition-transform duration-200",
              isOpen && "rotate-90"
            )}
          />
          {isThinking ? (
            <ShiningText text="Reasoning" className="text-[13px]" />
          ) : (
            <span className="text-muted-foreground/70">Reasoning</span>
          )}
        </button>

        {/* Collapsible content - simple paragraphs */}
        <div
          className={cn(
            "max-w-[calc(0.8*var(--thread-content-max-width,40rem))] transition-all duration-200 ease-in-out overflow-hidden pl-5",
            isOpen ? "opacity-100 max-h-[2000px] mt-2" : "opacity-0 max-h-0 mt-0",
          )}
        >
          <div className="text-[13px] leading-relaxed text-muted-foreground/60 space-y-4">
            {formatReasoningContent(combinedContent, isThinking)}
          </div>
        </div>
      </div>
    </div>
  )
}

// Format reasoning content - keep natural structure, just style it nicely
function formatReasoningContent(text: string, isThinking: boolean = false): React.ReactNode {
  // Split by double newlines to get natural paragraphs
  const blocks = text.split(/\n\n+/).filter(b => b.trim());

  return blocks.map((block, idx) => {
    // Check if this block has line breaks (could be a list or multi-line)
    const lines = block.split('\n').filter(l => l.trim());

    // For the last block when thinking, apply shimmer effect
    const isLastBlock = idx === blocks.length - 1;
    const shouldShimmer = isThinking && isLastBlock;

    if (lines.length > 1) {
      // Multiple lines - render each line separately
      return (
        <div key={idx} className="space-y-1">
          {lines.map((line, lineIdx) => {
            const isLastLine = lineIdx === lines.length - 1;
            const lineContent = line.trim();

            if (shouldShimmer && isLastLine && lineContent) {
              return (
                <TextShimmer key={lineIdx} as="p" className="text-[13px] text-muted-foreground/50" duration={1.5} spread={1.5}>
                  {lineContent}
                </TextShimmer>
              );
            }

            return (
              <p key={lineIdx} className="text-muted-foreground/50">
                {formatInlineContent(lineContent)}
              </p>
            );
          })}
        </div>
      );
    }

    // Single line paragraph
    const trimmedBlock = block.trim();

    if (shouldShimmer && trimmedBlock) {
      return (
        <TextShimmer key={idx} as="p" className="text-[13px] text-muted-foreground/50" duration={1.5} spread={1.5}>
          {trimmedBlock}
        </TextShimmer>
      );
    }

    return (
      <p key={idx} className="text-muted-foreground/50">
        {formatInlineContent(trimmedBlock)}
      </p>
    );
  });
}

// Format inline content (code and bold)
function formatInlineContent(text: string): React.ReactNode {
  // Handle code blocks (backticks) and bold
  const parts = text.split(/(`[^`]+`)/g);

  return parts.map((part, index) => {
    // Handle inline code with blue styling
    if (part.startsWith('`') && part.endsWith('`')) {
      const codeText = part.slice(1, -1);
      return (
        <code
          key={index}
          className="rounded bg-blue-500/15 px-1.5 py-0.5 text-[12px] font-mono text-blue-400"
        >
          {codeText}
        </code>
      );
    }

    // Handle bold text within non-code parts
    const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((boldPart, boldIndex) => {
      if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
        const boldText = boldPart.slice(2, -2);
        return <strong key={`${index}-${boldIndex}`} className="font-medium text-muted-foreground/70">{boldText}</strong>;
      }
      return <span key={`${index}-${boldIndex}`}>{boldPart}</span>;
    });
  });
}
