"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronLeft, Plus, Home, Library, Search, MessageSquare, Folder as FolderIcon, ArrowUp, User, ThumbsUp, HelpCircle, Gift, ChevronsLeft, Menu, AtSign, Settings2, Inbox, FlaskConical, BookOpen, X, Paperclip, History, Monitor, Smartphone, Tablet, ExternalLink, RotateCcw, Eye, GitBranch, Flag, PanelLeftClose, PanelLeftOpen, Share2, Copy, Hammer, Code, Terminal, AlertTriangle } from "lucide-react";
import UserNameBadge from "@/components/UserNameBadge";
import UserMenu from "@/components/ui/user-menu";
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { File, Folder, Tree } from "@/components/ui/file-tree";
import AIResponseActions from "@/components/ui/ai-response-actions";
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import ChatInputLight from "@/components/ui/chat-input-light";
import dynamic from 'next/dynamic'
import { MODELS } from "@/lib/deepsite/providers";
import { useDeepSite } from "./deepsite-integration/hooks/useDeepSite";
import { DeepSiteRenderer } from "./deepsite-integration/renderer/DeepSiteRenderer";
import { ChatMessage } from "./deepsite-integration/types";
import { SelectedHtmlElement } from "./deepsite-integration/components/SelectedHtmlElement";
import { EditModeTooltip } from "./deepsite-integration/components/EditModeTooltip";
import { AuthGuard } from "@/components/auth/AuthGuard";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from '@/contexts/AuthContext';
import { useRealtime } from '@/contexts/RealtimeContext';
import { ThinkingDisplay } from '../../../../components/ThinkingUi/components/thinking-display';
import { ToolCall } from '../../../../components/ThinkingUi/components/tool-call';
import { AILoader } from '@/components/ai-loader';
import { cn } from "@/lib/utils";
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

  return (
    <SandboxProvider key={bundle ? `${bundle.entry}-${Object.keys(bundle.files).length}` : "placeholder-project"} {...providerProps}>
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

  // Debug: Log the import specifier
  console.log('[deriveSandboxConfig] Entry:', normalizedEntry, 'Import:', importSpecifier);

  // Only create index.tsx if it doesn't exist
  if (!files["/index.tsx"]) {
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
  }

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

  // Check if this is a sandbox preview request
  const isSandboxPreview = searchParams?.get('sandbox') === '1';

  // Enable temporary mock mode to work on UI without DB/auth
  const mockMode = (searchParams?.get('mock') === '1') || (process.env.NEXT_PUBLIC_MOCK_PROJECT === 'true');

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
  
  const [isPlanUsageOpen, setIsPlanUsageOpen] = useState(true);
  const [isChatsOpen, setIsChatsOpen] = useState(false);
  const [isFoldersOpen, setIsFoldersOpen] = useState(false);
  const [isHomeOpen, setIsHomeOpen] = useState(false);
  const [isLabOpen, setIsLabOpen] = useState(false);
  const [isKnowledgeBaseOpen, setIsKnowledgeBaseOpen] = useState(false);
  const [chatText, setChatText] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<{ [key: string]: string }>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  
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
  const [isEditableModeEnabled, setIsEditableModeEnabled] = useState(false);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [selectedElementSnapshot, setSelectedElementSnapshot] = useState<SelectedElementSnapshot | null>(null);
  const [activeTopButton, setActiveTopButton] = useState<'upgrade' | 'publish' | null>(null);
  const [rendererKey, setRendererKey] = useState(0);
  const [isAskMode, setIsAskMode] = useState(false);
  const [isCgihadiDropdownOpen, setIsCgihadiDropdownOpen] = useState(false);
  const askModeRef = useRef(false);
  useEffect(() => { askModeRef.current = isAskMode; }, [isAskMode]);
  // Error detection and credit guard
  const conversationIdRef = useRef<string | null>(null);

  const activeRequestRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const selectedElementSnapshotRef = useRef<SelectedElementSnapshot | null>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    selectedElementSnapshotRef.current = selectedElementSnapshot;
  }, [selectedElementSnapshot]);

  
  const [thinkingHtmlStream, setThinkingHtmlStream] = useState<string>('');
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);
  const plannerSummarySeenRef = useRef(false);
  const plannerFallbackSentRef = useRef(false);
  const builderSummarySeenRef = useRef(false);
  const builderFallbackSentRef = useRef(false);
  const plannerReasoningSnapshotRef = useRef<ThinkingStep[]>([]);
  const builderReasoningSnapshotRef = useRef<ThinkingStep[]>([]);
  const latestThinkingStepsRef = useRef<ThinkingStep[]>([]);
  const [workflowPhase, setWorkflowPhase] = useState<WorkflowPhase>('idle');
  const workflowPhaseRef = useRef<WorkflowPhase>('idle');
  const [isBuilding, setIsBuilding] = useState(false);
  const [sandboxBundle, setSandboxBundle] = useState<SandboxBundle | null>(null);
  const [sandboxError, setSandboxError] = useState<string | null>(null);
  const [buildingLabel, setBuildingLabel] = useState('Building survey experience...');
  const [hasHtmlContent, setHasHtmlContent] = useState(false);
  const buildingLabelRef = useRef(buildingLabel);
  useEffect(() => {
    buildingLabelRef.current = buildingLabel;
  }, [buildingLabel]);

  const updateWorkflowPhase = useCallback((next: WorkflowPhase) => {
    workflowPhaseRef.current = next;
    setWorkflowPhase(next);
  }, []);

  const enterPlannerPhase = useCallback(() => {
    updateWorkflowPhase('planner');
    setIsThinking(true);
    setIsBuilding(false);
  }, [updateWorkflowPhase]);

  const enterPlannerSummaryPhase = useCallback(() => {
    updateWorkflowPhase('planner_summary');
    setIsThinking(false);
  }, [updateWorkflowPhase]);

  const enterBuilderPhase = useCallback(() => {
    updateWorkflowPhase('builder');
    setIsThinking(false);
    setIsBuilding(true);
  }, [updateWorkflowPhase]);

  const enterCompletePhase = useCallback(() => {
    updateWorkflowPhase('complete');
    setIsThinking(false);
    setIsBuilding(false);
  }, [updateWorkflowPhase]);

  const recordError = useCallback((err: string) => {
    console.error('[Error]', err);
    setSandboxError(err);
  }, []);

  // Context usage meter for Grok-4 with 2 million token limit
  const GROK_CONTEXT_TOKENS = 2000000; // 2 million tokens
  const [contextPercent, setContextPercent] = useState<number>(0);
  const ctxTokensUsedRef = useRef<number>(0);
  const ctxLimitRef = useRef<number>(GROK_CONTEXT_TOKENS);

  // Auto-reset context when hitting 2 million tokens
  const resetContextIfNeeded = () => {
    if (ctxTokensUsedRef.current >= GROK_CONTEXT_TOKENS) {
      console.log('[Context] Auto-resetting context at 2M tokens');
      ctxTokensUsedRef.current = 0;
      setContextPercent(0);
    }
  };
  const estimateTokens = (text: string) => Math.ceil((text || '').length / 4);
  const preciseCountTokens = async (text: string) => {
    try {
      const model = (isAskMode ? (process.env.OPENAI_LONG_MODEL || 'o200k_base') : (process.env.OPENAI_MODEL || 'cl100k_base'));
      const res = await fetch('/api/tokens/estimate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, model }) });
      const data = await res.json();
      if (data?.ok && typeof data.count === 'number') return data.count as number;
    } catch {}
    return estimateTokens(text);
  };
  
  // DeepSite integration
  // Memoize callbacks to prevent unnecessary re-renders
  const onDeepSiteMessage = useCallback((message: any) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const onDeepSiteError = useCallback((error: string) => {
    console.error('DeepSite error:', error);
    recordError(typeof error === 'string' ? error : 'Renderer error');
  }, [recordError]);

  const deepSite = useDeepSite({
    defaultHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Preview</title>
  <style>html,body{height:100%;margin:0;padding:0;background:#101010;color:#fff}</style>
</head>
<body></body>
</html>`,
    onMessage: onDeepSiteMessage,
    onError: onDeepSiteError,
  projectId: projectId || undefined
  });
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

  // Fetch project data (or use mock)
  useEffect(() => {
    const fetchProject = async () => {
      if (mockMode) {
        // Minimal mock project so the page can render without backend
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
        // No seeded chat messages in mock mode
        setMessages([]);
        setHasStartedChat(false);
        setProjectLoading(false);
        return;
      }

      if (!user || !projectId) return;
      
      try {
        const response = await fetch(`/api/projects/${projectId}?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setProject(data.project);
          
          // Load existing messages
          const messagesResponse = await fetch(`/api/projects/${projectId}/messages?userId=${user.id}`);
          if (messagesResponse.ok) {
            const messagesData = await messagesResponse.json();
            const formattedMessages = messagesData.messages?.map((msg: any) => ({
              id: msg.id,
              text: msg.content,
              isUser: Boolean(msg.is_user),
              timestamp: new Date(msg.created_at),
            })) || [];
            setMessages(formattedMessages);
            if (formattedMessages.length > 0) {
              setHasStartedChat(true);
            }
          }
        } else if (response.status === 404) {
          // Project doesn't exist, create it
          const createResponse = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: `Project ${projectId}`,
              description: 'Project created from builder',
              user_id: user.id
            })
          });
          
          if (createResponse.ok) {
            const { project } = await createResponse.json();
            setProject(project);
          }
        }
      } catch (error) {
        console.error('Failed to fetch project:', error);
      } finally {
        setProjectLoading(false);
      }
    };

    if (user && !authLoading && projectId) {
      fetchProject();
    }
  }, [user, authLoading, projectId]);

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



  // Handle placeholder visibility
  useEffect(() => {
    // Check for initial prompt and images from session storage
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
    
    if (initialPrompt || (initialImages && initialImages.length > 0)) {
      handleSendMessage(initialPrompt || '', initialImages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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












  const createMessageId = () => `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const registerAgentMessage = useCallback((agent?: string, isSummary?: boolean) => {
    if (!agent || !isSummary) return;
    const normalized = agent.toLowerCase();
    if (normalized.includes('surbeebuildplanner')) {
      plannerSummarySeenRef.current = true;
    }
    if (normalized.includes('surbeebuilder')) {
      builderSummarySeenRef.current = true;
    }
  }, []);

  const addAgentMessage = useCallback(
    (text: string, agent?: string, options?: { isSummary?: boolean }) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const isSummary = Boolean(options?.isSummary);
      setMessages((prev) => [
        ...prev,
        {
          id: createMessageId(),
          text: trimmed,
          isUser: false,
          agent,
          timestamp: new Date(),
          isSummary,
        },
      ]);
      registerAgentMessage(agent, isSummary);
    },
    [registerAgentMessage]
  );

  const clampHighlight = useCallback((text: string, maxLen = 240) => {
    const normalized = text.replace(/\s+/g, ' ').trim();
    if (!normalized) return '';
    return normalized.length > maxLen ? `${normalized.slice(0, Math.max(0, maxLen - 3))}...` : normalized;
  }, []);

  const extractHighlightsFromSteps = useCallback(
    (steps: ThinkingStep[], max: number, fromEnd = false) => {
      if (!Array.isArray(steps) || steps.length === 0 || max <= 0) {
        return [] as string[];
      }

      const highlights: string[] = [];
      const seen = new Set<string>();

      if (fromEnd) {
        for (let i = steps.length - 1; i >= 0 && highlights.length < max; i -= 1) {
          const highlight = clampHighlight(steps[i]?.content ?? '');
          if (!highlight) continue;
          const key = highlight.toLowerCase();
          if (seen.has(key)) continue;
          seen.add(key);
          highlights.unshift(highlight);
        }
        return highlights.slice(-max);
      }

      for (const step of steps) {
        const highlight = clampHighlight(step?.content ?? '');
        if (!highlight) continue;
        const key = highlight.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        highlights.push(highlight);
        if (highlights.length >= max) break;
      }

      return highlights.slice(0, max);
    },
    [clampHighlight]
  );

  const buildPlannerFallbackSummary = useCallback(() => {
    const highlights = extractHighlightsFromSteps(plannerReasoningSnapshotRef.current, 4, false);
    const sections: string[] = [
      "SurbeeBuildPlanner: Here's what I understood and how I'll build this survey experience.",
    ];
    if (highlights.length > 0) {
      sections.push(`**What I'm building**\n${highlights.map((line) => `- ${line}`).join('\n')}`);
    }
    sections.push("I'm about to start assembling the UI - pause me if you want to adjust anything before I begin.");
    return sections.filter(Boolean).join('\n\n');
  }, [extractHighlightsFromSteps]);

  const buildBuilderFallbackSummary = useCallback(() => {
    const highlights = extractHighlightsFromSteps(builderReasoningSnapshotRef.current, 5, true);
    const sections: string[] = [
      "SurbeeBuilder: I've finished constructing the survey exactly as planned.",
    ];
    if (highlights.length > 0) {
      sections.push(`**What I delivered**\n${highlights.map((line) => `- ${line}`).join('\n')}`);
    }
    sections.push("Let me know if you'd like revisions, extra logic, or follow-up journeys.");
    return sections.filter(Boolean).join('\n\n');
  }, [extractHighlightsFromSteps]);

  const ensurePlannerSummary = useCallback(() => {
    if (!plannerSummarySeenRef.current && !plannerFallbackSentRef.current) {
      const fallbackSummary = buildPlannerFallbackSummary().trim();
      if (fallbackSummary) {
        addAgentMessage(fallbackSummary, 'SurbeeBuildPlanner', { isSummary: true });
      }
      plannerFallbackSentRef.current = true;
    }
    enterPlannerSummaryPhase();
  }, [addAgentMessage, buildPlannerFallbackSummary, enterPlannerSummaryPhase]);

  const ensureBuilderSummary = useCallback(() => {
    if (!builderSummarySeenRef.current && !builderFallbackSentRef.current) {
      const fallbackSummary = buildBuilderFallbackSummary().trim();
      if (fallbackSummary) {
        addAgentMessage(fallbackSummary, 'SurbeeBuilder', { isSummary: true });
      }
      builderFallbackSentRef.current = true;
    }
  }, [addAgentMessage, buildBuilderFallbackSummary]);


  const stop = () => {
    if (activeRequestRef.current) {
      activeRequestRef.current.abort();
      activeRequestRef.current = null;
    }
    setIsThinking(false);
    setIsInputDisabled(false);
    deepSite.setIsAiWorking(false);
    deepSite.setIsThinking(false);
    setIsBuilding(false);
    const defaultBuildLabel = 'Building survey experience...';
    setBuildingLabel(defaultBuildLabel);
    buildingLabelRef.current = defaultBuildLabel;
    updateWorkflowPhase('idle');
  };

  const runSurveyBuild = useCallback(async (prompt: string, images?: string[]) => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      return false;
    }

    if (activeRequestRef.current) {
      activeRequestRef.current.abort();
    }

    const controller = new AbortController();
    activeRequestRef.current = controller;

    setSandboxError(null);
    enterPlannerPhase();
    setIsInputDisabled(true);
    deepSite.setIsAiWorking(true);
    deepSite.setIsThinking(true);
    setIsBuilding(false);

    const buildingLabels = [
      'Doodling your survey...',
      'Sketching questions...',
      'Crafting something special...',
      'Painting your survey...',
      'Conjuring magic...',
      'Weaving ideas together...',
      'Sculpting the experience...',
      'Drawing up something cool...',
      'Creating survey vibes...',
      'Mixing the perfect blend...',
      'Composing your masterpiece...',
      'Brewing survey magic...',
    ];
    const randomBuildLabel = buildingLabels[Math.floor(Math.random() * buildingLabels.length)];
    setBuildingLabel(randomBuildLabel);
    buildingLabelRef.current = randomBuildLabel;
    setThinkingHtmlStream('');
    setHasHtmlContent(false);
    setSandboxBundle(null);
    setSidebarView('chat');
    plannerSummarySeenRef.current = false;
    plannerFallbackSentRef.current = false;
    builderSummarySeenRef.current = false;
    builderFallbackSentRef.current = false;
    plannerReasoningSnapshotRef.current = [];
    builderReasoningSnapshotRef.current = [];
    latestThinkingStepsRef.current = [];
    setThinkingSteps([]);

    let reasoningCounter = 0;

    const appendReasoningStep = (text: string) => {
      const stepId = `reasoning-${Date.now()}-${reasoningCounter++}`;
      setThinkingSteps((prev) => {
        const next = [
          ...prev,
          {
            id: stepId,
            content: text,
            status: 'thinking' as const,
          },
        ];
        latestThinkingStepsRef.current = next;
        return next;
      });
    };

    const snapshotPlannerSteps = () => {
      const snapshot = latestThinkingStepsRef.current.map((step) => ({ ...step }));
      if (snapshot.length > 0) {
        plannerReasoningSnapshotRef.current = snapshot;
      }
    };

    const MAX_CONTEXT_HTML = 150000;
    const currentHtml = deepSite.html || '';
    const contextHtml =
      currentHtml.length > MAX_CONTEXT_HTML
        ? `${currentHtml.slice(0, MAX_CONTEXT_HTML)}<!-- truncated -->`
        : currentHtml;
    const chatHistoryPayload = buildChatHistoryPayload(messagesRef.current);
    const chatSummaryPayload = buildChatSummary(chatHistoryPayload);
    const selectedElementSnapshotValue = selectedElementSnapshotRef.current;
    const selectedElementPayload =
      selectedElementSnapshotValue &&
      (selectedElementSnapshotValue.outerHTML ||
        selectedElementSnapshotValue.textContent ||
        selectedElementSnapshotValue.selector)
        ? {
            outerHTML: selectedElementSnapshotValue.outerHTML || undefined,
            textContent: selectedElementSnapshotValue.textContent || undefined,
            selector: selectedElementSnapshotValue.selector || undefined,
          }
        : undefined;

    const contextPayload = {
      html: contextHtml,
      selectedRoute,
      pages,
      device: currentDevice,
      chatHistory: chatHistoryPayload.length ? chatHistoryPayload : undefined,
      chatSummary: chatSummaryPayload && chatSummaryPayload.trim() ? chatSummaryPayload : undefined,
      selectedElement: selectedElementPayload,
    };

    try {
      const response = await fetch('/api/agents/surbee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: trimmed, images, context: contextPayload }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Failed to reach Surbee agent workflow');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to read response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let htmlBuf = '';
      let lastPushedLen = 0;

      const processEvent = async (event: any) => {
        if (!event || typeof event !== 'object') return;

        if (event.type === 'reasoning' && event.text) {
          const text = String(event.text).trim();
          if (!text) return;
          appendReasoningStep(text);
          return;
        }

        if (event.type === 'message' && event.text) {
          const messageText = String(event.text).trim();
          if (!messageText) return;

          const isSummary = Boolean(event.isSummary);
          setMessages((prev) => [
            ...prev,
            {
              id: event.id || `msg-${Date.now()}`,
              text: messageText,
              isUser: false,
              agent: event.agent || undefined,
              timestamp: new Date(),
              isSummary,
            },
          ]);
          registerAgentMessage(event.agent || undefined, isSummary);

          if (isSummary) {
            const agentName = String(event.agent || '').toLowerCase();
            if (agentName.includes('surbeebuildplanner')) {
              ensurePlannerSummary();
            } else if (agentName.includes('surbeebuilder')) {
              builderSummarySeenRef.current = true;
            }
          }
          return;
        }

        if (event.type === 'tool_call') {
          if (event.name === 'build_typescript_tailwind_project') {
            snapshotPlannerSteps();
            ensurePlannerSummary();
            setThinkingSteps((prev) => {
              const updated = prev.map((step) => ({ ...step, status: 'complete' as const }));
              latestThinkingStepsRef.current = updated;
              return updated;
            });
            setIsThinking(false);
            deepSite.setIsThinking(false);
            enterBuilderPhase();
          }
          return;
        }

        if (event.type === 'code_bundle') {
          const files = event.files && typeof event.files === 'object' ? event.files : {};
          const entry = typeof event.entry === 'string' && event.entry.trim() ? event.entry : 'src/Survey.tsx';
          setSandboxBundle({
            files,
            entry,
            dependencies: Array.isArray(event.dependencies) ? event.dependencies : undefined,
            devDependencies: Array.isArray(event.devDependencies) ? event.devDependencies : undefined,
          });
          return;
        }

        if ((event as any).type === 'thinking_control') {
          const action = (event as any).action;
          if (action === 'close') {
            setThinkingSteps((prev) => {
              const updated = prev.map((step) => ({ ...step, status: 'complete' as const }));
              latestThinkingStepsRef.current = updated;
              return updated;
            });
            setIsThinking(false);
            deepSite.setIsThinking(false);
          } else if (action === 'open') {
            snapshotPlannerSteps();
            ensurePlannerSummary();
            setThinkingSteps([]);
            latestThinkingStepsRef.current = [];
            setIsThinking(true);
            deepSite.setIsThinking(true);
          }
          return;
        }

        if (event.type === 'html_chunk' && typeof event.chunk === 'string') {
          ensurePlannerSummary();
          const wasEmpty = htmlBuf.length === 0;
          htmlBuf += event.chunk;
          if (wasEmpty) {
            setThinkingSteps((prev) => {
              const updated = prev.map((step) => ({ ...step, status: 'complete' as const }));
              latestThinkingStepsRef.current = updated;
              return updated;
            });
            setIsThinking(false);
            deepSite.setIsThinking(false);
          }
          enterBuilderPhase();
          setHasHtmlContent(true);
          if (htmlBuf.length > lastPushedLen) {
            lastPushedLen = htmlBuf.length;
            deepSite.updateHtml(htmlBuf);
            setThinkingHtmlStream(htmlBuf);
          }
          return;
        }

        if (event.type === 'complete') {
          ensurePlannerSummary();
          const builderSnapshot = latestThinkingStepsRef.current.map((step) => ({ ...step }));
          if (builderSnapshot.length > 0) {
            builderReasoningSnapshotRef.current = builderSnapshot;
          }
          if (htmlBuf.length > lastPushedLen) {
            deepSite.updateHtml(htmlBuf);
            setThinkingHtmlStream(htmlBuf);
          }
          const finalLabel = 'Build complete.';
          setBuildingLabel(finalLabel);
          buildingLabelRef.current = finalLabel;
          setThinkingSteps((prev) => {
            const updated = prev.map((step) => ({ ...step, status: 'complete' as const }));
            latestThinkingStepsRef.current = updated;
            return updated;
          });
          ensureBuilderSummary();
          enterCompletePhase();
          deepSite.setIsThinking(false);
          deepSite.setIsAiWorking(false);
          setIsBuilding(false);
          return;
        }

        if (event.type === 'error' && event.message) {
          const errorMessage = String(event.message);
          const errorId = event.id || `error-${Date.now()}`;
          setThinkingSteps((prev) => [
            ...prev,
            { id: errorId, content: `Error: ${errorMessage}`, status: 'thinking' },
          ]);
          setIsThinking(false);
          deepSite.setIsThinking(false);
          setIsBuilding(false);
          recordError(errorMessage);
          return;
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        let boundary = buffer.indexOf('\n');
        while (boundary !== -1) {
          const line = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 1);

          if (line.startsWith('data: ')) {
            const payload = line.slice(6);
            if (payload.trim().length > 0) {
              try {
                const ev = JSON.parse(payload);
                if (ev.type === 'batch' && Array.isArray(ev.events)) {
                  for (const batchedEvent of ev.events) {
                    await processEvent(batchedEvent);
                  }
                } else {
                  await processEvent(ev);
                }
              } catch {
                // ignore malformed line
              }
            }
          }

          boundary = buffer.indexOf('\n');
        }
      }

      return true;
    } catch (error) {
      console.error('runSurveyBuild error', error);
      const message = error instanceof Error ? error.message : 'Unexpected agent error.';
      const failureLabel = 'Build interrupted.';
      setIsBuilding(false);
      setBuildingLabel(failureLabel);
      buildingLabelRef.current = failureLabel;
      setThinkingSteps((prev) => {
        const updated = prev.map((step) => ({ ...step, status: 'complete' as const }));
        latestThinkingStepsRef.current = updated;
        return updated;
      });
      recordError(message);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          text: `Error: ${message}`,
          isUser: false,
          timestamp: new Date(),
        },
      ]);
      updateWorkflowPhase('idle');
      return false;
    } finally {
      setIsInputDisabled(false);
      deepSite.setIsAiWorking(false);
      deepSite.setIsThinking(false);
      setIsBuilding(false);
      if (!plannerSummarySeenRef.current && !plannerFallbackSentRef.current) {
        ensurePlannerSummary();
      }
      if (!builderSummarySeenRef.current && !builderFallbackSentRef.current && workflowPhaseRef.current === 'complete') {
        ensureBuilderSummary();
      }
      if (workflowPhaseRef.current !== 'complete') {
        updateWorkflowPhase('idle');
      }
      activeRequestRef.current = null;
    }
  }, [currentDevice, deepSite, ensureBuilderSummary, ensurePlannerSummary, enterBuilderPhase, enterCompletePhase, enterPlannerPhase, pages, recordError, registerAgentMessage, selectedRoute, updateWorkflowPhase]);

  const handleSendMessage = async (message?: string, images?: string[]) => {
    const textToSend = message || chatText.trim();
    const imagePayload = Array.isArray(images) && images.length > 0 ? images : undefined;
    if (!textToSend && !imagePayload && files.length === 0) return;
    if (isInputDisabled || deepSite.isAiWorking) return;

    if (!message) {
      setChatText("");
      setFiles([]);
      setFilePreviews({});
    }
    setHasStartedChat(true);

    try {
      const tokenCount = await preciseCountTokens(textToSend);
      const inc = tokenCount + (imagePayload ? imagePayload.length * 128 : 0);
      ctxTokensUsedRef.current += inc;

      // Check if we need to reset context
      resetContextIfNeeded();

      const limit = ctxLimitRef.current;
      const pct = (ctxTokensUsedRef.current / limit) * 100;
      setContextPercent(Math.max(0, Math.min(100, Math.round(pct * 10) / 10)));
    } catch {}

    const contentEditableDiv = document.querySelector('.ProseMirror') as HTMLDivElement;
    if (contentEditableDiv) {
      contentEditableDiv.innerHTML = '<p class="is-empty is-editor-empty" style="margin: 0px; color: rgb(235, 235, 235);"><br class="ProseMirror-trailingBreak"></p>';
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: textToSend,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    await runSurveyBuild(textToSend, imagePayload);
  };

  const handleSandboxFixRequest = useCallback((errorMessage: string) => {
    const prompt = `The sandbox preview reported an error:\n\n${errorMessage}\n\nPlease diagnose the issue and provide an updated solution.`;
    void handleSendMessage(prompt);
    setSidebarView('chat');
    setSandboxError(null);
  }, [handleSendMessage, setSidebarView]);

  const handleSandboxIgnore = useCallback(() => {
    setSandboxError(null);
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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

  useEffect(() => {
    latestThinkingStepsRef.current = thinkingSteps.map((step) => ({ ...step }));
  }, [thinkingSteps]);

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

  // Derive pages from current HTML by scanning for anchor links with absolute paths
  useEffect(() => {
    try {
      const tmp = document.createElement('div');
      tmp.innerHTML = deepSite.html || '';
      const anchors = Array.from(tmp.querySelectorAll('a')) as HTMLAnchorElement[];
      const found: { path: string; title: string }[] = [];
      const seen = new Set<string>();
      // Always include root
      found.push({ path: '/', title: '/' });
      seen.add('/');
      anchors.forEach(a => {
        const href = (a.getAttribute('href') || '').trim();
        if (!href || !href.startsWith('/')) return;
        const path = href.split('#')[0];
        if (!seen.has(path)) {
          const txt = (a.textContent || '').trim();
          const title = txt || path;
          found.push({ path, title });
          seen.add(path);
        }
      });
      setPages(found);
      // If selected route no longer exists, fall back to '/'
      if (!found.find(p => p.path === selectedRoute)) {
        setSelectedRoute('/');
      }
    } catch {
      // ignore parsing errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deepSite.html]);

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
        <div className="profile-section relative">
          <div className="flex items-center gap-1">
            <div className="profile-button">
              <div 
                className="profile-circle cursor-pointer"
                onClick={() => setIsCgihadiDropdownOpen(!isCgihadiDropdownOpen)}
              >
                H
              </div>
              <motion.div
                className="profile-arrow-container cursor-pointer"
                animate={{ rotate: isCgihadiDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsCgihadiDropdownOpen(!isCgihadiDropdownOpen)}
              >
                <ChevronDown className="profile-arrow" />
              </motion.div>
            </div>
            <div className="user-plan-text pro" style={{ margin: '0', padding: '0', marginLeft: '-8px' }}>Max</div>
          </div>
          <AnimatePresence>
            {isCgihadiDropdownOpen && (
              <motion.div
                className="absolute z-50 mt-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <UserMenu className="mt-2" onClose={() => setIsCgihadiDropdownOpen(false)} />
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
              <div className="flex-1 overflow-y-auto pl-12 pr-6 py-6" ref={chatAreaRef}>
                <div className="space-y-6">
                  {messages.map((message, idx) => {
                  const lastUserPrompt =
                    [...messages].slice(0, idx).reverse().find((m) => m.isUser)?.text || "";
                  const isReasoningOnly = !message.isUser && message.text.trim().toLowerCase().startsWith("thought for ");

                  if (isReasoningOnly) {
                    return (
                      <div key={message.id} className="flex justify-start">
                        <div className="text-xs text-muted-foreground italic">
                          {message.text}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={message.id}
                      className={`flex w-full ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.isUser ? (
                        <div className="relative max-w-[80%] rounded-2xl bg-white text-black px-4 py-3 text-sm shadow-lg border border-zinc-200">
                          <span className="block text-sm font-medium text-slate-900">
                            You
                          </span>
                          <p className="mt-1 whitespace-pre-wrap text-slate-900/90">
                            {message.text}
                          </p>
                          {message.timestamp && (
                            <span className="mt-2 block text-right text-xs text-slate-500">
                              {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div
                          className={
                            message.isSummary
                              ? "group relative max-w-full flex-1 rounded-2xl border border-blue-500/35 bg-blue-500/10 px-4 py-4 text-sm text-zinc-100 shadow-sm"
                              : "group relative max-w-full flex-1 text-sm text-zinc-100 leading-relaxed"
                          }
                        >
                          {(message.agent || message.isSummary) && (
                            <div className="mb-2 flex items-center gap-2">
                              {message.agent && (
                                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                  {message.agent}
                                </span>
                              )}
                              {message.isSummary && (
                                <span className="inline-flex items-center rounded-full bg-blue-500/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-blue-200">
                                  Summary
                                </span>
                              )}
                            </div>
                          )}
                          <MarkdownRenderer content={message.text} className="prose-invert prose-sm max-w-none" />
                          <div className="mt-3">
                            <AIResponseActions
                              message={message.text}
                              onCopy={(content) => navigator.clipboard.writeText(content)}
                              onRetry={() => {
                                if (lastUserPrompt) {
                                  void handleSendMessage(lastUserPrompt);
                                }
                              }}
                              onCreateSurvey={() => {
                                const prompt = lastUserPrompt || messages.find((m) => m.isUser)?.text || "";
                                if (prompt) {
                                  const newProjectId = `project_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
                                  try {
                                    sessionStorage.setItem("surbee_initial_prompt", prompt);
                                  } catch {}
                                  window.location.href = `/project/${newProjectId}`;
                                }
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {(isThinking || isBuilding) && (
                  <div className="space-y-3">
                    {isThinking && (
                      <ThinkingDisplay steps={thinkingSteps} isThinking={isThinking} />
                    )}
                    {isBuilding && (
                      <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/50 px-4 py-3">
                        <ToolCall
                          icon={<Hammer className="h-4 w-4 text-muted-foreground" />}
                          label={buildingLabel}
                          isActive
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          </div>

        {/* Chat Input */}
        <div className="pl-8 pr-4 pb-3">
          <div className="relative ml-0 mr-0">
            {/* Chat input container to anchor controls to the box itself */}
            <div className="relative">
              <ChatInputLight
                onSendMessage={(message, images) => handleSendMessage(message, images)}
                isInputDisabled={isInputDisabled || deepSite.isAiWorking}
                placeholder="Ask for a follow-up"
                className="chat-input-grey"
                isEditMode={isEditableModeEnabled}
                onToggleEditMode={() => {
                  setIsEditableModeEnabled(!isEditableModeEnabled);
                  if (selectedElement) {
                    setSelectedElement(null);
                    setSelectedElementSnapshot(null);
                  }
                }}
                showSettings={false}
                selectedElement={selectedElement}
                disableRotatingPlaceholders={true}
                onClearSelection={() => {
                  setSelectedElement(null);
                  setSelectedElementSnapshot(null);
                }}
                isBusy={isThinking || isBuilding}
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
            <button
              className={`rounded-md transition-colors cursor-pointer ${
                sidebarView === 'console'
                  ? 'text-white bg-white/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              } ${!sandboxAvailable ? 'opacity-40 cursor-not-allowed' : ''}`}
              onClick={() => sandboxAvailable && setSidebarView((current) => current === 'console' ? 'chat' : 'console')}
              aria-pressed={sidebarView === 'console'}
              title="Toggle console view"
              style={{
                fontFamily: 'Sohne, sans-serif',
                padding: '8px 12px'
              }}
              disabled={!sandboxAvailable}
            >
              <Terminal className="w-4 h-4" />
            </button>
          </div>

          {/* Center Section - Device Controls */}
          <div className="hidden md:flex flex-1 items-center justify-center">
            <div className="relative flex h-8 min-w-[340px] max-w-[560px] items-center justify-between gap-2 rounded-md border border-zinc-800 bg-[#1a1a1a] px-2 text-sm page-dropdown">
              {/* Device View Buttons */}
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setCurrentDevice('desktop')}
                  className={`p-1 rounded transition-colors ${
                    currentDevice === 'desktop' 
                      ? 'bg-zinc-700/50 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-zinc-700/30'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => setCurrentDevice('tablet')}
                  className={`p-1 rounded transition-colors ${
                    currentDevice === 'tablet' 
                      ? 'bg-zinc-700/50 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-zinc-700/30'
                  }`}
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => setCurrentDevice('phone')}
                  className={`p-1 rounded transition-colors ${
                    currentDevice === 'phone' 
                      ? 'bg-zinc-700/50 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-zinc-700/30'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Center: Route dropdown showing '/', '/contact', etc. */}
              <div className="flex-1 flex items-center gap-2 px-1">
                <div className="relative">
                  <button
                    onClick={togglePageDropdown}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-gray-200 hover:bg-zinc-700/30"
                    title="Select page"
                  >
                    <span className="text-sm" style={{ fontFamily: 'Sohne, sans-serif' }}>{selectedRoute}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                  {isPageDropdownOpen && (
                    <div className="absolute z-50 mt-1 w-48 bg-[#0f0f0f] border border-zinc-800 rounded-md shadow-xl">
                      <div className="py-1 max-h-64 overflow-auto">
                        {pages.map(p => (
                          <button
                            key={p.path}
                            onClick={() => { setSelectedRoute(p.path); setIsPageDropdownOpen(false); setRendererKey(k => k+1); }}
                            className={`w-full text-left px-3 py-1.5 text-sm hover:bg-white/5 ${selectedRoute === p.path ? 'text-white' : 'text-gray-300'}`}
                          >
                            {p.path}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {isEditableModeEnabled && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => {
                    const previewUrl = `https://Surbee.dev/preview/${projectId}`;
                    window.open(previewUrl, '_blank', 'width=1200,height=800');
                  }}
                  className="p-1 rounded text-gray-400 hover:text-white hover:bg-zinc-700/30 transition-colors"
                  title="Open preview in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => setRendererKey((k) => k + 1)}
                  className="p-1 rounded text-gray-400 hover:text-white hover:bg-zinc-700/30 transition-colors"
                  title="Refresh page"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Section - Upgrade & Publish Buttons */}
          <div className="relative flex items-center gap-2">
            {/* Share */}
            <div className="relative">
              <button
                onClick={() => setIsShareOpen((v) => !v)}
                className="p-1.5 rounded-md text-gray-300 hover:bg-white/10"
                title="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>
              {isShareOpen && (
                <div ref={shareMenuRef} className="absolute top-full right-0 mt-2 w-[320px] bg-black border border-zinc-800 rounded-xl shadow-2xl z-50 p-3">
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
                  </div>
                </div>
              )}
            </div>
            <button
              className={`relative px-3 py-1.5 font-medium text-sm transition-all duration-150 cursor-pointer rounded-[0.38rem] ${
                activeTopButton === 'upgrade' ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10'
              }`}
              style={{
                fontFamily: 'FK Grotesk, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: '1.375rem'
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
              className={`relative px-3 py-1.5 font-medium text-sm transition-all duration-150 cursor-pointer rounded-[0.38rem] ${
                activeTopButton === 'publish' ? 'bg-white text-black' : 'bg-white text-black hover:opacity-90'
              }`}
              style={{
                fontFamily: 'FK Grotesk, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: '1.375rem'
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
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex relative">
          {/* Restored rounded preview frame with border, like before */}
          <div className="flex-1 flex flex-col relative bg-[#0a0a0a] rounded-[0.625rem] border border-zinc-800 mt-0 mr-3 mb-3 ml-2 overflow-hidden">
            {/* Show Sandbox View when code or console mode is active */}
            {(sidebarView === 'code' || sidebarView === 'console') && sandboxAvailable ? (
              <ProjectSandboxView
                showConsole={sidebarView === 'console'}
                providerProps={sandboxProviderProps}
                onFixError={handleSandboxFixRequest}
                bundle={sandboxBundle}
              />
            ) : (
              <div className="flex-1 overflow-hidden flex items-center justify-center bg-[#0a0a0a]">
                {/* Show loading animation while building but no HTML yet */}
                {(isBuilding || isThinking) && !hasHtmlContent ? (
                  <AILoader text="Building" size={200} />
                ) : (
                  /* Device-sized container with smooth transitions on resize */
                  <div className={`relative ${getDeviceStyles()} transition-all duration-300 ease-in-out`}>
                    <DeepSiteRenderer
                      key={`renderer-${rendererKey}`}
                      html={deepSite.html}
                      currentPath={selectedRoute}
                      deviceType={currentDevice}
                      title="Website Preview"
                      className="h-full w-full bg-[#0a0a0a]"
                      isEditableModeEnabled={isEditableModeEnabled}
                      onClickElement={(element) => {
                        setIsEditableModeEnabled(false);
                        setSelectedElement(element);
                      setSelectedElementSnapshot(captureElementSnapshot(element));
                      handleElementClick(element);
                    }}
                  />
                  {sandboxError && (
                    <div className="pointer-events-none absolute inset-0 flex items-end justify-end p-4">
                      <div className="pointer-events-auto max-w-sm rounded-xl border border-red-500/40 bg-red-500/15 backdrop-blur-sm shadow-2xl">
                        <div className="flex items-start gap-3 px-4 py-3 text-sm text-red-100">
                          <AlertTriangle className="mt-0.5 h-5 w-5 text-red-300" />
                          <div className="space-y-1">
                            <p className="text-xs font-semibold uppercase tracking-wide text-red-200">
                              Preview issue
                            </p>
                            <p className="text-sm leading-relaxed text-red-100/90">
                              {sandboxError}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 border-t border-white/10 px-4 py-3">
                          <button
                            type="button"
                            onClick={handleSandboxIgnore}
                            className="rounded-md border border-white/10 px-3 py-1.5 text-xs font-medium text-red-100 hover:border-white/20 hover:bg-white/10 transition"
                          >
                            Ignore
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSandboxFixRequest(sandboxError)}
                            className="rounded-md bg-red-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-red-400"
                          >
                            Fix now
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
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
