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

// Get user-friendly action text based on tool name
function getToolAction(toolName: string, isActive: boolean): { verb: string; icon: 'edit' | 'build' | 'search' | 'default' } {
  const map: Record<string, { active: string; done: string; icon: 'edit' | 'build' | 'search' | 'default' }> = {
    'surbe_write':                { active: 'Creating file',        done: 'Created file',        icon: 'edit' },
    'surbe_quick_edit':           { active: 'Editing file',         done: 'Edited file',         icon: 'edit' },
    'surbe_line_replace':         { active: 'Updating file',        done: 'Updated file',        icon: 'edit' },
    'surbe_view':                 { active: 'Viewing file',         done: 'Viewed file',         icon: 'search' },
    'surbe_search_files':         { active: 'Searching files',      done: 'Searched files',      icon: 'search' },
    'surbe_build_preview':        { active: 'Building preview',     done: 'Built preview',       icon: 'build' },
    'surbe_preview':              { active: 'Building preview',     done: 'Built preview',       icon: 'build' },
    'surbe_add_dependency':       { active: 'Installing package',   done: 'Installed package',   icon: 'build' },
    'surbe_remove_dependency':    { active: 'Removing package',     done: 'Removed package',     icon: 'build' },
    'surb_init_sandbox':          { active: 'Setting up project',   done: 'Project ready',       icon: 'build' },
    'init_sandbox':               { active: 'Setting up project',   done: 'Project ready',       icon: 'build' },
    'surbe_read_console_logs':    { active: 'Checking for errors',  done: 'Checked for errors',  icon: 'search' },
    'surbe_read_network_requests':{ active: 'Checking network',     done: 'Checked network',     icon: 'search' },
    'surbe_delete':               { active: 'Deleting file',        done: 'Deleted file',        icon: 'edit' },
    'surbe_rename':               { active: 'Renaming file',        done: 'Renamed file',        icon: 'edit' },
    'surbe_copy':                 { active: 'Copying file',         done: 'Copied file',         icon: 'edit' },
    'surbe_save_chat_image':      { active: 'Saving image',         done: 'Saved image',         icon: 'edit' },
    'surbe_download_to_repo':     { active: 'Downloading file',     done: 'Downloaded file',     icon: 'build' },
    'surbe_fetch_website':        { active: 'Fetching website',     done: 'Fetched website',     icon: 'search' },
    'websearch_web_search':       { active: 'Searching the web',    done: 'Searched the web',    icon: 'search' },
    'imagegen_generate_image':    { active: 'Generating image',     done: 'Generated image',     icon: 'build' },
    'imagegen_edit_image':        { active: 'Editing image',        done: 'Edited image',        icon: 'build' },
    'suggest_followups':          { active: 'Preparing suggestions', done: 'Suggestions ready',  icon: 'default' },
    'set_checkpoint_title':       { active: 'Saving version',       done: 'Version saved',       icon: 'default' },
    'save_survey_questions':      { active: 'Saving questions',     done: 'Questions saved',     icon: 'default' },
    'set_status':                 { active: 'Working',              done: 'Done',                icon: 'default' },
  };
  const entry = map[toolName];
  if (entry) return { verb: isActive ? entry.active : entry.done, icon: entry.icon };
  return { verb: isActive ? 'Working' : 'Done', icon: 'default' };
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
