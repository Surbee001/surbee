'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2 } from 'lucide-react';
import { RegisteredComponent } from '@/contexts/ComponentRegistry';
import { serializeComponentForAnalysis } from '@/lib/services/component-detection';
import { useAuth } from '@/contexts/AuthContext';

interface AnalysisPopupProps {
  dotId: string;
  projectId: string;
  component: RegisteredComponent | null;
  onClose: () => void;
  position: { x: number; y: number };
}

export function AnalysisPopup({
  dotId,
  projectId,
  component,
  onClose,
  position,
}: AnalysisPopupProps) {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch AI analysis
    if (user) {
      fetchAnalysis();
    }
  }, [component, projectId, user]);

  const fetchAnalysis = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    setAnalysis('');

    try {
      const context = component ? serializeComponentForAnalysis(component) : null;

      const response = await fetch(`/api/projects/${projectId}/ai-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          dotId,
          component: context,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analysis');
      }

      // Handle Vercel AI SDK data stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim() || line.startsWith(':')) continue;

          if (line.startsWith('0:')) {
            // Text chunk from Vercel AI SDK
            try {
              const text = JSON.parse(line.slice(2));
              setAnalysis((prev) => prev + text);
            } catch (e) {
              console.error('Error parsing text chunk:', e);
            }
          }
        }
      }

      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analysis');
      setIsLoading(false);
    }
  };

  // Auto-position to avoid edges
  const getPopupStyle = (): React.CSSProperties => {
    // Convert percentage position to pixels
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;

    const dotX = (position.x / 100) * viewportWidth;
    const dotY = (position.y / 100) * viewportHeight;

    const popupWidth = 350; // Average of min/max width
    const popupHeight = 400; // Max height
    const margin = 16;

    // Default: position to the right and below the dot
    let left = dotX + margin;
    let top = dotY + margin;

    // If it would overflow right edge, position to the left
    if (left + popupWidth > viewportWidth - margin) {
      left = dotX - popupWidth - margin;
    }

    // If it would overflow bottom edge, position above
    if (top + popupHeight > viewportHeight - margin) {
      top = dotY - popupHeight - margin;
    }

    // Ensure it doesn't go off the left edge
    if (left < margin) {
      left = margin;
    }

    // Ensure it doesn't go off the top edge
    if (top < margin) {
      top = margin;
    }

    return {
      position: 'fixed',
      left: `${left}px`,
      top: `${top}px`,
      maxWidth: '400px',
      minWidth: '300px',
      zIndex: 1001,
    };
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-1000"
        onClick={onClose}
      />

      {/* Popup */}
      <div
        ref={popupRef}
        style={getPopupStyle()}
        className="fixed z-1001"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="rounded-lg shadow-xl border border-white/10 max-h-[400px] flex flex-col"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div>
              <h3 className="text-white font-medium text-sm">
                {component ? component.label : 'Analysis'}
              </h3>
              {component && (
                <p className="text-white/50 text-xs mt-0.5 capitalize">
                  {component.type}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
            {isLoading && (
              <div className="flex items-center gap-2 text-white/60">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Analyzing...</span>
              </div>
            )}

            {error && (
              <div className="text-red-400 text-sm">
                {error}
              </div>
            )}

            {!isLoading && !error && !component && (
              <div className="text-white/60 text-sm">
                Position this dot over a component to analyze it.
              </div>
            )}

            {analysis && (
              <div className="text-white/90 text-sm prose prose-invert prose-sm max-w-none">
                <MarkdownRenderer content={analysis} />
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.4);
        }
      `}</style>
    </>
  );
}

// Simple Markdown renderer component
function MarkdownRenderer({ content }: { content: string }) {
  // Basic markdown parsing
  const parseMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let currentList: string[] = [];
    let listType: 'ul' | 'ol' | null = null;

    const flushList = () => {
      if (currentList.length > 0 && listType) {
        const ListTag = listType;
        elements.push(
          <ListTag key={elements.length} className="my-2 ml-4">
            {currentList.map((item, i) => (
              <li key={i} className="text-white/80">
                {item}
              </li>
            ))}
          </ListTag>
        );
        currentList = [];
        listType = null;
      }
    };

    lines.forEach((line, idx) => {
      // Headers
      if (line.startsWith('### ')) {
        flushList();
        elements.push(<h3 key={idx} className="text-white font-semibold mt-3 mb-1">{line.slice(4)}</h3>);
      } else if (line.startsWith('## ')) {
        flushList();
        elements.push(<h2 key={idx} className="text-white font-semibold text-base mt-3 mb-1">{line.slice(3)}</h2>);
      } else if (line.startsWith('# ')) {
        flushList();
        elements.push(<h1 key={idx} className="text-white font-bold text-lg mt-3 mb-1">{line.slice(2)}</h1>);
      }
      // Lists
      else if (line.match(/^[\-\*]\s/)) {
        if (listType !== 'ul') {
          flushList();
          listType = 'ul';
        }
        currentList.push(line.slice(2));
      } else if (line.match(/^\d+\.\s/)) {
        if (listType !== 'ol') {
          flushList();
          listType = 'ol';
        }
        currentList.push(line.replace(/^\d+\.\s/, ''));
      }
      // Code blocks
      else if (line.startsWith('```')) {
        flushList();
        // Skip for now
      }
      // Regular text
      else if (line.trim()) {
        flushList();
        // Handle inline formatting
        let formatted = line;
        // Bold
        formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        // Italic
        formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
        // Inline code
        formatted = formatted.replace(/`(.+?)`/g, '<code class="bg-white/10 px-1 rounded text-xs">$1</code>');

        elements.push(
          <p key={idx} className="text-white/80 my-1" dangerouslySetInnerHTML={{ __html: formatted }} />
        );
      } else {
        flushList();
      }
    });

    flushList();
    return elements;
  };

  return <div>{parseMarkdown(content)}</div>;
}
