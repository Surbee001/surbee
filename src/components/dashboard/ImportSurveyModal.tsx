"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Link2 } from "lucide-react";

interface ImportSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport?: (url: string) => void | Promise<void>;
}

export function ImportSurveyModal({ isOpen, onClose, onImport }: ImportSurveyModalProps) {
  const [url, setUrl] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setError(null);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setUrl("");
        setError(null);
        setIsImporting(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleGenerate = async () => {
    if (!url.trim()) return;

    setIsImporting(true);
    setError(null);

    try {
      // Call the import handler (it's now async and handles redirect)
      await onImport?.(url.trim());
      // Don't close modal immediately - let the redirect happen
      // onClose will be called automatically when component unmounts
    } catch (err: any) {
      console.error('Import error:', err);
      setError(err.message || 'Failed to import survey. Please try again.');
      setIsImporting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && url.trim()) {
      handleGenerate();
    }
  };

  if (!shouldRender) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        opacity: isAnimating ? 1 : 0,
        transitionDuration: isAnimating ? '300ms' : '150ms',
      }}
      onClick={isImporting ? undefined : onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-[500px] overflow-hidden transition-all"
        style={{
          backgroundColor: 'var(--surbee-dropdown-bg)',
          borderRadius: '40px',
          padding: '28px 36px 36px',
          boxShadow: '0 0 4px 0 rgba(0,0,0,0.04), 0 12px 32px 0 rgba(0,0,0,0.08)',
          opacity: isAnimating ? 1 : 0,
          transform: isAnimating ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(10px)',
          transitionDuration: isAnimating ? '300ms' : '150ms',
          transitionTimingFunction: isAnimating ? 'cubic-bezier(0.16, 1, 0.3, 1)' : 'ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          className="absolute top-6 right-6 flex items-center justify-center w-9 h-9 rounded-full transition-colors disabled:opacity-50"
          style={{ backgroundColor: 'var(--surbee-accent-subtle)' }}
          onClick={onClose}
          disabled={isImporting}
        >
          <X size={20} style={{ color: 'var(--surbee-fg-primary)' }} />
        </button>

        {/* Title */}
        <h2
          className="font-bold text-lg mb-2"
          style={{ color: 'var(--surbee-fg-primary)', lineHeight: 1.4 }}
        >
          Import Survey
        </h2>

        {/* Description */}
        <p 
          className="text-sm mb-5"
          style={{ color: 'var(--surbee-fg-secondary)' }}
        >
          Paste a survey link from Google Forms, Typeform, SurveyMonkey, or any other platform. We&apos;ll analyze it and create a Surbee version.
        </p>

        {/* URL Input */}
        <div className="relative flex items-center mb-4">
          <Link2 
            size={16} 
            className="absolute left-4 pointer-events-none"
            style={{ color: 'var(--surbee-fg-muted)' }}
          />
          <input
            type="url"
            className="w-full h-11 py-2 pl-11 pr-4 text-sm rounded-full transition-all duration-200"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid var(--surbee-dropdown-border)',
              color: 'var(--surbee-fg-primary)',
            }}
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>

        {/* Error message */}
        {error && (
          <p className="text-sm text-red-400 mb-3 text-center">{error}</p>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!url.trim() || isImporting}
          className="w-full h-11 rounded-full font-medium text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: url.trim() ? 'var(--surbee-fg-primary)' : 'var(--surbee-accent-subtle)',
            color: url.trim() ? 'var(--surbee-bg-primary)' : 'var(--surbee-fg-muted)',
          }}
        >
          {isImporting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Importing survey...
            </span>
          ) : (
            'Import'
          )}
        </button>
      </div>
    </div>
  );
}
