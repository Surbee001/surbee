"use client";

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

function getEditedFiles(output: any): string[] {
  if (!output) return [];

  if (output.source_files && typeof output.source_files === 'object') {
    return Object.keys(output.source_files);
  }

  if (Array.isArray(output.edits)) {
    return output.edits.map((e: any, i: number) => e.file || e.target || `Edit ${i + 1}`);
  }

  return [];
}

// Get the action verb based on tool name
function getToolAction(toolName: string, isActive: boolean): { verb: string; icon: 'edit' | 'build' | 'search' | 'default' } {
  const activeVerbs: Record<string, { verb: string; icon: 'edit' | 'build' | 'search' | 'default' }> = {
    'surbe_write': { verb: isActive ? 'Creating' : 'Created', icon: 'edit' },
    'surbe_quick_edit': { verb: isActive ? 'Editing' : 'Edited', icon: 'edit' },
    'surbe_line_replace': { verb: isActive ? 'Editing' : 'Edited', icon: 'edit' },
    'surbe_view': { verb: isActive ? 'Reading' : 'Read', icon: 'search' },
    'surbe_search_files': { verb: isActive ? 'Searching' : 'Searched', icon: 'search' },
    'surbe_preview': { verb: isActive ? 'Building' : 'Built', icon: 'build' },
    'surbe_add_dependency': { verb: isActive ? 'Installing' : 'Installed', icon: 'build' },
    'init_sandbox': { verb: isActive ? 'Initializing' : 'Initialized', icon: 'build' },
  };
  return activeVerbs[toolName] || { verb: isActive ? 'Processing' : 'Processed', icon: 'default' };
}

// Shimmer text component for active state - matches reasoning shimmer effect
function ShimmerText({ children }: { children: string }) {
  const dynamicSpread = useMemo(() => {
    return children.length * 1.5;
  }, [children]);

  return (
    <motion.span
      className={cn(
        'relative inline-block bg-[length:250%_100%,auto] bg-clip-text',
        'text-transparent [--base-color:#a1a1aa] [--base-gradient-color:#000]',
        '[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--base-gradient-color),#0000_calc(50%+var(--spread)))] [background-repeat:no-repeat,padding-box]',
        'dark:[--base-color:#71717a] dark:[--base-gradient-color:#ffffff] dark:[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--base-gradient-color),#0000_calc(50%+var(--spread)))]'
      )}
      initial={{ backgroundPosition: '100% center' }}
      animate={{ backgroundPosition: '0% center' }}
      transition={{
        repeat: Infinity,
        duration: 1.5,
        ease: 'linear',
      }}
      style={{
        '--spread': `${dynamicSpread}px`,
        backgroundImage: `var(--bg), linear-gradient(var(--base-color), var(--base-color))`,
      } as React.CSSProperties}
    >
      {children}
    </motion.span>
  );
}

interface ToolCallTreeProps {
  toolName: string;
  output: any;
  isActive: boolean;
  fileName?: string;
}

export function ToolCallTree({ toolName, output, isActive, fileName }: ToolCallTreeProps) {
  const editedFiles = getEditedFiles(output);
  const { verb, icon } = getToolAction(toolName, isActive);

  // Show active state with shimmer
  if (isActive) {
    const displayFile = fileName || (editedFiles.length > 0 ? editedFiles[0] : null);

    return (
      <div className="flex flex-col gap-1 my-1">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {/* Animated spinner */}
          <motion.div
            className="shrink-0 h-3.5 w-3.5"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <svg
              className="h-full w-full opacity-60"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </motion.div>
          <ShimmerText>{verb}</ShimmerText>
          {displayFile && (
            <span
              className="rounded bg-secondary/80 px-1.5 py-0.5 text-xs font-mono truncate max-w-[200px]"
              title={displayFile}
            >
              {displayFile}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Don't show completed state if no files were edited
  if (editedFiles.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1 my-1">
      {editedFiles.map((file, idx) => (
        <motion.div
          key={idx}
          className="flex items-center gap-1.5 text-sm text-muted-foreground"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: idx * 0.05 }}
        >
          {/* File edit icon */}
          <svg
            className="shrink-0 h-3.5 w-3.5 opacity-60"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <path d="M12 18v-6" />
            <path d="M9 15l3 3 3-3" />
          </svg>
          <span className="opacity-70">{verb}</span>
          <span
            className="rounded bg-secondary/80 px-1.5 py-0.5 text-xs font-mono truncate max-w-[200px]"
            title={file}
          >
            {file}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
