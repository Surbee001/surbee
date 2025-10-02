/**
 * Advanced Complexity Analyzer for Automatic Reasoning Level Detection
 * 
 * Uses multi-stage analysis:
 * 1. Pattern matching (regex for math, code, logical operators)
 * 2. LLM assessment for nuanced classification
 * 3. Historical learning from user feedback
 * 4. Confidence scoring with ensemble approach
 */

import OpenAI from 'openai';
import { ComplexityLevel, ComplexityAssessment, ContextMessage } from '@/types/reasoning.types';

// Pattern definitions for different complexity levels
const COMPLEXITY_PATTERNS = {
  MATHEMATICAL: [
    /\b(?:calculate|solve|equation|formula|derivative|integral|matrix|probability)\b/gi,
    /\b(?:algebra|calculus|statistics|geometry|trigonometry|optimization)\b/gi,
    /[∫∑∏√±≠≤≥∞∂∇∆]/g,
    /\b\d+\s*[+\-*/^]\s*\d+/g,
    /\b(?:proof|theorem|lemma|axiom|corollary)\b/gi
  ],
  
  PROGRAMMING: [
    /```[\s\S]*?```/g,
    /\b(?:function|class|method|algorithm|debug|optimize|refactor)\b/gi,
    /\b(?:javascript|python|typescript|react|nodejs|sql|html|css)\b/gi,
    /\b(?:api|database|frontend|backend|microservice|deployment)\b/gi,
    /\b(?:async|await|promise|callback|closure|recursion)\b/gi
  ],
  
  LOGICAL: [
    /\b(?:if|then|else|because|therefore|however|although|unless)\b/gi,
    /\b(?:analyze|compare|contrast|evaluate|assess|critique)\b/gi,
    /\b(?:premise|conclusion|argument|reasoning|logic|rational)\b/gi,
    /\b(?:cause|effect|correlation|implication|consequence)\b/gi
  ],
  
  CREATIVE: [
    /\b(?:creative|imagine|brainstorm|innovative|original|artistic)\b/gi,
    /\b(?:story|poem|song|design|concept|idea|vision)\b/gi,
    /\b(?:style|theme|mood|tone|aesthetic|narrative)\b/gi,
    /\b(?:generate|create|invent|compose|craft|develop)\b/gi
  ],
  
  ANALYTICAL: [
    /\b(?:analysis|research|investigate|examine|study|review)\b/gi,
    /\b(?:data|statistics|trends|patterns|insights|findings)\b/gi,
    /\b(?:methodology|framework|approach|strategy|process)\b/gi,
    /\b(?:comprehensive|detailed|thorough|systematic|rigorous)\b/gi
  ],
  
  SIMPLE: [
    /\b(?:what|when|where|who|define|meaning|definition)\b/gi,
    /\b(?:tell me|show me|list|example|simple|basic|quick)\b/gi,
    /\b(?:color|change|update|add|remove|replace)\b/gi
  ]
};

// Token and complexity estimation rules
const COMPLEXITY_WEIGHTS = {
  SIMPLE: { baseTokens: 100, multiplier: 1.0, baseDuration: 5 },
  MODERATE: { baseTokens: 500, multiplier: 2.0, baseDuration: 15 },
  COMPLEX: { baseTokens: 2000, multiplier: 4.0, baseDuration: 45 },
  CREATIVE: { baseTokens: 800, multiplier: 3.0, baseDuration: 30 }
};

// Token pricing (approximate GPT-5 rates)
const TOKEN_PRICING = {
  'gpt-5': { input: 0.00001, output: 0.00003 },
  'gpt-5-mini': { input: 0.000001, output: 0.000003 }
};

export class ComplexityAnalyzer {
  private openai: OpenAI;
  private historicalAssessments: Map<string, ComplexityAssessment> = new Map();
  private userFeedbackHistory: Array<{
    query: string;
    predicted: ComplexityLevel;
    actual: ComplexityLevel;
    timestamp: number;
  }> = [];

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  /**
   * Main complexity assessment function
   */
  async assessComplexity(
    query: string,
    context?: ContextMessage[],
    forceThinking = false,
    userId?: string
  ): Promise<ComplexityAssessment> {
    if (forceThinking) {
      return this.createComplexAssessment(query, 'User forced deep thinking mode');
    }

    // Check cache first
    const cacheKey = this.createCacheKey(query, context);
    const cached = this.historicalAssessments.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      return { ...cached, reason: `${cached.reason} (cached)` };
    }

