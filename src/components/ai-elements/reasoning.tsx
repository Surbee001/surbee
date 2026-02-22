"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect, useRef, memo, createContext, useContext, useMemo } from "react";
import { 
  ChevronDownIcon, 
  BrainIcon, 
  SparklesIcon,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { ComponentProps, ReactNode } from "react";

// ============================================================================
// Context for Reasoning State
// ============================================================================

interface ReasoningContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isStreaming: boolean;
}

const ReasoningContext = createContext<ReasoningContextValue | null>(null);

const useReasoningContext = () => {
  const context = useContext(ReasoningContext);
  if (!context) {
    throw new Error("Reasoning components must be used within Reasoning");
  }
  return context;
};

// ============================================================================
// Shimmer Text Effect
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
// Main Reasoning Component
// ============================================================================

export interface ReasoningProps extends ComponentProps<"div"> {
  /** Whether the reasoning is currently streaming */
  isStreaming?: boolean;
  /** Default open state */
  defaultOpen?: boolean;
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
}

export const Reasoning = memo(({
  className,
  isStreaming = false,
  defaultOpen = false,
  open,
  onOpenChange,
  children,
  ...props
}: ReasoningProps) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [wasStreaming, setWasStreaming] = useState(false);
  
  // Use controlled state if provided
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = (newOpen: boolean) => {
    if (open === undefined) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  // Auto-open when streaming starts, auto-close when it ends
  useEffect(() => {
    if (isStreaming && !wasStreaming) {
      setIsOpen(true);
      setWasStreaming(true);
    } else if (!isStreaming && wasStreaming) {
      // Keep open for a moment after streaming completes, then close
      const timeout = setTimeout(() => {
        setIsOpen(false);
        setWasStreaming(false);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [isStreaming, wasStreaming]);

  const contextValue = useMemo(
    () => ({ isOpen, setIsOpen, isStreaming }),
    [isOpen, isStreaming]
  );

  return (
    <ReasoningContext.Provider value={contextValue}>
      <div
        className={cn("not-prose max-w-prose", className)}
        {...props}
      >
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          {children}
        </Collapsible>
      </div>
    </ReasoningContext.Provider>
  );
});
Reasoning.displayName = "Reasoning";

// ============================================================================
// Reasoning Trigger
// ============================================================================

export interface ReasoningTriggerProps extends ComponentProps<typeof CollapsibleTrigger> {
  /** Custom label when not streaming */
  label?: string;
  /** Custom label when streaming */
  streamingLabel?: string;
  /** Show duration when not streaming */
  duration?: number;
}

export const ReasoningTrigger = memo(({
  className,
  label = "Reasoning",
  streamingLabel = "Thinking...",
  duration,
  children,
  ...props
}: ReasoningTriggerProps) => {
  const { isOpen, isStreaming } = useReasoningContext();

  // Format duration
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <CollapsibleTrigger
      className={cn(
        "flex w-full items-center gap-2 text-sm transition-colors",
        "text-muted-foreground hover:text-foreground",
        "py-1.5 px-0",
        className
      )}
      {...props}
    >
      <BrainIcon className="size-4" />
      <span className="flex-1 text-left">
        {children ?? (
          isStreaming ? (
            <ShimmerText text={streamingLabel} className="text-sm" />
          ) : (
            <span className="text-muted-foreground/70">
              {label} {duration !== undefined && duration > 0 && `· ${formatDuration(duration)}`}
            </span>
          )
        )}
      </span>
      <ChevronDownIcon
        className={cn(
          "size-4 transition-transform duration-200",
          isOpen ? "rotate-0" : "-rotate-90"
        )}
      />
    </CollapsibleTrigger>
  );
});
ReasoningTrigger.displayName = "ReasoningTrigger";

// ============================================================================
// Reasoning Content
// ============================================================================

export interface ReasoningContentProps extends ComponentProps<typeof CollapsibleContent> {
  /** Maximum height of the content area */
  maxHeight?: number;
}

export const ReasoningContent = memo(({
  className,
  maxHeight = 280,
  children,
  ...props
}: ReasoningContentProps) => {
  const { isStreaming } = useReasoningContext();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when streaming
  useEffect(() => {
    if (isStreaming && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [children, isStreaming]);

  return (
    <CollapsibleContent
      className={cn(
        "mt-2 overflow-hidden",
        "data-[state=closed]:animate-out data-[state=open]:animate-in",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2",
        className
      )}
      {...props}
    >
      <div className="relative pl-1">
        {/* Top fade */}
        <div
          className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-4"
          style={{
            background: 'linear-gradient(to bottom, var(--surbee-bg-primary, hsl(var(--background))) 0%, transparent 100%)',
          }}
        />

        {/* Scrollable area */}
        <div
          ref={scrollRef}
          className="overflow-y-auto pr-2 py-2"
          style={{
            maxHeight: `${maxHeight}px`,
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(128,128,128,0.2) transparent',
          }}
        >
          <div className="text-sm text-muted-foreground/70 leading-relaxed whitespace-pre-wrap">
            {isStreaming ? (
              <ShimmerText text={typeof children === 'string' ? children : ''} className="text-sm" />
            ) : (
              children
            )}
          </div>
        </div>

        {/* Bottom fade */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-4"
          style={{
            background: 'linear-gradient(to top, var(--surbee-bg-primary, hsl(var(--background))) 0%, transparent 100%)',
          }}
        />
      </div>
    </CollapsibleContent>
  );
});
ReasoningContent.displayName = "ReasoningContent";

// ============================================================================
// Export
// ============================================================================

export { ShimmerText };
