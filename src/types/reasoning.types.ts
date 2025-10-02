/**
 * Core types for the Production-Ready AI Chain-of-Thought Reasoning System
 */

// Stream event types for real-time communication
export interface StreamEvent {
  type: 'thinking_start' | 'thinking_step' | 'thinking_complete' | 'answer_start' | 'answer_chunk' | 'answer_complete' | 'error' | 'progress' | 'phase_change' | 'correction' | 'parallel_progress';
  data: {
    step?: string;
    content?: string;
    progress?: number;
    tokenCount?: number;
    timestamp?: number;
    phaseType?: ReasoningPhaseType;
    correctionId?: string;
    pathId?: string;
    confidence?: number;
    metadata?: Record<string, any>;
  };
}

// Complexity levels for automatic detection
export type ComplexityLevel = 'SIMPLE' | 'MODERATE' | 'COMPLEX' | 'CREATIVE';

// Complexity assessment result
export interface ComplexityAssessment {
  level: ComplexityLevel;
  confidence: number; // 0.0 to 1.0
  reason: string;
  patterns: string[];
  estimatedDuration: number; // in seconds
  tokenEstimate: number;
  costEstimate: number;
  canUseCache: boolean;
}

// Reasoning phase types for different complexity levels
export type ReasoningPhaseType = 
  | 'understanding'
  | 'planning' 
  | 'execution'
  | 'decomposition'
  | 'knowledge_gathering'
  | 'approach_planning'
  | 'detailed_reasoning'
  | 'self_critique'
  | 'alternative_exploration'
  | 'synthesis'
  | 'brainstorming'
  | 'convergence';

// Individual reasoning step/phase
export interface ReasoningPhase {
  id: string;
  type: ReasoningPhaseType;
  title: string;
  content: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  tokenCount?: number;
  confidence?: number;
  isComplete: boolean;
  hasCorrection?: boolean;
  correctionCount?: number;
  temperature?: number;
  metadata?: Record<string, any>;
}

// Reasoning session configuration
export interface ReasoningConfig {
  complexity: ComplexityLevel;
  forceThinking?: boolean;
  useCache?: boolean;
  maxTokens?: number;
  temperature?: number;
  enableParallel?: boolean;
  timeoutMs?: number;
  model?: string;
  templateId?: string;
  userId?: string;
  projectId?: string;
  contextHistory?: ContextMessage[];
}

// Memory context message
export interface ContextMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  reasoning?: ReasoningResult;
  tokenCount?: number;
  relevanceScore?: number;
}

// Parallel reasoning path
export interface ReasoningPath {
  id: string;
  name: string;
  approach: 'analytical' | 'creative' | 'systematic';
  phases: ReasoningPhase[];
  confidence: number;
  tokenCount: number;
  isComplete: boolean;
  result?: string;
}

// Self-correction detection
export interface CorrectionEvent {
  id: string;
  phaseId: string;
  originalContent: string;
  correctedContent: string;
  trigger: string; // The phrase that triggered correction
  timestamp: number;
  confidence: number;
}

// Final reasoning result
export interface ReasoningResult {
  id: string;
  query: string;
  complexity: ComplexityAssessment;
  phases: ReasoningPhase[];
  parallelPaths?: ReasoningPath[];
  corrections?: CorrectionEvent[];
  finalAnswer: string;
  suggestions?: string[];
  totalTokens: number;
  totalCost: number;
  duration: number;
  confidence: number;
  metadata: {
    model: string;
    startTime: number;
    endTime: number;
    cacheHit?: boolean;
    templateUsed?: string;
    errorCount?: number;
    correctionCount?: number;
    userFeedback?: 'helpful' | 'not_helpful';
    feedbackText?: string;
  };
}

// Reasoning template for common patterns
export interface ReasoningTemplate {
  id: string;
  name: string;
  description: string;
  queryPatterns: RegExp[];
  complexity: ComplexityLevel;
  phases: {
    type: ReasoningPhaseType;
    title: string;
    prompt: string;
    temperature?: number;
    expectedTokens?: number;
  }[];
  examples: string[];
  metadata: {
    category: string;
    tags: string[];
    successRate?: number;
    avgDuration?: number;
    avgCost?: number;
  };
}

// Memory system interfaces
export interface ShortTermMemory {
  sessionId: string;
  messages: ContextMessage[];
  reasoningPatterns: string[];
  complexityHistory: ComplexityAssessment[];
  userPreferences: {
    preferredComplexity?: ComplexityLevel;
    alwaysShowThinking?: boolean;
    preferredVerbosity?: 'concise' | 'detailed' | 'comprehensive';
  };
  cacheMisses: string[];
}

export interface LongTermMemory {
  userId: string;
  conversationHistory: {
    query: string;
    complexity: ComplexityLevel;
    success: boolean;
    feedback?: number; // 1-5 rating
    timestamp: Date;
  }[];
  learnedPatterns: {
    pattern: string;
    complexity: ComplexityLevel;
    confidence: number;
    updateCount: number;
  }[];
  userPreferences: {
    defaultComplexity?: ComplexityLevel;
    showThinkingDefault?: boolean;
    verbosityPreference?: string;
    topics: string[];
    avgSessionLength?: number;
  };
  performanceMetrics: {
    totalSessions: number;
    totalTokens: number;
    totalCost: number;
    avgSatisfaction?: number;
    favoriteTemplates: string[];
  };
}

// Caching interfaces
export interface ReasoningCache {
  key: string;
  query: string;
  queryHash: string;
  complexity: ComplexityLevel;
  result: ReasoningResult;
  timestamp: number;
  hitCount: number;
  lastAccessed: number;
  ttl: number;
  tags: string[];
  similarity?: number;
}

// Performance monitoring
export interface ReasoningMetrics {
  sessionId: string;
  startTime: number;
  endTime: number;
  totalTokens: number;
  tokensByPhase: Record<ReasoningPhaseType, number>;
  cost: number;
  complexity: ComplexityLevel;
  userSatisfaction?: number;
  cacheHitRate: number;
  errorCount: number;
  correctionCount: number;
  parallelPathsUsed?: number;
  templateUsed?: string;
  model: string;
}

// Error handling
export interface ReasoningError {
  code: string;
  message: string;
  phase?: ReasoningPhaseType;
  timestamp: number;
  context?: Record<string, any>;
  isRecoverable: boolean;
  suggestedAction?: string;
}

// Cost calculation utilities
export interface CostCalculation {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  model: string;
  cost: number;
  complexity: ComplexityLevel;
  breakdown: {
    phase: ReasoningPhaseType;
    tokens: number;
    cost: number;
  }[];
}

// Streaming progress
export interface ReasoningProgress {
  sessionId: string;
  currentPhase: ReasoningPhaseType;
  completedPhases: ReasoningPhaseType[];
  progress: number; // 0-100
  eta: number; // estimated seconds remaining
  tokenCount: number;
  currentCost: number;
  isThinking: boolean;
  canCancel: boolean;
}

