"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, ChevronLeft, Plus, Home, Library, Search, MessageSquare, Folder as FolderIcon, ArrowUp, User, ThumbsUp, HelpCircle, Gift, ChevronsLeft, Menu, AtSign, Settings2, Inbox, FlaskConical, BookOpen, X, Paperclip, History, Monitor, Smartphone, Tablet, ExternalLink, RotateCcw, Eye, GitBranch, Flag, PanelLeftClose, PanelLeftOpen, Share2, Copy, Hammer, Code, Terminal, AlertTriangle, Settings as SettingsIcon, Sun, Moon, Laptop } from "lucide-react";
import UserNameBadge from "@/components/UserNameBadge";
import UserMenu from "@/components/ui/user-menu";
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { File, Folder, Tree } from "@/components/ui/file-tree";
import ChatInputLight from "@/components/ui/chat-input-light";
import dynamic from 'next/dynamic'
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import type { ChatMessage } from '@/lib/agents/surbeeWorkflowV3';
import { AuthGuard } from "@/components/auth/AuthGuard";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from '@/contexts/AuthContext';
import { useRealtime } from '@/contexts/RealtimeContext';
import { useTheme } from '@/hooks/useTheme';
import { ThinkingDisplay } from '../../../../components/ThinkingUi/components/thinking-display';
import { ToolCall } from '../../../../components/ThinkingUi/components/tool-call';
import { AILoader } from '@/components/ai-loader';
import { cn } from "@/lib/utils";
import { Response } from '@/components/ai-elements/response';
import { ToolCallTree } from '@/components/ToolCallTree';
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

