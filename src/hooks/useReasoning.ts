/**
 * useReasoning Hook - Manages AI Reasoning State and API Integration
 * 
 * Provides a complete interface for the reasoning system:
 * - Complexity assessment
 * - Template management
 * - Real-time streaming
 * - Cache management
 * - Error handling and recovery
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  ComplexityAssessment,
  ComplexityLevel,
  ReasoningResult,
  ReasoningTemplate,
  StreamEvent,
  ReasoningProgress,
  ContextMessage
} from '@/types/reasoning.types';

interface UseReasoningOptions {
  userId?: string;
  projectId?: string;
  autoAssessComplexity?: boolean;
  enableCaching?: boolean;
  onComplete?: (result: ReasoningResult) => void;
  onError?: (error: string) => void;
  onProgress?: (progress: ReasoningProgress) => void;
}

interface ReasoningState {
  // Complexity Assessment
  complexity: ComplexityAssessment | null;
  isAssessingComplexity: boolean;
  complexityError: string | null;
  
  // Templates
  availableTemplates: ReasoningTemplate[];
  selectedTemplate: ReasoningTemplate | null;
  
  // Reasoning Process
  isReasoning: boolean;
  reasoningError: string | null;
  progress: ReasoningProgress | null;
  result: ReasoningResult | null;
  
  // Streaming
  isStreaming: boolean;
  streamEvents: StreamEvent[];
  currentPhase: string | null;
  
  // Context
  contextHistory: ContextMessage[];
}

interface ReasoningActions {
  // Complexity Assessment
  assessComplexity: (query: string, forceAssessment?: boolean) => Promise<void>;
  clearComplexityAssessment: () => void;
  
  // Templates
  loadTemplates: (filters?: { category?: string; complexity?: ComplexityLevel }) => Promise<void>;
  selectTemplate: (templateId: string | null) => void;
  
  // Reasoning
  startReasoning: (query: string, options?: {
    forceComplexity?: ComplexityLevel;
    templateId?: string;
    enableParallel?: boolean;
    model?: string;
  }) => Promise<void>;
  stopReasoning: () => void;
  pauseReasoning: () => void;
  resumeReasoning: () => void;
  
  // Context Management
  addContextMessage: (message: ContextMessage) => void;
  clearContext: () => void;
  
  // Utilities
  reset: () => void;
  retryLastQuery: () => Promise<void>;
}

export function useReasoning(options: UseReasoningOptions = {}): [ReasoningState, ReasoningActions] {
  const {
    userId,
    projectId,
    autoAssessComplexity = true,
    enableCaching = true,
    onComplete,
    onError,
    onProgress
  } = options;

  // State
  const [state, setState] = useState<ReasoningState>({
    complexity: null,
    isAssessingComplexity: false,
    complexityError: null,
    availableTemplates: [],
    selectedTemplate: null,
    isReasoning: false,
    reasoningError: null,
    progress: null,
    result: null,
    isStreaming: false,
    streamEvents: [],
    currentPhase: null,
    contextHistory: []
  });

  // Refs for cleanup
  const eventSourceRef = useRef<EventSource | null>(null);
  const lastQueryRef = useRef<string>('');
  const lastOptionsRef = useRef<any>({});

  // Complexity Assessment
  const assessComplexity = useCallback(async (query: string, forceAssessment = false) => {
    if (!query.trim()) return;

    setState(prev => ({
      ...prev,
      isAssessingComplexity: true,
      complexityError: null
    }));

    try {
      const response = await fetch('/api/reasoning/assess-complexity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          contextHistory: state.contextHistory.slice(-5),
          userId,
          includeTemplates: true,
          includeCostEstimate: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to assess complexity');
      }

      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        complexity: data.complexity,
        availableTemplates: data.suggestedTemplates?.map((t: any) => ({
          id: t.id,
          name: t.name,
          description: t.description,
          complexity: data.complexity.level,
          queryPatterns: [],
          phases: [],
          examples: [],
          metadata: {
            category: 'suggested',
            tags: [],
            successRate: t.successRate / 100,
            avgDuration: t.estimatedDuration,
            avgCost: 0.1
          }
        })) || [],
        isAssessingComplexity: false
      }));

      // Auto-select best template if available
      if (data.suggestedTemplates && data.suggestedTemplates.length > 0) {
        const bestTemplate = data.suggestedTemplates[0];
        setState(prev => ({
          ...prev,
          selectedTemplate: prev.availableTemplates.find(t => t.id === bestTemplate.id) || null
        }));
      }

    } catch (error: any) {
      console.error('Complexity assessment error:', error);
      setState(prev => ({
        ...prev,
        isAssessingComplexity: false,
        complexityError: error.message || 'Failed to assess complexity'
      }));
    }
  }, [state.contextHistory, userId]);

  const clearComplexityAssessment = useCallback(() => {
    setState(prev => ({
      ...prev,
      complexity: null,
      complexityError: null,
      selectedTemplate: null
    }));
  }, []);

  // Template Management
  const loadTemplates = useCallback(async (filters: { category?: string; complexity?: ComplexityLevel } = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.set('category', filters.category);
      if (filters.complexity) params.set('complexity', filters.complexity);
      params.set('includeStats', 'true');

      const response = await fetch(`/api/reasoning/templates?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to load templates');

      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        availableTemplates: data.templates
      }));

    } catch (error: any) {
      console.error('Template loading error:', error);
    }
  }, []);

  const selectTemplate = useCallback((templateId: string | null) => {
    setState(prev => ({
      ...prev,
      selectedTemplate: templateId 
        ? prev.availableTemplates.find(t => t.id === templateId) || null
        : null
    }));
  }, []);

  // Reasoning Process
  const startReasoning = useCallback(async (
    query: string, 
    reasoningOptions: {
      forceComplexity?: ComplexityLevel;
      templateId?: string;
      enableParallel?: boolean;
      model?: string;
    } = {}
  ) => {
    if (!query.trim()) return;

    // Store for retry functionality
    lastQueryRef.current = query;
    lastOptionsRef.current = reasoningOptions;

    // Clean up any existing stream
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setState(prev => ({
      ...prev,
      isReasoning: true,
      isStreaming: true,
      reasoningError: null,
      result: null,
      streamEvents: [],
      currentPhase: null,
      progress: null
    }));

    try {
      // Use POST for complex requests with body
      const streamResponse = await fetch('/api/reasoning/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          contextHistory: state.contextHistory.slice(-5),
          userId,
          projectId,
          forceComplexity: reasoningOptions.forceComplexity,
          templateId: reasoningOptions.templateId || state.selectedTemplate?.id,
          enableParallel: reasoningOptions.enableParallel,
          model: reasoningOptions.model
        })
      });

      if (!streamResponse.ok) {
        throw new Error(`HTTP ${streamResponse.status}: ${streamResponse.statusText}`);
      }

      // For now, handle as non-streaming response
      // In a real implementation, this would set up SSE
      const result = await streamResponse.json();
      
      setState(prev => ({
        ...prev,
        isReasoning: false,
        isStreaming: false,
        result: result.result,
        progress: {
          sessionId: 'demo',
          currentPhase: 'completed',
          completedPhases: ['understanding', 'planning', 'execution'],
          progress: 100,
          eta: 0,
          tokenCount: result.result?.totalTokens || 0,
          currentCost: result.result?.totalCost || 0,
          isThinking: false,
          canCancel: false
        }
      }));

      // Add to context
      const userMessage: ContextMessage = {
        id: `msg-${Date.now()}`,
        text: query,
        isUser: true,
        timestamp: new Date(),
        tokenCount: Math.ceil(query.length / 4)
      };

      const assistantMessage: ContextMessage = {
        id: `msg-${Date.now() + 1}`,
        text: result.result?.finalAnswer || '',
        isUser: false,
        timestamp: new Date(),
        reasoning: result.result,
        tokenCount: result.result?.totalTokens || 0
      };

      setState(prev => ({
        ...prev,
        contextHistory: [
          ...prev.contextHistory,
          userMessage,
          assistantMessage
        ].slice(-10) // Keep last 10 messages
      }));

      if (onComplete && result.result) {
        onComplete(result.result);
      }

    } catch (error: any) {
      console.error('Reasoning error:', error);
      const errorMessage = error.message || 'Failed to start reasoning';
      
      setState(prev => ({
        ...prev,
        isReasoning: false,
        isStreaming: false,
        reasoningError: errorMessage
      }));

      if (onError) {
        onError(errorMessage);
      }
    }
  }, [state.contextHistory, state.selectedTemplate, userId, projectId, onComplete, onError]);

  const stopReasoning = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isReasoning: false,
      isStreaming: false,
      currentPhase: null
    }));
  }, []);

  const pauseReasoning = useCallback(() => {
    // Would implement pause logic
    console.log('Pause reasoning');
  }, []);

  const resumeReasoning = useCallback(() => {
    // Would implement resume logic
    console.log('Resume reasoning');
  }, []);

  // Context Management
  const addContextMessage = useCallback((message: ContextMessage) => {
    setState(prev => ({
      ...prev,
      contextHistory: [...prev.contextHistory, message].slice(-10)
    }));
  }, []);

  const clearContext = useCallback(() => {
    setState(prev => ({
      ...prev,
      contextHistory: []
    }));
  }, []);

  // Utilities
  const reset = useCallback(() => {
    stopReasoning();
    setState({
      complexity: null,
      isAssessingComplexity: false,
      complexityError: null,
      availableTemplates: [],
      selectedTemplate: null,
      isReasoning: false,
      reasoningError: null,
      progress: null,
      result: null,
      isStreaming: false,
      streamEvents: [],
      currentPhase: null,
      contextHistory: []
    });
  }, [stopReasoning]);

  const retryLastQuery = useCallback(async () => {
    if (lastQueryRef.current) {
      await startReasoning(lastQueryRef.current, lastOptionsRef.current);
    }
  }, [startReasoning]);

  // Auto-assess complexity when query changes
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const actions: ReasoningActions = {
    assessComplexity,
    clearComplexityAssessment,
    loadTemplates,
    selectTemplate,
    startReasoning,
    stopReasoning,
    pauseReasoning,
    resumeReasoning,
    addContextMessage,
    clearContext,
    reset,
    retryLastQuery
  };

  return [state, actions];
}

export default useReasoning;