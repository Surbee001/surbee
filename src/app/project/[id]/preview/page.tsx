"use client";

import React, { useEffect, useState } from 'react';
import { SandpackProvider, SandpackPreview } from '@codesandbox/sandpack-react';
import { useAuth } from '@/lib/auth-context';

interface PreviewPageProps {
  params: {
    id: string;
  };
}

interface SandboxBundle {
  files: Record<string, string>;
  entry: string;
  dependencies?: string[];
  devDependencies?: string[];
}

export default function PreviewPage({ params }: PreviewPageProps) {
  const resolvedParams = (params && typeof params.then === 'function') ? (React as any).use(params) : params
  const projectId: string | undefined = resolvedParams?.id
  const { user } = useAuth();

  const [sandboxBundle, setSandboxBundle] = useState<SandboxBundle | null>(null);
  const [activeChatSessionId, setActiveChatSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjectData = async () => {
      if (!projectId) {
        setError('No project ID provided');
        setIsLoading(false);
        return;
      }

      if (!user?.id) {
        setError('Please log in to view this preview');
        setIsLoading(false);
        return;
      }

      try {
        // Fetch project data from API
        const response = await fetch(`/api/projects/${projectId}?userId=${user.id}`);

        if (!response.ok) {
          throw new Error('Failed to load project');
        }

        const data = await response.json();

        if (data.project?.sandbox_bundle) {
          console.log('=== PREVIEW: Loaded sandbox bundle from database ===');
          setSandboxBundle(data.project.sandbox_bundle);
          // Also load the active chat session ID for "Continue Editing"
          if (data.project.active_chat_session_id) {
            setActiveChatSessionId(data.project.active_chat_session_id);
          }
        } else {
          console.log('=== PREVIEW: No sandbox bundle found ===');
          setError('No survey generated yet. Please create a survey first.');
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Survey Found</h2>
          <p className="text-gray-600 mb-6">{error || 'No sandbox bundle available'}</p>
          <a
            href={`/project/${projectId}`}
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Project
          </a>
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
    <div className="min-h-screen bg-gray-50">
      {/* Preview Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-gray-900">Survey Preview</h1>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              Live Preview
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={activeChatSessionId ? `/project/${projectId}?sessionId=${activeChatSessionId}` : `/project/${projectId}`}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Continue Editing
            </a>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Survey Content - Full Screen Sandbox */}
      <div className="h-[calc(100vh-73px)]">
        <SandpackProvider
          template="react-ts"
          theme="dark"
          files={sandpackFiles}
          customSetup={{
            entry: "/index.tsx",
            dependencies: {
              react: "19.1.0",
              "react-dom": "19.1.0",
              "lucide-react": "^0.454.0",
              ...(sandboxBundle.dependencies?.reduce((acc, dep) => {
                acc[dep] = "latest";
                return acc;
              }, {} as Record<string, string>) || {}),
            },
          }}
          options={{
            autorun: true,
            recompileMode: "immediate",
            externalResources: [
              "https://cdn.tailwindcss.com?plugins=forms,typography",
              "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
            ],
          }}
        >
          <SandpackPreview
            style={{ height: '100%', width: '100%' }}
            showOpenInCodeSandbox={false}
            showRefreshButton={false}
          />
        </SandpackProvider>
      </div>
    </div>
  );
}