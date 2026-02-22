"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { RotateCcw, AlertCircle } from "lucide-react";
import { WebContainer } from "@webcontainer/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SandboxBundle {
  files: Record<string, string>;
  entry: string;
  dependencies?: string[];
  devDependencies?: string[];
}

interface WebContainerPreviewProps {
  bundle?: SandboxBundle | null;
  refreshKey?: number;
  className?: string;
  onPreviewUrlReady?: (url: string) => void;
  projectId?: string;
}

type ContainerStatus =
  | "idle"
  | "booting"
  | "installing"
  | "starting"
  | "ready"
  | "error";

// ---------------------------------------------------------------------------
// WebContainer singleton — only one instance per page
// ---------------------------------------------------------------------------

let wcInstance: WebContainer | null = null;
let wcBooting: Promise<WebContainer> | null = null;

async function getWebContainer(): Promise<WebContainer> {
  if (wcInstance) return wcInstance;
  if (wcBooting) return wcBooting;

  wcBooting = WebContainer.boot().then((wc) => {
    wcInstance = wc;
    wcBooting = null;
    return wc;
  });

  return wcBooting;
}

// ---------------------------------------------------------------------------
// Base template — baked in from modal/sandbox/survey-app/
// ---------------------------------------------------------------------------

const BASE_PACKAGE_JSON: Record<string, unknown> = {
  name: "surbee-survey-preview",
  version: "0.1.0",
  private: true,
  scripts: {
    dev: "next dev --turbopack -p 3000",
    build: "next build",
    start: "next start",
  },
  dependencies: {
    next: "^15.3.3",
    react: "^19.1.0",
    "react-dom": "^19.1.0",
    tailwindcss: "^4.1.8",
    "@tailwindcss/postcss": "^4.1.8",
    "lucide-react": "^0.454.0",
    "framer-motion": "^12.12.2",
  },
  devDependencies: {
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    typescript: "^5",
  },
};

const BASE_TSCONFIG = JSON.stringify(
  {
    compilerOptions: {
      lib: ["dom", "dom.iterable", "esnext"],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: "esnext",
      moduleResolution: "bundler",
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: "preserve",
      incremental: true,
      plugins: [{ name: "next" }],
      paths: { "@/*": ["./*"] },
    },
    include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    exclude: ["node_modules"],
  },
  null,
  2
);

const BASE_NEXT_CONFIG = `import type { NextConfig } from "next";
const nextConfig: NextConfig = { reactStrictMode: true };
export default nextConfig;
`;

const BASE_POSTCSS = `/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
`;

const BASE_GLOBALS_CSS = `@import "tailwindcss";
`;

const BASE_LAYOUT = `import "./globals.css";
export const metadata = { title: "Survey Preview" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
`;

const BASE_PAGE = `"use client";
export default function Page() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-white/40 text-sm">Loading preview...</p>
      </div>
    </div>
  );
}
`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert flat Record<string, string> to WebContainer FileSystemTree */
function toFileTree(files: Record<string, string>): Record<string, any> {
  const tree: Record<string, any> = {};

  for (const [rawPath, content] of Object.entries(files)) {
    // Strip leading slashes
    const path = rawPath.replace(/^\/+/, "");
    const parts = path.split("/");
    let current = tree;

    for (let i = 0; i < parts.length - 1; i++) {
      const dir = parts[i];
      if (!current[dir]) {
        current[dir] = { directory: {} };
      }
      current = current[dir].directory;
    }

    const fileName = parts[parts.length - 1];
    current[fileName] = { file: { contents: content } };
  }

  return tree;
}

/** Build the full mount tree including base template + user files */
function buildMountTree(
  userFiles: Record<string, string>,
  extraDeps?: string[]
): Record<string, any> {
  // Start with the base package.json, merge extra deps
  const pkgJson = structuredClone(BASE_PACKAGE_JSON);
  if (extraDeps && extraDeps.length > 0) {
    const deps = pkgJson.dependencies as Record<string, string>;
    for (const dep of extraDeps) {
      const match = dep.match(/^(@?[^@]+)(?:@(.+))?$/);
      if (match) {
        deps[match[1]] = match[2] || "latest";
      }
    }
  }

  // Base files
  const base: Record<string, any> = {
    "package.json": {
      file: { contents: JSON.stringify(pkgJson, null, 2) },
    },
    "tsconfig.json": { file: { contents: BASE_TSCONFIG } },
    "next.config.ts": { file: { contents: BASE_NEXT_CONFIG } },
    "postcss.config.mjs": { file: { contents: BASE_POSTCSS } },
    app: {
      directory: {
        "globals.css": { file: { contents: BASE_GLOBALS_CSS } },
        "layout.tsx": { file: { contents: BASE_LAYOUT } },
        "page.tsx": { file: { contents: BASE_PAGE } },
      },
    },
  };

  // Overlay user files onto the base
  const userTree = toFileTree(userFiles);
  return deepMerge(base, userTree);
}

