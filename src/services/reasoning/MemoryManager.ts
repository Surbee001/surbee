/**
 * Memory Manager for the Reasoning System
 * 
 * Handles both short-term (session) and long-term (persistent) memory:
 * - Short-term: Last 10 conversations, reasoning patterns, complexity history
 * - Long-term: User preferences, conversation history, learned patterns
 * - Context window management with sliding window approach
 * - Semantic similarity matching using embeddings
 */

import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';
import {
  ShortTermMemory,
  LongTermMemory,
  ContextMessage,
  ReasoningResult,
  ComplexityAssessment,
  ComplexityLevel,
  ReasoningCache
} from '@/types/reasoning.types';

interface SimilarityMatch {
  query: string;
  similarity: number;
  complexity: ComplexityLevel;
  result?: ReasoningResult;
}

export class MemoryManager {
  private openai: OpenAI;
  private shortTermMemory: Map<string, ShortTermMemory> = new Map();
  private cache: Map<string, ReasoningCache> = new Map();
  private static readonly MAX_CONTEXT_TOKENS = 8000;
  private static readonly MAX_NEW_THINKING_TOKENS = 4000;
  private static readonly SIMILARITY_THRESHOLD = 0.85;
  private static readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  // =================== SHORT-TERM MEMORY ===================

  /**
   * Initialize or get short-term memory for a session
   */
  async initializeSession(sessionId: string, userId?: string): Promise<ShortTermMemory> {
    let memory = this.shortTermMemory.get(sessionId);
    
    if (!memory) {
      memory = {
        sessionId,
        messages: [],
        reasoningPatterns: [],
        complexityHistory: [],
        userPreferences: await this.getUserPreferences(userId),
        cacheMisses: []
      };
      
      this.shortTermMemory.set(sessionId, memory);
    }
    
    return memory;
  }

  /**
   * Add a message to short-term memory
   */
  addMessage(
    sessionId: string,
    message: ContextMessage,
    reasoning?: ReasoningResult
  ): void {
    const memory = this.shortTermMemory.get(sessionId);
    if (!memory) return;

    // Add reasoning result to message if provided
    if (reasoning) {
      message.reasoning = reasoning;
      message.tokenCount = reasoning.totalTokens;
    }

    memory.messages.push(message);
    
    // Keep only last 10 messages for performance
    if (memory.messages.length > 10) {
      memory.messages = memory.messages.slice(-10);
    }

    // Extract reasoning patterns
    if (reasoning) {
      this.extractReasoningPatterns(memory, reasoning);
    }
  }

  /**
   * Add complexity assessment to history
   */
  addComplexityAssessment(sessionId: string, assessment: ComplexityAssessment): void {
    const memory = this.shortTermMemory.get(sessionId);
    if (!memory) return;

    memory.complexityHistory.push(assessment);
    
    // Keep only last 20 assessments
    if (memory.complexityHistory.length > 20) {
      memory.complexityHistory = memory.complexityHistory.slice(-20);
    }
  }

