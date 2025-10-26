import React, { useState, useRef, useEffect } from 'react';

interface AIInsightDotProps {
  summary: string;
}

export const AIInsightDot: React.FC<AIInsightDotProps> = ({ summary }) => {
  const [showSummary, setShowSummary] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const dotRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (showSummary && dotRef.current) {
      const rect = dotRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top,
        left: rect.left + rect.width + 8,
      });
    }
  }, [showSummary]);

  return (
    <>
      {/* Pulsing White Dot with Line */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {showSummary && (
          <div style={{
            width: '24px',
            height: '1px',
            background: 'rgba(255, 255, 255, 0.3)',
          }} />
        )}

        <button
          ref={dotRef}
          onClick={(e) => {
            e.stopPropagation();
            setShowSummary(!showSummary);
          }}
          style={{
            position: 'relative',
            width: '8px',
            height: '8px',
            background: 'white',
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            flexShrink: 0,
          }}
        >
          {/* Pulsing animation rings */}
          <span style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'white',
            transform: 'translate(-50%, -50%)',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            opacity: 0.75,
          }} />
          <span style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'white',
            transform: 'translate(-50%, -50%)',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            animationDelay: '1s',
            opacity: 0.75,
          }} />
        </button>
      </div>

      {/* AI Summary Tooltip */}
      {showSummary && (
        <>
          {/* Invisible backdrop to close tooltip */}
          <div
            onClick={() => setShowSummary(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
            }}
          />

          {/* Tooltip Card */}
          <div style={{
            position: 'fixed',
            top: `${position.top}px`,
            left: `${position.left}px`,
            transform: 'translateY(-50%)',
            maxWidth: '400px',
            width: 'max-content',
            zIndex: 1000,
            animation: 'tooltipSlideIn 0.2s ease-out',
          }}>
            <div style={{
              background: 'rgba(26, 26, 26, 0.98)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '12px',
              padding: '16px 20px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            }}>
              <p style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '13px',
                lineHeight: '1.6',
                margin: 0,
                whiteSpace: 'pre-wrap',
              }}>
                {summary}
              </p>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.75;
          }
          50% {
            transform: translate(-50%, -50%) scale(2.5);
            opacity: 0;
          }
        }

        @keyframes tooltipSlideIn {
          from {
            opacity: 0;
            transform: translateY(-50%) translateX(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(-50%) translateX(0);
          }
        }
      `}</style>
    </>
  );
};
