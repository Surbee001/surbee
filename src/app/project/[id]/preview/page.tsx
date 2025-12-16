"use client";

import React, { useEffect, useState, useRef } from 'react';
import { SandpackProvider, SandpackPreview } from '@codesandbox/sandpack-react';
import { useAuth } from '@/contexts/AuthContext';

interface PreviewPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface SandboxBundle {
  files: Record<string, string>;
  entry: string;
  dependencies?: string[];
  devDependencies?: string[];
}

export default function PreviewPage({ params }: PreviewPageProps) {
  const resolvedParams = React.use(params);
  const projectId: string | undefined = resolvedParams?.id
  const { user } = useAuth();

  const [sandboxBundle, setSandboxBundle] = useState<SandboxBundle | null>(null);
  const [activeChatSessionId, setActiveChatSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const loadProjectData = async () => {
      if (!projectId) {
        setError('No project ID provided');
        setIsLoading(false);
        return;
      }

      // Allow public access for survey previews - no authentication required
      // This allows creators to share preview links with others

      try {
        // Fetch project data from API
        const response = await fetch(`/api/projects/${projectId}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('=== PREVIEW: API error ===', response.status, errorData);

          if (response.status === 401) {
            setError('Please log in to view this preview');
          } else if (response.status === 404) {
            setError('Project not found');
          } else {
            setError(errorData.message || errorData.error || 'Failed to load project');
          }
          return;
        }

        const data = await response.json();
        console.log('=== PREVIEW: API Response ===', {
          hasProject: !!data.project,
          hasSandboxBundle: !!data.project?.sandbox_bundle,
          sandboxBundleKeys: data.project?.sandbox_bundle ? Object.keys(data.project.sandbox_bundle) : null,
          projectStatus: data.project?.status
        });

        if (data.project?.sandbox_bundle) {
          console.log('=== PREVIEW: Loaded sandbox bundle from database ===');
          setSandboxBundle(data.project.sandbox_bundle);
          // Also load the active chat session ID for "Continue Editing"
          if (data.project.active_chat_session_id) {
            setActiveChatSessionId(data.project.active_chat_session_id);
          }
        } else {
          // Fallback: try to load from localStorage if database doesn't have it
          console.log('=== PREVIEW: No sandbox bundle in database, trying localStorage ===');
          const localKey = `surbee_survey_${projectId}`;
          const localData = localStorage.getItem(localKey);
          if (localData) {
            try {
              const surveyData = JSON.parse(localData);
              console.log('=== PREVIEW: Found data in localStorage ===');
              // Convert survey data to sandbox bundle format (this is a fallback)
              setSandboxBundle({
                files: {
                  '/App.tsx': `export default function App() { return ${JSON.stringify(surveyData)}; }`,
                },
                entry: '/App.tsx',
                dependencies: ['react', 'react-dom']
              });
            } catch (e) {
              console.error('=== PREVIEW: Failed to parse localStorage data ===', e);
            }
          } else {
            console.log('=== PREVIEW: No data found in localStorage either ===');
            setError('No survey generated yet. Please create a survey first.');
          }
        }
      } catch (err) {
        console.error('=== PREVIEW: Error loading project data ===', err);
        setError('Error loading survey preview');
      } finally {
        setIsLoading(false);
      }
    };

    loadProjectData();
  }, [projectId, user?.id]);

  // Listen for messages from the iframe (for survey completions)
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Handle survey completion from iframe
      if (event.data?.type === 'SURVEY_COMPLETE' || event.data?.type === 'survey-response') {
        const responses = event.data.responses || event.data.data;

        if (projectId && responses) {
          try {
            console.log('=== PREVIEW: Saving preview response ===', responses);
            await fetch(`/api/projects/${projectId}/responses`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                responses,
                completed_at: new Date().toISOString(),
                is_preview: true, // Mark as preview response
                user_id: user?.id || null, // Associate with user if logged in
              }),
            });
            console.log('=== PREVIEW: Preview response saved ===');
          } catch (err) {
            console.error('=== PREVIEW: Error saving preview response ===', err);
          }
        }

        setIsCompleted(true);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [projectId, user?.id]);

  // Show completion message overlay
  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-slate-800 mb-3">Survey Completed!</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Thank you for testing this survey. Your responses have been recorded for review.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-block px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
          >
            Take Survey Again
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading survey preview...</p>
        </div>
      </div>
    );
  }

  if (error || !sandboxBundle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 border-2 border-slate-300 rounded"></div>
          </div>
          <h2 className="text-2xl font-semibold text-slate-800 mb-3">Survey Not Available</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            {error || 'This survey preview is not available. The survey may not be generated yet or there may be an issue loading it.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
            >
              Try Again
            </button>
            <a
              href="/"
              className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Go Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Convert sandbox bundle to Sandpack files format
  const sandpackFiles: Record<string, string> = {};
  Object.entries(sandboxBundle.files).forEach(([path, content]) => {
    sandpackFiles[path] = content;
  });

  return (
    <div className="min-h-screen">
      <SandpackProvider
        template="react-ts"
        theme="dark"
        files={sandpackFiles}
        customSetup={{
          entry: "/index.tsx",
          dependencies: {
            react: "18.2.0", // Use stable version for faster loading
            "react-dom": "18.2.0",
            // Remove lucide-react for faster loading
            ...(sandboxBundle.dependencies?.reduce((acc, dep) => {
              acc[dep] = "latest";
              return acc;
            }, {} as Record<string, string>) || {}),
          },
        }}
        options={{
          autorun: true,
          recompileMode: "delayed", // Changed for better performance
          recompileDelay: 500,
          externalResources: [
            "https://cdn.tailwindcss.com?plugins=forms", // Removed typography for faster loading
            "https://fonts.googleapis.com/css2?family=Inter:wght@400&display=swap", // Only regular weight
          ],
        }}
      >
        <SandpackPreview
          ref={iframeRef}
          style={{ height: '100vh', width: '100vw' }}
          showOpenInCodeSandbox={false}
          showRefreshButton={false}
        />
      </SandpackProvider>
    </div>
  );
}