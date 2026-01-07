import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface SandboxBundle {
  files: Record<string, string>;
  entry: string;
  dependencies?: string[];
  devDependencies?: string[];
}

/**
 * GET /api/projects/[id]/preview-render
 * Renders a survey preview page that can be captured by screenshot APIs.
 * This endpoint doesn't require the project to be published.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: projectId } = await context.params;

    // Get the project with sandbox bundle
    const { data: project, error } = await supabaseAdmin
      .from('projects')
      .select('id, title, sandbox_bundle, survey_schema')
      .eq('id', projectId)
      .single();

    if (error || !project) {
      return new NextResponse(
        generateErrorHtml('Survey not found'),
        {
          status: 404,
          headers: { 'Content-Type': 'text/html' }
        }
      );
    }

    if (!project.sandbox_bundle) {
      return new NextResponse(
        generateErrorHtml('Survey has no content yet'),
        {
          status: 404,
          headers: { 'Content-Type': 'text/html' }
        }
      );
    }

    // Generate the survey HTML
    const html = generateSurveyHtml(project.sandbox_bundle as SandboxBundle, project.title);

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  } catch (error) {
    console.error('Error rendering preview:', error);
    return new NextResponse(
      generateErrorHtml('Failed to load survey'),
      {
        status: 500,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

function generateErrorHtml(message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Survey Preview</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #0d0d0d 100%);
      font-family: system-ui, -apple-system, sans-serif;
      color: #888;
    }
    .error-container {
      text-align: center;
      padding: 40px;
    }
    .error-icon {
      width: 64px;
      height: 64px;
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      margin: 0 auto 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .error-icon svg {
      width: 32px;
      height: 32px;
      stroke: rgba(255, 255, 255, 0.3);
    }
    h1 {
      font-size: 20px;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.7);
      margin: 0 0 8px;
    }
    p {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.4);
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="error-container">
    <div class="error-icon">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    </div>
    <h1>Preview Not Available</h1>
    <p>${message}</p>
  </div>
</body>
</html>`;
}

function generateSurveyHtml(bundle: SandboxBundle, title?: string): string {
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
  <title>${title || 'Survey'}</title>
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

    // Helper to send responses to parent (no-op for preview)
    const sendResponse = (responses) => {
      console.log('Survey preview - responses:', responses);
    };

    // Listen for navigation commands from parent (for route dropdown)
    window.addEventListener('message', (e) => {
      if (e.data?.type === 'deepsite:navigateTo' && typeof e.data.path === 'string') {
        window.dispatchEvent(new CustomEvent('deepsite:navigateTo', { detail: e.data.path }));
      }
    });

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
