import { useState, useEffect, useCallback } from 'react';

interface Message {
  role: string;
  content: string;
  [key: string]: any;
}

interface ChatSession {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  status: string;
  messages: Message[];
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

interface UseChatSessionOptions {
  projectId: string;
  userId: string | undefined;
  sessionId?: string | null;
  enabled?: boolean;
}

interface UseChatSessionReturn {
  sessionId: string | null;
  isLoading: boolean;
  error: string | null;
  saveMessages: (messages: Message[]) => Promise<void>;
  loadSession: () => Promise<ChatSession | null>;
  completeSession: () => Promise<void>;
}

export function useChatSession({
  projectId,
  userId,
  sessionId: initialSessionId,
  enabled = true
}: UseChatSessionOptions): UseChatSessionReturn {
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load session on mount
  useEffect(() => {
    // Skip if disabled or missing required data
    if (!enabled || !userId || !projectId) return;

    const loadInitialSession = async () => {
      try {
        setIsLoading(true);
        const queryParams = new URLSearchParams({
          userId,
          ...(initialSessionId && { sessionId: initialSessionId }),
        });

        const response = await fetch(
          `/api/projects/${projectId}/chat-session?${queryParams}`
        );

        if (!response.ok) {
          throw new Error('Failed to load session');
        }

        const data = await response.json();
        if (data.session) {
          setSessionId(data.session.id);
        }
      } catch (err) {
        console.error('Error loading session:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialSession();
  }, [projectId, userId, initialSessionId, enabled]);

  // Save messages to session
  const saveMessages = useCallback(
    async (messages: Message[]) => {
      // Skip if disabled or missing required data
      if (!enabled || !userId || !projectId || messages.length === 0) return;

      try {
        // Generate title from first user message
        const firstUserMessage = messages.find((m) => m.role === 'user');
        const title = firstUserMessage?.content?.substring(0, 50) || 'New Chat';

        const response = await fetch(`/api/projects/${projectId}/chat-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            sessionId,
            messages: messages.map(m => ({
              role: m.role,
              content: m.content,
              // Include any additional message properties
              ...m
            })),
            title,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save messages');
        }

        const data = await response.json();
        if (data.session && !sessionId) {
          setSessionId(data.session.id);
        }
      } catch (err) {
        console.error('Error saving messages:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    },
    [userId, projectId, sessionId, enabled]
  );

  // Load session messages
  const loadSession = useCallback(async (): Promise<ChatSession | null> => {
    // Skip if disabled or missing required data
    if (!enabled || !userId || !projectId || !sessionId) return null;

    try {
      const queryParams = new URLSearchParams({
        userId,
        sessionId,
      });

      const response = await fetch(
        `/api/projects/${projectId}/chat-session?${queryParams}`
      );

      if (!response.ok) {
        throw new Error('Failed to load session');
      }

      const data = await response.json();
      return data.session || null;
    } catch (err) {
      console.error('Error loading session:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, [userId, projectId, sessionId, enabled]);

  // Mark session as complete
  const completeSession = useCallback(async () => {
    // Skip if disabled or missing required data
    if (!enabled || !userId || !projectId || !sessionId) return;

    try {
      await fetch(`/api/projects/${projectId}/chat-session`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          sessionId,
          status: 'completed',
        }),
      });
    } catch (err) {
      console.error('Error completing session:', err);
    }
  }, [userId, projectId, sessionId]);

  return {
    sessionId,
    isLoading,
    error,
    saveMessages,
    loadSession,
    completeSession,
  };
}
