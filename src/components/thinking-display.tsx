"use client"
import { cn } from "@/lib/utils"

import { ShiningText } from "./shining-text"
import { useState } from "react"

interface ThinkingStep {
  id: string
  content: string
  status: "thinking" | "complete"
}

interface ThinkingDisplayProps {
  steps: ThinkingStep[]
  duration?: number
  isThinking?: boolean
  isLatest?: boolean // Is this the latest/current thinking (show checkpoints)
  className?: string
}

export function ThinkingDisplay({ steps, duration = 0, isThinking = false, isLatest = true, className }: ThinkingDisplayProps) {
  const [isOpen, setIsOpen] = useState(true) // Always open by default

  return (
    <div className={cn("relative my-1 min-h-6", className)}>
      <div className="relative flex origin-top-left flex-col gap-2 overflow-x-clip">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-fit items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {isThinking ? (
            <ShiningText text="Thinking..." className="text-sm" />
          ) : (
            <span>{`Thought for ${duration}s`}</span>
          )}
        </button>

        <div
          className={cn(
            "max-w-[calc(0.8*var(--thread-content-max-width,40rem))] transition-all duration-300 ease-in-out overflow-hidden",
            isOpen ? "opacity-100 max-h-[2000px]" : "opacity-0 max-h-0",
          )}
        >
          <div className="relative z-0">
            <div className="relative flex h-full flex-col" style={{ margin: "4px 0px" }}>
              {steps.map((step, index) => (
                <ThinkingStep
                  key={step.id}
                  content={step.content}
                  status={step.status}
                  isLast={index === steps.length - 1}
                  isLatest={isLatest}
                  isActive={isThinking && index === steps.length - 1}
                  zIndex={index}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface ThinkingStepProps {
  content: string
  status: "thinking" | "complete"
  isLast: boolean
  isLatest: boolean // Is this in the latest thinking display (show checkpoints)
  isActive: boolean // Is this the currently streaming step (pulse animation)
  zIndex: number
}

// Simple markdown parser for basic formatting
function parseMarkdown(text: string) {
  return text
    // Bold: **text** or __text__
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    // Italic: *text* or _text_
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    // Code: `text`
    .replace(/`(.+?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-xs">$1</code>')
}

// Parse structured reasoning with titles
function parseStructuredReasoning(content: string): { title?: string; body: string } {
  // Check for **text** pattern as title
  const boldTitleMatch = content.match(/^\*\*(.+?)\*\*\s*\n(.+)/s)
  if (boldTitleMatch) {
    return {
      title: boldTitleMatch[1].trim(),
      body: boldTitleMatch[2].trim()
    }
  }

  // Check if content has a title pattern:
  // - First line is short (< 60 chars) and doesn't end with punctuation like . , ! ?
  // - Followed by rest of content
  const lines = content.split('\n')

  if (lines.length > 1) {
    const firstLine = lines[0].trim()
    const restContent = lines.slice(1).join('\n').trim()

    // Check if first line looks like a title
    // (short, doesn't end with common punctuation, and has content after it)
    if (
      firstLine.length > 0 &&
      firstLine.length < 60 &&
      restContent.length > 0 &&
      !/[.!?,;:]$/.test(firstLine)
    ) {
      return {
        title: firstLine,
        body: restContent
      }
    }
  }

  return { body: content }
}

function ThinkingStep({ content, status, isLast, isLatest, isActive, zIndex }: ThinkingStepProps) {
  const isComplete = status === "complete"
  const { title, body } = parseStructuredReasoning(content)
  const htmlBody = parseMarkdown(body)

  // Show checkpoint only for latest thinking, dots for previous
  const showCheckpoint = isLatest && title

  return (
    <div
      className="text-muted-foreground start-0 end-0 top-0 flex origin-left animate-in fade-in duration-500"
      style={{
        zIndex,
        position: "static",
      }}
    >
      <div className="relative flex w-full items-start gap-2 overflow-clip">
        <div className="flex h-full w-4 shrink-0 flex-col items-center">
          <div className="flex h-5 shrink-0 items-center justify-center">
            {showCheckpoint && isComplete ? (
              // Checkpoint (only for latest thinking with titles)
              <svg
                className="h-[15px] w-[15px] text-primary"
                height="20"
                width="20"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12.498 6.90887C12.7094 6.60867 13.1245 6.53642 13.4248 6.74774C13.7249 6.95913 13.7971 7.37424 13.5859 7.6745L9.62695 13.2995C9.51084 13.4644 9.32628 13.5681 9.125 13.5807C8.94863 13.5918 8.77583 13.5319 8.64453 13.4167L8.59082 13.364L6.50781 11.072L6.42773 10.9645C6.26956 10.6986 6.31486 10.3488 6.55273 10.1325C6.79045 9.91663 7.14198 9.9053 7.3916 10.0876L7.49219 10.1774L9.0166 11.8542L12.498 6.90887Z" />
                <path
                  clipRule="evenodd"
                  d="M10.3333 2.08496C14.7046 2.08496 18.2483 5.62867 18.2483 10C18.2483 14.3713 14.7046 17.915 10.3333 17.915C5.96192 17.915 2.41821 14.3713 2.41821 10C2.41821 5.62867 5.96192 2.08496 10.3333 2.08496ZM10.3333 3.41504C6.69646 3.41504 3.74829 6.3632 3.74829 10C3.74829 13.6368 6.69646 16.585 10.3333 16.585C13.97 16.585 16.9182 13.6368 16.9182 10C16.9182 6.3632 13.97 3.41504 10.3333 3.41504Z"
                  fillRule="evenodd"
                />
              </svg>
            ) : (
              // Dot (with optional pulse animation for active step)
              <div
                className={cn(
                  "h-[6px] w-[6px] rounded-full",
                  isActive
                    ? "bg-primary animate-pulse" // Active step pulses
                    : "bg-muted-foreground/40"
                )}
              />
            )}
          </div>
          {!isLast && <div className="bg-border h-full w-[1px] rounded-full" />}
        </div>
        <div className="w-full" style={{ marginBottom: isLast ? "0px" : "12px" }}>
          {title && (
            <div className="text-sm font-semibold text-foreground mb-1">
              {title}
            </div>
          )}
          <div className="text-sm w-full break-words">
            <span
              className="text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: htmlBody }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
