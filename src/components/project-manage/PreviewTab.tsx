"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface SandboxBundle {
  files: Record<string, string>;
  entry: string;
  dependencies?: string[];
  devDependencies?: string[];
}

interface PreviewTabProps {
  projectId: string;
  sandboxBundle?: SandboxBundle | null;
  activeChatSessionId?: string | null;
}

// Generate standalone HTML for the survey (same as in /s/[url] page)
function generateSurveyHtml(bundle: SandboxBundle): string {
  const files = bundle.files;

  // Find the main App component
  let appCode = files['/App.tsx'] || files['App.tsx'] || files['/App.jsx'] || files['App.jsx'] || '';

  // Find any CSS
  let cssCode = files['/styles.css'] || files['styles.css'] || files['/index.css'] || files['index.css'] || '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Survey Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    html, body, #root { margin: 0; padding: 0; min-height: 100vh; width: 100%; }
    ${cssCode}
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-type="module">
    const { useState, useEffect, useRef, useCallback } = React;

    // Lucide icons as simple SVG components
    const ChevronRight = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m9 18 6-6-6-6"/></svg>
    );
    const ChevronLeft = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m15 18-6-6 6-6"/></svg>
    );
    const Check = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 6 9 17l-5-5"/></svg>
    );
    const Star = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
    );
    const Send = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
    );
    const ArrowRight = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
    );
    const ArrowLeft = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
    );

    // Simple motion wrapper (no-op for animations)
    const motion = {
      div: ({ children, ...props }) => <div {...props}>{children}</div>,
      button: ({ children, ...props }) => <button {...props}>{children}</button>,
      span: ({ children, ...props }) => <span {...props}>{children}</span>,
      p: ({ children, ...props }) => <p {...props}>{children}</p>,
    };
    const AnimatePresence = ({ children }) => children;

    // Helper to send responses to parent
    const sendResponse = (responses) => {
      window.parent.postMessage({ type: 'SURVEY_COMPLETE', responses }, '*');
    };

    ${appCode
      .replace(/import\s+.*?from\s+['"].*?['"];?\n?/g, '')
      .replace(/export\s+default\s+/g, 'const App = ')
      .replace(/export\s+/g, 'const ')
    }

    ReactDOM.createRoot(document.getElementById('root')).render(<App />);
  </script>
</body>
</html>`;
}

export const PreviewTab: React.FC<PreviewTabProps> = ({ projectId, sandboxBundle }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [iframeHtml, setIframeHtml] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Generate iframe HTML from sandbox bundle
  useEffect(() => {
    if (sandboxBundle?.files) {
      const html = generateSurveyHtml(sandboxBundle);
      setIframeHtml(html);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [sandboxBundle]);

  // No sandbox bundle - show placeholder
  if (!sandboxBundle?.files) {
    return (
      <div className="preview-root">
        <div className="empty-state">
          <h3>No Survey Generated Yet</h3>
          <p>Create your survey using the AI chat to see a preview here.</p>
        </div>

        <style jsx>{`
          .preview-root {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--surbee-bg-primary, #131314);
            margin: -24px;
          }

          .empty-state {
            text-align: center;
            color: var(--surbee-fg-muted, #888);
          }

          .empty-state h3 {
            color: var(--surbee-fg-primary, #E8E8E8);
            font-size: 18px;
            font-weight: 500;
            margin: 0 0 8px 0;
          }

          .empty-state p {
            font-size: 14px;
            margin: 0;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="preview-root">
      <div className="preview-container">
        <div className="preview-frame">
          {isLoading && (
            <div className="loading-overlay">
              <Loader2 className="loading-spinner" size={32} />
              <span>Loading survey...</span>
            </div>
          )}
          {iframeHtml && (
            <iframe
              ref={iframeRef}
              srcDoc={iframeHtml}
              className="preview-iframe"
              onLoad={() => setIsLoading(false)}
              title="Survey Preview"
              sandbox="allow-scripts allow-forms allow-same-origin"
            />
          )}
        </div>
      </div>

      <style jsx>{`
        .preview-root {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          background: var(--surbee-bg-primary, #131314);
          overflow: hidden;
          margin: -24px;
        }

        .preview-container {
          flex: 1;
          display: flex;
          overflow: hidden;
          background: var(--surbee-bg-primary, #131314);
        }

        .preview-frame {
          position: relative;
          width: 100%;
          height: 100%;
          background: white;
          overflow: hidden;
        }

        .preview-iframe {
          width: 100%;
          height: 100%;
          border: none;
          display: block;
        }

        .loading-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          background: var(--surbee-bg-secondary, #1E1E1F);
          color: var(--surbee-fg-muted, #888);
          font-size: 14px;
          z-index: 10;
        }

        .loading-overlay :global(.loading-spinner) {
          animation: spin 1s linear infinite;
          color: var(--surbee-fg-primary, #E8E8E8);
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PreviewTab;
