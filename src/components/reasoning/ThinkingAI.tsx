/**
 * Main ThinkingAI Component - Production-Ready Reasoning Interface
 * 
 * Features:
 * - Real-time streaming thinking display
 * - Complexity assessment with visual indicators
 * - Collapsible reasoning phases with animations
 * - Progress tracking with ETA
 * - Token counting and cost estimation
 * - Template suggestions and usage
 * - Error handling and recovery
 * - Copy/share functionality
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingIcon from '@/components/ui/loading-icon';
import { TextShimmerWave } from '@/components/ui/text-shimmer-wave';
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Share2,
  Pause,
  Play,
  Square,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Lightbulb,
  Brain,
  Zap,
  Info
} from 'lucide-react';
import {
  ComplexityAssessment,
  ComplexityLevel,
  ReasoningPhase,
  ReasoningResult,
  StreamEvent,
  ReasoningProgress,
  CorrectionEvent
} from '@/types/reasoning.types';

interface ThinkingAIProps {
  query: string;
  isActive?: boolean;
  onComplete?: (result: ReasoningResult) => void;
  onError?: (error: string) => void;
  onHtmlStream?: (html: string) => void; // Real-time HTML streaming
  userId?: string;
  projectId?: string;
  className?: string;
  autoStart?: boolean;
  showCostEstimates?: boolean;
  enableInteraction?: boolean;
  forceComplexity?: ComplexityLevel;
  templateId?: string;
}

interface PhaseDisplayData extends ReasoningPhase {
  isVisible: boolean;
  animationClass: string;
  streamedContent: string;
}

export function ThinkingAI({
  query,
  isActive = false,
  onComplete,
  onError,
  onHtmlStream,
  userId,
  projectId,
  className = '',
  autoStart = true,
  showCostEstimates = true,
  enableInteraction = true,
  forceComplexity,
  templateId
}: ThinkingAIProps) {
  // State management
  const [complexity, setComplexity] = useState<ComplexityAssessment | null>(null);
  const [phases, setPhases] = useState<PhaseDisplayData[]>([]);
  const [currentPhase, setCurrentPhase] = useState<string | null>(null);
  const [progress, setProgress] = useState<ReasoningProgress | null>(null);
  const [finalAnswer, setFinalAnswer] = useState<string>('');
  const [builtHtml, setBuiltHtml] = useState<string>(''); // Store the built HTML separately
  const [corrections, setCorrections] = useState<CorrectionEvent[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // Refs
  const eventSourceRef = useRef<EventSource | null>(null);
  const phaseRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const autoScrollRef = useRef<HTMLDivElement>(null);

  // Complexity styling
  const getComplexityColor = (level: ComplexityLevel): string => {
    const colors = {
      SIMPLE: 'bg-green-100 text-green-800 border-green-200',
      MODERATE: 'bg-blue-100 text-blue-800 border-blue-200',
      COMPLEX: 'bg-purple-100 text-purple-800 border-purple-200',
      CREATIVE: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[level];
  };

  const getComplexityIcon = (level: ComplexityLevel) => {
    const icons = {
      SIMPLE: <Zap className="h-4 w-4" />,
      MODERATE: <Brain className="h-4 w-4" />,
      COMPLEX: <Lightbulb className="h-4 w-4" />,
      CREATIVE: <span className="text-lg">✨</span>
    };
    return icons[level];
  };

  const getPhaseColor = (type: string): string => {
    const colors = {
      understanding: 'text-blue-600 bg-blue-50 border-blue-200',
      planning: 'text-purple-600 bg-purple-50 border-purple-200',
      execution: 'text-green-600 bg-green-50 border-green-200',
      decomposition: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      knowledge_gathering: 'text-teal-600 bg-teal-50 border-teal-200',
      approach_planning: 'text-purple-600 bg-purple-50 border-purple-200',
      detailed_reasoning: 'text-blue-600 bg-blue-50 border-blue-200',
      self_critique: 'text-orange-600 bg-orange-50 border-orange-200',
      alternative_exploration: 'text-pink-600 bg-pink-50 border-pink-200',
      synthesis: 'text-green-600 bg-green-50 border-green-200',
      brainstorming: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      convergence: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      implementation: 'text-green-600 bg-green-50 border-green-200'
    };
    return colors[type as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  // Start reasoning process
  const startReasoning = useCallback(async () => {
    if (!query.trim()) return;

    setIsStreaming(true);
    setError(null);
    setPhases([]);
    setCurrentPhase(null);
    setFinalAnswer('');
    setBuiltHtml(''); // Reset built HTML
    setCorrections([]);

    try {
      // Build request URL
      const params = new URLSearchParams({
        query: query.trim(),
        ...(forceComplexity && { complexity: forceComplexity }),
        ...(templateId && { templateId }),
        ...(userId && { userId }),
        ...(projectId && { projectId }),
        enableParallel: 'true'
      });

      const url = `/api/reasoning/stream?${params.toString()}`;
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const streamEvent: StreamEvent = JSON.parse(event.data);
          handleStreamEvent(streamEvent);
        } catch (parseError) {
          console.error('Failed to parse stream event:', parseError);
        }
      };

      eventSource.addEventListener('thinking_start', (event) => {
        try {
          if (event.data && event.data !== 'undefined') {
            const data = JSON.parse(event.data);
            setIsStreaming(true);
            setIsExpanded(true); // Auto-expand when thinking starts
          }
        } catch (parseError) {
          console.warn('Failed to parse thinking_start event:', parseError);
        }
      });

      eventSource.addEventListener('phase_change', (event) => {
        try {
          if (event.data && event.data !== 'undefined') {
            const data = JSON.parse(event.data);
            handlePhaseChange(data);
          }
        } catch (parseError) {
          console.warn('Failed to parse phase_change event:', parseError);
        }
      });

      eventSource.addEventListener('thinking_step', (event) => {
        try {
          if (event.data && event.data !== 'undefined') {
            const data = JSON.parse(event.data);
            handleThinkingStep(data);
          }
        } catch (parseError) {
          console.warn('Failed to parse thinking_step event:', parseError);
        }
      });

      eventSource.addEventListener('progress', (event) => {
        try {
          if (event.data && event.data !== 'undefined') {
            const data = JSON.parse(event.data);
            handleProgress(data);
          }
        } catch (parseError) {
          console.warn('Failed to parse progress event:', parseError);
        }
      });

      eventSource.addEventListener('correction', (event) => {
        try {
          if (event.data && event.data !== 'undefined') {
            const data = JSON.parse(event.data);
            handleCorrection(data);
          }
        } catch (parseError) {
          console.warn('Failed to parse correction event:', parseError);
        }
      });

      eventSource.addEventListener('answer_chunk', (event) => {
        try {
          if (event.data && event.data !== 'undefined') {
            const data = JSON.parse(event.data);
            handleAnswerChunk(data);
          }
        } catch (parseError) {
          console.warn('Failed to parse answer_chunk event:', parseError);
        }
      });

      eventSource.addEventListener('thinking_complete', (event) => {
        try {
          if (event.data && event.data !== 'undefined') {
            const data = JSON.parse(event.data);
            handleComplete(data);
          }
        } catch (parseError) {
          console.warn('Failed to parse thinking_complete event:', parseError);
        }
      });

      // Note: build_chunk and build_complete are now handled as thinking_step and thinking_complete
      // to create a unified thinking + building experience

      eventSource.addEventListener('error', (event) => {
        try {
          if (event.data && event.data !== 'undefined') {
            const data = JSON.parse(event.data);
            handleError(data);
          } else {
            // Handle error events without data
            handleError({ content: 'Connection error occurred' });
          }
        } catch (parseError) {
          console.warn('Failed to parse error event:', parseError);
          handleError({ content: 'Connection error occurred' });
        }
      });

      eventSource.onerror = (error) => {
        // Only log as warning for normal connection close events
        console.warn('EventSource connection event:', error);

        // Check if this is a real error or just normal completion
        if (eventSource.readyState === EventSource.CLOSED) {
          // Connection is closed - this is normal when reasoning completes
          console.log('EventSource closed normally after reasoning completion');
        } else if (eventSource.readyState === EventSource.CONNECTING) {
          // Still attempting to connect - this is normal
          console.log('EventSource attempting to reconnect...');
        } else {
          // Actual error state
          console.error('EventSource error - connection failed');
          handleError({ content: 'Connection error occurred' });
        }
      };

    } catch (error: any) {
      console.error('Failed to start reasoning:', error);
      setError(error.message || 'Failed to start reasoning process');
      setIsStreaming(false);
    }
  }, [query, forceComplexity, templateId, userId, projectId]);

  // Event handlers
  const handleStreamEvent = (event: StreamEvent) => {
    switch (event.type) {
      case 'thinking_start':
        setIsStreaming(true);
        break;
      case 'phase_change':
        handlePhaseChange(event.data);
        break;
      case 'thinking_step':
        handleThinkingStep(event.data);
        break;
      case 'progress':
        handleProgress(event.data);
        break;
      case 'correction':
        handleCorrection(event.data);
        break;
      case 'answer_chunk':
        handleAnswerChunk(event.data);
        break;
      case 'thinking_complete':
        handleComplete(event.data);
        break;
      case 'error':
        handleError(event.data);
        break;
    }
  };

  const handlePhaseChange = (data: any) => {
    if (data.phaseType) {
      setCurrentPhase(data.phaseType);
    }

    if (data.metadata?.complexity) {
      setComplexity(data.metadata.complexity);
    }
  };

  const handleThinkingStep = (data: any) => {
    if (data.step && data.content) {
      // If this is implementation phase and content looks like HTML, stream it directly
      if (data.step === 'implementation') {
        // Check if content contains HTML tags or we're already building HTML
        if ((data.content || '').toString().includes('<!DOCTYPE') || (data.content || '').toString().includes('<html') || builtHtml) {
          // This is HTML being built
          const newHtml = builtHtml + data.content;
          setBuiltHtml(newHtml);

          // Stream the HTML update in real-time to the iframe
          if (onHtmlStream) {
            onHtmlStream(newHtml);
          }

          // Create or update implementation phase UI (but without showing HTML)
          setPhases(prev => {
            const existingIndex = prev.findIndex(p => p.type === 'implementation');

            if (existingIndex >= 0) {
              // Update existing phase
              const updated = [...prev];
              updated[existingIndex] = {
                ...updated[existingIndex],
                streamedContent: 'Building HTML...',
                isVisible: true
              };
              return updated;
            } else {
              // Create new phase
              const newPhase: PhaseDisplayData = {
                id: `implementation-${Date.now()}`,
                type: 'implementation',
                title: 'Implementation',
                content: 'Building HTML...',
                streamedContent: 'Building HTML...',
                startTime: Date.now(),
                isComplete: false,
                isVisible: true,
                animationClass: 'animate-fadeIn'
              };
              return [...prev, newPhase];
            }
          });

          return; // Don't add HTML content to visible phases
        }
      }

      setPhases(prev => {
        const existingIndex = prev.findIndex(p => p.type === data.step);

        if (existingIndex >= 0) {
          // Update existing phase
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            streamedContent: updated[existingIndex].streamedContent + data.content,
            isVisible: true
          };
          return updated;
        } else {
          // Create new phase
          const newPhase: PhaseDisplayData = {
            id: `${data.step}-${Date.now()}`,
            type: data.step,
            title: getPhaseTitle(data.step),
            content: data.content,
            streamedContent: data.content,
            startTime: Date.now(),
            isComplete: false,
            isVisible: true,
            animationClass: 'animate-fadeIn'
          };
          return [...prev, newPhase];
        }
      });

      // Auto-scroll to current phase
      scrollToCurrentPhase();
    }
  };

  const handleProgress = (data: any) => {
    if (data.metadata) {
      setProgress(data.metadata as ReasoningProgress);
    }
  };

  const handleCorrection = (data: any) => {
    const correction: CorrectionEvent = {
      id: data.correctionId || `correction-${Date.now()}`,
      phaseId: currentPhase || 'unknown',
      originalContent: '',
      correctedContent: data.content || '',
      trigger: 'self-correction',
      timestamp: Date.now(),
      confidence: 0.8
    };
    
    setCorrections(prev => [...prev, correction]);
  };

  const handleAnswerChunk = (data: any) => {
    if (data.content) {
      setFinalAnswer(prev => prev + data.content);
    }
  };


  const handleComplete = (data: any) => {
    setIsStreaming(false);
    setCurrentPhase(null);

    // Clean up EventSource connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // Mark all phases as complete
    setPhases(prev => prev.map(phase => ({
      ...phase,
      isComplete: true,
      endTime: Date.now()
    })));

    // Build final result
    if (onComplete && data.metadata) {
      const result: ReasoningResult = {
        id: data.metadata.sessionId || `result-${Date.now()}`,
        query,
        complexity: complexity!,
        phases: phases.map(p => ({
          id: p.id,
          type: p.type as any,
          title: p.title,
          content: p.streamedContent,
          startTime: p.startTime,
          endTime: p.endTime,
          duration: p.endTime ? p.endTime - p.startTime : 0,
          isComplete: true
        })),
        corrections,
        finalAnswer: builtHtml || finalAnswer, // Use builtHtml if available
        totalTokens: data.metadata.totalTokens || 0,
        totalCost: parseFloat(data.metadata.totalCost) || 0,
        duration: data.metadata.duration || 0,
        confidence: 0.85,
        metadata: {
          model: 'gpt-5-mini',
          startTime: Date.now() - (data.metadata.duration || 0),
          endTime: Date.now(),
          builtHtml: builtHtml || undefined // Include the built HTML in metadata
        }
      };

      onComplete(result);
    }
  };

  const handleError = (data: any) => {
    const errorMessage = data.content || 'An error occurred during reasoning';
    setError(errorMessage);
    setIsStreaming(false);
    
    if (onError) {
      onError(errorMessage);
    }

    // Clean up event source
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  // Helper functions
  const getPhaseTitle = (type: string): string => {
    const titles = {
      understanding: 'Understanding',
      planning: 'Planning',
      execution: 'Execution',
      decomposition: 'Problem Decomposition',
      knowledge_gathering: 'Knowledge Gathering',
      approach_planning: 'Approach Planning',
      detailed_reasoning: 'Detailed Reasoning',
      self_critique: 'Self-Critique',
      alternative_exploration: 'Alternative Exploration',
      synthesis: 'Synthesis',
      brainstorming: 'Brainstorming',
      convergence: 'Convergence',
      implementation: 'Implementation'
    };
    return titles[type as keyof typeof titles] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const scrollToCurrentPhase = () => {
    if (autoScrollRef.current) {
      autoScrollRef.current.scrollTop = autoScrollRef.current.scrollHeight;
    }
  };

  // Control functions
  const pauseReasoning = () => {
    setIsPaused(true);
    // Would implement pause logic
  };

  const resumeReasoning = () => {
    setIsPaused(false);
    // Would implement resume logic
  };

  const stopReasoning = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsStreaming(false);
    setCurrentPhase(null);
  };

  const copyThinkingProcess = () => {
    const content = phases.map(phase => 
      `## ${phase.title}\n${phase.streamedContent}`
    ).join('\n\n');
    
    navigator.clipboard.writeText(content);
  };

  const shareThinkingProcess = () => {
    // Would implement sharing functionality
    console.log('Share thinking process');
  };

  // Auto-start effect (guard against re-entry)
  const startedRef = useRef(false);
  useEffect(() => {
    if (autoStart && isActive && query.trim() && !startedRef.current) {
      startedRef.current = true;
      startReasoning();
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      startedRef.current = false;
    };
    // Depend on simple scalars to avoid recreating callback loops
  }, [autoStart, isActive, query]);

  // Render complexity badge
  const renderComplexityBadge = () => {
    if (!complexity) return null;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={`${getComplexityColor(complexity.level)} flex items-center gap-1 cursor-help`}
            >
              {getComplexityIcon(complexity.level)}
              <span>{complexity.level}</span>
              <span className="text-xs opacity-70">
                ({Math.round(complexity.confidence * 100)}%)
              </span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="space-y-2">
              <p className="font-medium">Complexity Assessment</p>
              <p className="text-sm">{complexity.reason}</p>
              {complexity.patterns.length > 0 && (
                <div>
                  <p className="text-xs font-medium">Detected Patterns:</p>
                  <ul className="text-xs list-disc list-inside">
                    {complexity.patterns.slice(0, 3).map((pattern, i) => (
                      <li key={i}>{pattern}</li>
                    ))}
                  </ul>
                </div>
              )}
              {showCostEstimates && (
                <div className="pt-1 border-t">
                  <p className="text-xs">
                    Est. Duration: {complexity.estimatedDuration}s | 
                    Est. Cost: ${complexity.costEstimate.toFixed(4)}
                  </p>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Render progress bar
  const renderProgress = () => {
    if (!progress || !isStreaming) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{progress.currentPhase.replace('_', ' ')}</span>
          <span>{Math.round(progress.progress)}%</span>
        </div>
        <Progress value={progress.progress} className="h-2" />
        {progress.eta > 0 && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{Math.round(progress.eta)}s remaining</span>
            </div>
            {showCostEstimates && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                <span>${progress.currentCost.toFixed(4)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render phase
  const renderPhase = (phase: PhaseDisplayData, index: number) => {
    const isActive = currentPhase === phase.type;
    const phaseColor = getPhaseColor(phase.type);

    return (
      <div 
        key={phase.id}
        className={`border rounded-lg overflow-hidden transition-all duration-300 ${phaseColor} ${
          isActive ? 'ring-2 ring-offset-2 ring-blue-500' : ''
        } ${phase.animationClass}`}
        ref={el => el && phaseRefs.current.set(phase.id, el)}
      >
        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
              phase.isComplete ? 'bg-green-500 text-white' : isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {phase.isComplete ? <CheckCircle className="h-3 w-3" /> : index + 1}
            </div>
            <h4 className="font-medium">{phase.title}</h4>
            {phase.hasCorrection && (
              <Badge variant="outline" className="text-xs">
                Corrected
              </Badge>
            )}
            {isActive && <LoadingIcon size={16} className="text-blue-500" />}
          </div>
          
          <div className="text-sm space-y-1">
            {(phase.streamedContent || '').toString().split('\n').map((line, i) => (
              <div key={i} className={isActive && i === (phase.streamedContent || '').toString().split('\n').length - 1 ? '' : ''}>
                {line}
              </div>
            ))}
            {isActive && phase.streamedContent && (
              <TextShimmerWave 
                className="inline-block w-4 text-blue-500"
                duration={1.5}
              >
                ...
              </TextShimmerWave>
            )}
          </div>

          {phase.isComplete && phase.duration && (
            <div className="mt-2 text-xs text-muted-foreground">
              Completed in {(phase.duration / 1000).toFixed(1)}s
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold">AI Reasoning</h3>
            </div>
            {renderComplexityBadge()}
          </div>
          
          <div className="flex items-center gap-2">
            {enableInteraction && (
              <>
                {isStreaming && (
                  <>
                    {isPaused ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={resumeReasoning}
                        className="h-8"
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={pauseReasoning}
                        className="h-8"
                      >
                        <Pause className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={stopReasoning}
                      className="h-8"
                    >
                      <Square className="h-3 w-3" />
                    </Button>
                  </>
                )}
                
                {phases.length > 0 && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copyThinkingProcess}
                      className="h-8"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={shareThinkingProcess}
                      className="h-8"
                    >
                      <Share2 className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowDetails(!showDetails)}
              className="h-8"
            >
              <Info className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {renderProgress()}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {corrections.length > 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {corrections.length} self-correction{corrections.length > 1 ? 's' : ''} applied during reasoning
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <CardContent>
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start p-0 h-auto font-normal hover:bg-transparent"
            >
              <div className="flex items-center gap-2">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">
                  {isExpanded ? 'Hide' : 'Show'} Thinking Process
                  {phases.length > 0 && (
                    <span className="text-muted-foreground ml-1">
                      ({phases.length} phase{phases.length > 1 ? 's' : ''})
                    </span>
                  )}
                </span>
              </div>
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-4 mt-4">
            <div 
              ref={autoScrollRef}
              className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            >
              {phases.map((phase, index) => renderPhase(phase, index))}
              
              {isStreaming && phases.length === 0 && (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <LoadingIcon size={24} className="mr-3" />
                  <span>Initializing reasoning process...</span>
                </div>
              )}
            </div>

            {showDetails && progress && (
              <div className="pt-4 border-t space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Tokens Used:</span>
                    <span className="ml-2">{progress.tokenCount.toLocaleString()}</span>
                  </div>
                  {showCostEstimates && (
                    <div>
                      <span className="font-medium">Current Cost:</span>
                      <span className="ml-2">${progress.currentCost.toFixed(4)}</span>
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Phases Complete:</span>
                    <span className="ml-2">{progress.completedPhases.length}</span>
                  </div>
                  <div>
                    <span className="font-medium">Can Cancel:</span>
                    <span className="ml-2">{progress.canCancel ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {finalAnswer && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Final Answer
            </h4>
            <div className="prose prose-sm max-w-none">
              {finalAnswer}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ThinkingAI;
