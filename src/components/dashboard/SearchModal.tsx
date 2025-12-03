"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay to trigger animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      // Wait for close animation to finish before unmounting
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 150); // Fast close animation
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        opacity: isAnimating ? 1 : 0,
        transitionDuration: isAnimating ? '300ms' : '150ms',
      }}
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-[900px] max-h-[80vh] overflow-auto transition-all"
        style={{
          backgroundColor: 'rgb(19, 19, 20)',
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
          className="absolute top-6 right-6 flex items-center justify-center w-9 h-9 rounded-full transition-colors"
          style={{ backgroundColor: 'rgba(232, 232, 232, 0.06)' }}
          onClick={onClose}
        >
          <X size={20} style={{ color: 'var(--surbee-fg-primary)' }} />
        </button>

        {/* Title */}
        <h2
          className="font-bold text-lg mb-5"
          style={{ color: 'var(--surbee-fg-primary)', lineHeight: 1.4 }}
        >
          Search
        </h2>

        {/* Search Input */}
        <div className="relative flex items-center mb-4">
          <svg
            className="absolute left-4 pointer-events-none"
            height="16"
            width="16"
            fill="currentColor"
            viewBox="0 0 16 16"
            style={{ color: 'rgba(232, 232, 232, 0.4)' }}
          >
            <path d="M1.719 6.484a5.35 5.35 0 0 0 5.344 5.344 5.3 5.3 0 0 0 3.107-1.004l3.294 3.301a.8.8 0 0 0 .57.228c.455 0 .77-.342.77-.79a.77.77 0 0 0-.221-.55L11.308 9.72a5.28 5.28 0 0 0 1.098-3.235 5.35 5.35 0 0 0-5.344-5.343A5.35 5.35 0 0 0 1.72 6.484m1.145 0a4.2 4.2 0 0 1 4.199-4.198 4.2 4.2 0 0 1 4.198 4.198 4.2 4.2 0 0 1-4.198 4.199 4.2 4.2 0 0 1-4.2-4.199" />
          </svg>
          <input
            type="text"
            className="w-full h-10 py-2 px-10 text-sm rounded-full transition-all duration-200"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid rgba(232, 232, 232, 0.15)',
              color: 'var(--surbee-fg-primary)',
            }}
            placeholder="Search surveys or templates"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          <button
            className="absolute right-2 flex items-center justify-center w-6 h-6 rounded-full transition-opacity"
            style={{ opacity: searchQuery ? 1 : 0.2 }}
            disabled={!searchQuery}
          >
            <svg height="22" width="22" fill="currentColor" viewBox="0 0 22 22">
              <path
                clipRule="evenodd"
                d="M0.753966 11.0005C0.753966 16.5955 5.39454 21.2461 10.9995 21.2461C16.5943 21.2461 21.245 16.5954 21.245 11.0005C21.245 5.39564 16.6044 0.75502 11.0095 0.75502C5.40457 0.755021 0.753965 5.39564 0.753966 11.0005ZM16.0216 10.3879C16.2325 10.5988 16.3129 10.7595 16.3129 10.9905C16.3129 11.2215 16.2124 11.4024 16.0216 11.5932L12.526 15.0988C12.3854 15.2394 12.2046 15.3198 11.9836 15.3198C11.5517 15.3198 11.2303 14.9883 11.2303 14.5564C11.2303 14.3354 11.3207 14.1445 11.4613 14.0039L12.747 12.7283L14.0026 11.6836L11.8028 11.764L6.4289 11.764C5.9669 11.764 5.64547 11.4426 5.64547 10.9905C5.64547 10.5284 5.97693 10.207 6.4289 10.207L11.8028 10.207L13.9926 10.2974L12.747 9.25279L11.4613 7.97712C11.3307 7.82645 11.2303 7.6356 11.2303 7.41462C11.2303 6.9827 11.5517 6.66127 11.9836 6.66127C12.2046 6.66127 12.3854 6.73159 12.526 6.87221L16.0216 10.3879Z"
                fillRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Filter buttons - hidden for now */}
        {/* <div className="flex flex-wrap gap-3 mb-8">
          ... filters hidden ...
        </div> */}

        {/* Recent searches */}
        <div>
          <p className="text-sm font-bold mb-4" style={{ color: 'var(--surbee-fg-primary)' }}>
            Recent searches
          </p>

          {/* Empty state */}
          <div
            className="flex flex-col items-center justify-center py-12 text-center"
            style={{ color: 'rgba(232, 232, 232, 0.4)' }}
          >
            <svg height="48" width="48" fill="currentColor" viewBox="0 0 16 16" className="mb-4 opacity-30">
              <path d="M1.719 6.484a5.35 5.35 0 0 0 5.344 5.344 5.3 5.3 0 0 0 3.107-1.004l3.294 3.301a.8.8 0 0 0 .57.228c.455 0 .77-.342.77-.79a.77.77 0 0 0-.221-.55L11.308 9.72a5.28 5.28 0 0 0 1.098-3.235 5.35 5.35 0 0 0-5.344-5.343A5.35 5.35 0 0 0 1.72 6.484m1.145 0a4.2 4.2 0 0 1 4.199-4.198 4.2 4.2 0 0 1 4.198 4.198 4.2 4.2 0 0 1-4.198 4.199 4.2 4.2 0 0 1-4.2-4.199" />
            </svg>
            <p className="text-sm">No recent searches</p>
          </div>
        </div>
      </div>
    </div>
  );
}
