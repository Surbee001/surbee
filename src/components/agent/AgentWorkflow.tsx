"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Types for workflow items
export type WorkflowPhase =
  | 'reasoning'
  | 'setup'
  | 'analyzing'
  | 'creating'
  | 'editing'
  | 'searching'
  | 'building'
  | 'installing'
  | 'screenshotting';

export interface ReasoningBlock {
  type: 'reasoning';
  content: string;
  isStreaming?: boolean;
}

export interface ToolCallBlock {
  type: 'tool_call';
  name: string;
  phase: WorkflowPhase;
  fileName?: string;
  status: 'pending' | 'running' | 'complete';
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
}

export interface CodeSnippetBlock {
  type: 'code_snippet';
  fileName: string;
  language: string;
  code: string;
  linesChanged?: number;
}

export type WorkflowBlock = ReasoningBlock | ToolCallBlock | CodeSnippetBlock;

interface AgentWorkflowProps {
  blocks: WorkflowBlock[];
  isStreaming?: boolean;
  className?: string;
}

// --- Icon SVGs (matching Claude's thinking UI) ---

function FileReadIcon({ className }: { className?: string }) {
  return (
    <svg height="16" width="16" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M13.04 7.30371C13.1486 7.05001 13.4425 6.93174 13.6963 7.04004C13.95 7.14863 14.0683 7.44253 13.96 7.69629C13.6651 8.38527 13.089 9 12.2998 9C11.8132 8.99994 11.408 8.76633 11.0996 8.42578C10.7913 8.76607 10.3867 8.99987 9.90039 9C9.41365 9 9.00769 8.76648 8.69922 8.42578C8.39083 8.76606 7.98636 9 7.5 9C7.22386 9 7 8.77614 7 8.5C7 8.22386 7.22386 8 7.5 8C7.71245 8 8.01918 7.8199 8.24023 7.30371C8.31897 7.11975 8.50009 7 8.7002 7C8.90022 7.00008 9.08145 7.11981 9.16016 7.30371C9.38121 7.8198 9.68796 8 9.90039 8C10.1128 7.99978 10.4197 7.81969 10.6406 7.30371L10.6748 7.2373C10.7649 7.09147 10.9248 7.00014 11.0996 7C11.2997 7 11.4808 7.11975 11.5596 7.30371C11.7806 7.8198 12.0874 7.99989 12.2998 8C12.5122 8 12.819 7.81985 13.04 7.30371Z" />
      <path clipRule="evenodd" d="M14 3C15.1046 3 16 3.89543 16 5V13H17.5C17.7761 13 18 13.2239 18 13.5V15C18 16.1046 17.1046 17 16 17H7C5.89543 17 5 16.1046 5 15V4H4C3.44772 4 3 4.44772 3 5C3 5.25644 3.09624 5.48974 3.25488 5.66699C3.43863 5.87277 3.42144 6.18901 3.21582 6.37305C3.01006 6.5572 2.69393 6.53877 2.50977 6.33301C2.1934 5.97951 2 5.51189 2 5C2 3.89543 2.89543 3 4 3H14ZM6 15C6 15.5523 6.44772 16 7 16C7.55228 16 8 15.5523 8 15V13.5C8 13.2239 8.22386 13 8.5 13H15V5C15 4.44772 14.5523 4 14 4H6V15ZM9 15C9 15.3646 8.90094 15.7056 8.73047 16H16C16.5523 16 17 15.5523 17 15V14H9V15Z" fillRule="evenodd" />
    </svg>
  );
}

function FileDocIcon({ className }: { className?: string }) {
  return (
    <svg height="16" width="16" viewBox="0 0 256 256" fill="currentColor" className={className}>
      <path d="M212.24,83.76l-56-56A6,6,0,0,0,152,26H56A14,14,0,0,0,42,40v72a6,6,0,0,0,12,0V40a2,2,0,0,1,2-2h90V88a6,6,0,0,0,6,6h50V224a6,6,0,0,0,12,0V88A6,6,0,0,0,212.24,83.76ZM158,46.48,193.52,82H158ZM144,146H128a6,6,0,0,0-6,6v56a6,6,0,0,0,6,6h16a34,34,0,0,0,0-68Zm0,56H134V158h10a22,22,0,0,1,0,44Zm-42-50v56a6,6,0,0,1-12,0V171L72.92,195.44a6,6,0,0,1-9.84,0L46,171v37a6,6,0,0,1-12,0V152a6,6,0,0,1,10.92-3.44l23.08,33,23.08-33A6,6,0,0,1,102,152Z" />
    </svg>
  );
}