  /**
   * Get contextual messages with relevance scoring
   */
  async getRelevantContext(
    sessionId: string,
    currentQuery: string,
    maxTokens: number = MemoryManager.MAX_CONTEXT_TOKENS
  ): Promise<ContextMessage[]> {
    const memory = this.shortTermMemory.get(sessionId);
    if (!memory || memory.messages.length === 0) return [];

    // Calculate relevance scores using semantic similarity
    const messagesWithRelevance = await Promise.all(
      memory.messages.map(async (msg) => ({
        ...msg,
        relevanceScore: await this.calculateRelevance(currentQuery, msg.text)
      }))
    );

    // Sort by relevance and recency (weighted combination)
    messagesWithRelevance.sort((a, b) => {
      const aScore = (a.relevanceScore || 0) * 0.7 + (a.timestamp.getTime() / Date.now()) * 0.3;
      const bScore = (b.relevanceScore || 0) * 0.7 + (b.timestamp.getTime() / Date.now()) * 0.3;
      return bScore - aScore;
    });

    // Select messages within token budget
    const selectedMessages: ContextMessage[] = [];
    let currentTokens = 0;

    for (const msg of messagesWithRelevance) {
      const msgTokens = this.estimateTokens(msg.text);
      if (currentTokens + msgTokens <= maxTokens) {
        selectedMessages.push(msg);
        currentTokens += msgTokens;
      } else {
        break;
      }
    }

    // Return in chronological order
    return selectedMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Extract reasoning patterns from completed reasoning
   */
  private extractReasoningPatterns(memory: ShortTermMemory, reasoning: ReasoningResult): void {
    const patterns = [];
    
    // Pattern: Complexity progression
    if (reasoning.complexity.level !== 'SIMPLE') {
      patterns.push(`complexity_${reasoning.complexity.level.toLowerCase()}`);
    }
    
    // Pattern: Phase types used
    reasoning.phases.forEach(phase => {
      patterns.push(`phase_${phase.type}`);
    });
    
    // Pattern: Correction frequency
    if (reasoning.corrections && reasoning.corrections.length > 0) {
      patterns.push(`self_correction_${reasoning.corrections.length}`);
    }
    
    // Pattern: Token usage range
    const tokenRange = reasoning.totalTokens < 500 ? 'low' : 
                      reasoning.totalTokens < 1500 ? 'medium' : 'high';
    patterns.push(`tokens_${tokenRange}`);

    // Add unique patterns to memory
    patterns.forEach(pattern => {
      if (!memory.reasoningPatterns.includes(pattern)) {
        memory.reasoningPatterns.push(pattern);
      }
    });

    // Keep only recent patterns (last 50)
    if (memory.reasoningPatterns.length > 50) {
      memory.reasoningPatterns = memory.reasoningPatterns.slice(-50);
    }
  }

  // =================== LONG-TERM MEMORY ===================

  /**
   * Get user preferences from long-term storage
   */
  async getUserPreferences(userId?: string) {
    if (!userId) {
      return {
        preferredComplexity: undefined,
        alwaysShowThinking: false,
        preferredVerbosity: 'detailed' as const
      };
    }

    // Skip database call for demo/mock users
    if (userId === 'demo-user' || process.env.NEXT_PUBLIC_MOCK_PROJECT === 'true') {
      return {
        preferredComplexity: undefined,
        alwaysShowThinking: true,
        preferredVerbosity: 'detailed' as const
      };
    }

    try {
      const { data, error } = await supabase
        .from('user_reasoning_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error is OK
        console.warn('Failed to fetch user preferences:', error);
      }

      return {
        preferredComplexity: data?.preferred_complexity as ComplexityLevel,
        alwaysShowThinking: data?.always_show_thinking || false,
        preferredVerbosity: data?.preferred_verbosity || 'detailed'
      };
    } catch (error) {
      console.warn('Error fetching user preferences:', error);
      return {
        preferredComplexity: undefined,
        alwaysShowThinking: false,
        preferredVerbosity: 'detailed' as const
      };
    }
  }

  /**
   * Update user preferences in long-term storage
   */
  async updateUserPreferences(
    userId: string,
    preferences: Partial<{
      preferredComplexity: ComplexityLevel;
      alwaysShowThinking: boolean;
      preferredVerbosity: string;
    }>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_reasoning_preferences')
        .upsert({
          user_id: userId,
          preferred_complexity: preferences.preferredComplexity,
          always_show_thinking: preferences.alwaysShowThinking,
          preferred_verbosity: preferences.preferredVerbosity,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      // Update short-term memory for active sessions
      for (const [sessionId, memory] of this.shortTermMemory.entries()) {
        if (preferences.preferredComplexity) {
          memory.userPreferences.preferredComplexity = preferences.preferredComplexity;
        }
        if (preferences.alwaysShowThinking !== undefined) {
          memory.userPreferences.alwaysShowThinking = preferences.alwaysShowThinking;
        }
        if (preferences.preferredVerbosity) {
          memory.userPreferences.preferredVerbosity = preferences.preferredVerbosity as any;
        }
      }
    } catch (error) {
      console.error('Failed to update user preferences:', error);
      throw new Error('Failed to save preferences');
    }
  }

  /**
   * Store reasoning session in long-term memory
   */
  async storeReasoningSession(
    userId: string,
    sessionId: string,
    reasoning: ReasoningResult,
    feedback?: { rating: number; text?: string }
  ): Promise<void> {
    // Skip database storage for demo/mock users
    if (userId === 'demo-user' || process.env.NEXT_PUBLIC_MOCK_PROJECT === 'true') {
      console.log('Skipping database storage for demo user');
      return;
    }

    try {
      // Store main session
      const { error: sessionError } = await supabase
        .from('reasoning_sessions')
        .insert({
          id: reasoning.id,
          user_id: userId,
          session_id: sessionId,
          query: reasoning.query,
          complexity_level: reasoning.complexity.level,
          complexity_confidence: reasoning.complexity.confidence,
          total_tokens: reasoning.totalTokens,
          total_cost: reasoning.totalCost,
          duration: reasoning.duration,
          confidence: reasoning.confidence,
          model: reasoning.metadata.model,
          template_used: reasoning.metadata.templateUsed,
          correction_count: reasoning.corrections?.length || 0,
          user_feedback_rating: feedback?.rating,
          user_feedback_text: feedback?.text,
          created_at: new Date(reasoning.metadata.startTime).toISOString(),
          metadata: reasoning.metadata
        });

      if (sessionError) throw sessionError;

      // Store individual reasoning phases
      if (reasoning.phases.length > 0) {
        const phaseInserts = reasoning.phases.map(phase => ({
          session_id: reasoning.id,
          phase_type: phase.type,
          title: phase.title,
          content: phase.content,
          token_count: phase.tokenCount,
          duration: phase.duration,
          confidence: phase.confidence,
          temperature: phase.temperature,
          has_correction: phase.hasCorrection || false,
          created_at: new Date(phase.startTime).toISOString()
        }));

        const { error: phasesError } = await supabase
          .from('reasoning_phases')
          .insert(phaseInserts);

        if (phasesError) throw phasesError;
      }

      // Update user performance metrics
      await this.updateUserMetrics(userId, reasoning, feedback?.rating);

    } catch (error) {
      console.error('Failed to store reasoning session:', error);
      // Don't throw - this is not critical for the user experience
    }
  }

  /**
   * Get user's reasoning history for learning
   */
  async getUserReasoningHistory(
    userId: string,
    limit: number = 50
  ): Promise<Array<{
    query: string;
    complexity: ComplexityLevel;
    success: boolean;
    feedback?: number;
    timestamp: Date;
  }>> {
    try {
      const { data, error } = await supabase
        .from('reasoning_sessions')
        .select('query, complexity_level, user_feedback_rating, created_at, confidence')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data?.map(session => ({
        query: session.query,
        complexity: session.complexity_level as ComplexityLevel,
        success: session.confidence > 0.7, // Consider successful if confidence > 0.7
        feedback: session.user_feedback_rating,
        timestamp: new Date(session.created_at)
      })) || [];

    } catch (error) {
      console.error('Failed to fetch user reasoning history:', error);
      return [];
    }
  }

  // =================== CACHING SYSTEM ===================

  /**
   * Check cache for similar queries
   */
  async getCachedResult(query: string, userId?: string): Promise<ReasoningResult | null> {
    const queryEmbedding = await this.getEmbedding(query);
    const queryHash = this.hashString(query.toLowerCase().trim());

    // Check exact match first
    const exactMatch = this.cache.get(queryHash);
    if (exactMatch && this.isCacheValid(exactMatch)) {
      exactMatch.hitCount++;
      exactMatch.lastAccessed = Date.now();
      return exactMatch.result;
    }

    // Check semantic similarity
    const similarMatches = await this.findSimilarCachedQueries(queryEmbedding, query);
    
    for (const match of similarMatches) {
      if (match.similarity >= MemoryManager.SIMILARITY_THRESHOLD) {
        const cached = this.cache.get(this.hashString(match.query));
        if (cached && this.isCacheValid(cached)) {
          cached.hitCount++;
          cached.lastAccessed = Date.now();
          cached.similarity = match.similarity;
          return cached.result;
        }
      }
    }

    return null;
  }

  /**
   * Cache reasoning result
   */
  async cacheResult(
    query: string,
    result: ReasoningResult,
    userId?: string
  ): Promise<void> {
    if (!result.complexity.canUseCache) return;

    const queryHash = this.hashString(query.toLowerCase().trim());
    const now = Date.now();

    const cacheEntry: ReasoningCache = {
      key: queryHash,
      query,
      queryHash,
      complexity: result.complexity.level,
      result,
      timestamp: now,
      hitCount: 0,
      lastAccessed: now,
      ttl: MemoryManager.CACHE_TTL,
      tags: this.extractCacheTags(query, result)
    };

    this.cache.set(queryHash, cacheEntry);

    // Clean up old cache entries
    if (this.cache.size > 500) {
      this.cleanupCache();
    }

    // Optionally store in database for cross-session caching
    if (userId) {
      await this.storeCacheInDatabase(cacheEntry, userId);
    }
  }

  /**
   * Find similar cached queries using embeddings
   */
  private async findSimilarCachedQueries(
    queryEmbedding: number[],
    query: string
  ): Promise<SimilarityMatch[]> {
    const matches: SimilarityMatch[] = [];

    // For now, use in-memory cache comparison
    // In production, this would use a vector database
    for (const [_, cached] of this.cache.entries()) {
      if (this.isCacheValid(cached)) {
        const cachedEmbedding = await this.getEmbedding(cached.query);
        const similarity = this.cosineSimilarity(queryEmbedding, cachedEmbedding);
        
        if (similarity > 0.7) { // Lower threshold for matches list
          matches.push({
            query: cached.query,
            similarity,
            complexity: cached.complexity,
            result: cached.result
          });
        }
      }
    }

    return matches.sort((a, b) => b.similarity - a.similarity).slice(0, 5);
  }

  // =================== UTILITY METHODS ===================

  /**
   * Calculate semantic similarity between two texts
   */
  private async calculateRelevance(query1: string, query2: string): Promise<number> {
    try {
      const [embedding1, embedding2] = await Promise.all([
        this.getEmbedding(query1),
        this.getEmbedding(query2)
      ]);

      return this.cosineSimilarity(embedding1, embedding2);
    } catch (error) {
      console.warn('Failed to calculate relevance:', error);
      return 0.5; // Default relevance
    }
  }

  /**
   * Get text embedding using OpenAI
   */
  private async getEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small', // Cheaper and faster
        input: text.slice(0, 8000) // Limit input size
      });

