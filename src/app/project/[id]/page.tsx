"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo, startTransition, useDeferredValue } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, ChevronLeft, Plus, Home, Library, Search, MessageSquare, Folder as FolderIcon, ArrowUp, User, ThumbsUp, HelpCircle, Gift, ChevronsLeft, Menu, AtSign, Settings2, Inbox, FlaskConical, BookOpen, X, Paperclip, History, Monitor, Smartphone, Tablet, ExternalLink, RotateCcw, Eye, GitBranch, Flag, PanelLeftClose, PanelLeftOpen, Share2, Copy, Hammer, Code, Terminal, AlertTriangle, Settings as SettingsIcon, Sun, Moon, Laptop, CheckCircle2 } from "lucide-react";
import UserNameBadge from "@/components/UserNameBadge";
import UserMenu from "@/components/ui/user-menu";
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { File, Folder, Tree } from "@/components/ui/file-tree";
import ChatInputLight from "@/components/ui/chat-input-light";
import { AIModel } from "@/components/ui/model-selector";
import dynamic from 'next/dynamic'
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import type { ChatMessage } from '@/lib/agents/surbeeWorkflowV3';
import { AuthGuard } from "@/components/auth/AuthGuard";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from '@/contexts/AuthContext';
import { useRealtime } from '@/contexts/RealtimeContext';
import { useTheme } from '@/hooks/useTheme';
import { useChatSession } from '@/hooks/useChatSession';
import { ThinkingDisplay } from '../../../../components/ThinkingUi/components/thinking-display';
import { ToolCall } from '../../../../components/ThinkingUi/components/tool-call';
import { AILoader } from '@/components/ai-loader';
import { cn } from "@/lib/utils";
import { Response } from '@/components/ai-elements/response';
import { ToolCallTree } from '@/components/ToolCallTree';
import { VersionHistory } from '@/components/VersionHistory';
import { Switch } from "@/components/ui/switch";
import {
  SandboxProvider,
  SandboxLayout,
  type SandboxProviderProps,
} from "@/components/kibo-ui/sandbox";
import {
  SandpackCodeEditor,
  SandpackConsole,
  SandpackFileExplorer,
  SandpackPreview,
  useSandpack,
} from "@codesandbox/sandpack-react";

interface ThinkingStep {
  id: string;
  content: string;
  status: "thinking" | "complete";
}

interface FunctionCallItem {
  id: string;
  toolName: string;
  fileName?: string;
  linesAdded?: number;
  linesDeleted?: number;
  status: "pending" | "complete";
  timestamp: Date;
}

type WorkflowContextChatMessage = {
  role: "user" | "assistant";
  text: string;
  agent?: string;
};

type SelectedElementSnapshot = {
  outerHTML: string;
  textContent: string;
  selector: string;
};

const MAX_CHAT_HISTORY_ENTRIES = 8;

const sanitizePlainTextForContext = (value: string | null | undefined, limit: number) => {
  if (!value) return "";
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  if (normalized.length <= limit) return normalized;
  return `${normalized.slice(0, Math.max(0, limit - 3))}...`;
};

const sanitizeHtmlSnippetForContext = (value: string | null | undefined, limit: number) => {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.length <= limit) return trimmed;
  return `${trimmed.slice(0, limit)}<!-- truncated -->`;
};

const computeElementSelector = (element: HTMLElement): string => {
  const segments: string[] = [];
  let node: HTMLElement | null = element;

  while (node && segments.length < 5) {
    let segment = node.tagName.toLowerCase();

    if (node.id) {
      segment += `#${node.id}`;
      segments.unshift(segment);
      break;
    }

    const classList = Array.from(node.classList).slice(0, 2);
    if (classList.length > 0) {
      segment += `.${classList.join(".")}`;
    }

    const parent = node.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        (child) => (child as HTMLElement).tagName === node.tagName
      );
      if (siblings.length > 1) {
        const index = siblings.indexOf(node) + 1;
        segment += `:nth-of-type(${index})`;
      }
    }

    segments.unshift(segment);
    node = node.parentElement;

    if (node && node.tagName.toLowerCase() === "body") {
      segments.unshift("body");
      break;
    }
  }

  if (segments.length === 0) {
    return element.tagName.toLowerCase();
  }

  return segments.join(" > ");
};

const captureElementSnapshot = (element: HTMLElement | null): SelectedElementSnapshot | null => {
  if (!element) return null;
  return {
    outerHTML: sanitizeHtmlSnippetForContext(element.outerHTML, 8000),
    textContent: sanitizePlainTextForContext(element.textContent, 400),
    selector: sanitizePlainTextForContext(computeElementSelector(element), 250) || element.tagName.toLowerCase(),
  };
};

const buildChatHistoryPayload = (
  messages: ChatMessage[],
  limit = MAX_CHAT_HISTORY_ENTRIES
): WorkflowContextChatMessage[] => {
  if (!Array.isArray(messages) || messages.length === 0) return [];
  const recent = messages
    .filter((message) => typeof message.text === "string" && message.text.trim().length > 0)
    .slice(-limit);

  const history: WorkflowContextChatMessage[] = [];
  for (const entry of recent) {
    const safeText = sanitizePlainTextForContext(entry.text, 900);
    if (!safeText) continue;
    history.push({
      role: entry.isUser ? "user" : "assistant",
      text: safeText,
      agent: entry.isUser ? undefined : entry.agent,
    });
  }

  return history;
};

const buildChatSummary = (history: WorkflowContextChatMessage[], limit = 4): string | null => {
  if (!Array.isArray(history) || history.length === 0) return null;
  const recent = history.slice(-limit);
  const lines = recent
    .map((entry) => {
      const safe = sanitizePlainTextForContext(entry.text, 400);
      if (!safe) return null;
      const speaker =
        entry.role === "assistant" ? `Surbee${entry.agent ? ` (${entry.agent})` : ""}` : "User";
      return `${speaker}: ${safe}`;
    })
    .filter((line): line is string => Boolean(line));

  return lines.length > 0 ? lines.join("\n") : null;
};

// Helper to create a stable bundle key for forcing Sandpack remounts
function createBundleKey(files: Record<string, any>, entry: string): string {
  if (!files || Object.keys(files).length === 0) return "empty";

  // Create a hash from file paths and content lengths to detect changes
  const fileSignature = Object.entries(files)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, file]) => `${path}:${file.code?.length || 0}`)
    .join('|');

  // Use a simple hash to keep key shorter
  let hash = 0;
  for (let i = 0; i < fileSignature.length; i++) {
    const char = fileSignature.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return `${entry}-${Math.abs(hash)}`;
}

// Simple preview-only component for main area (no code editor)
function ProjectPreviewOnly({
  providerProps,
}: {
  providerProps: SandboxProviderProps;
}) {
  // Create a stable key to force remount when files change
  const bundleKey = useMemo(() => {
    return createBundleKey(providerProps.files || {}, providerProps.activeFile || '');
  }, [providerProps.files, providerProps.activeFile]);

  console.log('[ProjectPreviewOnly] Bundle key:', bundleKey);

  return (
    <SandboxProvider key={bundleKey} {...providerProps}>
      <div className="h-full w-full bg-[#0a0a0a]">
        <SandpackPreview
          className="h-full w-full"
          showRefreshButton={false}
          showNavigator={false}
          showOpenInCodeSandbox={false}
          style={{ backgroundColor: "#0a0a0a" }}
        />
      </div>
    </SandboxProvider>
  );
}

function ProjectSandboxView({
  showConsole,
  providerProps,
  onFixError,
  bundle,
  viewMode = 'code',
}: {
  showConsole: boolean;
  providerProps: SandboxProviderProps;
  onFixError: (errorMessage: string) => void;
  bundle: SandboxBundle | null;
  viewMode?: 'code' | 'console';
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const downloadMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!downloadMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(e.target as Node)) {
        setDownloadMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [downloadMenuOpen]);

  const handleDownloadAll = useCallback(async () => {
    if (!bundle) return;
    setIsDownloading(true);
    setDownloadMenuOpen(false);
    try {
      const JSZip = (await import("jszip")).default;
      const { saveAs } = await import("file-saver");
      const zip = new JSZip();
      Object.entries(bundle.files).forEach(([filePath, contents]) => {
        zip.file(filePath, contents ?? "");
      });
      const blob = await zip.generateAsync({ type: "blob" });
      saveAs(blob, "surbee-survey-artifacts.zip");
    } catch (error) {
      console.error("[Sandbox] Failed to download bundle", error);
    } finally {
      setIsDownloading(false);
    }
  }, [bundle]);

  const handleDownloadCurrentFile = useCallback(async () => {
    if (!bundle) return;
    const activeFile = Object.entries(bundle.files).find(([path]) =>
      path === providerProps.files?.[path]?.active || path === bundle.entry
    );
    if (!activeFile) return;

    setIsDownloading(true);
    setDownloadMenuOpen(false);
    try {
      const { saveAs } = await import("file-saver");
      const [filePath, contents] = activeFile;
      const fileName = filePath.split('/').pop() || 'file.txt';
      const blob = new Blob([contents ?? ""], { type: "text/plain;charset=utf-8" });
      saveAs(blob, fileName);
    } catch (error) {
      console.error("[Sandbox] Failed to download file", error);
    } finally {
      setIsDownloading(false);
    }
  }, [bundle, providerProps.files]);

  const dependencySummary = useMemo(() => {
    if (!bundle) {
      return "Bundle output will appear here as soon as SurbeeBuilder delivers a project.";
    }
    const deps = [...(bundle.dependencies ?? []), ...(bundle.devDependencies ?? [])];
    const summaryParts = [`Entry file: ${bundle.entry}`];
    if (deps.length > 0) {
      summaryParts.push(`Requires: ${deps.join(", ")}`);
    } else {
      summaryParts.push("Requires: default React/Tailwind runtime only");
    }
    summaryParts.push("Global stylesheet: src/styles/survey.css");
    return summaryParts.join(" | ");
  }, [bundle]);

  // Create a stable key based on bundle content to force remount on changes
  const bundleKey = useMemo(() => {
    if (!bundle) return "placeholder-project";
    return createBundleKey(providerProps.files || {}, bundle.entry);
  }, [bundle, providerProps.files]);

  return (
    <SandboxProvider key={bundleKey} {...providerProps}>
      <SandboxLayout className="flex flex-col h-full !bg-[#0a0a0a] !border-none !rounded-none">
        {/* Top bar with info and download */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800" style={{ backgroundColor: 'var(--surbee-sidebar-bg)' }}>
          <span className="text-xs text-zinc-400 leading-relaxed">{dependencySummary}</span>

          {viewMode === 'code' ? (
            // Download dropdown for code view
            <div className="relative" ref={downloadMenuRef}>
              <button
                type="button"
                onClick={() => setDownloadMenuOpen(!downloadMenuOpen)}
                disabled={!bundle || isDownloading}
                className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isDownloading ? "Preparing..." : "Download"}
                <ChevronDown className="w-3 h-3" />
              </button>

              {downloadMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-md border border-zinc-700 shadow-lg z-10" style={{ backgroundColor: 'var(--surbee-sidebar-bg)' }}>
                  <button
                    onClick={handleDownloadCurrentFile}
                    className="w-full px-3 py-2 text-left text-xs text-zinc-300 hover:bg-white/10 transition-colors"
                  >
                    Download Current File
                  </button>
                  <button
                    onClick={handleDownloadAll}
                    className="w-full px-3 py-2 text-left text-xs text-zinc-300 hover:bg-white/10 transition-colors border-t border-zinc-700"
                  >
                    Download All Files (ZIP)
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Simple download button for console view
            <button
              type="button"
              onClick={handleDownloadAll}
              disabled={!bundle || isDownloading}
              className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isDownloading ? "Preparing..." : "Download ZIP"}
            </button>
          )}
        </div>

        {/* Main Content Area */}
        {viewMode === 'code' ? (
          // Code view: File tree on left, code editor on right (no preview)
          <div className="flex-1 flex overflow-hidden">
            {/* File Explorer */}
            <SandpackFileExplorer className="w-64 shrink-0 border-r border-zinc-800 text-sm text-zinc-200" style={{ backgroundColor: 'var(--surbee-sidebar-bg)' }} />

            {/* Code Editor - Full width */}
            <SandpackCodeEditor
              className="flex-1 min-w-0"
              showLineNumbers
              showInlineErrors
              wrapContent
              style={{ fontSize: 14, backgroundColor: '#0a0a0a' }}
            />
          </div>
        ) : (
          // Console view: File tree, code editor, and preview
          <div className="flex-1 flex overflow-hidden">
            {/* File Explorer */}
            <SandpackFileExplorer className="w-56 shrink-0 border-r border-zinc-800 text-xs text-zinc-200" style={{ backgroundColor: 'var(--surbee-sidebar-bg)' }} />

            {/* Code Editor */}
            <SandpackCodeEditor
              className="flex-1 min-w-0"
              showLineNumbers
              showInlineErrors
              wrapContent
              style={{ fontSize: 14, backgroundColor: '#0a0a0a' }}
            />

            {/* Preview */}
            <div className="flex-1 border-l border-zinc-800 bg-[#0a0a0a]">
              <SandpackPreview
                className="h-full w-full"
                showRefreshButton
                showNavigator={false}
                showOpenInCodeSandbox={false}
                style={{ backgroundColor: "#0a0a0a" }}
              />
            </div>
          </div>
        )}

        {/* Console Panel at Bottom */}
        {showConsole && (
          <div className="h-48 border-t border-zinc-800 p-3" style={{ backgroundColor: 'var(--surbee-sidebar-bg)' }}>
            <SandpackConsole
              className="h-full overflow-y-auto text-xs leading-relaxed text-emerald-100 [&>*]:font-mono"
              style={{ backgroundColor: '#0a0a0a' }}
            />
          </div>
        )}

        <SandboxErrorPanel isVisible onFix={onFixError} />
      </SandboxLayout>
    </SandboxProvider>
  );
}