// Simple preview-only component for main area (no code editor)
function ProjectPreviewOnly({
  providerProps,
}: {
  providerProps: SandboxProviderProps;
}) {
  return (
    <SandboxProvider {...providerProps}>
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
}: {
  showConsole: boolean;
  providerProps: SandboxProviderProps;
  onFixError: (errorMessage: string) => void;
  bundle: SandboxBundle | null;
}) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!bundle) return;
    setIsDownloading(true);
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

  // Create a stable key based on bundle content hash
  const bundleKey = useMemo(() => {
    if (!bundle) return "placeholder-project";
    // Create a stable hash from entry + file count + dependency count
    const fileKeys = Object.keys(bundle.files).sort().join(',');
    const depsCount = (bundle.dependencies?.length || 0) + (bundle.devDependencies?.length || 0);
    return `${bundle.entry}-${Object.keys(bundle.files).length}-${depsCount}-${fileKeys.slice(0, 50)}`;
  }, [bundle]);

  return (
    <SandboxProvider key={bundleKey} {...providerProps}>
      <SandboxLayout className="flex flex-col h-full !bg-[#0a0a0a] !border-none !rounded-none">
        {/* Top bar with info and download */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800" style={{ backgroundColor: 'var(--surbee-sidebar-bg)' }}>
          <span className="text-xs text-zinc-400 leading-relaxed">{dependencySummary}</span>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!bundle || isDownloading}
            className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isDownloading ? "Preparing..." : "Download ZIP"}
          </button>
        </div>

        {/* Main Content Area */}
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

  // Always recreate index.tsx to ensure import path matches current entry
  files["/index.tsx"] = {
    code: `import React from "react";
import { createRoot } from "react-dom/client";
import SurveyExperience from "${importSpecifier}";
import "./tailwind.css";

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
    "/Survey.tsx": {
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

export default function Survey() {
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
    activeFile: "/Survey.tsx",
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

export default function ProjectPage() {
  // In client components, use useParams() to read dynamic params
  const { id } = useParams() as { id?: string };
  const projectId: string | undefined = id;
  const searchParams = useSearchParams();
  // Disabled for demo
  const user = { id: 'demo-user' };
  const authLoading = false;
  // Disabled for demo
  const subscribeToProject = () => {};
  const router = useRouter();
  const { theme, setTheme } = useTheme();

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

  // Enable mock mode by default (no database)
  const mockMode = true;

  // Project state - mock project for demo
  const [project, setProject] = useState<Project | null>({
    id: 'demo-project',
    title: 'Demo Project',
    description: 'Survey built with Grok 4 Fast Reasoning',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'demo-user',
    status: 'draft'
  });
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
  const [reasoningByMessage, setReasoningByMessage] = useState<Record<string, ThinkingStep[]>>({});
  const reasoningStartTimesRef = useRef<Record<string, number>>({});
  const prevReasoningRef = useRef<string>('{}');
  const [sandboxContent, setSandboxContent] = useState<Record<string, string> | null>(null);

  // useChat hook for message handling
  const { messages, sendMessage, status } = useChat<ChatMessage>({
    transport: new DefaultChatTransport({
      api: '/api/agents/surbee-v3',
    }),
  });

  // Extract sandbox bundle from tool results
  const prevBundleRef = useRef<string | null>(null);
  useEffect(() => {
    if (!messages || messages.length === 0) return;

    // Look through all assistant messages for any tool that returns source_files
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role !== 'assistant') continue;

      // Check ALL tool parts for source_files
      for (const part of msg.parts) {
        if (part.type.startsWith('tool-') && part.state === 'output-available') {
          const output = part.output as any;
          if (output?.source_files && Object.keys(output.source_files).length > 0) {
            // Normalize all file paths to have leading slashes
            const normalizedFiles: Record<string, string> = {};
            Object.entries(output.source_files).forEach(([path, content]) => {
              const normalizedPath = path.startsWith('/') ? path : `/${path}`;
              normalizedFiles[normalizedPath] = content as string;
            });

            // Get entry point and normalize it
            const rawEntry = output.entry_point || output.entry_file || output.entry || 'src/Survey.tsx';
            const normalizedEntry = rawEntry.startsWith('/') ? rawEntry : `/${rawEntry}`;

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
              setSandboxBundle(bundle);
            }
            return; // Use the most recent source_files found
          }
        }
      }
    }
  }, [messages]);

  // Convert reasoning parts to ThinkingSteps and track durations
  useEffect(() => {
    if (!messages || messages.length === 0) return;

    const newReasoningByMessage: Record<string, ThinkingStep[]> = {};
    const lastMessage = messages[messages.length - 1];

    // If the last message is from assistant and we're streaming, start timer
    if (lastMessage?.role === 'assistant' && status !== 'ready') {
      if (!reasoningStartTimesRef.current[lastMessage.id]) {
        reasoningStartTimesRef.current[lastMessage.id] = Date.now();
      }
    }

    messages.forEach((msg) => {
      if (msg.role !== 'assistant') return;

      const reasoningParts = msg.parts.filter(p => p.type === 'reasoning');
      if (reasoningParts.length === 0) return;

      // Determine if this is the last message and still streaming
      const isLastMessage = msg.id === messages[messages.length - 1]?.id;
      const isStreaming = status !== 'ready';

      // Track start time if this is the first reasoning part for this message
      // OR if this is the last message and we're currently streaming
      if (!reasoningStartTimesRef.current[msg.id] && (reasoningParts.length > 0 || (isLastMessage && isStreaming))) {
        reasoningStartTimesRef.current[msg.id] = Date.now();
      }

      const steps: ThinkingStep[] = reasoningParts.map((part, idx) => {
        // If this is the last reasoning part of the last message and we're streaming,
        // mark it as thinking, otherwise complete
        const isLastStep = idx === reasoningParts.length - 1;
        const stepStatus = (isLastMessage && isStreaming && isLastStep) ? 'thinking' : 'complete';

        return {
          id: `${msg.id}-reasoning-${idx}`,
          content: part.text || '',
          status: stepStatus as const,
        };
      });

      newReasoningByMessage[msg.id] = steps;
    });

    // Only update if the content actually changed to avoid infinite loops
    const newReasoningStr = JSON.stringify(newReasoningByMessage);
    if (newReasoningStr !== prevReasoningRef.current) {
      prevReasoningRef.current = newReasoningStr;
      setReasoningByMessage(newReasoningByMessage);
    }
  }, [messages, status]);

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
  const [sandboxBundle, setSandboxBundle] = useState<SandboxBundle | null>(null);
  const [sandboxError, setSandboxError] = useState<string | null>(null);
  const [rendererKey, setRendererKey] = useState(0);
  const sandboxConfig = useMemo(() => {
    const config = deriveSandboxConfig(sandboxBundle);
    console.log('[Sandbox Config]', {
      bundle: sandboxBundle,
      files: Object.keys(config.files),
      activeFile: config.activeFile,
      dependencies: config.dependencies,
      fileContents: config.files
    });
    return config;
  }, [sandboxBundle]);

  const sandboxProviderProps = useMemo<SandboxProviderProps>(() => ({
    template: "react-ts",
    theme: "dark",
    files: sandboxConfig.files,
    customSetup: {
      entry: "/index.tsx",
      main: "/index.tsx",
      dependencies: sandboxConfig.dependencies,
    },
    options: {
      activeFile: sandboxConfig.activeFile,
      autorun: true,
      recompileMode: "immediate",
      recompileDelay: 300,
    },
  }), [sandboxConfig]);
  const sandboxAvailable = Boolean(sandboxBundle);

  const chatAreaRef = useRef<HTMLDivElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const publishMenuRef = useRef<HTMLDivElement>(null);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [creditsTotal] = useState(5);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [publishToCommunity, setPublishToCommunity] = useState(true);

  // Initialize mock project on mount
  useEffect(() => {
    if (mockMode && !project) {
      const now = new Date().toISOString();
      setProject({
        id: projectId || 'mock-project',
        created_at: now,
        updated_at: now,
        title: `Demo Project ${projectId || ''}`.trim(),
        description: null,
        user_id: 'mock-user',
        status: 'draft',
      } as Project);
      setProjectLoading(false);
    }
  }, [mockMode, projectId]);

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













  const handleSubmit = async (message: string, images?: string[]) => {
    if (!message.trim() || status !== 'ready') return;

    setHasStartedChat(true);

    // Generate title from first message using AI if not already set
    if (!autoGeneratedTitle && message.trim()) {
      setIsTitleGenerating(true);

      // Run title generation in background without blocking message send
      fetch('/api/generate-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: message }),
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
              setAutoGeneratedTitle(streamedTitle.trim());
            }
          }
        })
        .catch((error) => {
          console.error('Title generation failed:', error);
          // Fallback to simple title generation
          const words = message.trim().split(/\s+/);
          const titleWords = words.slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
          setAutoGeneratedTitle(titleWords.join(' '));
        })
        .finally(() => {
          setIsTitleGenerating(false);
        });
    }

    // Send message with images if provided following ImagePart format
    if (images && images.length > 0) {
      const parts: Array<{ type: 'text'; text: string } | { type: 'image'; image: string }> = [
        { type: 'text', text: message }
      ];

      // Add image parts following the ImagePart interface
      images.forEach(img => {
        parts.push({
          type: 'image',
          image: img, // URL or base64 data
        });
      });

      sendMessage({ parts } as any);
    } else {
      sendMessage({ text: message });
    }
  };

  const handleSandboxFixRequest = useCallback((errorMessage: string) => {
    const prompt = `The sandbox preview reported an error:\n\n${errorMessage}\n\nPlease diagnose the issue and provide an updated solution.`;
    void handleSubmit(prompt, []);
    setSidebarView('chat');
    setSandboxError(null);
  }, [handleSubmit, setSidebarView]);

  const handleSandboxIgnore = useCallback(() => {
    setSandboxError(null);
  }, []);

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
    };

    if (isCgihadiDropdownOpen || isPageDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCgihadiDropdownOpen, isPageDropdownOpen]);

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
        "src/Survey.tsx": `export default function GeneratedSurvey() {
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
      entry: 'src/Survey.tsx',
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
                  <span className="h-5 w-32 rounded bg-white/10 animate-pulse" />
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
                  left: '12px',
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

                {/* Set up profile button */}
                <button
                  onClick={() => { setIsUserMenuOpen(false); handleNavigation('/dashboard/settings'); }}
                  className="user-menu-setup-profile"
                >
                  Set up profile
                </button>

                {/* Settings */}
                <button
                  onClick={() => { setIsUserMenuOpen(false); handleNavigation('/dashboard/settings'); }}
                  className="user-menu-item"
                >
                  <div className="flex items-center gap-2">
                    <div className="user-menu-icon-circle">
                      <SettingsIcon className="h-4 w-4" />
                    </div>
                    <span>Settings</span>
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
              /* History View */
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 pr-4">
                  <div className="mb-4" style={{ paddingLeft: '8px' }}>
                    <h3 className="text-lg font-semibold text-white mb-2" style={{
                      fontFamily: 'Sohne, sans-serif',
                    fontSize: '14px',
                    fontWeight: 500,
                    lineHeight: '1.375rem'
                  }}>History</h3>
                </div>
                <div className="space-y-2">
                  {historyEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-800/50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-white font-medium truncate" style={{ fontFamily: 'Sohne, sans-serif' }}>
                              {entry.prompt}
                            </p>
                            <span className="text-xs text-gray-500 bg-zinc-800 px-2 py-1 rounded whitespace-nowrap">
                              v{entry.version}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{formatHistoryDate(entry.timestamp)}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleHistoryFlag(entry.id);
                        }}
                        className={`p-1 rounded transition-colors ${
                          entry.isFlagged 
                            ? 'text-yellow-400 hover:text-yellow-300' 
                            : 'text-gray-500 hover:text-gray-300 opacity-0 group-hover:opacity-100'
                        }`}
                        title={entry.isFlagged ? 'Remove flag' : 'Flag this version'}
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Chat Messages View */
              <div className="flex-1 overflow-y-auto px-4 py-6" ref={chatAreaRef}>
                <div className="space-y-4">
                  {messages?.map((msg, idx) => (
                    <div key={msg.id} className="space-y-2">
                      {msg.role === 'user' ? (
                        <div className="flex justify-end">
                          <div className="max-w-[80%]">
                            <div className="rounded-2xl px-6 py-3 text-primary-foreground" style={{ backgroundColor: 'rgb(38, 38, 38)' }}>
                              {/* Show images if present (ImagePart format) */}
                              {(() => {
                                // Filter image parts following ImagePart interface
                                const imageParts = msg.parts?.filter(p => p.type === 'image') || [];

                                if (imageParts.length > 0) {
                                  const imageSize = imageParts.length === 1 ? 'medium' : imageParts.length === 2 ? 'small' : 'xsmall';
                                  const sizeClasses = {
                                    medium: 'h-48 w-48',
                                    small: 'h-32 w-32',
                                    xsmall: 'h-24 w-24'
                                  };

                                  return (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                      {imageParts.map((part, imgIdx) => {
                                        // Handle both URL and data content (base64, Uint8Array, etc.)
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

                              <p className="whitespace-pre-wrap" style={{ fontSize: '16px' }}>
                                {msg.parts.find(p => p.type === 'text')?.text || ''}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Show thinking display first - show immediately when assistant is responding */}
                          {(msg.role === 'assistant' && (
                            reasoningByMessage[msg.id]?.length > 0 ||
                            (idx === messages.length - 1 && status !== 'ready')
                          )) && (
                            <div className="pl-0">
                              <ThinkingDisplay
                                steps={reasoningByMessage[msg.id] || []}
                                duration={reasoningStartTimesRef.current[msg.id]
                                  ? Math.floor((Date.now() - reasoningStartTimesRef.current[msg.id]) / 1000)
                                  : 0}
                                isThinking={idx === messages.length - 1 && status !== 'ready'}
                              />
                            </div>
                          )}

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
                isBusy={status === 'submitted' || status === 'streaming'}
                onStop={() => {}}
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
              borderColor: typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'var(--surbee-border-accent)' : 'rgba(0, 0, 0, 0.1)',
              backgroundColor: 'var(--surbee-sidebar-bg)'
            }}>
              {/* Device View Buttons - Hidden on mobile */}
              <div className="hidden md:flex items-center gap-0.5">
                <button
                  onClick={() => setCurrentDevice('desktop')}
                  className="aspect-square h-6 w-6 p-1 rounded-md transition-colors inline-flex items-center justify-center"
                  style={{
                    backgroundColor: currentDevice === 'desktop'
                      ? (typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'rgba(113,113,122,0.5)' : 'rgba(0,0,0,0.1)')
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
                      ? (typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'rgba(113,113,122,0.5)' : 'rgba(0,0,0,0.1)')
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
                      ? (typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'rgba(113,113,122,0.5)' : 'rgba(0,0,0,0.1)')
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
                  ? (typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)')
                  : 'transparent',
                color: typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? '#d1d5db' : '#000000'
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
              onClick={() => {
                setIsPublishOpen((v) => !v);
                setActiveTopButton(activeTopButton === 'publish' ? null : 'publish');
              }}
              className="relative px-3 py-1.5 font-medium text-sm transition-all duration-150 cursor-pointer rounded-[0.38rem]"
              style={{
                fontFamily: 'FK Grotesk, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: '1.375rem',
                backgroundColor: typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? '#ffffff' : '#000000',
                color: typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? '#000000' : '#ffffff'
              }}
              onMouseEnter={(e) => {
                const isDark = document.documentElement.classList.contains('dark');
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              Publish
            </button>
            {isPublishOpen && (
              <div
                ref={publishMenuRef}
                className="absolute top-full right-0 mt-2 w-[360px] bg-black border border-zinc-800 rounded-xl shadow-2xl z-50"
              >
                <div className="p-4 space-y-3">
                  {/* Share Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Share</span>
                      <button
                        onClick={() => { try { navigator.clipboard.writeText(window.location.href); } catch {} }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-white/5 hover:bg-white/10 text-gray-200"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copy link
                      </button>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-gray-400">Invite by email</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="name@company.com"
                          className="flex-1 h-8 rounded-md bg-zinc-900 border border-zinc-800 px-2 text-sm text-white outline-none focus:border-zinc-700"
                        />
                        <button
                          onClick={() => { try { /* TODO: backend invite */ alert(`Invited ${inviteEmail}`); } catch {} setInviteEmail(''); }}
                          className="h-8 px-2 rounded-md bg-white text-black text-sm font-medium hover:opacity-90"
                        >
                          Invite
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-zinc-800" />

                  {/* Preview Section */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Preview</span>
                    <a
                      href={`https://Surbee.dev/preview/${projectId}`}
                      target="_blank"
                      className="inline-flex items-center gap-2 px-2 py-1 rounded-md text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="truncate">Surbee.dev/preview/{projectId}</span>
                    </a>
                  </div>

                  <div className="border-t border-zinc-800" />

                  {/* Publish Options */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-gray-300">Publish to community</span>
                      <button
                        onClick={() => setPublishToCommunity(v => !v)}
                        className={`w-10 h-6 rounded-full relative transition-colors ${publishToCommunity ? 'bg-blue-600' : 'bg-zinc-700'}`}
                        aria-pressed={publishToCommunity}
                        title="Toggle publish to community"
                      >
                        <span className={`absolute top-0.5 ${publishToCommunity ? 'left-5' : 'left-0.5'} w-5 h-5 bg-white rounded-full transition-all`} />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <button className="w-full h-9 rounded-md bg-zinc-900 text-gray-200 text-sm font-medium hover:bg-zinc-800 transition-colors border border-zinc-800">
                        Connect Domain
                      </button>
                      <button className="w-full h-9 rounded-md bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors border border-white/10">
                        Publish to Surbee.dev
                      </button>
                    </div>
                  </div>
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
              backgroundColor: typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? '#242424' : '#F8F8F8',
              borderColor: typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'var(--surbee-border-accent)' : 'rgba(0, 0, 0, 0.1)'
            }}
          >
            {/* Show Sandbox View when code or console mode is active */}
            {(sidebarView === 'code' || sidebarView === 'console') && sandboxAvailable ? (
              <ProjectSandboxView
                showConsole={sidebarView === 'console'}
                providerProps={sandboxProviderProps}
                onFixError={handleSandboxFixRequest}
                bundle={sandboxBundle}
              />
            ) : (
              <div
                className="flex-1 overflow-hidden flex items-center justify-center"
                style={{
                  backgroundColor: typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? '#242424' : '#F8F8F8'
                }}
              >
                {/* Show loading animation while AI is working */}
                {(status === 'submitted' || status === 'streaming') && !sandboxAvailable ? (
                  <AILoader text="Building" size={200} />
                ) : sandboxAvailable ? (
                  /* Show React preview when sandbox bundle is available */
                  <div className="h-full w-full">
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