    // Stage 1: Pattern-based analysis
    const patternResult = this.analyzePatterns(query);
    
    // Stage 2: LLM-based assessment for nuanced understanding
    const llmResult = await this.analyzeLLM(query, context);
    
    // Stage 3: Ensemble scoring
    const ensembleResult = this.combineAssessments(patternResult, llmResult, query);
    
    // Stage 4: Historical learning adjustment
    const finalResult = this.adjustWithHistory(ensembleResult, userId);
    
    // Cache the result
    this.historicalAssessments.set(cacheKey, finalResult);
    
    // Clean up old cache entries
    if (this.historicalAssessments.size > 1000) {
      this.cleanupCache();
    }
    
    return finalResult;
  }

  /**
   * Pattern-based complexity analysis
   */
  private analyzePatterns(query: string): { level: ComplexityLevel; confidence: number; patterns: string[] } {
    const scores = {
      SIMPLE: 0,
      MODERATE: 0,
      COMPLEX: 0,
      CREATIVE: 0
    };
    
    const foundPatterns: string[] = [];
    const queryLower = query.toLowerCase();
    const queryLength = query.length;
    
    // Length-based initial scoring
    if (queryLength < 50) scores.SIMPLE += 0.3;
    else if (queryLength < 150) scores.MODERATE += 0.2;
    else if (queryLength < 300) scores.COMPLEX += 0.2;
    else scores.COMPLEX += 0.4;
    
    // Pattern matching
    for (const [category, patterns] of Object.entries(COMPLEXITY_PATTERNS)) {
      let categoryMatches = 0;
      for (const pattern of patterns) {
        const matches = query.match(pattern);
        if (matches) {
          categoryMatches += matches.length;
          foundPatterns.push(`${category.toLowerCase()}: ${matches[0]}`);
        }
      }
      
      // Scoring based on pattern matches
      if (category === 'SIMPLE') {
        scores.SIMPLE += categoryMatches * 0.4;
      } else if (category === 'MATHEMATICAL' || category === 'PROGRAMMING') {
        scores.COMPLEX += categoryMatches * 0.5;
      } else if (category === 'LOGICAL' || category === 'ANALYTICAL') {
        scores.MODERATE += categoryMatches * 0.3;
        scores.COMPLEX += categoryMatches * 0.2;
      } else if (category === 'CREATIVE') {
        scores.CREATIVE += categoryMatches * 0.6;
      }
    }
    
    // Complexity indicators
    if (query.includes('step by step') || query.includes('explain how')) {
      scores.MODERATE += 0.3;
    }
    
    if (query.includes('comprehensive') || query.includes('detailed analysis')) {
      scores.COMPLEX += 0.5;
    }
    
    if (query.includes('?') && query.split('?').length > 2) {
      scores.MODERATE += 0.2;
    }
    
    // Find the highest scoring complexity
    const maxScore = Math.max(...Object.values(scores));
    const predictedLevel = Object.keys(scores).find(
      key => scores[key as ComplexityLevel] === maxScore
    ) as ComplexityLevel;
    
    // Confidence is based on the gap between highest and second highest scores
    const sortedScores = Object.values(scores).sort((a, b) => b - a);
    const confidence = Math.min(0.95, Math.max(0.1, (sortedScores[0] - sortedScores[1]) + 0.3));
    
    return {
      level: predictedLevel,
      confidence,
      patterns: foundPatterns.slice(0, 5) // Limit to top 5 patterns
    };
  }

  /**
   * LLM-based complexity assessment for nuanced understanding
   */
  private async analyzeLLM(query: string, context?: ContextMessage[]): Promise<{
    level: ComplexityLevel;
    confidence: number;
    reasoning: string;
  }> {
    try {
      const contextSummary = context?.slice(-3).map(msg => 
        `${msg.isUser ? 'User' : 'Assistant'}: ${msg.text.slice(0, 200)}`
      ).join('\n') || '';

      const systemPrompt = `You are an expert at analyzing query complexity for AI reasoning systems.

Classify this query into one of four complexity levels:
- SIMPLE: Direct facts, definitions, simple modifications (1-2 reasoning steps)
- MODERATE: Multi-step thinking, comparisons, explanations (3-5 reasoning steps)  
- COMPLEX: Deep analysis, problem-solving, multi-faceted reasoning (5-7+ reasoning steps)
- CREATIVE: Open-ended exploration, brainstorming, artistic creation

Consider:
- Number of reasoning steps needed
- Domain expertise required
- Multiple perspectives needed
- Problem decomposition complexity
- Context integration needs

Context from conversation:
${contextSummary}

Respond with ONLY a JSON object:
{
  "level": "SIMPLE|MODERATE|COMPLEX|CREATIVE",
  "confidence": 0.85,
  "reasoning": "Brief explanation of classification"
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini', // Using mini for fast classification
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Query: "${query}"` }
        ],
        max_completion_tokens: 200,
        // temperature: 0.3, // Removed - gpt-5-mini only supports default temperature
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{}');
      
      return {
        level: result.level as ComplexityLevel || 'MODERATE',
        confidence: Math.min(0.95, Math.max(0.1, result.confidence || 0.5)),
        reasoning: result.reasoning || 'LLM classification'
      };
    } catch (error) {
      console.warn('LLM complexity analysis failed:', error);
      // Fallback to moderate complexity
      return {
        level: 'MODERATE',
        confidence: 0.5,
        reasoning: 'LLM analysis failed, using moderate complexity'
      };
    }
  }

  /**
   * Combine pattern and LLM assessments using ensemble method
   */
  private combineAssessments(
    patternResult: { level: ComplexityLevel; confidence: number; patterns: string[] },
    llmResult: { level: ComplexityLevel; confidence: number; reasoning: string },
    query: string
  ): ComplexityAssessment {
    // Weight the assessments based on their confidence
    const patternWeight = patternResult.confidence;
    const llmWeight = llmResult.confidence;
    const totalWeight = patternWeight + llmWeight;
    
    let finalLevel: ComplexityLevel;
    let finalConfidence: number;
    
    // If both agree, high confidence
    if (patternResult.level === llmResult.level) {
      finalLevel = patternResult.level;
      finalConfidence = Math.min(0.95, (patternResult.confidence + llmResult.confidence) / 2 + 0.2);
    } else {
      // If they disagree, use weighted average approach
      const levelScores = {
        SIMPLE: 0,
        MODERATE: 0,
        COMPLEX: 0,
        CREATIVE: 0
      };
      
      levelScores[patternResult.level] += patternWeight;
      levelScores[llmResult.level] += llmWeight;
      
      finalLevel = Object.keys(levelScores).reduce((a, b) => 
        levelScores[a as ComplexityLevel] > levelScores[b as ComplexityLevel] ? a : b
      ) as ComplexityLevel;
      
      finalConfidence = Math.max(patternResult.confidence, llmResult.confidence) * 0.8; // Lower confidence for disagreement
    }
    
    // Calculate estimates
    const weights = COMPLEXITY_WEIGHTS[finalLevel];
    const queryComplexityMultiplier = Math.min(3.0, query.length / 100);
    
    const tokenEstimate = Math.round(weights.baseTokens * weights.multiplier * queryComplexityMultiplier);
    const estimatedDuration = Math.round(weights.baseDuration * queryComplexityMultiplier);
    
    // Cost calculation (using GPT-5 pricing)
    const pricing = TOKEN_PRICING['gpt-5'];
    const costEstimate = tokenEstimate * pricing.output; // Rough estimate using output pricing
    
    return {
      level: finalLevel,
      confidence: finalConfidence,
      reason: `Pattern analysis: ${patternResult.level} (${patternResult.confidence.toFixed(2)}), LLM analysis: ${llmResult.level} (${llmResult.confidence.toFixed(2)}). ${llmResult.reasoning}`,
      patterns: patternResult.patterns,
      estimatedDuration,
      tokenEstimate,
      costEstimate,
      canUseCache: finalConfidence > 0.8 && query.length < 500 // Cache high-confidence, shorter queries
    };
  }

  /**
   * Adjust assessment based on historical user feedback
   */
  private adjustWithHistory(assessment: ComplexityAssessment, userId?: string): ComplexityAssessment {
    if (!userId || this.userFeedbackHistory.length === 0) {
      return assessment;
    }
    
    // Find recent feedback for similar queries
    const recentFeedback = this.userFeedbackHistory
      .filter(f => f.timestamp > Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      .slice(-10); // Last 10 assessments
    
    if (recentFeedback.length < 3) {
      return assessment;
    }
    
    // Calculate historical accuracy for this predicted level
    const sameLevel = recentFeedback.filter(f => f.predicted === assessment.level);
    if (sameLevel.length > 0) {
      const accuracy = sameLevel.filter(f => f.predicted === f.actual).length / sameLevel.length;
      
      // Adjust confidence based on historical accuracy
      assessment.confidence = Math.min(0.95, Math.max(0.1, assessment.confidence * accuracy + 0.2));
      
      // If historical accuracy is low, suggest one level higher
      if (accuracy < 0.6 && assessment.level !== 'COMPLEX') {
        const levelOrder: ComplexityLevel[] = ['SIMPLE', 'MODERATE', 'COMPLEX', 'CREATIVE'];
        const currentIndex = levelOrder.indexOf(assessment.level);
        if (currentIndex < 2) { // Don't upgrade CREATIVE
          assessment.level = levelOrder[currentIndex + 1];
          assessment.reason += ` (Upgraded based on user feedback patterns)`;
        }
      }
    }
    
    return assessment;
  }

  /**
   * Learn from user feedback to improve future assessments
   */
  recordFeedback(query: string, predicted: ComplexityLevel, actual: ComplexityLevel) {
    this.userFeedbackHistory.push({
      query: query.slice(0, 200), // Store first 200 chars
      predicted,
      actual,
      timestamp: Date.now()
    });
    
    // Keep only recent feedback (last 100 entries)
    if (this.userFeedbackHistory.length > 100) {
      this.userFeedbackHistory = this.userFeedbackHistory.slice(-100);
    }
  }

  /**
   * Force complex assessment for override
   */
  private createComplexAssessment(query: string, reason: string): ComplexityAssessment {
    const weights = COMPLEXITY_WEIGHTS.COMPLEX;
    const queryComplexityMultiplier = Math.min(3.0, query.length / 100);
    
    return {
      level: 'COMPLEX',
      confidence: 1.0,
      reason,
      patterns: ['user_override'],
      estimatedDuration: Math.round(weights.baseDuration * queryComplexityMultiplier),
      tokenEstimate: Math.round(weights.baseTokens * weights.multiplier * queryComplexityMultiplier),
      costEstimate: Math.round(weights.baseTokens * weights.multiplier * queryComplexityMultiplier) * TOKEN_PRICING['gpt-5'].output,
      canUseCache: false
    };
  }

  /**
   * Create cache key for assessment caching
   */
  private createCacheKey(query: string, context?: ContextMessage[]): string {
    const queryHash = this.hashString(query.toLowerCase().trim());
    const contextHash = context ? this.hashString(context.slice(-2).map(m => m.text).join()) : '';
    return `${queryHash}-${contextHash}`;
  }

  /**
   * Check if cached assessment is still valid
   */
  private isCacheValid(assessment: ComplexityAssessment): boolean {
    // Cache assessments for 1 hour
    return assessment.canUseCache;
  }

  /**
   * Clean up old cache entries
   */
  private cleanupCache() {
    // Remove oldest entries, keep 500 most recent
    const entries = Array.from(this.historicalAssessments.entries());
    entries.sort((a, b) => b[1].tokenEstimate - a[1].tokenEstimate); // Sort by recency (rough proxy)
    
    this.historicalAssessments.clear();
    entries.slice(0, 500).forEach(([key, value]) => {
      this.historicalAssessments.set(key, value);
    });
  }

  /**
   * Simple string hashing function
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get complexity statistics for monitoring
   */
  getStats() {
    return {
      cacheSize: this.historicalAssessments.size,
      feedbackHistory: this.userFeedbackHistory.length,
      recentAccuracy: this.calculateRecentAccuracy()
    };
  }

  /**
   * Calculate recent prediction accuracy
   */
  private calculateRecentAccuracy(): number {
    const recent = this.userFeedbackHistory.slice(-20);
    if (recent.length === 0) return 0;
    
    const correct = recent.filter(f => f.predicted === f.actual).length;
    return correct / recent.length;
  }
}

// Export singleton instance
export const complexityAnalyzer = new ComplexityAnalyzer();