const BASE_SANDBOX_DEPENDENCIES: Record<string, string> = {
  react: "19.1.0",
  "react-dom": "19.1.0",
  "lucide-react": "^0.454.0",
};

function deriveSandboxConfig(bundle: SandboxBundle | null): {
  files: SandboxProviderProps["files"];
  activeFile: string;
  dependencies: Record<string, string>;
} {
  if (!bundle) {
    return createDefaultSandboxConfig();
  }

  const files: SandboxProviderProps["files"] = {};
  const normalizedEntry = normalizeSandboxPath(bundle.entry);
  const dependencies = buildSandboxDependencies(bundle);
  let entryExists = false;

  // Process all files - they should already be normalized from the useEffect
  for (const [filePath, contents] of Object.entries(bundle.files)) {
    const normalizedPath = normalizeSandboxPath(filePath);
    const code = typeof contents === "string" ? contents : "";
    files[normalizedPath] = {
      code,
      active: normalizedPath === normalizedEntry,
    };
    if (normalizedPath === normalizedEntry) {
      entryExists = true;
    }
  }

  if (!entryExists) {
    files[normalizedEntry] = {
      code: `export default function GeneratedSurvey() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-center">
        <h1 className="text-2xl font-semibold">Entry component missing</h1>
        <p className="mt-3 text-sm text-zinc-300">
          The survey builder did not provide the file referenced in the tool call (\`${bundle.entry}\`).
          Update the build output and retry.
        </p>
      </div>
    </main>
  );
}
`,
      active: true,
    };
  }

  const importSpecifier = toImportSpecifier(normalizedEntry);

  // Debug: Log the import specifier and verify file exists
  console.log('[deriveSandboxConfig] Entry:', normalizedEntry, 'Import:', importSpecifier);
  console.log('[deriveSandboxConfig] Entry exists:', entryExists);
  console.log('[deriveSandboxConfig] Available files:', Object.keys(files));

  // Collect all CSS imports
  const cssImports: string[] = ["./tailwind.css"];

  // Find all CSS files and import them
  Object.keys(files).forEach(filePath => {
    if (filePath.endsWith('.css') && filePath !== '/tailwind.css') {
      // Import CSS files with relative paths
      const importPath = filePath.startsWith('/') ? `.${filePath}` : `./${filePath}`;
      console.log('[deriveSandboxConfig] Found CSS file:', filePath, '-> import:', importPath);
      cssImports.push(importPath);
    }
  });

  console.log('[deriveSandboxConfig] Total CSS imports:', cssImports);

  // Always recreate index.tsx to ensure import path matches current entry
  files["/index.tsx"] = {
    code: `import React from "react";
import { createRoot } from "react-dom/client";
import SurveyExperience from "${importSpecifier}";
${cssImports.map(css => `import "${css}";`).join('\n')}

const container = document.getElementById("root");

if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <SurveyExperience />
    </React.StrictMode>
  );
}
`,
  };

  // Add tailwind.css file if it doesn't exist
  if (!files["/tailwind.css"]) {
    files["/tailwind.css"] = {
      code: "/* Tailwind styles are provided via CDN in public/index.html */",
      hidden: true,
    };
  }

  // Add styles/survey.css file if it doesn't exist (AI agents often reference this)
  if (!files["/styles/survey.css"]) {
    files["/styles/survey.css"] = {
      code: `/* Survey styles - Tailwind provided via CDN in public/index.html */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}`,
      hidden: true,
    };
  }

  // Only create public/index.html if it doesn't exist
  if (!files["/public/index.html"]) {
    files["/public/index.html"] = {
      code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Survey Preview</title>
    <script src="https://cdn.tailwindcss.com?plugins=forms,typography"></script>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Inter', sans-serif; }
    </style>
  </head>
  <body class="bg-slate-950 text-slate-100">
    <div id="root"></div>
  </body>
</html>
`,
      hidden: true,
    };
  }

  if (!files["/package.json"]) {
    files["/package.json"] = {
      code: JSON.stringify(
        {
          name: "surbee-sandbox",
          version: "1.0.0",
          private: true,
          main: "index.tsx",
          dependencies,
        },
        null,
       2
      ),
      hidden: true,
    };
  }

  return {
    files,
    activeFile: normalizedEntry,
    dependencies,
  };
}

function createDefaultSandboxConfig(): {
  files: SandboxProviderProps["files"];
  activeFile: string;
  dependencies: Record<string, string>;
} {
  const dependencies = { ...BASE_SANDBOX_DEPENDENCIES };
  const files: SandboxProviderProps["files"] = {
    "/App.tsx": {
      code: `import { Calendar, Smile } from "lucide-react";

interface SurveyQuestion {
  id: string;
  label: string;
  type: "multiple-choice" | "rating" | "open-ended";
  options?: string[];
}

const QUESTIONS: SurveyQuestion[] = [
  {
    id: "sentiment",
    label: "How satisfied are you with your onboarding experience so far?",
    type: "rating",
    options: ["1", "2", "3", "4", "5"],
  },
  {
    id: "channels",
    label: "Which communication channels do you prefer?",
    type: "multiple-choice",
    options: ["Email", "SMS", "Slack", "Teams", "Phone"],
  },
  {
    id: "insights",
    label: "Share any ideas or questions you have for the team.",
    type: "open-ended",
  },
];

export default function App() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
        <header className="flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-wider text-white/70">
            <Calendar className="h-3 w-3" />
            Customer Discovery Pulse
          </div>
          <h1 className="text-3xl font-semibold">
            Tell us about your first impressions
          </h1>
          <p className="text-sm text-white/70">
            Your answers help us tailor the onboarding journey to what matters most for your team.
          </p>
        </header>

        <section className="space-y-6">
          {QUESTIONS.map((question) => (
            <article
              key={question.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-white/5"
            >
              <h2 className="text-lg font-medium text-white/90">{question.label}</h2>
              <div className="mt-4">
                {question.type === "rating" && question.options && (
                  <div className="flex items-center gap-1">
                    {question.options.map((option) => (
                      <button
                        key={option}
                        className="h-10 w-10 rounded-full border border-white/10 bg-white/10 text-sm text-white/80 transition hover:bg-white/20"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
                {question.type === "multiple-choice" && question.options && (
                  <div className="flex flex-wrap gap-2">
                    {question.options.map((option) => (
                      <label
                        key={option}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 transition hover:bg-white/10"
                      >
                        <input type="checkbox" className="accent-white/80" /> {option}
                      </label>
                    ))}
                  </div>
                )}
                {question.type === "open-ended" && (
                  <div className="relative">
                    <textarea
                      className="mt-2 block w-full resize-y rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/90 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                      rows={4}
                      placeholder="Drop your thoughts here..."
                    />
                    <Smile className="absolute bottom-4 right-4 h-4 w-4 text-white/40" />
                  </div>
                )}
              </div>
            </article>
          ))}
        </section>

        <footer className="flex flex-col gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-sm text-emerald-100">
          <p>
            We read every response. Your insights directly inform how we design product tours, playbooks,
            and success metrics.
          </p>
          <button className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400">
            Submit responses
          </button>
        </footer>
      </div>
    </main>
  );
}
`,
      active: true,
    },
    "/index.tsx": {
      code: `import React from "react";
import { createRoot } from "react-dom/client";
import Survey from "./Survey";
import "./tailwind.css";

const container = document.getElementById("root");

if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <Survey />
    </React.StrictMode>
  );
}
`,
    },
    "/tailwind.css": {
      code: "/* Tailwind styles are provided via CDN in public/index.html for the default sandbox. */",
      hidden: true,
    },
    "/public/index.html": {
      code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Surbee Sandbox</title>
    <script src="https://cdn.tailwindcss.com?plugins=forms,typography"></script>
  </head>
  <body class="bg-slate-950 text-slate-100">
    <div id="root"></div>
  </body>
</html>
`,
      hidden: true,
    },
    "/package.json": {
      code: JSON.stringify(
        {
          name: "surbee-sandbox",
          version: "1.0.0",
          private: true,
          main: "index.tsx",
          dependencies,
        },
        null,
        2
      ),
      hidden: true,
    },
  };

  return {
    files,
    activeFile: "/App.tsx",
    dependencies,
  };
}

function normalizeSandboxPath(filePath: string): string {
  const trimmed = filePath.replace(/^\.\//, "").replace(/\\/g, "/");
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function toImportSpecifier(normalizedPath: string): string {
  const withoutExtension = normalizedPath.replace(/\.[tj]sx?$/, "");
  return withoutExtension.startsWith("/")
    ? `.${withoutExtension}`
    : `./${withoutExtension}`;
}

function buildSandboxDependencies(bundle: SandboxBundle | null): Record<string, string> {
  const dependencies: Record<string, string> = { ...BASE_SANDBOX_DEPENDENCIES };

  const mergeSpecs = (specs?: string[]) => {
    specs?.forEach((spec) => {
      const parsed = parseDependencySpec(spec);
      if (parsed) {
        dependencies[parsed.name] = parsed.version;
      }
    });
  };

  mergeSpecs(bundle?.dependencies);
  mergeSpecs(bundle?.devDependencies);

  return dependencies;
}

function parseDependencySpec(spec: string): { name: string; version: string } | null {
  const trimmed = spec.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("@")) {
    const atIndex = trimmed.indexOf("@", 1);
    if (atIndex !== -1) {
      return {
        name: trimmed.slice(0, atIndex),
        version: trimmed.slice(atIndex + 1) || "latest",
      };
    }
    return { name: trimmed, version: "latest" };
  }

  const lastAt = trimmed.lastIndexOf("@");
  if (lastAt > 0) {
    return {
      name: trimmed.slice(0, lastAt),
      version: trimmed.slice(lastAt + 1) || "latest",
    };
  }

  return { name: trimmed, version: "latest" };
}

function SandboxErrorPanel({
  isVisible,
  onFix,
}: {
  isVisible: boolean;
  onFix: (error: string) => void;
}) {
  const { sandpack } = useSandpack();
  const errorMessage = useMemo(() => {
    if (!isVisible) return null;
    const errors = sandpack?.bundlerState?.errors ?? {};
    const firstError = Object.values(errors)[0] as any;
    if (!firstError) return null;
    if (typeof firstError === "string") return firstError;
    return firstError?.message || firstError?.stack || JSON.stringify(firstError);
  }, [isVisible, sandpack?.bundlerState]);

  if (!isVisible || !errorMessage) {
    return null;
  }

  return (
    <div className="pointer-events-auto absolute bottom-4 right-4 max-w-xs rounded-lg border border-red-500/35 bg-red-500/10 px-3 py-3 text-sm shadow-lg backdrop-blur">
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-red-200">
        Runtime error
      </div>
      <p className="text-sm text-red-100/90 whitespace-pre-wrap">
        {errorMessage}
      </p>
      <button
        type="button"
        onClick={() => onFix(errorMessage)}
        className="mt-2 inline-flex items-center justify-center gap-1 rounded-md bg-red-500/80 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-500"
      >
        Fix it
      </button>
    </div>
  );
}


interface Project {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string | null;
  user_id: string;
  status: 'draft' | 'published' | 'archived';
}

const InviteModal = dynamic(() => import('@/components/referrals/InviteModal'), { ssr: false })

type AgentItem =
  | { type: 'message'; text?: string; agent?: string; isHtml?: boolean }
  | { type: 'reasoning'; text?: string; agent?: string }
  | { type: 'tool_call'; name?: string; arguments?: unknown; agent?: string }
  | { type: 'tool_result'; name?: string; output?: unknown; agent?: string; html?: string | null }
  | { type: 'tool_approval'; name?: string; status?: string; agent?: string }
  | { type: 'handoff'; description?: string; agent?: string; from?: string; to?: string };

interface WorkflowRunResult {
  output_text: string;
  stage: 'fail' | 'plan' | 'build';
  guardrails: unknown;
  items?: AgentItem[];
  html?: string;
}

const HTML_TAG_CUES = ['<!doctype', '<html', '<body', '<head', '<section', '<main', '<form', '<div'];

type WorkflowPhase = 'idle' | 'planner' | 'planner_summary' | 'builder' | 'complete';

interface SandboxBundle {
  files: Record<string, string>;
  entry: string;
  dependencies?: string[];
  devDependencies?: string[];
}

interface BundleVersion {
  id: string;
  timestamp: number;
  bundle: SandboxBundle;
  description: string;
  messageId?: string; // ID of the message that created this version
}



interface HistoryEntry {
  id: string;
  prompt: string;
  timestamp: Date;
  changes: string[];
  version: number;
  isFlagged: boolean;
}

type SidebarView = 'chat' | 'history' | 'code' | 'console';

interface ProjectPageProps {
  params: {
    id: string;
  };
}

// Helper function to extract questions from source files
function extractQuestionsFromSourceFiles(files: Record<string, string>): Array<{
  question_id: string;
  question_text: string;
  question_type: string;
  options?: string[];
  required?: boolean;
  order_index: number;
}> {
  const questions: Map<string, any> = new Map();

  // Regular expressions to match metadata attributes
  const questionIdRegex = /data-question-id=["']([^"']+)["']/g;
  const questionTextRegex = /data-question-text=["']([^"']+)["']/g;
  const questionTypeRegex = /data-question-type=["']([^"']+)["']/g;
  const questionOptionsRegex = /data-question-options=["']([^"']+)["']/g;
  const questionRequiredRegex = /data-question-required=["'](true|false)["']/g;

  // Process each file
  Object.values(files).forEach((content) => {
    if (typeof content !== 'string') return;

    // Find all question IDs in this file
    let match;
    const questionIdsInFile: string[] = [];

    while ((match = questionIdRegex.exec(content)) !== null) {
      questionIdsInFile.push(match[1]);
    }

    // For each question ID, extract all its metadata
    questionIdsInFile.forEach((questionId) => {
      if (questions.has(questionId)) return; // Already processed

      // Find the section of code containing this question
      const questionSection = content.substring(
        Math.max(0, content.indexOf(questionId) - 500),
        content.indexOf(questionId) + 500
      );

      // Extract question text
      const textMatch = questionSection.match(questionTextRegex);
      const questionText = textMatch ? textMatch[0].match(/["']([^"']+)["']/)?.[1] : questionId;

      // Extract question type
      const typeMatch = questionSection.match(questionTypeRegex);
      const questionType = typeMatch ? typeMatch[0].match(/["']([^"']+)["']/)?.[1] : 'text_input';

      // Extract options if present
      const optionsMatch = questionSection.match(questionOptionsRegex);
      let options: string[] | undefined;
      if (optionsMatch) {
        const optionsStr = optionsMatch[0].match(/["']([^"']+)["']/)?.[1];
        options = optionsStr ? JSON.parse(optionsStr.replace(/&quot;/g, '"')) : undefined;
      }

      // Extract required flag
      const requiredMatch = questionSection.match(questionRequiredRegex);
      const required = requiredMatch ? requiredMatch[0].includes('true') : false;

      questions.set(questionId, {
        question_id: questionId,
        question_text: questionText || questionId,
        question_type: questionType || 'text_input',
        options,
        required,
      });
    });
  });

  // Convert to array and add order_index
  const questionsArray = Array.from(questions.values());
  return questionsArray.map((q, index) => ({
    ...q,
    order_index: index + 1,
  }));
}

export default function ProjectPage() {

  // In client components, use useParams() to read dynamic params
  const { id } = useParams() as { id?: string };
  const projectId: string | undefined = id;
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { subscribeToProject } = useRealtime();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration errors by only checking theme on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isDarkMode = isMounted && theme === 'dark';

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleProfileAction = (action: string) => {
    setIsUserMenuOpen(false);
    switch (action) {
      case 'settings':
        handleNavigation('/dashboard/settings');
        break;
      case 'logout':
        // Handle logout
        handleNavigation('/');
        break;
      default:
        break;
    }
  };

  // Check if this is a sandbox preview request
  const isSandboxPreview = searchParams?.get('sandbox') === '1';

  // Extract session ID from URL for chat session management
  const sessionIdFromUrl = searchParams?.get('sessionId');

  // Initialize chat session management (skip in sandbox preview mode)
  const {
    sessionId: currentSessionId,
    isLoading: sessionLoading,
    saveMessages: saveChatMessages,
    loadSession,
  } = useChatSession({
    projectId: projectId || '',
    userId: user?.id,
    sessionId: sessionIdFromUrl,
    // Disable session management in sandbox preview mode
    enabled: !isSandboxPreview,
  });

  // Enable mock mode by default (no database)
  const mockMode = false;

  // Project state
  const [project, setProject] = useState<Project | null>(null);
  const [projectLoading, setProjectLoading] = useState(false);
  const [autoGeneratedTitle, setAutoGeneratedTitle] = useState<string | null>(null);
  const [isTitleGenerating, setIsTitleGenerating] = useState(false);

  const [isPlanUsageOpen, setIsPlanUsageOpen] = useState(true);
  const [isChatsOpen, setIsChatsOpen] = useState(false);
  const [isFoldersOpen, setIsFoldersOpen] = useState(false);
  const [isHomeOpen, setIsHomeOpen] = useState(false);
  const [isLabOpen, setIsLabOpen] = useState(false);
  const [isKnowledgeBaseOpen, setIsKnowledgeBaseOpen] = useState(false);
  const [chatText, setChatText] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<{ [key: string]: string }>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Reasoning and sandbox state
  const [sandboxContent, setSandboxContent] = useState<Record<string, string> | null>(null);
  const [sandboxBundle, setSandboxBundle] = useState<SandboxBundle | null>(null);
  const [sandboxError, setSandboxError] = useState<string | null>(null);
  const [rendererKey, setRendererKey] = useState(0);
  const [bundleVersions, setBundleVersions] = useState<BundleVersion[]>([]);
  const [currentVersionId, setCurrentVersionId] = useState<string | null>(null);
  const sandboxConfig = useMemo(() => {
    return deriveSandboxConfig(sandboxBundle);
  }, [sandboxBundle]);

  const sandboxProviderProps = useMemo<SandboxProviderProps>(() => ({
    template: "react-ts",
    theme: "dark",
    files: sandboxConfig.files,
    customSetup: {
      entry: "/index.tsx",
      main: "/index.tsx",
      dependencies: sandboxConfig.dependencies,
      environment: "create-react-app",
    },
    options: {
      activeFile: sandboxConfig.activeFile,
      autorun: true,
      recompileMode: "immediate",
      recompileDelay: 300,
      externalResources: [
        "https://cdn.tailwindcss.com?plugins=forms,typography",
        "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
      ],
    },
  }), [sandboxConfig]);
  const sandboxAvailable = Boolean(sandboxBundle);

  // Initialize selected model ONCE from sessionStorage
  const [selectedModel, setSelectedModel] = useState<AIModel>(() => {
    if (typeof window === 'undefined') return 'gpt-5';
    try {
      const storedModel = sessionStorage.getItem('surbee_selected_model');
      if (storedModel === 'gpt-5' || storedModel === 'claude-haiku' || storedModel === 'mistral') {
        return storedModel as AIModel;
      }
    } catch (e) {
      console.error('Failed to read model from sessionStorage:', e);
    }
    return 'gpt-5';
  });

  const selectedModelRef = useRef(selectedModel);

  // Update sessionStorage when model changes
  const handleModelChange = useCallback((model: AIModel) => {
    console.log('🔄 CHANGING MODEL TO:', model);
    setSelectedModel(model);
    selectedModelRef.current = model;
    try {
      sessionStorage.setItem('surbee_selected_model', model);
      console.log('✅ SAVED NEW MODEL TO SESSION STORAGE:', model);
    } catch (e) {
      console.error('Failed to save model to sessionStorage:', e);
    }
  }, []);

  // useChat hook for message handling - using Vercel AI SDK
  const chatTransport = useMemo(() => new DefaultChatTransport({ api: '/api/agents/surbee-v3' }), []);

  // Memoize onError to prevent useChat re-initialization
  const onError = useCallback((error: Error) => {
    console.error('🚨 Chat error:', error);
  }, []);

  const { messages: rawMessages, sendMessage: originalSendMessage, status, stop, reload, setMessages } = useChat<ChatMessage>({
    transport: chatTransport,
    // DO NOT pass body here - we'll pass it in sendMessage instead to allow dynamic model switching
    onError,
    // CRITICAL: Throttle UI updates to prevent "Maximum update depth exceeded"
    experimental_throttle: 50,
  });

  // Use raw messages directly - deferring didn't help
  const messages = rawMessages;

  // Use sendMessage directly - don't wrap it
  const sendMessage = originalSendMessage;

  // Load and restore session messages when continuing from a previous session
  const [sessionLoaded, setSessionLoaded] = useState(false);
  useEffect(() => {
    const loadAndRestoreSession = async () => {
      if (!sessionIdFromUrl || !user?.id || sessionLoaded || isSandboxPreview) return;

      try {
        console.log('📥 Loading session messages for:', sessionIdFromUrl);
        const session = await loadSession();

        if (session?.messages && session.messages.length > 0) {
          console.log('✅ Restoring', session.messages.length, 'messages from session');
          // Transform session messages to the format useChat expects
          const restoredMessages = session.messages.map((m: any, idx: number) => ({
            id: m.id || `restored-${idx}`,
            role: m.role,
            content: m.content,
            ...m
          }));
          setMessages(restoredMessages);
          setHasStartedChat(true);

          // Also try to restore sandbox bundle from the last assistant message
          const lastAssistant = session.messages.filter((m: any) => m.role === 'assistant').pop();
          if (lastAssistant?.toolInvocations) {
            for (const tool of lastAssistant.toolInvocations) {
              if (tool.result?.source_files) {
                console.log('🔄 Restoring sandbox bundle from session');
                setSandboxBundle({
                  files: tool.result.source_files,
                  entry: tool.result.entry || '/index.tsx',
                  dependencies: tool.result.dependencies || []
                });
                break;
              }
            }
          }
        }
        setSessionLoaded(true);
      } catch (error) {
        console.error('Failed to load session:', error);
        setSessionLoaded(true);
      }
    };

    loadAndRestoreSession();
  }, [sessionIdFromUrl, user?.id, loadSession, setMessages, isSandboxPreview, sessionLoaded]);

  // No debouncing needed - we render directly from messages

  // Save chat messages to session whenever they change
  useEffect(() => {
    if (messages.length > 0 && user?.id && !isSandboxPreview) {
      // Convert messages to the format expected by saveChatMessages
      const messagesToSave = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.text || msg.content || '',
        ...msg // Include any other properties
      }));

      // Save to database
      saveChatMessages(messagesToSave as any).catch(err => {
        console.error('Failed to save chat messages:', err);
      });
    }
  }, [messages, user?.id, saveChatMessages, isSandboxPreview]);

  // Capture and save preview screenshot after sandbox bundle is created
  useEffect(() => {
    if (!sandboxBundle || !projectId || !user?.id || isSandboxPreview) return;

    // Generate preview from survey questions
    const capturePreview = async () => {
      try {
        // Wait a bit for questions to be saved
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Fetch questions for this project to generate preview
        const questionsRes = await fetch(`/api/projects/${projectId}/questions?userId=${user.id}`);
        const questionsData = await questionsRes.json();

        // Import the screenshot utility dynamically
        const { generateSurveyPreview, captureSandboxScreenshot } = await import('@/lib/capture-sandbox-screenshot');

        let screenshotDataUrl: string;

        // If we have questions, generate a proper preview from them
        if (questionsData.questions && questionsData.questions.length > 0) {
          console.log('📸 Generating preview from survey questions:', questionsData.questions.length);
          screenshotDataUrl = await generateSurveyPreview(
            questionsData.questions.map((q: any) => ({
              question_text: q.question_text,
              question_type: q.question_type,
              options: q.options,
            })),
            {
              width: 400,
              height: 300,
              quality: 0.5,
              format: 'jpeg'
            }
          );
        } else {
          // Fallback: generate a placeholder preview
          console.log('📸 No questions found, generating placeholder preview');
          const previewFrame = document.querySelector('[data-sp-preview-iframe]') as HTMLIFrameElement;
          if (previewFrame) {
            screenshotDataUrl = await captureSandboxScreenshot(previewFrame, {
              width: 400,
              height: 300,
              quality: 0.5,
              format: 'jpeg'
            });
          } else {
            // Final fallback - just generate a basic placeholder
            screenshotDataUrl = await captureSandboxScreenshot({} as HTMLIFrameElement, {
              width: 400,
              height: 300,
              quality: 0.5,
              format: 'jpeg'
            });
          }
        }

        // Save to database
        const response = await fetch(`/api/projects/${projectId}/preview`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            previewImage: screenshotDataUrl,
            sandboxBundle: sandboxBundle,
          }),
        });

        if (response.ok) {
          console.log('✅ Preview screenshot saved successfully');
        } else {
          console.error('Failed to save preview screenshot:', await response.text());
        }
      } catch (error) {
        console.error('Error capturing/saving preview:', error);
      }
    };

    capturePreview();
  }, [sandboxBundle, projectId, user?.id, isSandboxPreview]);

  // Extract sandbox bundle from tool results
  const prevBundleRef = useRef<string | null>(null);
  const messagesLengthRef = useRef(0);

  // Extract sandbox bundle from tool results
  useEffect(() => {
    if (!messages || messages.length === 0) return;

    // Skip if messages length hasn't changed AND status hasn't changed to ready
    const isNewMessage = messages.length !== messagesLengthRef.current;
    const justFinishedStreaming = status === 'ready';

    if (!isNewMessage && !justFinishedStreaming) return;

    messagesLengthRef.current = messages.length;

    console.log('[Bundle Extraction] Checking for source_files, messages:', messages.length, 'status:', status);

    // Look through all assistant messages for any tool that returns source_files
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role !== 'assistant') continue;

      // Check ALL tool parts for source_files
      for (const part of msg.parts) {
        if (part.type.startsWith('tool-') && part.state === 'output-available') {
          const output = part.output as any;
          if (output?.source_files && Object.keys(output.source_files).length > 0) {
            console.log('[Bundle Extraction] Found source_files in tool output!');

            // Helper function to fix common syntax errors in generated code
            const fixSyntaxIssues = (code: string): string => {
              // Simple approach: Convert all single-quoted strings to template literals
              // This avoids apostrophe issues entirely
              // Match patterns like: text: 'content with apostrophe's'

              // Replace single-quoted strings with template literals (backticks)
              // But only for property values, not for keys
              let fixed = code.replace(/:\s*'([^']*?)'/gs, (match, content) => {
                // If the content doesn't contain newlines or other special chars, use template literal
                // Template literals handle apostrophes naturally
                return `: \`${content}\``;
              });

              return fixed;
            };

            // Normalize all file paths to have leading slashes and fix syntax issues
            const normalizedFiles: Record<string, string> = {};
            Object.entries(output.source_files).forEach(([path, content]) => {
              const normalizedPath = path.startsWith('/') ? path : `/${path}`;
              const contentStr = content as string;
              // Fix syntax issues in the code
              const fixedContent = fixSyntaxIssues(contentStr);
              normalizedFiles[normalizedPath] = fixedContent;
            });

            // Auto-detect entry file if not specified
            const detectEntryFile = (files: Record<string, string>): string => {
              // First check if AI provided an entry point
              if (output.entry_point || output.entry_file || output.entry) {
                const provided = output.entry_point || output.entry_file || output.entry;
                return provided.startsWith('/') ? provided : `/${provided}`;
              }

              // Look for common entry file patterns
              const fileKeys = Object.keys(files);

              // Priority 1: Look for App.tsx, App.ts, index.tsx, index.ts
              const commonEntries = ['/App.tsx', '/src/App.tsx', '/Index.tsx', '/src/Index.tsx', '/index.tsx', '/src/index.tsx'];
              for (const entry of commonEntries) {
                if (fileKeys.includes(entry)) return entry;
              }

              // Priority 2: Look for any .tsx file in root or src
              const tsxFile = fileKeys.find(key =>
                (key.endsWith('.tsx') || key.endsWith('.ts')) &&
                (key.startsWith('/src/') || key.split('/').length === 2)
              );
              if (tsxFile) return tsxFile;

              // Priority 3: First .tsx or .ts file found
              const firstReactFile = fileKeys.find(key => key.endsWith('.tsx') || key.endsWith('.ts'));
              if (firstReactFile) return firstReactFile;

              // Fallback: first file
              return fileKeys[0] || '/App.tsx';
            };

            const normalizedEntry = detectEntryFile(normalizedFiles);

            // Create a proper SandboxBundle with normalized paths
            const bundle: SandboxBundle = {
              files: normalizedFiles,
              entry: normalizedEntry,
              dependencies: output.dependencies || [],
              devDependencies: output.devDependencies || [],
            };

            // Only update if bundle content has changed
            const bundleStr = JSON.stringify(bundle);
            if (bundleStr !== prevBundleRef.current) {
              prevBundleRef.current = bundleStr;

              console.log('[Bundle Extraction] New bundle detected! Updating sandbox...');

              // Extract and save questions from the generated survey
              const extractAndSaveQuestions = async () => {
                if (!projectId || !user?.id) return;

                try {
                  const questions = extractQuestionsFromSourceFiles(normalizedFiles);

                  if (questions.length > 0) {
                    console.log('[Questions] Extracted', questions.length, 'questions from survey');

                    // Save questions to database
                    const response = await fetch(`/api/projects/${projectId}/questions`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        userId: user.id,
                        questions,
                      }),
                    });

                    if (response.ok) {
                      console.log('[Questions] Successfully saved questions to database');
                    } else {
                      console.error('[Questions] Failed to save questions:', await response.text());
                    }
                  }
                } catch (error) {
                  console.error('[Questions] Error extracting/saving questions:', error);
                }
              };

              // Batch all state updates together to prevent cascading re-renders
              const versionId = `v${Date.now()}`;
              startTransition(() => {
                setSandboxBundle(bundle);
                setBundleVersions(prev => {
                  const newVersion: BundleVersion = {
                    id: versionId,
                    timestamp: Date.now(),
                    bundle: bundle,
                    description: `Version ${prev.length + 1}`,
                    messageId: msg.id,
                  };
                  return [...prev, newVersion];
                });
                setCurrentVersionId(versionId);
              });

              // Extract and save questions asynchronously
              extractAndSaveQuestions();
            } else {
              console.log('[Bundle Extraction] Bundle unchanged, skipping update');
            }
            return; // Use the most recent source_files found
          }
        }
      }
    }

    console.log('[Bundle Extraction] No source_files found in messages');
  }, [messages, status]); // Also depend on status to re-check when streaming finishes

  // Track thinking duration
  const [thinkingStartTime, setThinkingStartTime] = useState<number | null>(null);
  const [thinkingDuration, setThinkingDuration] = useState<number>(0);

  // Track when thinking starts/ends
  useEffect(() => {
    if (status === 'streaming' || status === 'submitted') {
      if (!thinkingStartTime) {
        setThinkingStartTime(Date.now());
      }
    } else if (status === 'ready' && thinkingStartTime) {
      const duration = Math.round((Date.now() - thinkingStartTime) / 1000);
      setThinkingDuration(duration);
      setThinkingStartTime(null);
    }
  }, [status, thinkingStartTime]);

  // Thinking chain state
  const [sidebarView, setSidebarView] = useState<SidebarView>('chat');
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [versionCounter, setVersionCounter] = useState(1);
  const [currentDevice, setCurrentDevice] = useState<'desktop' | 'tablet' | 'phone'>('desktop');
  const [previewUrl, setPreviewUrl] = useState('/');
  const [isPageDropdownOpen, setIsPageDropdownOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<string>('/');
  const [pages, setPages] = useState<{ path: string; title: string }[]>([{ path: '/', title: '/' }]);
  const [isChatHidden, setIsChatHidden] = useState(false);
  const [currentView, setCurrentView] = useState<'viewer' | 'flow'>('viewer');
  const [isEditMode, setIsEditMode] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [activeTopButton, setActiveTopButton] = useState<'upgrade' | 'publish' | null>(null);
  const [isCgihadiDropdownOpen, setIsCgihadiDropdownOpen] = useState(false);

  const chatAreaRef = useRef<HTMLDivElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const publishMenuRef = useRef<HTMLDivElement>(null);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [creditsTotal] = useState(5);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'up' | 'down'>>({});
  // Always publish to marketplace (community)
  const publishToMarketplace = true;
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);

  // Load project from database (don't auto-create)
  useEffect(() => {
    if (!mockMode && projectId && user?.id && !project && !projectLoading) {
      setProjectLoading(true);

      // Try to fetch the project
      fetch(`/api/projects/${projectId}?userId=${user.id}`)
        .then(res => {
          if (!res.ok) {
            // Project doesn't exist yet (404) or other error
            // Set a placeholder to prevent repeated fetches
            if (res.status === 404) {
              console.log('Project not found, will be created on first publish');
              setProject({ id: projectId } as any); // Placeholder to stop refetching
              return null;
            }
            throw new Error(`HTTP ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          if (data?.project) {
            // Project exists, use it
            setProject(data.project);
          }
          // If project doesn't exist, it will be created on first publish
        })
        .catch(err => {
          console.error('Failed to load project:', err);
          // Set placeholder to prevent infinite retries
          setProject({ id: projectId } as any);
        })
        .finally(() => setProjectLoading(false));
    }
  }, [mockMode, projectId, user?.id, project, projectLoading]);

  // Initialize published URL from project
  useEffect(() => {
    if (project?.published_url && !publishedUrl) {
      setPublishedUrl(project.published_url);
    }
  }, [project, publishedUrl]);

  // Subscribe to real-time messages for this project
  useEffect(() => {
    if (projectId && user && !mockMode) {
      const unsubscribe = subscribeToProject();
      return unsubscribe;
    }
  }, [projectId, user, mockMode]);

    // Sync in-frame navigations to the route dropdown
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const data: any = e.data || {};
      if (data && data.type === 'deepsite:navigate' && typeof data.path === 'string') {
        setSelectedRoute(prevRoute => {
          // Only update if the route actually changed
          if (prevRoute !== data.path) {
            return data.path;
          }
          return prevRoute;
        });
      }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);



  // Handle initial prompt from session storage
  const hasSubmittedInitialPrompt = useRef(false);
  useEffect(() => {
    // Check for initial prompt and images from session storage
    if (hasSubmittedInitialPrompt.current) return;

    let initialPrompt: string | null = null;
    let initialImages: string[] = [];
    try {
      if (typeof window !== 'undefined') {
        initialPrompt = sessionStorage.getItem('surbee_initial_prompt');
        const imagesStr = sessionStorage.getItem('surbee_initial_images');
        if (imagesStr) {
          try { initialImages = JSON.parse(imagesStr) as string[]; } catch {}
          sessionStorage.removeItem('surbee_initial_images');
        }
        if (initialPrompt) {
          sessionStorage.removeItem('surbee_initial_prompt');
        }
      }
    } catch {}

    if (initialPrompt && status === 'ready') {
      hasSubmittedInitialPrompt.current = true;
      handleSubmit(initialPrompt, initialImages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Update placeholder class in editor when chat text changes
  useEffect(() => {
    const contentEditableDiv = document.querySelector('.ProseMirror') as HTMLDivElement;
    if (contentEditableDiv) {
      const isEmpty = !contentEditableDiv.textContent || contentEditableDiv.textContent.trim() === '';
      if (isEmpty) {
        contentEditableDiv.classList.add('is-editor-empty');
      } else {
        contentEditableDiv.classList.remove('is-editor-empty');
      }
    }
  }, [chatText]);













  const handleRestoreVersion = useCallback((versionId: string) => {
    const version = bundleVersions.find(v => v.id === versionId);
    if (!version) {
      console.error('[Version History] Version not found:', versionId);
      return;
    }

    console.log('[Version History] Restoring version:', versionId);
    setSandboxBundle(version.bundle);
    setCurrentVersionId(versionId);
    setSidebarView('chat'); // Switch back to chat view after restore
  }, [bundleVersions]);

  const handleSubmit = useCallback(async (message: string, images?: string[]) => {
    if (!message.trim() || status !== 'ready') return;

    setHasStartedChat(true);

    // Generate title from first message using AI if not already set
    if (!autoGeneratedTitle && message.trim()) {
      setIsTitleGenerating(true);

      // Run title generation in background without blocking message send
      fetch('/api/generate-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: message,
          model: selectedModelRef.current // Pass the selected model
        }),
      })
        .then(async (response) => {
          if (response.ok && response.body) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let streamedTitle = '';

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              streamedTitle += chunk;
            }

            if (streamedTitle.trim()) {
              const generatedTitle = streamedTitle.trim();
              setAutoGeneratedTitle(generatedTitle);

              // Save title to database
              if (projectId && user?.id) {
                fetch(`/api/projects/${projectId}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    user_id: user.id,
                    title: generatedTitle,
                  }),
                })
                  .then((res) => {
                    if (res.ok) {
                      console.log('✅ Title saved to database:', generatedTitle);
                    }
                  })
                  .catch((err) => console.error('Failed to save title:', err));
              }
            }
          }
        })
        .catch((error) => {
          console.error('Title generation failed:', error);
          // Fallback to simple title generation
          const words = message.trim().split(/\s+/);
          const titleWords = words.slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
          const fallbackTitle = titleWords.join(' ');
          setAutoGeneratedTitle(fallbackTitle);

          // Save fallback title to database
          if (projectId && user?.id) {
            fetch(`/api/projects/${projectId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id: user.id,
                title: fallbackTitle,
              }),
            }).catch((err) => console.error('Failed to save title:', err));
          }
        })
        .finally(() => {
          setIsTitleGenerating(false);
        });
    }

    // Use the current selected model from state
    const currentModel = selectedModelRef.current;
    console.log('📤 SENDING MESSAGE WITH MODEL:', currentModel);

    // Send message with images via body options (not content array)
    if (images && images.length > 0) {
      console.log('📷 Sending message with', images.length, 'images');

      const sendOptions = {
        body: {
          model: currentModel,
          images: images, // Send images in body, not in message content
          projectId: id,
          userId: user?.id
        }
      };

      sendMessage({ text: message }, sendOptions);
    } else {
      const sendOptions = { body: { model: currentModel, projectId: id, userId: user?.id } };
      sendMessage({ text: message }, sendOptions);
    }
  }, [status, autoGeneratedTitle]); // sendMessage and selectedModel intentionally excluded - using refs/direct access

  const handleSandboxFixRequest = useCallback((errorMessage: string) => {
    const prompt = `The sandbox preview reported an error:\n\n${errorMessage}\n\nPlease diagnose the issue and provide an updated solution.`;
    void handleSubmit(prompt, []);
    setSidebarView('chat');
    setSandboxError(null);
  }, [handleSubmit, setSidebarView]);

  const handleSandboxIgnore = useCallback(() => {
    setSandboxError(null);
  }, []);

  const handlePublish = useCallback(async () => {
    if (!projectId || !user?.id) return;

    // Check if there's code in the sandbox
    if (!sandboxAvailable) {
      setPublishSuccess('Please generate code before publishing');
      setTimeout(() => setPublishSuccess(null), 3000);
      return;
    }

    setIsPublishing(true);
    setPublishSuccess(null);

    try {
      // Publish the project (creates it if it doesn't exist)
      const response = await fetch(`/api/projects/${projectId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          surveySchema: null, // Can add survey schema if needed
          publishToMarketplace
        })
      });

      const data = await response.json();

      if (data.success && data.publishedUrl) {
        setPublishedUrl(data.publishedUrl);
        setPublishSuccess(project?.status === 'published' ? 'Survey updated successfully!' : 'Survey published successfully!');

        // Update project status and store the full project
        setProject(data.project || {
          id: projectId,
          status: 'published',
          published_url: data.publishedUrl,
          user_id: user.id
        } as any);

        setTimeout(() => setPublishSuccess(null), 3000);
      } else {
        throw new Error(data.error || 'Failed to publish');
      }
    } catch (error) {
      console.error('Failed to publish:', error);
      setPublishSuccess('Failed to publish. Please try again.');
      setTimeout(() => setPublishSuccess(null), 3000);
    } finally {
      setIsPublishing(false);
    }
  }, [projectId, user?.id, publishToMarketplace, project, sandboxAvailable]);

  const copyPublishedLink = useCallback(async () => {
    if (!publishedUrl) return;

    const fullUrl = `${window.location.origin}/s/${publishedUrl}`;

    try {
      await navigator.clipboard.writeText(fullUrl);
      setPublishSuccess('Link copied to clipboard!');
      setTimeout(() => setPublishSuccess(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [publishedUrl]);

  // Copy message content to clipboard
  const handleCopyMessage = useCallback(async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, []);

  // Handle feedback (thumbs up/down)
  const handleFeedback = useCallback(async (messageId: string, feedbackType: 'up' | 'down', messageContent: string) => {
    // Update local state immediately
    setFeedbackGiven(prev => ({ ...prev, [messageId]: feedbackType }));

    // Send to API
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          projectId,
          messageId,
          feedbackType: feedbackType === 'up' ? 'thumbs_up' : 'thumbs_down',
          messageContent,
          context: {
            model: selectedModel,
            timestamp: new Date().toISOString(),
          },
        }),
      });
    } catch (error) {
      console.error('Failed to save feedback:', error);
    }
  }, [user?.id, projectId, selectedModel]);

  // Handle retry - delete last message and regenerate
  const handleRetry = useCallback(() => {
    // Reset thinking duration for new attempt
    setThinkingDuration(0);
    setThinkingStartTime(null);
    // Call reload which regenerates the last response
    reload();
  }, [reload]);

  const isImageFile = (file: File) => file.type.startsWith("image/");

  const processFile = (file: File) => {
    if (!isImageFile(file)) {
      console.log("Only image files are allowed");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      console.log("File too large (max 10MB)");
      return;
    }
    setFiles(prev => (prev.length >= 10 ? prev : [...prev, file].slice(0, 10)));
    const reader = new FileReader();
    reader.onload = (e) => setFilePreviews(prev => ({ ...prev, [file.name]: e.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    const newPreviews = { ...filePreviews };
    delete newPreviews[files[index].name];
    setFilePreviews(newPreviews);
  };

  const openImageModal = (imageUrl: string) => setSelectedImage(imageUrl);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((file) => isImageFile(file));
    imageFiles.slice(0, 10).forEach(processFile);
  };

  const handlePaste = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const images: File[] = []
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) images.push(file)
      }
    }
    if (images.length) {
      e.preventDefault();
      images.slice(0, 10).forEach(processFile)
    }
  };

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, []);

  // Close publish menu on outside click or Escape
  useEffect(() => {
    if (!isPublishOpen && !isShareOpen) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (publishMenuRef.current && !publishMenuRef.current.contains(t)) setIsPublishOpen(false);
      if (shareMenuRef.current && !shareMenuRef.current.contains(t)) setIsShareOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsPublishOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [isPublishOpen, isShareOpen]);

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const addHistoryEntry = (prompt: string, changes: string[]) => {
    const newEntry: HistoryEntry = {
      id: Date.now().toString(),
      prompt,
      timestamp: new Date(),
      changes,
      version: versionCounter,
      isFlagged: false,
    };
    setHistoryEntries(prev => [newEntry, ...prev]);
    setVersionCounter(prev => prev + 1);
  };

  const toggleHistoryFlag = (entryId: string) => {
    setHistoryEntries(prev => 
      prev.map(entry => 
        entry.id === entryId 
          ? { ...entry, isFlagged: !entry.isFlagged }
          : entry
      )
    );
  };

  const formatHistoryDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const togglePageDropdown = () => {
    setIsPageDropdownOpen(!isPageDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.cgihadi-dropdown')) {
        setIsCgihadiDropdownOpen(false);
      }
      if (!target.closest('.page-dropdown')) {
        setIsPageDropdownOpen(false);
      }
      // Close publish dropdown when clicking outside
      if (!target.closest('.publish-dropdown') && !target.closest('[data-publish-trigger]')) {
        setIsPublishOpen(false);
        if (activeTopButton === 'publish') {
          setActiveTopButton(null);
        }
      }
    };

    if (isCgihadiDropdownOpen || isPageDropdownOpen || isPublishOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCgihadiDropdownOpen, isPageDropdownOpen, isPublishOpen, activeTopButton]);

  const getDeviceStyles = () => {
    switch (currentDevice) {
      case 'phone':
        // Shrink width only; keep full height
        return 'w-[375px] max-w-full h-full';
      case 'tablet':
        // Shrink width only; keep full height
        return 'w-[768px] max-w-full h-full';
      default:
        return 'w-full h-full';
    }
  };

  // Skip loading states for demo mode
  // if (authLoading || projectLoading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
  //     </div>
  //   );
  // }

  // Skip authentication for demo mode
  // if (!user && !mockMode) {
  //   window.location.href = '/login';
  //   return null;
  // }

  // Skip project check for demo mode
  // if (!project) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="text-center">
  //         <h1 className="text-2xl font-semibold mb-2 text-white">Project not found</h1>
  //         <p className="text-gray-400">The project you're looking for doesn't exist or you don't have access to it.</p>
  //         <button 
  //           onClick={() => window.location.href = '/dashboard/projects'}
  //           className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
  //         >
  //           Back to Projects
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  // Handle element clicks in sandbox for parent window communication
  const handleElementClick = (element: HTMLElement) => {
    if (isSandboxPreview && window.parent) {
      window.parent.postMessage({
        type: 'element-selected',
        element: {
          tagName: element.tagName,
          textContent: element.textContent,
          styles: window.getComputedStyle(element)
        }
      }, window.location.origin);
    }
  };

  // If this is a sandbox preview request, show only the sandbox
  if (isSandboxPreview) {
    // For sandbox preview, we need to ensure sandbox bundle is loaded
    // Use mock bundle if none exists
    const previewBundle = sandboxBundle || {
      files: {
        "src/App.tsx": `export default function App() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-8">
      <div className="rounded-2xl border border-white/10 bg-white/5 px-8 py-12 text-center max-w-md">
        <h1 className="text-2xl font-semibold mb-4">Survey Preview</h1>
        <p className="text-white/70 mb-6">
          This survey is being built. The preview will appear once the sandbox is ready.
        </p>
        <div className="text-sm text-white/50">
          Project: ${projectId}
        </div>
      </div>
    </main>
  );
}`,
      },
      entry: 'src/App.tsx',
      dependencies: ['react', 'react-dom', 'lucide-react'],
    };

    return (
      <div className="h-screen w-full bg-[#0a0a0a] text-white">
        {/* Show sandbox view only */}
        <div className="relative h-full w-full">
          <ProjectSandboxView
            showConsole={false}
            providerProps={{
              ...sandboxProviderProps,
              files: previewBundle.files as any,
              customSetup: {
                ...sandboxProviderProps.customSetup,
                dependencies: {
                  react: "19.1.0",
                  "react-dom": "19.1.0",
                  "lucide-react": "^0.454.0",
                  ...previewBundle.dependencies?.reduce((acc: Record<string, string>, dep: string) => ({ ...acc, [dep]: "latest" }), {}),
                },
              },
            }}
            onFixError={handleSandboxFixRequest}
            bundle={previewBundle}
          />
          {/* Overlay to capture clicks for element selection */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'transparent',
              zIndex: 10
            }}
          >
            <div
              className="w-full h-full pointer-events-auto cursor-crosshair opacity-0 hover:opacity-10 transition-opacity"
              style={{
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
              }}
              onClick={(e) => {
                // For sandbox preview, we need to handle clicks differently
                // The iframe will handle its own click events
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppLayout hideSidebar fullBleed>
      <div className="flex h-full w-full" style={{ fontFamily: 'FK Grotesk, sans-serif', backgroundColor: 'var(--surbee-sidebar-bg)', color: 'var(--surbee-fg-primary)' }}>
      {/* Left Sidebar - Chat Area */}
      <div className={`flex flex-col transition-all duration-300 ${
        isChatHidden ? 'w-0 opacity-0 pointer-events-none' : (isSidebarCollapsed ? 'w-16' : 'w-140')
      }`} style={{ backgroundColor: 'var(--surbee-sidebar-bg)' }}>
        {/* Profile Section at Top (match dashboard UserMenu) */}
        <div className="profile-section relative h-14 flex items-center px-3">
          <div className="sidebar-item w-full" onClick={() => setIsUserMenuOpen((v) => !v)} style={{ cursor: 'pointer' }}>
            <span className="sidebar-item-label">
              <span className="flex items-center gap-1">
                {isTitleGenerating ? (
                  <span className="h-5 w-32 rounded bg-gradient-to-r from-white/10 via-white/20 to-white/10 bg-[length:200%_100%] animate-shimmer" />
                ) : (
                  <span style={{ fontWeight: 600, color: 'var(--surbee-fg-primary)' }}>
                    {autoGeneratedTitle || 'Untitled Survey'}
                  </span>
                )}
                {isUserMenuOpen ? <ChevronUp className="h-3 w-3" style={{ opacity: 0.6, color: 'var(--surbee-fg-primary)' }} /> : <ChevronDown className="h-3 w-3" style={{ opacity: 0.6, color: 'var(--surbee-fg-primary)' }} />}
              </span>
            </span>
          </div>

          {/* Overlay to close on outside click */}
          {isUserMenuOpen && (
            <div className="user-menu-overlay" onClick={() => setIsUserMenuOpen(false)} />
          )}

          <AnimatePresence>
            {isUserMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '60px',
                  zIndex: 1200,
                  border: 'none',
                  background: 'hsl(0, 0%, 16%)',
                  color: 'hsl(0, 0%, 100%)',
                  borderRadius: '0.75rem',
                  minWidth: '8rem',
                  width: '17rem',
                  padding: '0.5rem',
                  boxShadow: 'none',
                  backdropFilter: 'blur(32px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(32px) saturate(180%)',
                  WebkitFontSmoothing: 'antialiased',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}
                role="menu"
              >
                {/* User info header */}
                <div className="user-menu-header-section">
                  <div className="user-menu-username">Demo</div>
                  <div className="user-menu-email">demo@example.com</div>
                </div>

                {/* Back to Dashboard */}
                <button
                  onClick={() => { setIsUserMenuOpen(false); handleNavigation('/dashboard'); }}
                  className="user-menu-item"
                >
                  <div className="flex items-center gap-2">
                    <div className="user-menu-icon-circle">
                      <Home className="h-4 w-4" />
                    </div>
                    <span>Back to Dashboard</span>
                  </div>
                </button>

                {/* Set up profile button */}
                <button
                  onClick={() => { setIsUserMenuOpen(false); handleNavigation('/dashboard/settings'); }}
                  className="user-menu-setup-profile"
                >
                  Set up profile
                </button>

                {/* Project Settings */}
                <button
                  onClick={() => { setIsUserMenuOpen(false); handleNavigation('/dashboard/settings'); }}
                  className="user-menu-item"
                >
                  <div className="flex items-center gap-2">
                    <div className="user-menu-icon-circle">
                      <SettingsIcon className="h-4 w-4" />
                    </div>
                    <span>Project Settings</span>
                  </div>
                </button>

                {/* Theme selector */}
                <div className="user-menu-theme-section">
                  <div className="user-menu-theme-label">Theme</div>
                  <div className="user-menu-theme-toggle">
                    <button
                      className={`user-menu-theme-btn ${theme === 'light' ? 'active' : ''}`}
                      onClick={() => setTheme('light')}
                      aria-label="Light theme"
                    >
                      <Sun className="h-4 w-4" />
                    </button>
                    <button
                      className={`user-menu-theme-btn ${theme === 'dark' ? 'active' : ''}`}
                      onClick={() => setTheme('dark')}
                      aria-label="Dark theme"
                    >
                      <Moon className="h-4 w-4" />
                    </button>
                    <button
                      className={`user-menu-theme-btn ${theme === 'system' ? 'active' : ''}`}
                      onClick={() => setTheme('system')}
                      aria-label="System theme"
                    >
                      <Laptop className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Pricing */}
                <button
                  onClick={() => { setIsUserMenuOpen(false); handleNavigation('/pricing'); }}
                  className="user-menu-item"
                >
                  <span>Pricing</span>
                </button>

                {/* Changelog */}
                <button
                  onClick={() => { setIsUserMenuOpen(false); handleNavigation('/changelog'); }}
                  className="user-menu-item"
                >
                  <span>Changelog</span>
                </button>

                {/* Blog */}
                <button
                  onClick={() => { setIsUserMenuOpen(false); handleNavigation('/blog'); }}
                  className="user-menu-item"
                >
                  <span>Blog</span>
                </button>

                {/* Give Feedback */}
                <button
                  onClick={() => { setIsUserMenuOpen(false); }}
                  className="user-menu-item"
                >
                  <span>Give Feedback</span>
                </button>

                {/* Support */}
                <button
                  onClick={() => { setIsUserMenuOpen(false); window.open('/support', '_blank'); }}
                  className="user-menu-item"
                >
                  <div className="flex items-center justify-between w-full">
                    <span>Support</span>
                    <ExternalLink className="h-3.5 w-3.5 opacity-40" />
                  </div>
                </button>

                {/* Log out */}
                <button
                  onClick={() => { setIsUserMenuOpen(false); handleProfileAction('logout'); }}
                  className="user-menu-item"
                >
                  <span>Log out</span>
                </button>

                {/* Footer */}
                <div className="user-menu-footer">
                  <button
                    onClick={() => { setIsUserMenuOpen(false); handleNavigation('/privacy'); }}
                    className="user-menu-footer-link"
                  >
                    Privacy
                  </button>
                  <button
                    onClick={() => { setIsUserMenuOpen(false); handleNavigation('/terms'); }}
                    className="user-menu-footer-link"
                  >
                    Terms
                  </button>
                  <button
                    onClick={() => { setIsUserMenuOpen(false); handleNavigation('/copyright'); }}
                    className="user-menu-footer-link"
                  >
                    Copyright
                  </button>
                  <button
                    onClick={() => { setIsUserMenuOpen(false); window.open('https://x.com/surbee', '_blank'); }}
                    className="user-menu-footer-link"
                    aria-label="X (Twitter)"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Chat Area in Sidebar */}
          <div className="flex-1 flex flex-col min-h-0">
            {sidebarView === 'history' ? (
              /* Version History View */
              <div className="flex-1 overflow-hidden">
                <VersionHistory
                  versions={bundleVersions}
                  currentVersionId={currentVersionId}
                  onRestore={handleRestoreVersion}
                />
              </div>
            ) : (
              /* Chat Messages View */
              <div className="flex-1 overflow-y-auto px-4 py-6" ref={chatAreaRef}>
                <div className="space-y-4">
                  {messages?.map((msg, idx) => (
                    <div key={msg.id} className="space-y-2">
                      {msg.role === 'user' ? (
                        <div className="flex justify-end">
                          <div className="max-w-[80%] space-y-2">
                            {/* Show images above the bubble */}
                            {(() => {
                              const imageParts = msg.parts?.filter(p => p.type === 'image') || [];
                              if (imageParts.length > 0) {
                                const imageSize = imageParts.length === 1 ? 'small' : imageParts.length === 2 ? 'xsmall' : 'tiny';
                                const sizeClasses = {
                                  small: 'h-24 w-24',
                                  xsmall: 'h-20 w-20',
                                  tiny: 'h-16 w-16'
                                };

                                return (
                                  <div className="flex flex-wrap gap-2 justify-end">
                                    {imageParts.map((part, imgIdx) => {
                                      const imageUrl = typeof part.image === 'string'
                                        ? part.image
                                        : part.image instanceof URL
                                          ? part.image.toString()
                                          : URL.createObjectURL(new Blob([part.image as any]));

                                      return (
                                        <div
                                          key={imgIdx}
                                          className={`${sizeClasses[imageSize]} rounded-md overflow-hidden flex-shrink-0`}
                                        >
                                          <img
                                            src={imageUrl}
                                            alt={`Attachment ${imgIdx + 1}`}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>
                                );
                              }
                              return null;
                            })()}

                            <div className="rounded-2xl px-6 py-3 text-primary-foreground" style={{ backgroundColor: 'rgb(38, 38, 38)' }}>
                              <p className="whitespace-pre-wrap" style={{ fontSize: '16px' }}>
                                {msg.parts.find(p => p.type === 'text')?.text || ''}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Show thinking display first - show immediately when assistant is responding */}
                          {(() => {
                            if (msg.role !== 'assistant') return null;

                            const reasoningParts = msg.parts.filter(p => p.type === 'reasoning');
                            const hasReasoning = reasoningParts.length > 0;
                            const isLastMessage = idx === messages.length - 1;
                            const isThinking = isLastMessage && status !== 'ready';

                            if (!hasReasoning && !isThinking) return null;

                            // Convert reasoning parts to steps inline
                            const steps = reasoningParts.map((part, partIdx) => ({
                              id: `${msg.id}-reasoning-${partIdx}`,
                              content: part.text || '',
                              status: (isLastMessage && isThinking && partIdx === reasoningParts.length - 1) ? 'thinking' : 'complete'
                            }));

                            return (
                              <div className="pl-0">
                                <ThinkingDisplay
                                  steps={steps}
                                  duration={thinkingDuration}
                                  isThinking={isThinking}
                                />
                              </div>
                            );
                          })()}

                          {/* Show all parts in chronological order (tool calls and text interleaved) */}
                          {msg.parts.map((part, partIdx) => {
                            // Render tool calls with tree structure
                            if (part.type.startsWith('tool-')) {
                              const toolName = part.type.replace('tool-', '');
                              const isActive = part.state === 'input-streaming' || part.state === 'input-available';
                              const output = part.state === 'output-available' ? part.output : null;

                              return (
                                <ToolCallTree
                                  key={`tool-${partIdx}`}
                                  toolName={toolName}
                                  output={output}
                                  isActive={isActive}
                                />
                              );
                            }

                            // Render text content with markdown
                            if (part.type === 'text') {
                              return (
                                <div key={`text-${partIdx}`} className="max-w-none ai-response-markdown">
                                  <Response>{part.text}</Response>
                                </div>
                              );
                            }

                            // Skip other part types (reasoning, image, etc.)
                            return null;
                          })}

                          {/* Action buttons - only show when message is complete */}
                          {idx === messages.length - 1 && status === 'ready' && msg.parts.some(p => p.type === 'text') && (
                            <div className="flex items-center gap-0.5 pt-2">
                              {/* Retry */}
                              <button
                                onClick={handleRetry}
                                className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
                                title="Regenerate response"
                                disabled={!(status === 'ready' || status === 'error')}
                              >
                                <RotateCcw className="w-4 h-4 text-muted-foreground" />
                              </button>
                              {/* Copy */}
                              <button
                                onClick={() => {
                                  const textContent = msg.parts.find(p => p.type === 'text')?.text || '';
                                  handleCopyMessage(msg.id, textContent);
                                }}
                                className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
                                title={copiedMessageId === msg.id ? "Copied!" : "Copy to clipboard"}
                              >
                                {copiedMessageId === msg.id ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Copy className="w-4 h-4 text-muted-foreground" />
                                )}
                              </button>
                              {/* Thumbs up */}
                              <button
                                onClick={() => {
                                  const textContent = msg.parts.find(p => p.type === 'text')?.text || '';
                                  handleFeedback(msg.id, 'up', textContent);
                                }}
                                className={`p-1.5 rounded-md hover:bg-white/10 transition-colors ${feedbackGiven[msg.id] === 'up' ? 'bg-white/10' : ''}`}
                                title="Good response"
                                disabled={!!feedbackGiven[msg.id]}
                              >
                                <ThumbsUp className={`w-4 h-4 ${feedbackGiven[msg.id] === 'up' ? 'text-green-500' : 'text-muted-foreground'}`} />
                              </button>
                              {/* Thumbs down */}
                              <button
                                onClick={() => {
                                  const textContent = msg.parts.find(p => p.type === 'text')?.text || '';
                                  handleFeedback(msg.id, 'down', textContent);
                                }}
                                className={`p-1.5 rounded-md hover:bg-white/10 transition-colors ${feedbackGiven[msg.id] === 'down' ? 'bg-white/10' : ''}`}
                                title="Bad response"
                                disabled={!!feedbackGiven[msg.id]}
                              >
                                <svg className={`w-4 h-4 ${feedbackGiven[msg.id] === 'down' ? 'text-red-500' : 'text-muted-foreground'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        {/* Chat Input */}
        <div className="pl-4 pr-2 pb-3">
          <div className="relative ml-0 mr-0">
            {/* Chat input container to anchor controls to the box itself */}
            <div className="relative">
              <ChatInputLight
                onSendMessage={(message, images) => handleSubmit(message, images)}
                isInputDisabled={status !== 'ready'}
                placeholder="Ask for a follow-up"
                className="chat-input-grey"
                isEditMode={false}
                onToggleEditMode={() => {}}
                showSettings={false}
                selectedElement={null}
                disableRotatingPlaceholders={true}
                onClearSelection={() => {}}
                showModelSelector={true}
                selectedModel={selectedModel}
                onModelChange={handleModelChange}
                isBusy={status === 'submitted' || status === 'streaming'}
                onStop={stop}
              />
            </div>
        </div>
      </div>
      </div>

      {/* Right Side - Preview */}
      <div className="flex-1 flex flex-col relative" style={{ backgroundColor: 'var(--surbee-sidebar-bg)' }}>
        {/* Header */}
        <div className="h-14 flex items-center justify-between pl-2 pr-4" style={{ backgroundColor: 'var(--surbee-sidebar-bg)' }}>
          {/* Left Section */}
          <div className="flex items-center gap-2">
            {/* Collapse/Expand Chat */}
            <button
              className={`rounded-md transition-colors cursor-pointer ${
                isChatHidden 
                  ? 'text-gray-400 hover:text-white hover:bg-white/5' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              onClick={() => setIsChatHidden(v => !v)}
              title={isChatHidden ? 'Expand chat' : 'Collapse chat'}
              style={{
                fontFamily: 'Sohne, sans-serif',
                padding: '8px 12px'
              }}
            >
              {isChatHidden ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
            <button
              className={`rounded-md transition-colors cursor-pointer ${
                sidebarView === 'history'
                  ? 'text-white bg-white/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              onClick={() => setSidebarView((current) => current === 'history' ? 'chat' : 'history')}
              aria-pressed={sidebarView === 'history'}
              title="Toggle history"
              style={{
                fontFamily: 'Sohne, sans-serif',
                padding: '8px 12px'
              }}
            >
              <History className="w-4 h-4" />
            </button>
            <button
              className={`rounded-md transition-colors cursor-pointer ${
                sidebarView === 'code'
                  ? 'text-white bg-white/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              } ${!sandboxAvailable ? 'opacity-40 cursor-not-allowed' : ''}`}
              onClick={() => sandboxAvailable && setSidebarView((current) => current === 'code' ? 'chat' : 'code')}
              aria-pressed={sidebarView === 'code'}
              title="Toggle code view"
              style={{
                fontFamily: 'Sohne, sans-serif',
                padding: '8px 12px'
              }}
              disabled={!sandboxAvailable}
            >
              <Code className="w-4 h-4" />
            </button>
          </div>

          {/* Center Section - Device Controls */}
          <div className="hidden md:flex flex-1 items-center justify-center">
            <div className="relative flex h-8 min-w-[340px] max-w-[560px] items-center justify-between gap-2 rounded-full border px-1 text-sm page-dropdown" style={{
              borderColor: isDarkMode ? 'var(--surbee-border-accent)' : 'rgba(0, 0, 0, 0.1)',
              backgroundColor: 'var(--surbee-sidebar-bg)'
            }}>
              {/* Device View Buttons - Hidden on mobile */}
              <div className="hidden md:flex items-center gap-0.5">
                <button
                  onClick={() => setCurrentDevice('desktop')}
                  className="aspect-square h-6 w-6 p-1 rounded-md transition-colors inline-flex items-center justify-center"
                  style={{
                    backgroundColor: currentDevice === 'desktop'
                      ? (isDarkMode ? 'rgba(113,113,122,0.5)' : 'rgba(0,0,0,0.1)')
                      : 'transparent',
                    color: currentDevice === 'desktop'
                      ? 'var(--surbee-fg-primary)'
                      : 'var(--surbee-fg-secondary)'
                  }}
                  onMouseEnter={(e) => {
                    if (currentDevice !== 'desktop') {
                      const isDark = document.documentElement.classList.contains('dark');
                      e.currentTarget.style.backgroundColor = isDark ? 'rgba(113,113,122,0.3)' : 'rgba(0,0,0,0.05)';
                      e.currentTarget.style.color = 'var(--surbee-fg-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentDevice !== 'desktop') {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--surbee-fg-secondary)';
                    }
                  }}
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCurrentDevice('tablet')}
                  className="aspect-square h-6 w-6 p-1 rounded-md transition-colors inline-flex items-center justify-center"
                  style={{
                    backgroundColor: currentDevice === 'tablet'
                      ? (isDarkMode ? 'rgba(113,113,122,0.5)' : 'rgba(0,0,0,0.1)')
                      : 'transparent',
                    color: currentDevice === 'tablet'
                      ? 'var(--surbee-fg-primary)'
                      : 'var(--surbee-fg-secondary)'
                  }}
                  onMouseEnter={(e) => {
                    if (currentDevice !== 'tablet') {
                      const isDark = document.documentElement.classList.contains('dark');
                      e.currentTarget.style.backgroundColor = isDark ? 'rgba(113,113,122,0.3)' : 'rgba(0,0,0,0.05)';
                      e.currentTarget.style.color = 'var(--surbee-fg-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentDevice !== 'tablet') {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--surbee-fg-secondary)';
                    }
                  }}
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCurrentDevice('phone')}
                  className="aspect-square h-6 w-6 p-1 rounded-md transition-colors inline-flex items-center justify-center"
                  style={{
                    backgroundColor: currentDevice === 'phone'
                      ? (isDarkMode ? 'rgba(113,113,122,0.5)' : 'rgba(0,0,0,0.1)')
                      : 'transparent',
                    color: currentDevice === 'phone'
                      ? 'var(--surbee-fg-primary)'
                      : 'var(--surbee-fg-secondary)'
                  }}
                  onMouseEnter={(e) => {
                    if (currentDevice !== 'phone') {
                      const isDark = document.documentElement.classList.contains('dark');
                      e.currentTarget.style.backgroundColor = isDark ? 'rgba(113,113,122,0.3)' : 'rgba(0,0,0,0.05)';
                      e.currentTarget.style.color = 'var(--surbee-fg-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentDevice !== 'phone') {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--surbee-fg-secondary)';
                    }
                  }}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Center: Route input */}
              <div className="flex-1 flex items-center min-w-0 px-1">
                <input
                  type="text"
                  value={selectedRoute}
                  onChange={(e) => setSelectedRoute(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setRendererKey(k => k+1);
                    }
                  }}
                  className="w-full bg-transparent border-none outline-none text-sm"
                  placeholder="/"
                  style={{
                    color: 'var(--surbee-fg-primary)',
                    fontFamily: 'Sohne, sans-serif'
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-0.5">
                <a
                  href={`https://Surbee.dev/preview/${projectId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="aspect-square h-6 w-6 p-1 rounded-md transition-colors inline-flex items-center justify-center"
                  title="Open preview in new tab"
                  style={{ color: 'var(--surbee-fg-secondary)' }}
                  onMouseEnter={(e) => {
                    const isDark = document.documentElement.classList.contains('dark');
                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(113,113,122,0.3)' : 'rgba(0,0,0,0.05)';
                    e.currentTarget.style.color = 'var(--surbee-fg-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--surbee-fg-secondary)';
                  }}
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  onClick={() => setRendererKey((k) => k + 1)}
                  className="aspect-square h-6 w-6 p-1 rounded-md transition-colors inline-flex items-center justify-center"
                  title="Refresh page"
                  style={{ color: 'var(--surbee-fg-secondary)' }}
                  onMouseEnter={(e) => {
                    const isDark = document.documentElement.classList.contains('dark');
                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(113,113,122,0.3)' : 'rgba(0,0,0,0.05)';
                    e.currentTarget.style.color = 'var(--surbee-fg-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--surbee-fg-secondary)';
                  }}
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Section - Upgrade & Publish Buttons */}
          <div className="relative flex items-center gap-2">
            <button
              className="relative px-3 py-1.5 font-medium text-sm transition-all duration-150 cursor-pointer rounded-[0.38rem]"
              style={{
                fontFamily: 'FK Grotesk, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: '1.375rem',
                backgroundColor: activeTopButton === 'upgrade'
                  ? (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)')
                  : 'transparent',
                color: isDarkMode ? '#d1d5db' : '#000000'
              }}
              onMouseEnter={(e) => {
                const isDark = document.documentElement.classList.contains('dark');
                e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
              }}
              onMouseLeave={(e) => {
                if (activeTopButton !== 'upgrade') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                } else {
                  const isDark = document.documentElement.classList.contains('dark');
                  e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
                }
              }}
              onClick={() => router.push('/dashboard/upgrade-plan')}
            >
              Upgrade
            </button>

            <button
              data-publish-trigger
              onClick={() => {
                setIsPublishOpen((v) => !v);
                setActiveTopButton(activeTopButton === 'publish' ? null : 'publish');
              }}
              disabled={!sandboxAvailable}
              className="relative px-3 py-1.5 font-medium text-sm transition-all duration-150 rounded-[0.38rem]"
              style={{
                fontFamily: 'FK Grotesk, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: '1.375rem',
                backgroundColor: !sandboxAvailable
                  ? (isDarkMode ? '#3a3a3a' : '#e5e7eb')
                  : (isDarkMode ? '#ffffff' : '#000000'),
                color: !sandboxAvailable
                  ? (isDarkMode ? '#6b7280' : '#9ca3af')
                  : (isDarkMode ? '#000000' : '#ffffff'),
                cursor: !sandboxAvailable ? 'not-allowed' : 'pointer',
                opacity: !sandboxAvailable ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (sandboxAvailable) {
                  e.currentTarget.style.opacity = '0.9';
                }
              }}
              onMouseLeave={(e) => {
                if (sandboxAvailable) {
                  e.currentTarget.style.opacity = '1';
                }
              }}
            >
              {project?.status === 'published' || publishedUrl ? 'Update' : 'Publish'}
            </button>
            {isPublishOpen && (
              <div
                ref={publishMenuRef}
                className="publish-dropdown absolute top-full right-0 mt-2 w-[280px] rounded-lg shadow-xl z-50 overflow-hidden"
                style={{
                  backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
                  border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
                }}
              >
                <div className="p-4 space-y-3">
                  {/* Success Message */}
                  {publishSuccess && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-md text-sm" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
                      <CheckCircle2 className="w-4 h-4" />
                      {publishSuccess}
                    </div>
                  )}

                  {/* Published URL Section */}
                  {(publishedUrl || project?.published_url) && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium" style={{ color: 'var(--surbee-fg-secondary)' }}>Survey Link</span>
                        <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>Live</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 px-3 py-2 rounded-md text-xs truncate" style={{ backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', color: 'var(--surbee-fg-secondary)' }}>
                          {window.location.origin}/s/{publishedUrl || project?.published_url}
                        </div>
                        <button
                          onClick={copyPublishedLink}
                          className="p-2 rounded-md transition-colors hover:bg-white/10"
                          title="Copy link"
                        >
                          <Copy className="w-4 h-4" style={{ color: 'var(--surbee-fg-secondary)' }} />
                        </button>
                      </div>
                      <div style={{ borderTop: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, margin: '12px 0' }} />
                    </>
                  )}

                  {/* Preview Link */}
                  <a
                    href={`/project/${projectId}/preview`}
                    target="_blank"
                    className="flex items-center justify-between px-3 py-2 rounded-md transition-colors hover:bg-white/5"
                  >
                    <span className="text-sm" style={{ color: 'var(--surbee-fg-primary)' }}>Preview survey</span>
                    <ExternalLink className="w-4 h-4" style={{ color: 'var(--surbee-fg-secondary)' }} />
                  </a>

                  {/* Publish Button */}
                  <button
                    onClick={handlePublish}
                    disabled={isPublishing || !sandboxAvailable}
                    className="w-full py-2.5 px-4 rounded-md text-sm font-medium transition-all"
                    style={{
                      backgroundColor: (!sandboxAvailable || isPublishing) ? (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') : 'white',
                      color: (!sandboxAvailable || isPublishing) ? 'var(--surbee-fg-secondary)' : '#000',
                      opacity: (isPublishing || !sandboxAvailable) ? 0.6 : 1,
                      cursor: (isPublishing || !sandboxAvailable) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isPublishing ? 'Publishing...' : !sandboxAvailable ? 'Generate code first' : (project?.status === 'published' || publishedUrl) ? 'Update' : 'Publish'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex relative">
          {/* Restored rounded preview frame with border, like before */}
          <div
            className="flex-1 flex flex-col relative rounded-[0.625rem] border mt-0 mr-3 mb-3 ml-2 overflow-hidden"
            style={{
              backgroundColor: isDarkMode ? '#242424' : '#F8F8F8',
              borderColor: isDarkMode ? 'var(--surbee-border-accent)' : 'rgba(0, 0, 0, 0.1)'
            }}
          >
            {/* Show Sandbox View when code or console mode is active */}
            {(sidebarView === 'code' || sidebarView === 'console') && sandboxAvailable ? (
              <ProjectSandboxView
                showConsole={sidebarView === 'console'}
                viewMode={sidebarView === 'code' ? 'code' : 'console'}
                providerProps={sandboxProviderProps}
                onFixError={handleSandboxFixRequest}
                bundle={sandboxBundle}
              />
            ) : (
              <div
                className="flex-1 overflow-hidden flex items-center justify-center"
                style={{
                  backgroundColor: isDarkMode ? '#242424' : '#F8F8F8'
                }}
              >
                {/* Show loading animation while AI is working */}
                {(status === 'submitted' || status === 'streaming') && !sandboxAvailable ? (
                  <AILoader text="Building" size={120} />
                ) : sandboxAvailable ? (
                  /* Show React preview when sandbox bundle is available */
                  <div className={`${getDeviceStyles()} transition-all duration-300 mx-auto`}>
                    <ProjectPreviewOnly providerProps={sandboxProviderProps} />
                  </div>
                ) : (
                  /* Waiting for content */
                  <div className="flex items-center justify-center h-full text-sm" style={{ color: 'var(--surbee-fg-secondary)' }}>
                    <p>Start a conversation to see the preview</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-4xl">
            <img src={selectedImage} alt="Preview" className="max-w-full max-h-full object-contain" />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      )}
      
      {/* Invite Modal */}
      <InviteModal open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
    </AppLayout>
  );
}