function TerminalIcon({ className }: { className?: string }) {
  return (
    <svg height="16" width="16" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M5.14648 7.14648C5.34175 6.95122 5.65825 6.95122 5.85352 7.14648L8.35352 9.64648C8.44728 9.74025 8.5 9.86739 8.5 10C8.5 10.0994 8.47037 10.1958 8.41602 10.2773L8.35352 10.3535L5.85352 12.8535C5.65825 13.0488 5.34175 13.0488 5.14648 12.8535C4.95122 12.6583 4.95122 12.3417 5.14648 12.1465L7.29297 10L5.14648 7.85352C4.95122 7.65825 4.95122 7.34175 5.14648 7.14648Z" />
      <path d="M14.5 12C14.7761 12 15 12.2239 15 12.5C15 12.7761 14.7761 13 14.5 13H9.5C9.22386 13 9 12.7761 9 12.5C9 12.2239 9.22386 12 9.5 12H14.5Z" />
      <path clipRule="evenodd" d="M16.5 4C17.3284 4 18 4.67157 18 5.5V14.5C18 15.3284 17.3284 16 16.5 16H3.5C2.67157 16 2 15.3284 2 14.5V5.5C2 4.67157 2.67157 4 3.5 4H16.5ZM3.5 5C3.22386 5 3 5.22386 3 5.5V14.5C3 14.7761 3.22386 15 3.5 15H16.5C16.7761 15 17 14.7761 17 14.5V5.5C17 5.22386 16.7761 5 16.5 5H3.5Z" fillRule="evenodd" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg height="16" width="16" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 2.5C14.1421 2.5 17.5 5.85786 17.5 10C17.5 14.1421 14.1421 17.5 10 17.5C5.85786 17.5 2.5 14.1421 2.5 10C2.5 5.85786 5.85786 2.5 10 2.5ZM10 3.5C6.41015 3.5 3.5 6.41015 3.5 10C3.5 13.5899 6.41015 16.5 10 16.5C13.5899 16.5 16.5 13.5899 16.5 10C16.5 6.41015 13.5899 3.5 10 3.5ZM12.6094 7.1875C12.7819 6.97187 13.0969 6.93687 13.3125 7.10938C13.5281 7.28188 13.5631 7.59687 13.3906 7.8125L9.39062 12.8125C9.30178 12.9236 9.16935 12.9912 9.02734 12.999C8.92097 13.0049 8.81649 12.9768 8.72852 12.9199L8.64648 12.8535L6.64648 10.8535L6.58203 10.7754C6.45387 10.5813 6.47562 10.3173 6.64648 10.1465C6.81735 9.97562 7.08131 9.95387 7.27539 10.082L7.35352 10.1465L8.95801 11.751L12.6094 7.1875Z" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg height="12" width="12" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M14.128 7.16482C14.3126 6.95983 14.6298 6.94336 14.835 7.12771C15.0402 7.31242 15.0567 7.62952 14.8721 7.83477L10.372 12.835L10.2939 12.9053C10.2093 12.9667 10.1063 13 9.99995 13C9.85833 12.9999 9.72264 12.9402 9.62788 12.835L5.12778 7.83477L5.0682 7.75273C4.95072 7.55225 4.98544 7.28926 5.16489 7.12771C5.34445 6.96617 5.60969 6.95939 5.79674 7.09744L5.87193 7.16482L9.99995 11.7519L14.128 7.16482Z" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg height="16" width="16" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" clipRule="evenodd" d="M8.5 3C5.46243 3 3 5.46243 3 8.5C3 11.5376 5.46243 14 8.5 14C9.83879 14 11.0659 13.5217 12.0196 12.7266L16.1464 16.8536C16.3417 17.0488 16.6583 17.0488 16.8536 16.8536C17.0488 16.6583 17.0488 16.3417 16.8536 16.1464L12.7266 12.0196C13.5217 11.0659 14 9.83879 14 8.5C14 5.46243 11.5376 3 8.5 3ZM4 8.5C4 6.01472 6.01472 4 8.5 4C10.9853 4 13 6.01472 13 8.5C13 10.9853 10.9853 13 8.5 13C6.01472 13 4 10.9853 4 8.5Z" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg height="16" width="16" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M14.8536 3.14645C14.6583 2.95118 14.3417 2.95118 14.1464 3.14645L3.14645 14.1464C3.05268 14.2402 3 14.3674 3 14.5V17C3 17.2761 3.22386 17.5 3.5 17.5H6C6.13261 17.5 6.25979 17.4473 6.35355 17.3536L17.3536 6.35355C17.5488 6.15829 17.5488 5.84171 17.3536 5.64645L14.8536 3.14645ZM4 14.7071L14.5 4.20711L16.2929 6L5.79289 16.5H4V14.7071Z" />
    </svg>
  );
}

