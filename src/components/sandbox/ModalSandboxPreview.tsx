"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { RotateCcw, Loader2 } from "lucide-react";

interface SandboxBundle {
  files: Record<string, string>;
  entry: string;
  dependencies?: string[];
  devDependencies?: string[];
}

interface ModalSandboxPreviewProps {
  bundle: SandboxBundle | null;
  refreshKey?: number;
  className?: string;
  onScreenshotReady?: (blob: Blob) => void;
  onPreviewUrlReady?: (url: string) => void;
  projectId?: string;
}

type SandboxStatus =
  | "idle"
  | "creating"
  | "starting"
  | "ready"
  | "error";

export function ModalSandboxPreview({
  bundle,
  refreshKey = 0,
  className = "",
  onScreenshotReady,
  onPreviewUrlReady,
  projectId,
}: ModalSandboxPreviewProps) {
  const [status, setStatus] = useState<SandboxStatus>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const sandboxIdRef = useRef<string>("");
  const screenshotTakenRef = useRef<boolean>(false);
  const isCreatingRef = useRef<boolean>(false); // Guard against concurrent creations
  const lastBundleHashRef = useRef<string>(""); // Track bundle changes

  // Generate unique sandbox ID
  const generateSandboxId = useCallback(() => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${projectId || 'preview'}-${timestamp}-${random}`;
  }, [projectId]);

  // Hash bundle to detect real changes
  const getBundleHash = useCallback((b: SandboxBundle | null) => {
    if (!b) return "";
    return JSON.stringify(Object.keys(b.files).sort());
  }, []);

  // Capture screenshot when iframe loads
  const captureScreenshot = useCallback(async () => {
    if (!iframeRef.current || !onScreenshotReady || screenshotTakenRef.current) return;

    // Wait for content to fully render
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      // Use html2canvas if available, otherwise skip
      const html2canvas = (await import('html2canvas')).default;
      const iframe = iframeRef.current;
      const canvas = await html2canvas(iframe, {
        useCORS: true,
        allowTaint: true,
        width: 1200,
        height: 900,
        scale: 2,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          screenshotTakenRef.current = true;
          onScreenshotReady(blob);
        }
      }, 'image/png');
    } catch (err) {
      console.log('[ModalSandbox] Screenshot capture failed:', err);
    }
  }, [onScreenshotReady]);

  // Create sandbox
  const createSandbox = useCallback(async () => {
    // Guard against concurrent creations
    if (isCreatingRef.current) {
      console.log("[ModalSandbox] Already creating, skipping duplicate request");
      return;
    }

    if (!bundle || Object.keys(bundle.files).length === 0) {
      console.log("[ModalSandbox] No bundle or empty files, skipping");
      return;
    }

    // Check if bundle actually changed
    const currentHash = getBundleHash(bundle);
    if (currentHash === lastBundleHashRef.current && previewUrl) {
      console.log("[ModalSandbox] Bundle unchanged, using existing preview");
      setStatus("ready");
      return;
    }

    try {
      isCreatingRef.current = true;
      setStatus("creating");
      setError(null);
      screenshotTakenRef.current = false;

      const sandboxId = generateSandboxId();
      sandboxIdRef.current = sandboxId;
      lastBundleHashRef.current = currentHash;

      console.log(`[ModalSandbox] Creating sandbox ${sandboxId}...`);
      console.log(`[ModalSandbox] Files: ${Object.keys(bundle.files).join(', ')}`);

      const response = await fetch('/api/sandbox/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: bundle.files,
          sandbox_id: sandboxId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      if (!result.preview_url) {
        throw new Error('No preview URL returned');
      }

      console.log(`[ModalSandbox] Preview ready: ${result.preview_url}`);
      setPreviewUrl(result.preview_url);
      setStatus("ready");

      // Notify parent of the preview URL
      if (onPreviewUrlReady) {
        onPreviewUrlReady(result.preview_url);
      }

    } catch (err) {
      console.error("[ModalSandbox] Error:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      setStatus("error");
    } finally {
      isCreatingRef.current = false;
    }
  }, [bundle, generateSandboxId, getBundleHash, previewUrl]);

  // Initial setup - only run once when bundle first becomes available
  useEffect(() => {
    if (bundle && status === "idle" && !isCreatingRef.current) {
      createSandbox();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bundle]); // Only depend on bundle, not createSandbox to avoid loops

  // Handle refresh key changes
  useEffect(() => {
    if (refreshKey > 0) {
      // Reset state and create new sandbox
      lastBundleHashRef.current = ""; // Force recreation
      setStatus("idle");
      setPreviewUrl(null);
      setError(null);
      // Trigger creation after state reset
      setTimeout(() => {
        if (bundle && !isCreatingRef.current) {
          createSandbox();
        }
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  // Handle retry
  const handleRetry = useCallback(() => {
    lastBundleHashRef.current = ""; // Force recreation
    setStatus("idle");
    setPreviewUrl(null);
    setError(null);
    setTimeout(() => createSandbox(), 100);
  }, [createSandbox]);

  // Render loading state
  if (status !== "ready" && status !== "error") {
    const statusMessages: Record<SandboxStatus, string> = {
      idle: "Initializing...",
      creating: "Creating sandbox...",
      starting: "Starting server...",
      ready: "Ready",
      error: "Error"
    };

    return (
      <div className={`h-full w-full bg-[#0a0a0a] flex flex-col items-center justify-center ${className}`}>
        <Loader2
          className="w-8 h-8 animate-spin mb-4"
          style={{ color: "rgba(232, 232, 232, 0.6)" }}
        />
        <p
          className="text-sm font-medium"
          style={{ color: "rgba(232, 232, 232, 0.8)" }}
        >
          {statusMessages[status]}
        </p>
      </div>
    );
  }

  // Render error state
  if (status === "error") {
    return (
      <div className={`h-full w-full bg-[#0a0a0a] flex items-center justify-center ${className}`}>
        <div className="text-center px-6">
          <p
            className="text-sm mb-2"
            style={{ color: "rgba(232, 232, 232, 0.8)" }}
          >
            Failed to load preview
          </p>
          <p
            className="text-xs mb-4 max-w-md"
            style={{ color: "rgba(232, 232, 232, 0.5)" }}
          >
            {error || "Unknown error occurred"}
          </p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              background: "#E8E8E8",
              color: "rgb(19, 19, 20)"
            }}
          >
            <RotateCcw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render preview iframe
  return (
    <div className={`h-full w-full bg-[#0a0a0a] ${className}`}>
      {previewUrl ? (
        <iframe
          ref={iframeRef}
          src={previewUrl}
          className="w-full h-full border-none"
          title="Survey Preview"
          sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
          onLoad={captureScreenshot}
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center">
          <Loader2
            className="w-6 h-6 animate-spin"
            style={{ color: "rgba(232, 232, 232, 0.4)" }}
          />
        </div>
      )}
    </div>
  );
}

export default ModalSandboxPreview;
