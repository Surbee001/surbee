import { useEffect, useState, useCallback } from 'react';

export interface Analytics {
  projectId: string;
  surveyTitle: string;
  totalResponses: number;
  completionRate: number;
  questionsAnalytics: any[];
  responses: any[];
  lastUpdated: string;
}

interface UseAnalyticsStreamOptions {
  projectId: string;
  userId: string;
  onUpdate?: (analytics: Analytics) => void;
  onError?: (error: Error) => void;
  pollInterval?: number; // Fallback polling interval in ms
}

/**
 * React hook for real-time analytics updates via Server-Sent Events
 * Falls back to polling if SSE is unavailable
 */
export function useAnalyticsStream({
  projectId,
  userId,
  onUpdate,
  onError,
  pollInterval = 5000
}: UseAnalyticsStreamOptions) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [usePolling, setUsePolling] = useState(false);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/projects/${projectId}/analytics?userId=${userId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.status}`);
      }

      const data: Analytics = await response.json();
      setAnalytics(data);
      onUpdate?.(data);
      setIsLoading(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
      setIsLoading(false);
    }
  }, [projectId, userId, onUpdate, onError]);

  // Initialize SSE connection
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let pollingInterval: NodeJS.Timeout | null = null;

    const connectSSE = () => {
      try {
        eventSource = new EventSource(
          `/api/projects/${projectId}/analytics/stream?userId=${userId}`
        );

        eventSource.onopen = () => {
          setIsConnected(true);
          setUsePolling(false);
          setError(null);
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'connected') {
              console.log('Connected to analytics stream');
            } else if (data.type === 'analytics_update') {
              setAnalytics(data);
              onUpdate?.(data);
            } else {
              // Generic analytics update
              setAnalytics(data);
              onUpdate?.(data);
            }
          } catch (parseError) {
            console.error('Failed to parse analytics update:', parseError);
          }
        };

        eventSource.onerror = (event) => {
          console.warn('SSE connection error, falling back to polling');
          setIsConnected(false);
          eventSource?.close();
          eventSource = null;

          // Fall back to polling
          setUsePolling(true);
          pollingInterval = setInterval(fetchAnalytics, pollInterval);
        };
      } catch (err) {
        console.warn('SSE not available, using polling instead');
        setUsePolling(true);
        pollingInterval = setInterval(fetchAnalytics, pollInterval);
      }
    };

    // Initial fetch
    fetchAnalytics();

    // Connect to SSE
    connectSSE();

    // Cleanup
    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [projectId, userId, fetchAnalytics, pollInterval]);

  return {
    analytics,
    isConnected,
    isLoading,
    error,
    usePolling,
    refetch: fetchAnalytics
  };
}