function CreateIcon({ className }: { className?: string }) {
  return (
    <svg height="16" width="16" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 3C10.2761 3 10.5 3.22386 10.5 3.5V9.5H16.5C16.7761 9.5 17 9.72386 17 10C17 10.2761 16.7761 10.5 16.5 10.5H10.5V16.5C10.5 16.7761 10.2761 17 10 17C9.72386 17 9.5 16.7761 9.5 16.5V10.5H3.5C3.22386 10.5 3 10.2761 3 10C3 9.72386 3.22386 9.5 3.5 9.5H9.5V3.5C9.5 3.22386 9.72386 3 10 3Z" />
    </svg>
  );
}

// --- Helpers ---

function getPhaseFromToolName(toolName: string): WorkflowPhase {
  const toolPhaseMap: Record<string, WorkflowPhase> = {
    'surbe_write': 'creating',
    'surbe_quick_edit': 'editing',
    'surbe_line_replace': 'editing',
    'surbe_view': 'analyzing',
    'surbe_search_files': 'searching',
    'surbe_preview': 'building',
    'surbe_add_dependency': 'installing',
    'init_sandbox': 'setup',
    'screenshot': 'screenshotting',
    'fetch_url': 'analyzing',
  };
  return toolPhaseMap[toolName] || 'reasoning';
}

function getToolDescription(toolName: string, fileName?: string): string {
  const descriptions: Record<string, string> = {
    'surbe_write': fileName ? `Creating ${fileName}` : 'Creating file',
    'surbe_quick_edit': fileName ? `Editing ${fileName}` : 'Editing file',
    'surbe_line_replace': fileName ? `Updating ${fileName}` : 'Updating file',
    'surbe_view': fileName ? `Reading ${fileName}` : 'Reading file',
    'surbe_search_files': 'Searching files',
    'surbe_preview': 'Building preview',
    'surbe_add_dependency': 'Installing dependency',
    'surbe_remove_dependency': 'Removing dependency',
    'init_sandbox': 'Setting up sandbox',
    'screenshot': 'Capturing screenshot',
    'fetch_url': 'Fetching website',
    'web_search': 'Searching the web',
    'surbe_delete': fileName ? `Deleting ${fileName}` : 'Deleting file',
    'surbe_rename': fileName ? `Renaming ${fileName}` : 'Renaming file',
    'surbe_copy': fileName ? `Copying ${fileName}` : 'Copying file',
  };
  return descriptions[toolName] || toolName.replace(/_/g, ' ');
}

type ToolCategory = 'read' | 'write' | 'edit' | 'command' | 'search' | 'other';

function getToolCategory(name: string): ToolCategory {
  if (name === 'surbe_view' || name === 'fetch_url') return 'read';
  if (name === 'surbe_write') return 'write';
  if (name === 'surbe_quick_edit' || name === 'surbe_line_replace') return 'edit';
  if (name === 'surbe_search_files' || name === 'web_search') return 'search';
  if (name === 'surbe_preview' || name === 'init_sandbox' || name === 'surbe_add_dependency') return 'command';
  return 'other';
}

function getCategoryLabel(cat: ToolCategory, count: number): string {
  const labels: Record<ToolCategory, [string, string]> = {
    read: ['Viewed 1 file', `Viewed ${count} files`],
    write: ['Created 1 file', `Created ${count} files`],
    edit: ['Edited 1 file', `Edited ${count} files`],
    search: ['Ran 1 search', `Ran ${count} searches`],
    command: ['Ran 1 command', `Ran ${count} commands`],
    other: ['Ran 1 action', `Ran ${count} actions`],
  };
  return count === 1 ? labels[cat][0] : labels[cat][1];
}

