"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { RotateCcw, ExternalLink, Copy, Check, AlertCircle } from "lucide-react";

interface SandboxBundle {
  files: Record<string, string>;
  entry: string;
  dependencies?: string[];
  devDependencies?: string[];
}

interface ModalSandboxPreviewProps {
  /** Direct preview URL from the agent (preferred — shows iframe immediately) */
  previewUrl?: string | null;
  /** Fallback: create sandbox from bundle if no previewUrl */
  bundle?: SandboxBundle | null;
  refreshKey?: number;
  className?: string;
  onPreviewUrlReady?: (url: string) => void;
  onRelayUrlReady?: (url: string) => void;
  projectId?: string;
}

type SandboxStatus =
  | "idle"
  | "creating"
  | "ready"
  | "reconnecting"
  | "error";

const HEARTBEAT_INTERVAL = 30_000; // 30 seconds

export function ModalSandboxPreview({
  previewUrl: externalPreviewUrl,
  bundle,
  refreshKey = 0,
  className = "",
  onPreviewUrlReady,
  onRelayUrlReady,
  projectId,
}: ModalSandboxPreviewProps) {
  const [status, setStatus] = useState<SandboxStatus>("idle");
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [sandboxId, setSandboxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isCreatingRef = useRef(false);
  const heartbeatRef = useRef<ReturnType<typeof setInterval>>();

  // When an external preview URL is provided (from agent tool result), use it directly
  useEffect(() => {
    if (externalPreviewUrl) {
      setActiveUrl(externalPreviewUrl);
      setStatus("ready");
      onPreviewUrlReady?.(externalPreviewUrl);
    }
  }, [externalPreviewUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  // Create sandbox from bundle (fallback when no previewUrl is provided)
  const createSandbox = useCallback(async () => {
    if (isCreatingRef.current || !bundle || Object.keys(bundle.files).length === 0) return;

    try {
      isCreatingRef.current = true;
      setStatus("creating");
      setError(null);

      const id = projectId ? `${projectId}-${Date.now()}` : `preview-${Date.now()}`;

      const response = await fetch("/api/sandbox/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: bundle.files,
          sandbox_id: id,
          project_id: projectId,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      if (!result.preview_url) throw new Error("No preview URL returned");

      setSandboxId(result.sandbox_id || id);
      setActiveUrl(result.preview_url);
      setStatus("ready");
      onPreviewUrlReady?.(result.preview_url);
      if (result.relay_url) onRelayUrlReady?.(result.relay_url);
    } catch (err) {
      console.error("[ModalSandbox] Create error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setStatus("error");
    } finally {
      isCreatingRef.current = false;
    }
  }, [bundle, projectId, onPreviewUrlReady, onRelayUrlReady]);

  // Auto-create sandbox when bundle is provided but no external URL
  useEffect(() => {
    if (!externalPreviewUrl && bundle && status === "idle" && !isCreatingRef.current) {
      createSandbox();
    }
  }, [bundle, externalPreviewUrl, status, createSandbox]);

  // Handle refresh key
  useEffect(() => {
    if (refreshKey > 0 && !externalPreviewUrl && bundle) {
      setStatus("idle");
      setActiveUrl(null);
      setError(null);
      setTimeout(() => createSandbox(), 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  // Heartbeat polling
  useEffect(() => {
    if (status !== "ready" || !sandboxId) return;

    const checkHeartbeat = async () => {
      try {
        const res = await fetch("/api/sandbox/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sandbox_id: sandboxId }),
        });
        const data = await res.json();
        if (!data.alive && status === "ready") {
          console.warn("[ModalSandbox] Sandbox died, attempting reconnect...");
          setStatus("reconnecting");
          // Try to recreate from bundle
          if (bundle) {
            isCreatingRef.current = false;
            await createSandbox();
          }
        }
      } catch {
        // Heartbeat failure is non-fatal
      }
    };

    heartbeatRef.current = setInterval(checkHeartbeat, HEARTBEAT_INTERVAL);
    return () => clearInterval(heartbeatRef.current);
  }, [status, sandboxId, bundle, createSandbox]);

  // Timeout for sandbox creation
  useEffect(() => {
    if (status !== "creating") return;
    const timeout = setTimeout(() => {
      if (status === "creating") {
        setError("Sandbox creation timed out. Click Retry to try again.");
        setStatus("error");
        isCreatingRef.current = false;
      }
    }, 120_000);
    return () => clearTimeout(timeout);
  }, [status]);

  const handleRetry = useCallback(() => {
    setStatus("idle");
    setActiveUrl(null);
    setError(null);
    isCreatingRef.current = false;
    setTimeout(() => createSandbox(), 100);
  }, [createSandbox]);

  const handleCopyUrl = useCallback(() => {
    if (!activeUrl) return;
    navigator.clipboard.writeText(activeUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [activeUrl]);

  const handleRefreshIframe = useCallback(() => {
    if (iframeRef.current && activeUrl) {
      iframeRef.current.src = activeUrl;
    }
  }, [activeUrl]);

  // Loading state
  if (status === "idle" || status === "creating" || status === "reconnecting") {
    return (
      <div className={`h-full w-full bg-white dark:bg-[#0a0a0a] relative ${className}`}>
        <div className="absolute top-0 left-0 right-0 h-0.5 overflow-hidden z-10" style={{ backgroundColor: 'var(--surbee-border-secondary, rgba(255,255,255,0.05))' }}>
          <div
            className="h-full bg-gradient-to-r from-indigo-500/50 via-purple-500/50 to-pink-500/50 animate-pulse"
            style={{
              width: status === 'idle' ? '20%' : status === 'creating' ? '60%' : '80%',
              transition: 'width 0.5s ease-out'
            }}
          />
        </div>
        <div className="flex items-center justify-center h-full">
          <p className="text-sm" style={{ color: 'var(--surbee-fg-muted)' }}>
            {status === 'reconnecting' ? 'Reconnecting sandbox...' : status === 'creating' ? 'Building preview...' : 'Preparing sandbox...'}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (status === "error") {
    return (
      <div className={`h-full w-full bg-white dark:bg-[#0a0a0a] flex items-center justify-center ${className}`}>
        <div className="text-center px-6">
          <AlertCircle className="w-8 h-8 mx-auto mb-3 opacity-40" style={{ color: 'var(--surbee-fg-secondary)' }} />
          <p className="text-sm mb-2" style={{ color: "var(--surbee-fg-secondary)" }}>
            Failed to load preview
          </p>
          <p className="text-xs mb-4 max-w-md" style={{ color: "var(--surbee-fg-muted)" }}>
            {error || "Unknown error occurred"}
          </p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              background: "var(--surbee-button-primary-bg)",
              color: "var(--surbee-button-primary-fg)"
            }}
          >
            <RotateCcw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Ready state — show iframe
  return (
    <div className={`h-full w-full bg-white dark:bg-[#0a0a0a] relative flex flex-col ${className}`}>
      {activeUrl && (
        <>
          <iframe
            ref={iframeRef}
            src={activeUrl}
            className="w-full flex-1 border-none"
            title="Survey Preview"
            referrerPolicy="no-referrer"
            allow="clipboard-write"
          />

          {/* Shareable link bar */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 border-t text-xs"
            style={{
              borderColor: 'var(--surbee-border-secondary, rgba(255,255,255,0.08))',
              backgroundColor: 'var(--surbee-bg-secondary, #141414)',
              color: 'var(--surbee-fg-muted)',
            }}
          >
            <span className="truncate flex-1 font-mono select-all" title={activeUrl}>
              {activeUrl}
            </span>
            <button
              onClick={handleCopyUrl}
              className="shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
              title="Copy URL"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <a
              href={activeUrl}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
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

export default ModalSandboxPreview;