      return response.data[0].embedding;
    } catch (error) {
      console.warn('Failed to get embedding:', error);
      // Return zero vector as fallback
      return new Array(1536).fill(0);
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

    if (magnitudeA === 0 || magnitudeB === 0) return 0;

    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Estimate token count for text
   */
  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  /**
   * Update user performance metrics
   */
  private async updateUserMetrics(
    userId: string,
    reasoning: ReasoningResult,
    feedback?: number
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc('update_user_reasoning_metrics', {
        p_user_id: userId,
        p_tokens: reasoning.totalTokens,
        p_cost: reasoning.totalCost,
        p_rating: feedback
      });

      if (error) throw error;
    } catch (error) {
      console.warn('Failed to update user metrics:', error);
    }
  }

  /**
   * Extract cache tags from query and result
   */
  private extractCacheTags(query: string, result: ReasoningResult): string[] {
    const tags = [];
    
    tags.push(`complexity_${result.complexity.level.toLowerCase()}`);
    tags.push(`model_${result.metadata.model}`);
    
    if (result.metadata.templateUsed) {
      tags.push(`template_${result.metadata.templateUsed}`);
    }
    
    // Extract domain tags from query
    const domains = ['math', 'code', 'creative', 'analysis', 'survey'];
    for (const domain of domains) {
      if (query.toLowerCase().includes(domain)) {
        tags.push(`domain_${domain}`);
      }
    }
    
    return tags;
  }

  /**
   * Check if cache entry is valid
   */
  private isCacheValid(cache: ReasoningCache): boolean {
    return Date.now() - cache.timestamp < cache.ttl;
  }

  /**
   * Clean up old cache entries
   */
  private cleanupCache(): void {
    const entries = Array.from(this.cache.entries());
    
    // Remove expired entries
    entries.forEach(([key, cache]) => {
      if (!this.isCacheValid(cache)) {
        this.cache.delete(key);
      }
    });

    // If still too large, remove least recently used
    if (this.cache.size > 400) {
      const sortedEntries = entries
        .filter(([_, cache]) => this.isCacheValid(cache))
        .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

      const toRemove = sortedEntries.slice(0, this.cache.size - 400);
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  /**
   * Store cache entry in database for persistence
   */
  private async storeCacheInDatabase(
    cache: ReasoningCache,
    userId: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('reasoning_cache')
        .upsert({
          cache_key: cache.key,
          user_id: userId,
          query: cache.query,
          complexity_level: cache.complexity,
          result: cache.result,
          hit_count: cache.hitCount,
          created_at: new Date(cache.timestamp).toISOString(),
          expires_at: new Date(cache.timestamp + cache.ttl).toISOString(),
          tags: cache.tags
        });

      if (error && error.code !== '23505') { // Ignore duplicate key errors
        throw error;
      }
    } catch (error) {
      console.warn('Failed to store cache in database:', error);
    }
  }

  /**
   * Hash string for caching
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Clean up session data
   */
  cleanupSession(sessionId: string): void {
    this.shortTermMemory.delete(sessionId);
  }

  /**
   * Get memory statistics
   */
  getStats() {
    return {
      shortTermSessions: this.shortTermMemory.size,
      cacheEntries: this.cache.size,
      cacheHitRate: this.calculateCacheHitRate(),
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  /**
   * Calculate cache hit rate
   */
  private calculateCacheHitRate(): number {
    const entries = Array.from(this.cache.values());
    if (entries.length === 0) return 0;

    const totalRequests = entries.reduce((sum, cache) => sum + cache.hitCount + 1, 0);
    const hits = entries.reduce((sum, cache) => sum + cache.hitCount, 0);

    return totalRequests > 0 ? hits / totalRequests : 0;
  }

  /**
   * Estimate memory usage
   */
  private estimateMemoryUsage(): { shortTerm: string; cache: string } {
    const shortTermSize = Array.from(this.shortTermMemory.values())
      .reduce((sum, memory) => sum + JSON.stringify(memory).length, 0);
    
    const cacheSize = Array.from(this.cache.values())
      .reduce((sum, cache) => sum + JSON.stringify(cache).length, 0);

    return {
      shortTerm: `${Math.round(shortTermSize / 1024)} KB`,
      cache: `${Math.round(cacheSize / 1024)} KB`
    };
  }
}

// Export singleton instance
export const memoryManager = new MemoryManager();