function getCategoryIcon(cat: ToolCategory) {
  switch (cat) {
    case 'read': return FileReadIcon;
    case 'write': return CreateIcon;
    case 'edit': return EditIcon;
    case 'search': return SearchIcon;
    case 'command': return TerminalIcon;
    default: return TerminalIcon;
  }
}

// Group consecutive tool calls by category
interface ToolGroup {
  type: 'tool_group';
  category: ToolCategory;
  tools: ToolCallBlock[];
  codeSnippets: CodeSnippetBlock[];
}

type DisplayItem = ReasoningBlock | ToolGroup | { type: 'done' };

function groupBlocks(blocks: WorkflowBlock[]): DisplayItem[] {
  const items: DisplayItem[] = [];
  let currentGroup: ToolGroup | null = null;

  for (const block of blocks) {
    if (block.type === 'reasoning') {
      if (currentGroup) {
        items.push(currentGroup);
        currentGroup = null;
      }
      if (block.content.trim()) {
        items.push(block);
      }
    } else if (block.type === 'tool_call') {
      const cat = getToolCategory(block.name);
      if (currentGroup && currentGroup.category === cat) {
        currentGroup.tools.push(block);
      } else {
        if (currentGroup) items.push(currentGroup);
        currentGroup = { type: 'tool_group', category: cat, tools: [block], codeSnippets: [] };
      }
    } else if (block.type === 'code_snippet') {
      if (currentGroup) {
        currentGroup.codeSnippets.push(block);
      }
    }
  }
  if (currentGroup) items.push(currentGroup);
  return items;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

// --- CSS variables for theme ---
const themeVars = {
  text: 'var(--surbee-fg-primary, #bdbab1)',
  textMuted: 'var(--surbee-fg-secondary, #999590)',
  textFaint: 'var(--surbee-fg-muted, rgba(153, 149, 144, 0.6))',
  line: 'var(--surbee-border-primary, rgba(200, 195, 188, 0.15))',
  codeBg: 'var(--surbee-bg-tertiary, #2f2f2d)',
  codeBorder: 'var(--surbee-border-primary, rgba(200, 195, 188, 0.15))',
};

// --- Shimmer ---
function ShimmerText({ children, className }: { children: string; className?: string }) {
  const dynamicSpread = useMemo(() => String(children).length * 1.5, [children]);
  return (
    <motion.span
      className={cn(
        'relative inline-block bg-[length:250%_100%,auto] bg-clip-text',
        'text-transparent [--base-color:#71717a] [--base-gradient-color:#ffffff]',
        '[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--base-gradient-color),#0000_calc(50%+var(--spread)))]',
        '[background-repeat:no-repeat,padding-box]',
        className
      )}
      initial={{ backgroundPosition: '100% center' }}
      animate={{ backgroundPosition: '0% center' }}
      transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
      style={{
        '--spread': `${dynamicSpread}px`,
        backgroundImage: `var(--bg), linear-gradient(var(--base-color), var(--base-color))`,
      } as React.CSSProperties}
    >
      {children}
    </motion.span>
  );
}

// --- Vertical line segment ---
function VLine({ height = 8 }: { height?: number }) {
  return (
    <div className="flex flex-row" style={{ height }}>
      <div className="w-5 flex justify-center">
        <div className="w-px h-full" style={{ backgroundColor: themeVars.line }} />
      </div>
    </div>
  );
}

// --- Tool row in expanded group ---
function ToolRow({ block, isLast }: { block: ToolCallBlock; isLast: boolean }) {
  const cat = getToolCategory(block.name);
  const Icon = getCategoryIcon(cat);

  return (
    <div>
      <div className="flex flex-row items-center py-1 rounded-lg transition-colors duration-150">
        <div className="w-5 flex justify-center shrink-0" style={{ color: themeVars.textMuted }}>
          <Icon className="block shrink-0" />
        </div>
        <div className="flex-1 min-w-0">
          <button className="flex flex-row items-center rounded-lg px-2.5 w-full justify-between cursor-pointer transition-colors duration-200 hover:opacity-80">
            <div className="flex flex-row items-center gap-2 min-w-0 flex-1">
              <div className="text-sm text-left truncate w-0 flex-grow" style={{ color: themeVars.textMuted }}>
                <span className="truncate">{getToolDescription(block.name, block.fileName)}</span>
              </div>
            </div>
          </button>
        </div>
      </div>
      {!isLast && (
        <div className="flex flex-row">
          <div className="w-5 flex justify-center shrink-0">
            <div className="w-px h-full" style={{ backgroundColor: themeVars.line }} />
          </div>
          <div className="flex-1 min-w-0" />
        </div>
      )}
    </div>
  );
}

// --- Code block inside a group ---
function ToolCodeBlock({ block }: { block: CodeSnippetBlock }) {
  return (
    <div className="flex flex-row">
      <div className="w-5 flex justify-center shrink-0">
        <div className="w-px h-full" style={{ backgroundColor: themeVars.line }} />
      </div>
      <div className="flex-1 min-w-0 mx-2.5 mt-1 mb-2">
        <div className="overflow-hidden rounded-lg cursor-pointer" style={{ border: `0.5px solid ${themeVars.codeBorder}`, backgroundColor: themeVars.codeBg }}>
          <div className="p-2 flex flex-col gap-2 max-h-[200px] overflow-y-auto">
            <div className="flex flex-col gap-3 p-3 rounded-md" style={{ backgroundColor: 'var(--surbee-bg-primary, #252523)' }}>
              <div className="flex justify-between items-center h-3">
                <p className="text-[0.6875rem] font-mono font-medium" style={{ color: themeVars.text }}>{block.language}</p>
              </div>
              <pre className="!my-0 !p-0 !rounded-none text-xs leading-relaxed whitespace-pre-wrap" style={{ background: 'transparent', color: themeVars.text, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace' }}>
                <code className="text-xs leading-4" style={{ fontFamily: 'inherit' }}>{block.code}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Tool group (collapsible) ---
function ToolGroupDisplay({ group, isStreaming }: { group: ToolGroup; isStreaming: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const label = getCategoryLabel(group.category, group.tools.length);
  const allDone = group.tools.every(t => t.status === 'complete');

  return (
    <div>
      <VLine />
      <div className="min-w-0 pl-2 py-0.5">
        <button
          className="flex items-center gap-1 py-1 text-sm w-full text-left cursor-pointer transition-colors duration-150 hover:opacity-80"
          style={{ color: themeVars.textMuted }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="inline-flex items-center gap-1 min-w-0">
            <span className="truncate text-sm" style={{ fontWeight: 400, lineHeight: 1.4 }}>
              {!allDone && isStreaming ? (
                <ShimmerText className="text-sm">{label}</ShimmerText>
              ) : (
                label
              )}
            </span>
            <span
              className="inline-flex shrink-0 transition-transform duration-200"
              style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}
            >
              <ChevronDownIcon />
            </span>
          </div>
        </button>

        <div
          className="grid transition-[grid-template-rows] duration-300 ease-out"
          style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
        >
          <div className="overflow-hidden min-w-0">
            <div className="flex flex-col" style={{ lineHeight: 1.5 }}>
              {group.tools.map((tool, idx) => (
                <div key={idx}>
                  <VLine />
                  <ToolRow block={tool} isLast={idx === group.tools.length - 1 && group.codeSnippets.length === 0} />
                </div>
              ))}
              {group.codeSnippets.map((cs, idx) => (
                <div key={`cs-${idx}`}>
                  <ToolCodeBlock block={cs} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Done marker ---
function DoneMarker() {
  return (
    <div>
      <VLine />
      <div className="flex flex-row rounded-lg transition-colors duration-150">
        <div className="w-5 flex justify-center shrink-0">
          <div className="flex flex-col items-center pt-1">
            <div style={{ color: themeVars.textMuted }}>
              <CheckCircleIcon />
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="pl-2.5 pt-0.5 text-sm" style={{ color: themeVars.text, fontWeight: 430, lineHeight: 1.4 }}>
            Done
          </div>
        </div>
      </div>
      <VLine />
    </div>
  );
}

// --- Reasoning display ---
function ReasoningDisplay({ block }: { block: ReasoningBlock }) {
  const lines = block.content.split('\n').filter(l => l.trim());
  if (lines.length === 0) return null;

  return (
    <div className="py-1">
      <div className="flex flex-row">
        <div className="w-5 flex justify-center shrink-0">
          <div className="w-px h-full" style={{ backgroundColor: themeVars.line }} />
        </div>
        <div className="flex-1 min-w-0 pl-2.5">
          <div className="text-xs leading-relaxed space-y-0.5" style={{ color: themeVars.textFaint }}>
            {lines.slice(-6).map((line, lIdx) => (
              <p key={lIdx} className={cn(block.isStreaming && lIdx === lines.length - 1 && 'opacity-80')}>
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main workflow component
// ============================================================================

export function AgentWorkflow({ blocks, isStreaming, className }: AgentWorkflowProps) {
  const startTimeRef = useRef<number | null>(null);
  const [finalDuration, setFinalDuration] = useState<number | null>(null);

  useEffect(() => {
    if (isStreaming && blocks.length > 0 && !startTimeRef.current) {
      startTimeRef.current = Date.now();
    }
    if (!isStreaming && startTimeRef.current && finalDuration === null) {
      setFinalDuration(Math.round((Date.now() - startTimeRef.current) / 1000));
    }
  }, [isStreaming, blocks.length, finalDuration]);

  useEffect(() => {
    if (blocks.length === 0) {
      startTimeRef.current = null;
      setFinalDuration(null);
    }
  }, [blocks.length === 0]);

  const grouped = useMemo(() => groupBlocks(blocks), [blocks]);
  const hasBlocks = blocks.length > 0;
  const showDone = !isStreaming && hasBlocks && blocks.some(b => b.type === 'tool_call');

  if (!hasBlocks && !isStreaming) return null;

  return (
    <div className={cn("min-w-0", className)} style={{ fontWeight: 360, fontFamily: '-apple-system, system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', lineHeight: '26.4px' }}>
      <div className="min-w-0 pl-2 py-1.5">
        {grouped.map((item, idx) => {
          if (item.type === 'reasoning') {
            return <ReasoningDisplay key={`r-${idx}`} block={item} />;
          }
          if (item.type === 'tool_group') {
            return <ToolGroupDisplay key={`g-${idx}`} group={item} isStreaming={!!isStreaming} />;
          }
          return null;
        })}
        {showDone && <DoneMarker />}
      </div>
    </div>
  );
}

// Helper to convert message parts to workflow blocks
export function convertPartsToWorkflowBlocks(
  parts: Array<{ type: string; [key: string]: any }>,
  isStreaming: boolean
): WorkflowBlock[] {
  const blocks: WorkflowBlock[] = [];

  for (const part of parts) {
    if (part.type === 'reasoning' || part.type === 'thinking') {
      const content = part.reasoning || part.thinking || part.text || part.content || '';
      blocks.push({
        type: 'reasoning',
        content,
        isStreaming: isStreaming && parts.indexOf(part) === parts.length - 1,
      });
    } else if (part.type === 'tool-invocation' || part.type === 'tool-call') {
      const toolName = part.toolName || part.name || '';
      const input = part.input || part.args || {};
      const fileName = input?.file_path || input?.path || input?.filename || input?.target_file;

      blocks.push({
        type: 'tool_call',
        name: toolName,
        phase: getPhaseFromToolName(toolName),
        fileName: fileName ? String(fileName).split('/').pop() : undefined,
        status: part.state === 'result' ? 'complete' : 'running',
        input,
        output: part.result,
      });

      if (part.result?.source_files) {
        const files = part.result.source_files;
        for (const [filePath, content] of Object.entries(files)) {
          if (typeof content === 'string' && content.length < 5000) {
            const ext = filePath.split('.').pop() || '';
            const langMap: Record<string, string> = {
              tsx: 'typescript', ts: 'typescript', jsx: 'javascript',
              js: 'javascript', css: 'css', json: 'json',
            };
            blocks.push({
              type: 'code_snippet',
              fileName: filePath.split('/').pop() || filePath,
              language: langMap[ext] || ext,
              code: content,
              linesChanged: content.split('\n').length,
            });
          }
        }
      }
    }
  }

  return blocks;
}

export default AgentWorkflow;
