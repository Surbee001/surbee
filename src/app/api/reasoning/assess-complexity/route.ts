/**
 * Complexity Assessment API Endpoint
 * 
 * Provides fast complexity assessment for queries without full reasoning execution.
 * Used for:
 * - UI complexity indicators
 * - Cost estimation
 * - Template suggestions
 * - User education about reasoning levels
 */

import { NextRequest, NextResponse } from 'next/server';
import { complexityAnalyzer } from '@/services/reasoning/ComplexityAnalyzer';
import { reasoningTemplateManager } from '@/services/reasoning/ReasoningTemplates';
import { memoryManager } from '@/services/reasoning/MemoryManager';
import {
  ComplexityAssessment,
  ContextMessage,
  ReasoningTemplate
} from '@/types/reasoning.types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface AssessmentRequest {
  query: string;
  contextHistory?: ContextMessage[];
  userId?: string;
  includeTemplates?: boolean;
  includeCostEstimate?: boolean;
}

interface AssessmentResponse {
  complexity: ComplexityAssessment;
  suggestedTemplates?: Array<{
    id: string;
    name: string;
    description: string;
    matchScore: number;
    estimatedDuration: number;
    successRate: number;
  }>;
  costBreakdown?: {
    estimatedTokens: number;
    estimatedCost: number;
    costByPhase: Array<{
      phase: string;
      tokens: number;
      cost: number;
    }>;
  };
  recommendations?: {
    shouldUseThinking: boolean;
    suggestedModel: string;
    riskFactors: string[];
    optimizations: string[];
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: AssessmentRequest = await request.json();
    const { 
      query, 
      contextHistory, 
      userId,
      includeTemplates = true,
      includeCostEstimate = true
    } = body;

    // Validate input
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

    // Get relevant context if user provided
    let relevantContext: ContextMessage[] = [];
    if (contextHistory && contextHistory.length > 0) {
      // For assessment, we don't need full session setup
      // Just use the provided context directly, limiting to recent messages
      relevantContext = contextHistory.slice(-5);
    }

    // Perform complexity assessment
    const complexity = await complexityAnalyzer.assessComplexity(
      query,
      relevantContext,
      false, // Don't force thinking for assessment
      userId
    );

    const response: AssessmentResponse = {
      complexity
    };

    // Add template suggestions if requested
    if (includeTemplates) {
      const allTemplates = reasoningTemplateManager.getTemplates({
        complexity: complexity.level,
        sortBy: 'success_rate'
      });

      const suggestedTemplates = allTemplates.slice(0, 3).map(template => {
        // Calculate match score based on query patterns
        let matchScore = 0;
        const queryLower = query.toLowerCase();
        
        for (const pattern of template.queryPatterns) {
          const matches = query.match(pattern);
          if (matches) {
            matchScore += matches.length * 10;
          }
        }

        // Factor in template tags
        for (const tag of template.metadata.tags) {
          if (queryLower.includes(tag.replace('-', ' '))) {
            matchScore += 5;
          }
        }

        const stats = reasoningTemplateManager.getTemplateStats(template.id);
        
        return {
          id: template.id,
          name: template.name,
          description: template.description,
          matchScore: Math.min(100, matchScore),
          estimatedDuration: stats?.stats.avgDuration || template.metadata.avgDuration || 30,
          successRate: Math.round((stats?.stats.successRate || template.metadata.successRate || 0.8) * 100)
        };
      }).filter(t => t.matchScore > 0);

      response.suggestedTemplates = suggestedTemplates;
    }

    // Add cost breakdown if requested
    if (includeCostEstimate) {
      const tokenEstimate = complexity.tokenEstimate;
      const costEstimate = complexity.costEstimate;

      // Estimate cost breakdown by phases based on complexity
      const phaseBreakdown = getPhaseTokenBreakdown(complexity.level, tokenEstimate);
      
      response.costBreakdown = {
        estimatedTokens: tokenEstimate,
        estimatedCost: costEstimate,
        costByPhase: phaseBreakdown.map(phase => ({
          ...phase,
          cost: phase.tokens * 0.00003 // GPT-5 approximate pricing
        }))
      };
    }

    // Add recommendations
    response.recommendations = generateRecommendations(complexity, query, userId);

    // Log assessment for analytics (in production, this would be async)
    if (userId) {
      try {
        // Could store in complexity_assessments table for learning
        console.log('Complexity assessment logged:', {
          userId,
          query: query.slice(0, 100),
          level: complexity.level,
          confidence: complexity.confidence
        });
      } catch (logError) {
        console.warn('Failed to log assessment:', logError);
      }
    }

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Complexity assessment error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to assess query complexity',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * Generate phase-based token breakdown for cost estimation
 */
function getPhaseTokenBreakdown(complexity: string, totalTokens: number): Array<{
  phase: string;
  tokens: number;
  description: string;
}> {
  switch (complexity) {
    case 'SIMPLE':
      return [
        { phase: 'Direct Answer', tokens: totalTokens, description: 'Immediate response generation' }
      ];

    case 'MODERATE':
      return [
        { phase: 'Understanding', tokens: Math.round(totalTokens * 0.2), description: 'Query analysis and comprehension' },
        { phase: 'Planning', tokens: Math.round(totalTokens * 0.3), description: 'Approach planning and strategy' },
        { phase: 'Execution', tokens: Math.round(totalTokens * 0.5), description: 'Solution development and response' }
      ];

    case 'COMPLEX':
      return [
        { phase: 'Decomposition', tokens: Math.round(totalTokens * 0.15), description: 'Problem breakdown' },
        { phase: 'Knowledge Gathering', tokens: Math.round(totalTokens * 0.15), description: 'Information collection' },
        { phase: 'Approach Planning', tokens: Math.round(totalTokens * 0.15), description: 'Strategy development' },
        { phase: 'Detailed Reasoning', tokens: Math.round(totalTokens * 0.25), description: 'Deep analysis and computation' },
        { phase: 'Self-Critique', tokens: Math.round(totalTokens * 0.10), description: 'Validation and error checking' },
        { phase: 'Alternative Exploration', tokens: Math.round(totalTokens * 0.10), description: 'Alternative approaches' },
        { phase: 'Synthesis', tokens: Math.round(totalTokens * 0.10), description: 'Final integration and response' }
      ];

    case 'CREATIVE':
      return [
        { phase: 'Brainstorming', tokens: Math.round(totalTokens * 0.6), description: 'Creative idea generation' },
        { phase: 'Convergence', tokens: Math.round(totalTokens * 0.4), description: 'Idea refinement and synthesis' }
      ];

    default:
      return [
        { phase: 'Processing', tokens: totalTokens, description: 'Query processing' }
      ];
  }
}

/**
 * Generate personalized recommendations based on assessment
 */
function generateRecommendations(
  complexity: ComplexityAssessment,
  query: string,
  userId?: string
): {
  shouldUseThinking: boolean;
  suggestedModel: string;
  riskFactors: string[];
  optimizations: string[];
} {
  const recommendations = {
    shouldUseThinking: complexity.level !== 'SIMPLE' || complexity.confidence < 0.7,
    suggestedModel: complexity.level === 'SIMPLE' ? 'gpt-4o-mini' : 'gpt-4o',
    riskFactors: [] as string[],
    optimizations: [] as string[]
  };

  // Risk factors
  if (complexity.confidence < 0.6) {
    recommendations.riskFactors.push('Low complexity confidence - results may vary');
  }

  if (complexity.tokenEstimate > 2000) {
    recommendations.riskFactors.push('High token usage - consider breaking into smaller queries');
  }

  if (complexity.costEstimate > 0.25) {
    recommendations.riskFactors.push('High estimated cost - consider optimization');
  }

  if (query.length > 1000) {
    recommendations.riskFactors.push('Long query - may benefit from summarization');
  }

  // Optimizations
  if (complexity.level === 'SIMPLE' && query.length < 100) {
    recommendations.optimizations.push('Use direct mode for faster, cheaper responses');
  }

  if (complexity.canUseCache) {
    recommendations.optimizations.push('Similar queries may be cached for instant results');
  }

  if (complexity.level === 'COMPLEX' && query.includes('step by step')) {
    recommendations.optimizations.push('Consider using the math problem solving template');
  }

  if (query.toLowerCase().includes('debug') || query.toLowerCase().includes('error')) {
    recommendations.optimizations.push('Code debugging template may provide better structure');
  }

  if (complexity.level === 'CREATIVE') {
    recommendations.optimizations.push('Creative queries benefit from higher temperature settings');
  }

  return recommendations;
}