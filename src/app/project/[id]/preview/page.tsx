"use client";

import React, { useEffect, useState } from 'react';
import { SurveyRenderer } from '@/components/SurveyRenderer-enhanced';
import { AIGenerationOutput } from '@/lib/schemas/survey-schemas';

interface PreviewPageProps {
  params: {
    id: string;
  };
}

export default function PreviewPage({ params }: PreviewPageProps) {
  const resolvedParams = (params && typeof params.then === 'function') ? (React as any).use(params) : params
  const projectId: string | undefined = resolvedParams?.id

  const [surveyData, setSurveyData] = useState<AIGenerationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get survey data from localStorage or session storage
    const loadSurveyData = () => {
      try {
        // Try multiple sources for survey data
        const sources = [
          `surbee_survey_${projectId}`,
          `surbee_latest_survey`,
          'surbee_preview_survey'
        ];

        for (const key of sources) {
          const storedData = localStorage.getItem(key);
          if (storedData) {
            const parsed = JSON.parse(storedData);
            console.log('=== PREVIEW: Loaded survey data from', key, '===');
            console.log('Survey title:', parsed?.survey?.title);
            console.log('Components:', parsed?.components?.length);
            setSurveyData(parsed);
            setIsLoading(false);
            return;
          }
        }

        // If no data found, show placeholder
        console.log('=== PREVIEW: No survey data found ===');
        setError('No survey data found. Please create a survey first.');
        setIsLoading(false);
      } catch (err) {
        console.error('=== PREVIEW: Error loading survey data ===', err);
        setError('Error loading survey data');
        setIsLoading(false);
      }
    };

    loadSurveyData();

    // Listen for storage changes to update preview in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.includes('surbee_survey')) {
        console.log('=== PREVIEW: Survey data updated ===');
        loadSurveyData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check every 2 seconds for updates (for same-tab updates)
    const interval = setInterval(loadSurveyData, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [projectId]);

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Survey Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.close()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    );
  }

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
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              🔄 Refresh
            </button>
            <button
              onClick={() => window.close()}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>

      {/* Survey Content */}
      <div className="py-8">
        <div className="max-w-4xl mx-auto">
          <SurveyRenderer
            surveyData={surveyData}
            surveyId={projectId || 'preview'}
            onComplete={(responses) => {
              console.log('=== PREVIEW: Survey completed ===', responses);
              alert('Survey completed! Check console for responses.');
            }}
            onError={(error) => {
              console.error('=== PREVIEW: Survey error ===', error);
              alert(`Survey error: ${error}`);
            }}
          />
        </div>
      </div>
    </div>
  );
}