/** Deep merge two file system trees (b overwrites a) */
function deepMerge(a: Record<string, any>, b: Record<string, any>): Record<string, any> {
  const result = { ...a };

  for (const key of Object.keys(b)) {
    if (
      result[key]?.directory &&
      b[key]?.directory
    ) {
      result[key] = {
        directory: deepMerge(result[key].directory, b[key].directory),
      };
    } else {
      result[key] = b[key];
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WebContainerPreview({
  bundle,
  refreshKey = 0,
  className = "",
  onPreviewUrlReady,
}: WebContainerPreviewProps) {
  const [status, setStatus] = useState<ContainerStatus>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const mountedFilesRef = useRef<Record<string, string>>({});
  const isBootingRef = useRef(false);
  const devProcessRef = useRef<any>(null);
  const wcRef = useRef<WebContainer | null>(null);

  // Boot the WebContainer and mount initial files
  const boot = useCallback(
    async (files: Record<string, string>, deps?: string[]) => {
      if (isBootingRef.current) return;
      isBootingRef.current = true;
      setError(null);

      try {
        setStatus("booting");
        const wc = await getWebContainer();
        wcRef.current = wc;

        // Mount base template + user files
        const tree = buildMountTree(files, deps);
        await wc.mount(tree);
        mountedFilesRef.current = { ...files };

        // Install dependencies
        setStatus("installing");
        const installProcess = await wc.spawn("npm", ["install"]);
        const installExit = await installProcess.exit;

        if (installExit !== 0) {
          throw new Error(`npm install failed with exit code ${installExit}`);
        }

        // Start dev server
        setStatus("starting");
        devProcessRef.current = await wc.spawn("npm", ["run", "dev"]);

        // Listen for the server-ready event
        wc.on("server-ready", (_port: number, url: string) => {
          setPreviewUrl(url);
          setStatus("ready");
          onPreviewUrlReady?.(url);
        });

        // Pipe output for debugging (silent)
        devProcessRef.current.output.pipeTo(
          new WritableStream({
            write(data: string) {
              // Dev server output — silent in production
              if (data.includes("error") || data.includes("Error")) {
                console.warn("[WebContainer]", data);
              }
            },
          })
        );
      } catch (err) {
        console.error("[WebContainer] Boot error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setStatus("error");
      } finally {
        isBootingRef.current = false;
      }
    },
    [onPreviewUrlReady]
  );

  // Boot on first bundle
  useEffect(() => {
    if (!bundle || Object.keys(bundle.files).length === 0) return;
    if (status !== "idle") return;

    boot(bundle.files, bundle.dependencies);
  }, [bundle, status, boot]);

  // Incremental file updates on subsequent bundle changes
  useEffect(() => {
    if (status !== "ready" || !bundle || !wcRef.current) return;

    const wc = wcRef.current;
    const prev = mountedFilesRef.current;
    const next = bundle.files;

    // Diff: find changed or new files
    const changes: Record<string, string> = {};
    for (const [path, content] of Object.entries(next)) {
      const normalizedPath = path.replace(/^\/+/, "");
      if (prev[path] !== content && prev[`/${normalizedPath}`] !== content) {
        changes[normalizedPath] = content;
      }
    }

    if (Object.keys(changes).length === 0) return;

    // Write changed files
    const writeChanges = async () => {
      for (const [path, content] of Object.entries(changes)) {
        try {
          // Ensure parent directory exists
          const dir = path.substring(0, path.lastIndexOf("/"));
          if (dir) {
            await wc.fs.mkdir(dir, { recursive: true });
          }
          await wc.fs.writeFile(path, content);
        } catch (err) {
          console.warn(`[WebContainer] Failed to write ${path}:`, err);
        }
      }
      // Update ref
      mountedFilesRef.current = { ...next };
    };

    writeChanges();
  }, [bundle, status]);

  // Handle refreshKey — reload the iframe
  useEffect(() => {
    if (refreshKey > 0 && iframeRef.current && previewUrl) {
      iframeRef.current.src = previewUrl;
    }
  }, [refreshKey, previewUrl]);

  const handleRetry = useCallback(() => {
    // Reset everything
    setStatus("idle");
    setPreviewUrl(null);
    setError(null);
    mountedFilesRef.current = {};
    isBootingRef.current = false;

    // Re-boot with current bundle
    if (bundle && Object.keys(bundle.files).length > 0) {
      setTimeout(() => boot(bundle.files, bundle.dependencies), 100);
    }
  }, [bundle, boot]);

  const handleRefreshIframe = useCallback(() => {
    if (iframeRef.current && previewUrl) {
      iframeRef.current.src = previewUrl;
    }
  }, [previewUrl]);

  // Install a single dependency into the running container
  const installDependency = useCallback(
    async (pkg: string) => {
      if (!wcRef.current) return;
      try {
        const proc = await wcRef.current.spawn("npm", ["install", pkg]);
        await proc.exit;
      } catch (err) {
        console.warn(`[WebContainer] Failed to install ${pkg}:`, err);
      }
    },
    []
  );

  // Expose installDependency on the DOM element for parent to call
  useEffect(() => {
    const el = iframeRef.current;
    if (el) {
      (el as any).__installDependency = installDependency;
    }
  }, [installDependency]);

  // ------- Render -------

  // Loading states
  if (
    status === "idle" ||
    status === "booting" ||
    status === "installing" ||
    status === "starting"
  ) {
    const statusText: Record<string, string> = {
      idle: "Preparing preview...",
      booting: "Booting WebContainer...",
      installing: "Installing dependencies...",
      starting: "Starting dev server...",
    };

    const progressWidth: Record<string, string> = {
      idle: "10%",
      booting: "25%",
      installing: "55%",
      starting: "80%",
    };

    return (
      <div
        className={`h-full w-full bg-white dark:bg-[#0a0a0a] relative ${className}`}
      >
        <div
          className="absolute top-0 left-0 right-0 h-0.5 overflow-hidden z-10"
          style={{
            backgroundColor:
              "var(--surbee-border-secondary, rgba(255,255,255,0.05))",
          }}
        >
          <div
            className="h-full bg-gradient-to-r from-indigo-500/50 via-purple-500/50 to-pink-500/50 animate-pulse"
            style={{
              width: progressWidth[status] || "20%",
              transition: "width 0.5s ease-out",
            }}
          />
        </div>
        <div className="flex items-center justify-center h-full">
          <p
            className="text-sm"
            style={{ color: "var(--surbee-fg-muted)" }}
          >
            {statusText[status] || "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (status === "error") {
    return (
      <div
        className={`h-full w-full bg-white dark:bg-[#0a0a0a] flex items-center justify-center ${className}`}
      >
        <div className="text-center px-6">
          <AlertCircle
            className="w-8 h-8 mx-auto mb-3 opacity-40"
            style={{ color: "var(--surbee-fg-secondary)" }}
          />
          <p
            className="text-sm mb-2"
            style={{ color: "var(--surbee-fg-secondary)" }}
          >
            Failed to load preview
          </p>
          <p
            className="text-xs mb-4 max-w-md"
            style={{ color: "var(--surbee-fg-muted)" }}
          >
            {error || "Unknown error occurred"}
          </p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              background: "var(--surbee-button-primary-bg)",
              color: "var(--surbee-button-primary-fg)",
            }}
          >
            <RotateCcw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Ready — show iframe
  return (
    <div
      className={`h-full w-full bg-white dark:bg-[#0a0a0a] relative flex flex-col ${className}`}
    >
      {previewUrl && (
        <>
          <iframe
            ref={iframeRef}
            src={previewUrl}
            className="w-full flex-1 border-none"
            title="Survey Preview"
            allow="clipboard-write"
          />

          {/* Minimal toolbar */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 border-t text-xs"
            style={{
              borderColor:
                "var(--surbee-border-secondary, rgba(255,255,255,0.08))",
              backgroundColor: "var(--surbee-bg-secondary, #141414)",
              color: "var(--surbee-fg-muted)",
            }}
          >
            <span className="truncate flex-1 font-mono opacity-50">
              WebContainer Preview
            </span>
            <button
              onClick={handleRefreshIframe}
              className="shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
              title="Refresh preview"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default WebContainerPreview;
