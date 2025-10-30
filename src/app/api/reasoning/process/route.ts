/**
 * Main Reasoning API Endpoint
 * 
 * This endpoint orchestrates the entire reasoning process:
 * - Automatic complexity detection
 * - Template matching
 * - Memory context retrieval
 * - Cache checking
 * - Reasoning execution with streaming
 * - Result storage and analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { complexityAnalyzer } from '@/services/reasoning/ComplexityAnalyzer';
import { reasoningEngine } from '@/services/reasoning/ReasoningEngine';
import { memoryManager } from '@/services/reasoning/MemoryManager';
import { reasoningTemplateManager } from '@/services/reasoning/ReasoningTemplates';
import { streamingService } from '@/services/reasoning/StreamingService';
import {
  ReasoningConfig,
  StreamEvent,
  ComplexityLevel,
  ContextMessage,
  ReasoningResult
} from '@/types/reasoning.types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Rate limiting (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 50; // requests per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

interface ProcessRequest {
  query: string;
  forceThinking?: boolean;
  useCache?: boolean;
  complexity?: ComplexityLevel;
  templateId?: string;
  contextHistory?: ContextMessage[];
  userId?: string;
  projectId?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  enableParallel?: boolean;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let sessionId: string | null = null;
  
  try {
    // Parse request body
    const body: ProcessRequest = await request.json();
    const { 
      query, 
      forceThinking = false, 
      useCache = true,
      complexity: forcedComplexity,
      templateId,
      contextHistory,
      userId,
      projectId,
      model,
      maxTokens,
      temperature,
      enableParallel = false
    } = body;

    // Validate required parameters
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (query.length > 10000) {
      return NextResponse.json(
        { error: 'Query too long (max 10,000 characters)' },
        { status: 400 }
      );
    }

    // Rate limiting
    if (userId) {
      const clientKey = userId;
      const now = Date.now();
      const clientLimit = rateLimitMap.get(clientKey) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
      
      if (now > clientLimit.resetTime) {
        clientLimit.count = 0;
        clientLimit.resetTime = now + RATE_LIMIT_WINDOW;
      }
      
      if (clientLimit.count >= RATE_LIMIT) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      
      clientLimit.count++;
      rateLimitMap.set(clientKey, clientLimit);
    }

    // Initialize session memory
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await memoryManager.initializeSession(sessionId, userId);

    // Add context history to memory
    if (contextHistory && contextHistory.length > 0) {
      for (const message of contextHistory) {
        memoryManager.addMessage(sessionId, message);
      }
    }

    // Step 1: Check cache if enabled
    if (useCache && !forceThinking) {
      const cachedResult = await memoryManager.getCachedResult(query, userId);
      if (cachedResult) {
        console.log('Cache hit for query:', query.slice(0, 100));
        return NextResponse.json({
          result: cachedResult,
          fromCache: true,
          processingTime: Date.now() - startTime
        });
      }
    }

    // Step 2: Complexity assessment
    const relevantContext = await memoryManager.getRelevantContext(sessionId, query);
    const complexityAssessment = forcedComplexity 
      ? { level: forcedComplexity, confidence: 1.0, reason: 'User specified', patterns: [], estimatedDuration: 30, tokenEstimate: 1000, costEstimate: 0.03, canUseCache: false }
      : await complexityAnalyzer.assessComplexity(query, relevantContext, forceThinking, userId);

    memoryManager.addComplexityAssessment(sessionId, complexityAssessment);

    // Step 3: Template matching
    let selectedTemplate = null;
    if (templateId) {
      selectedTemplate = reasoningTemplateManager.getTemplate(templateId);
    } else {
      selectedTemplate = reasoningTemplateManager.findBestTemplate(query, complexityAssessment.level);
    }

    // Step 4: Build reasoning configuration
    const config: ReasoningConfig = {
      complexity: complexityAssessment.level,
      forceThinking,
      useCache,
      maxTokens: maxTokens || getDefaultTokens(complexityAssessment.level),
      temperature: temperature || 0.4,
      enableParallel: enableParallel && complexityAssessment.level === 'COMPLEX',
      model: model || getDefaultModel(complexityAssessment.level),
      templateId: selectedTemplate?.id,
      userId,
      projectId,
      contextHistory: relevantContext,
      timeoutMs: getTimeoutForComplexity(complexityAssessment.level)
    };

    console.log(`Processing query with ${complexityAssessment.level} complexity:`, {
      query: query.slice(0, 100),
      confidence: complexityAssessment.confidence,
      template: selectedTemplate?.name,
      estimatedCost: complexityAssessment.costEstimate
    });

    // Step 5: Execute reasoning
    const result = await reasoningEngine.processQuery(
      query,
      config,
      (event: StreamEvent) => {
        // Stream events would be handled by WebSocket/SSE in streaming endpoint
        // For direct API calls, we collect events for final response
      }
    );

    // Step 6: Store result in memory and database
    if (userId) {
      await memoryManager.storeReasoningSession(userId, sessionId, result);
      
      // Cache the result if appropriate
      if (result.complexity.canUseCache) {
        await memoryManager.cacheResult(query, result, userId);
      }
    }

    // Step 7: Update template analytics
    if (selectedTemplate) {
      reasoningTemplateManager.recordUsage(
        selectedTemplate.id,
        result.duration,
        result.totalCost,
        result.confidence > 0.7
      );
    }

    // Add user message to memory for future context
    const userMessage: ContextMessage = {
      id: `msg-${Date.now()}`,
      text: query,
      isUser: true,
      timestamp: new Date(),
      tokenCount: Math.ceil(query.length / 4)
    };

    const assistantMessage: ContextMessage = {
      id: `msg-${Date.now() + 1}`,
      text: result.finalAnswer,
      isUser: false,
      timestamp: new Date(),
      reasoning: result,
      tokenCount: result.totalTokens
    };

    memoryManager.addMessage(sessionId, userMessage, result);
    memoryManager.addMessage(sessionId, assistantMessage, result);

    // Return successful response
    return NextResponse.json({
      result,
      complexity: complexityAssessment,
      template: selectedTemplate ? {
        id: selectedTemplate.id,
        name: selectedTemplate.name
      } : null,
      processingTime: Date.now() - startTime,
      fromCache: false
    });

  } catch (error: any) {
    console.error('Reasoning process error:', error);

    // Store error for analytics
    if (userId && sessionId) {
      try {
        // Would store in reasoning_errors table
        console.log('Error stored for analytics:', {
          sessionId,
          userId,
          error: error.message
        });
      } catch (storeError) {
        console.error('Failed to store error:', storeError);
      }
    }

    // Cleanup session on error
    if (sessionId) {
      memoryManager.cleanupSession(sessionId);
    }

    return NextResponse.json(
      { 
        error: 'Failed to process reasoning request',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        code: error.code || 'REASONING_ERROR'
      },
      { status: 500 }
    );
  }
}

// Utility functions
function getDefaultTokens(complexity: ComplexityLevel): number {
  const tokenLimits = {
    SIMPLE: 500,
    MODERATE: 1500,
    COMPLEX: 3000,
    CREATIVE: 2000
  };
  return tokenLimits[complexity];
}

function getDefaultModel(complexity: ComplexityLevel): string {
  // Use GPT-4o mini for simple queries to save cost
  return complexity === 'SIMPLE' ? 'gpt-4o-mini' : 'gpt-4o';
}

function getTimeoutForComplexity(complexity: ComplexityLevel): number {
  const timeouts = {
    SIMPLE: 10000,    // 10 seconds
    MODERATE: 30000,  // 30 seconds
    COMPLEX: 60000,   // 60 seconds
    CREATIVE: 45000   // 45 seconds
  };
  return timeouts[complexity];
}