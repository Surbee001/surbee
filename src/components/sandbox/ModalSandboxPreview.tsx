"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { RotateCcw, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SandboxBundle {
  files: Record<string, string>;
  entry: string;
  dependencies?: string[];
  devDependencies?: string[];
}

interface ModalSandboxPreviewProps {
  bundle?: SandboxBundle | null;
  refreshKey?: number;
  className?: string;
  onPreviewUrlReady?: (url: string) => void;
  projectId?: string;
}

type SandboxStatus = "idle" | "creating" | "updating" | "ready" | "error";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ModalSandboxPreview({
  bundle,
  refreshKey = 0,
  className = "",
  onPreviewUrlReady,
  projectId,
}: ModalSandboxPreviewProps) {
  const [status, setStatus] = useState<SandboxStatus>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const prevBundleRef = useRef<Record<string, string> | null>(null);
  const isCreatingRef = useRef(false);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup poll timer
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

  // Get auth token for API calls
  const getAuthHeaders = useCallback(async (): Promise<Record<string, string>> => {
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
    } catch {
      return { "Content-Type": "application/json" };
    }
  }, []);

  // Poll for sandbox readiness after spawn
  const pollForReady = useCallback(
    async (callId: string, pid: string) => {
      const headers = await getAuthHeaders();
      let attempts = 0;
      const maxAttempts = 90; // 3 minutes at 2s intervals

      if (pollTimerRef.current) clearInterval(pollTimerRef.current);

      pollTimerRef.current = setInterval(async () => {
        attempts++;
        if (attempts > maxAttempts) {
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);
          setError("Sandbox creation timed out after 3 minutes");
          setStatus("error");
          isCreatingRef.current = false;
          return;
        }

        try {
          const resp = await fetch(
            `/api/sandbox/poll?callId=${encodeURIComponent(callId)}&projectId=${encodeURIComponent(pid)}`,
            { headers }
          );
          const data = await resp.json();

          if (data.status === "ready") {
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
            setPreviewUrl(data.previewUrl);
            setStatus("ready");
            isCreatingRef.current = false;
            onPreviewUrlReady?.(data.previewUrl);
          } else if (data.status === "error") {
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
            setError(data.error || "Sandbox creation failed");
            setStatus("error");
            isCreatingRef.current = false;
          }
          // status === "creating" -> keep polling
        } catch {
          // Network error — keep polling
        }
      }, 2000);
    },
    [getAuthHeaders, onPreviewUrlReady]
  );

  // Create sandbox on first bundle
  const createSandbox = useCallback(
    async (files: Record<string, string>, entry?: string, deps?: string[]) => {
      if (isCreatingRef.current) return;
      isCreatingRef.current = true;
      setError(null);
      setStatus("creating");

      try {
        const headers = await getAuthHeaders();
        const resp = await fetch("/api/sandbox/create", {
          method: "POST",
          headers,
          body: JSON.stringify({
            projectId,
            files,
            entry,
            dependencies: deps,
          }),
        });

        if (!resp.ok) {
          const errData = await resp.json().catch(() => ({}));
          throw new Error(errData.error || `Failed to create sandbox (${resp.status})`);
        }

        const data = await resp.json();

        if (data.status === "ready") {
          // Existing sandbox was reused — immediately ready
          setPreviewUrl(data.previewUrl);
          setStatus("ready");
          prevBundleRef.current = { ...files };
          isCreatingRef.current = false;
          onPreviewUrlReady?.(data.previewUrl);
        } else if (data.status === "creating" && data.callId) {
          // Sandbox being created — start polling
          prevBundleRef.current = { ...files };
          pollForReady(data.callId, data.projectId || projectId || "");
        } else {
          throw new Error("Unexpected response from create API");
        }
      } catch (err) {
        console.error("[ModalSandbox] Create error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setStatus("error");
        isCreatingRef.current = false;
      }
    },
    [projectId, getAuthHeaders, onPreviewUrlReady, pollForReady]
  );

  // Update sandbox files on subsequent changes
  const updateSandbox = useCallback(
    async (files: Record<string, string>, entry?: string) => {
      setStatus("updating");

      try {
        // Diff files to only send changes
        const prev = prevBundleRef.current || {};
        const changes: Record<string, string> = {};
        for (const [path, content] of Object.entries(files)) {
          const normalizedPath = path.replace(/^\/+/, "");
          const normalizedPrev = prev[normalizedPath] || prev[`/${normalizedPath}`];
          if (normalizedPrev !== content) {
            changes[normalizedPath] = content;
          }
        }

        if (Object.keys(changes).length === 0) {
          setStatus("ready");
          return;
        }

        const headers = await getAuthHeaders();
        const resp = await fetch("/api/sandbox/update", {
          method: "POST",
          headers,
          body: JSON.stringify({
            projectId,
            files: changes,
            entry,
          }),
        });

        if (!resp.ok) {
          const errData = await resp.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to update sandbox");
        }

        prevBundleRef.current = { ...files };
        setStatus("ready");

        // Reload iframe to pick up HMR changes
        if (iframeRef.current && previewUrl) {
          setTimeout(() => {
            if (iframeRef.current) {
              iframeRef.current.src = previewUrl;
            }
          }, 500);
        }
      } catch (err) {
        console.error("[ModalSandbox] Update error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setStatus("error");
      }
    },
    [projectId, previewUrl, getAuthHeaders]
  );

  // Boot on first bundle
  useEffect(() => {
    if (!bundle || Object.keys(bundle.files).length === 0) return;
    if (status !== "idle") return;

    createSandbox(bundle.files, bundle.entry, bundle.dependencies);
  }, [bundle, status, createSandbox]);

  // Incremental updates on subsequent bundle changes
  useEffect(() => {
    if (status !== "ready" || !bundle) return;
    if (!prevBundleRef.current) return;

    const hasChanges = Object.entries(bundle.files).some(([path, content]) => {
      const normalized = path.replace(/^\/+/, "");
      const prev = prevBundleRef.current?.[normalized] || prevBundleRef.current?.[`/${normalized}`];
      return prev !== content;
    });

    if (hasChanges) {
      updateSandbox(bundle.files, bundle.entry);
    }
  }, [bundle, status, updateSandbox]);

  // Handle refreshKey — reload the iframe
  useEffect(() => {
    if (refreshKey > 0 && iframeRef.current && previewUrl) {
      iframeRef.current.src = previewUrl;
    }
  }, [refreshKey, previewUrl]);

  const handleRetry = useCallback(() => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    setStatus("idle");
    setPreviewUrl(null);
    setError(null);
    prevBundleRef.current = null;
    isCreatingRef.current = false;

    if (bundle && Object.keys(bundle.files).length > 0) {
      setTimeout(
        () => createSandbox(bundle.files, bundle.entry, bundle.dependencies),
        100
      );
    }
  }, [bundle, createSandbox]);

  // ------- Render -------

  // Loading states
  if (status === "idle" || status === "creating") {
    return (
      <div
        className={`h-full w-full flex items-center justify-center ${className}`}
        style={{
          backgroundColor: "var(--surbee-bg-primary, #ffffff)",
          border: "1px solid var(--surbee-border-primary, rgba(0,0,0,0.08))",
          borderRadius: "0.625rem",
        }}
      >
        <p className="text-sm" style={{ color: "var(--surbee-fg-muted)" }}>
          {status === "creating" ? "Starting sandbox..." : "Building"}
        </p>
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

  // Ready — show iframe (also during "updating" to avoid flicker)
  return (
    <div
      className={`h-full w-full bg-white dark:bg-[#0a0a0a] relative flex flex-col ${className}`}
    >
      {status === "updating" && (
        <div className="absolute top-2 right-2 z-10 px-2 py-1 rounded text-xs bg-black/50 text-white">
          Updating...
        </div>
      )}
      {previewUrl && (
        <iframe
          ref={iframeRef}
          src={previewUrl}
          className="w-full flex-1 border-none"
          title="Survey Preview"
          allow="clipboard-write"
        />
      )}
    </div>
  );
}

export default ModalSandboxPreview;
