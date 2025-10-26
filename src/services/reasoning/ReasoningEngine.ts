/**
 * Core Reasoning Engine - Orchestrates the entire thinking process
 * 
 * Handles different complexity levels with appropriate reasoning strategies:
 * - SIMPLE: Direct response, minimal thinking
 * - MODERATE: 3-stage thinking (Understanding → Planning → Execution)  
 * - COMPLEX: 7-stage deep thinking with backtracking support
 * - CREATIVE: Brainstorming with parallel thought streams
 */

import OpenAI from 'openai';
import {
  ComplexityLevel,
  ComplexityAssessment,
  ReasoningConfig,
  ReasoningResult,
  ReasoningPhase,
  ReasoningPhaseType,
  CorrectionEvent,
  ReasoningPath,
  StreamEvent,
  ContextMessage
} from '@/types/reasoning.types';
import { complexityAnalyzer } from './ComplexityAnalyzer';

// Phase definitions for different complexity levels
// Using reasoning effort and verbosity for GPT-5 instead of temperature
const PHASE_DEFINITIONS = {
  SIMPLE: [], // No phases, direct response

  MODERATE: [
    { type: 'understanding', title: 'Understanding', reasoning: 'medium', verbosity: 'medium' },
    { type: 'planning', title: 'Planning Approach', reasoning: 'medium', verbosity: 'medium' },
    { type: 'execution', title: 'Executing Solution', reasoning: 'medium', verbosity: 'high' }
  ],

  COMPLEX: [
    { type: 'decomposition', title: 'Problem Decomposition', reasoning: 'high', verbosity: 'medium' },
    { type: 'knowledge_gathering', title: 'Knowledge Gathering', reasoning: 'high', verbosity: 'medium' },
    { type: 'approach_planning', title: 'Approach Planning', reasoning: 'high', verbosity: 'high' },
    { type: 'detailed_reasoning', title: 'Detailed Reasoning', reasoning: 'high', verbosity: 'high' },
    { type: 'self_critique', title: 'Self-Critique', reasoning: 'high', verbosity: 'medium' },
    { type: 'alternative_exploration', title: 'Alternative Exploration', reasoning: 'high', verbosity: 'high' },
    { type: 'synthesis', title: 'Synthesis', reasoning: 'high', verbosity: 'medium' }
  ],

  CREATIVE: [
    { type: 'brainstorming', title: 'Brainstorming', reasoning: 'high', verbosity: 'high' },
    { type: 'convergence', title: 'Convergence', reasoning: 'medium', verbosity: 'medium' }
  ]
} as const;

// Self-correction trigger phrases
const CORRECTION_TRIGGERS = [
  'actually, wait',
  'on second thought',
  'let me reconsider',
  'i need to revise',
  'that\'s not quite right',
  'let me think again',
  'i should correct',
  'wait, i realize',
  'hmm, actually'
];

export class ReasoningEngine {
  private openai: OpenAI;
  private activeSession: string | null = null;
  private sessionPhases: Map<string, ReasoningPhase[]> = new Map();
  private sessionCorrections: Map<string, CorrectionEvent[]> = new Map();
  private streamCallback?: (event: StreamEvent) => void;
  private abortController?: AbortController;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  /**
   * Main reasoning process orchestration
   */
  async processQuery(
    query: string,
    config: ReasoningConfig,
    onStream?: (event: StreamEvent) => void
  ): Promise<ReasoningResult> {
    this.streamCallback = onStream;
    this.abortController = new AbortController();
    
    const sessionId = this.generateSessionId();
    this.activeSession = sessionId;
    this.sessionPhases.set(sessionId, []);
    this.sessionCorrections.set(sessionId, []);

    const startTime = Date.now();

    try {
      // Emit start event
      this.emitStream({
        type: 'thinking_start',
        data: {
          timestamp: startTime,
          content: `Starting ${config.complexity.toLowerCase()} reasoning...`
        }
      });

      let result: ReasoningResult;

      // Route to appropriate reasoning strategy based on complexity
      switch (config.complexity) {
        case 'SIMPLE':
          result = await this.processSimple(query, config, sessionId);
          break;
        case 'MODERATE':
          result = await this.processModerate(query, config, sessionId);
          break;
        case 'COMPLEX':
          result = await this.processComplex(query, config, sessionId);
          break;
        case 'CREATIVE':
          result = await this.processCreative(query, config, sessionId);
          break;
        default:
          throw new Error(`Unknown complexity level: ${config.complexity}`);
      }

      const endTime = Date.now();
      result.duration = endTime - startTime;
      result.metadata.startTime = startTime;
      result.metadata.endTime = endTime;

      // Emit completion event
      this.emitStream({
        type: 'thinking_complete',
        data: {
          timestamp: endTime,
          content: 'Reasoning complete',
          progress: 100
        }
      });

      return result;

    } catch (error: any) {
      this.emitStream({
        type: 'error',
        data: {
          content: error.message || 'An error occurred during reasoning',
          timestamp: Date.now()
        }
      });
      throw error;
    } finally {
      this.cleanup(sessionId);
    }
  }

  /**
   * Process SIMPLE queries - direct response with minimal thinking
   */
  private async processSimple(
    query: string,
    config: ReasoningConfig,
    sessionId: string
  ): Promise<ReasoningResult> {
    const model = config.model || 'gpt-5-nano';
    const startTime = Date.now();

    // For simple queries, go straight to answer generation
    this.emitStream({
      type: 'answer_start',
      data: { timestamp: startTime }
    });

    // Prepare API parameters for current OpenAI models
    const apiParams: any = {
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant. Provide clear, concise answers to user questions. Be direct and accurate.'
        },
        ...this.buildContextMessages(config.contextHistory),
        { role: 'user', content: query }
      ],
      max_completion_tokens: config.maxTokens || 500,
      temperature: 0.3, // Low temperature for simple queries
      stream: true
    };

    const response = await this.openai.chat.completions.create(apiParams, {
      signal: this.abortController?.signal
    });

    let answer = '';
    let tokenCount = 0;

    for await (const chunk of response) {
      if (this.abortController?.signal.aborted) break;
      
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        answer += content;
        tokenCount++;
        
        this.emitStream({
          type: 'answer_chunk',
          data: {
            content,
            tokenCount,
            timestamp: Date.now()
          }
        });
      }
    }

    return {
      id: sessionId,
      query,
      complexity: {
        level: 'SIMPLE',
        confidence: 1.0,
        reason: 'Simple query processed directly',
        patterns: [],
        estimatedDuration: 5,
        tokenEstimate: tokenCount,
        costEstimate: this.calculateCost(tokenCount, model),
        canUseCache: true
      },
      phases: [], // No thinking phases for simple queries
      finalAnswer: answer,
      totalTokens: tokenCount,
      totalCost: this.calculateCost(tokenCount, model),
      duration: Date.now() - startTime,
      confidence: 0.9,
      metadata: {
        model,
        startTime,
        endTime: Date.now(),
        cacheHit: false
      }
    };
  }

  /**
   * Process MODERATE queries - 3-stage thinking
   */
  private async processModerate(
    query: string,
    config: ReasoningConfig,
    sessionId: string
  ): Promise<ReasoningResult> {
    const phases = PHASE_DEFINITIONS.MODERATE;
    const model = config.model || 'gpt-5-nano';
    let totalTokens = 0;
    const allPhases: ReasoningPhase[] = [];

    // Execute each phase
    for (let i = 0; i < phases.length; i++) {
      const phaseConfig = phases[i];
      const isLastPhase = i === phases.length - 1;
      
      const phase = await this.executePhase(
        phaseConfig.type as ReasoningPhaseType,
        phaseConfig.title,
        query,
        config,
        sessionId,
        model,
        phaseConfig.reasoning,
        phaseConfig.verbosity,
        isLastPhase ? 'final_answer' : 'thinking_step',
        allPhases
      );
      
      allPhases.push(phase);
      totalTokens += phase.tokenCount || 0;

      // Progress update
      const progress = ((i + 1) / phases.length) * 100;
      this.emitStream({
        type: 'progress',
        data: { progress, phaseType: phase.type, timestamp: Date.now() }
      });
    }

    // Generate final answer based on all phases
    const finalAnswer = await this.generateFinalAnswer(query, allPhases, config, model);
    totalTokens += finalAnswer.tokenCount;

    return {
      id: sessionId,
      query,
      complexity: {
        level: 'MODERATE',
        confidence: 0.85,
        reason: '3-stage reasoning process',
        patterns: ['multi-step'],
        estimatedDuration: 15,
        tokenEstimate: totalTokens,
        costEstimate: this.calculateCost(totalTokens, model),
        canUseCache: false
      },
      phases: allPhases,
      finalAnswer: finalAnswer.content,
      totalTokens,
      totalCost: this.calculateCost(totalTokens, model),
      duration: 0, // Will be set by caller
      confidence: 0.85,
      corrections: this.sessionCorrections.get(sessionId) || [],
      metadata: {
        model,
        startTime: 0, // Will be set by caller
        endTime: 0,
        correctionCount: this.sessionCorrections.get(sessionId)?.length || 0
      }
    };
  }

  /**
   * Process COMPLEX queries - 7-stage deep thinking with backtracking
   */
  private async processComplex(
    query: string,
    config: ReasoningConfig,
    sessionId: string
  ): Promise<ReasoningResult> {
    const phases = PHASE_DEFINITIONS.COMPLEX;
    const model = config.model || 'gpt-5-nano';
    let totalTokens = 0;
    const allPhases: ReasoningPhase[] = [];

    // Enable parallel processing for certain phases if requested
    if (config.enableParallel) {
      return await this.processComplexParallel(query, config, sessionId);
    }

    // Execute each phase with self-correction monitoring
    for (let i = 0; i < phases.length; i++) {
      const phaseConfig = phases[i];
      const isLastPhase = i === phases.length - 1;
      
      const phase = await this.executePhase(
        phaseConfig.type as ReasoningPhaseType,
        phaseConfig.title,
        query,
        config,
        sessionId,
        model,
        phaseConfig.reasoning,
        phaseConfig.verbosity,
        isLastPhase ? 'final_answer' : 'thinking_step',
        allPhases
      );
      
      allPhases.push(phase);
      totalTokens += phase.tokenCount || 0;

      // Check for self-correction after each phase
      const corrections = await this.detectSelfCorrection(phase, sessionId);
      if (corrections.length > 0) {
        // Re-execute the phase if corrections were detected
        const correctedPhase = await this.executePhase(
          phaseConfig.type as ReasoningPhaseType,
          `${phaseConfig.title} (Corrected)`,
          query,
          config,
          sessionId,
          model,
          phaseConfig.reasoning,
        phaseConfig.verbosity, // Use same verbosity for correction
          'thinking_step',
          allPhases
        );
        
        correctedPhase.hasCorrection = true;
        correctedPhase.correctionCount = corrections.length;
        allPhases[allPhases.length - 1] = correctedPhase;
        totalTokens += correctedPhase.tokenCount || 0;
      }

      // Progress update
      const progress = ((i + 1) / phases.length) * 90; // Leave 10% for final answer
      this.emitStream({
        type: 'progress',
        data: { progress, phaseType: phase.type, timestamp: Date.now() }
      });
    }

    // Generate comprehensive final answer
    const finalAnswer = await this.generateFinalAnswer(query, allPhases, config, model);
    totalTokens += finalAnswer.tokenCount;

    return {
      id: sessionId,
      query,
      complexity: {
        level: 'COMPLEX',
        confidence: 0.9,
        reason: '7-stage deep reasoning with self-correction',
        patterns: ['deep-thinking', 'multi-faceted'],
        estimatedDuration: 45,
        tokenEstimate: totalTokens,
        costEstimate: this.calculateCost(totalTokens, model),
        canUseCache: false
      },
      phases: allPhases,
      finalAnswer: finalAnswer.content,
      totalTokens,
      totalCost: this.calculateCost(totalTokens, model),
      duration: 0,
      confidence: 0.9,
      corrections: this.sessionCorrections.get(sessionId) || [],
      metadata: {
        model,
        startTime: 0,
        endTime: 0,
        correctionCount: this.sessionCorrections.get(sessionId)?.length || 0
      }
    };
  }

  /**
   * Process CREATIVE queries - brainstorming with convergence
   */
  private async processCreative(
    query: string,
    config: ReasoningConfig,
    sessionId: string
  ): Promise<ReasoningResult> {
    const phases = PHASE_DEFINITIONS.CREATIVE;
    const model = config.model || 'gpt-5-nano';
    let totalTokens = 0;
    const allPhases: ReasoningPhase[] = [];

    // Brainstorming phase - high reasoning effort for creativity
    const brainstormPhase = await this.executePhase(
      'brainstorming',
      'Creative Brainstorming',
      query,
      config,
      sessionId,
      model,
      'high', // High reasoning for creativity
      'high', // High verbosity for detailed brainstorming
      'thinking_step',
      []
    );
    
    allPhases.push(brainstormPhase);
    totalTokens += brainstormPhase.tokenCount || 0;

    this.emitStream({
      type: 'progress',
      data: { progress: 50, phaseType: 'brainstorming', timestamp: Date.now() }
    });

    // Convergence phase - synthesize best ideas
    const convergencePhase = await this.executePhase(
      'convergence',
      'Idea Convergence',
      query,
      config,
      sessionId,
      model,
      'medium', // Medium reasoning for synthesis
      'medium', // Medium verbosity for focused convergence
      'thinking_step',
      allPhases
    );
    
    allPhases.push(convergencePhase);
    totalTokens += convergencePhase.tokenCount || 0;

    this.emitStream({
      type: 'progress',
      data: { progress: 90, phaseType: 'convergence', timestamp: Date.now() }
    });

    // Generate creative final answer
    const finalAnswer = await this.generateFinalAnswer(query, allPhases, config, model);
    totalTokens += finalAnswer.tokenCount;

    return {
      id: sessionId,
      query,
      complexity: {
        level: 'CREATIVE',
        confidence: 0.8,
        reason: 'Creative brainstorming and convergence',
        patterns: ['creative', 'open-ended'],
        estimatedDuration: 30,
        tokenEstimate: totalTokens,
        costEstimate: this.calculateCost(totalTokens, model),
        canUseCache: false
      },
      phases: allPhases,
      finalAnswer: finalAnswer.content,
      totalTokens,
      totalCost: this.calculateCost(totalTokens, model),
      duration: 0,
      confidence: 0.8,
      metadata: {
        model,
        startTime: 0,
        endTime: 0
      }
    };
  }

  /**
   * Execute a single reasoning phase
   */
  private async executePhase(
    type: ReasoningPhaseType,
    title: string,
    query: string,
    config: ReasoningConfig,
    sessionId: string,
    model: string,
    reasoning: 'low' | 'medium' | 'high',
    verbosity: 'low' | 'medium' | 'high',
    streamType: 'thinking_step' | 'final_answer',
    previousPhases: ReasoningPhase[]
  ): Promise<ReasoningPhase> {
    const startTime = Date.now();
    
    // Emit phase start
    this.emitStream({
      type: 'phase_change',
      data: {
        phaseType: type,
        content: title,
        timestamp: startTime
      }
    });

    // Build phase-specific prompt
    const phasePrompt = this.buildPhasePrompt(type, query, previousPhases, config);
    
    const messages = [
      { role: 'system', content: phasePrompt },
      ...this.buildContextMessages(config.contextHistory),
      { role: 'user', content: query }
    ];

    // Prepare API parameters for GPT-5 with reasoning and verbosity
    let response;
    let apiParams: any;

    if (model === 'gpt-5-nano' || model === 'gpt-5' || model === 'gpt-5-mini') {
      try {
        // Use GPT-5 responses.create() API with correct syntax
        apiParams = {
          model,
          input: phasePrompt + '\n\nQuery: ' + query, // Combine system prompt with query for GPT-5
          reasoning: { effort: reasoning === 'low' ? 'minimal' : reasoning === 'medium' ? 'standard' : 'high' },
          text: { verbosity: verbosity },
          max_output_tokens: this.getPhaseTokenLimit(type)
        };

        // @ts-ignore - GPT-5 responses API might not be fully typed yet
        response = await this.openai.responses.create(apiParams, {
          signal: this.abortController?.signal
        });
      } catch (error) {
        console.warn(`GPT-5 responses API not available, falling back to chat completions: ${error}`);
        // Fallback to standard chat completions
        apiParams = {
          model: 'gpt-5-mini',
          messages,
          max_completion_tokens: this.getPhaseTokenLimit(type),
          temperature: reasoning === 'low' ? 0.3 : reasoning === 'medium' ? 0.7 : 0.9,
          stream: true
        };

        response = await this.openai.chat.completions.create(apiParams, {
          signal: this.abortController?.signal
        });
      }
    } else {
      // Standard chat completion for other models
      apiParams = {
        model,
        messages,
        max_completion_tokens: this.getPhaseTokenLimit(type),
        stream: true
      };

      response = await this.openai.chat.completions.create(apiParams, {
        signal: this.abortController?.signal
      });
    }

    let content = '';
    let tokenCount = 0;

    // Check if we got a GPT-5 responses response (non-streaming) or standard streaming response
    if ((model === 'gpt-5-nano' || model === 'gpt-5' || model === 'gpt-5-mini') && response.text) {
      // Handle GPT-5 responses.create() response
      // @ts-ignore - GPT-5 response format may differ
      content = response.text || '';
      tokenCount = response.usage?.total_tokens || (content || '').toString().split(' ').length;

      // Emit the complete response as chunks for streaming effect
      const words = (content || '').toString().split(' ');
      for (const word of words) {
        if (this.abortController?.signal.aborted) break;

        this.emitStream({
          type: streamType,
          data: {
            step: type,
            content: word + ' ',
            tokenCount,
            timestamp: Date.now()
          }
        });

        // Small delay to simulate streaming
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    } else {
      // Handle standard streaming response (including fallback from GPT-5)
      for await (const chunk of response) {
        if (this.abortController?.signal.aborted) break;

        const deltaContent = chunk.choices[0]?.delta?.content || '';
        if (deltaContent) {
          content += deltaContent;
          tokenCount++;

          this.emitStream({
            type: streamType,
            data: {
              step: type,
              content: deltaContent,
              tokenCount,
              timestamp: Date.now()
            }
          });
        }
      }
    }

    const endTime = Date.now();
    
    return {
      id: `${sessionId}-${type}-${startTime}`,
      type,
      title,
      content,
      startTime,
      endTime,
      duration: endTime - startTime,
      tokenCount,
      isComplete: true,
      reasoning_effort: reasoning, // Use reasoning effort instead of temperature
      confidence: this.estimatePhaseConfidence(type, content, tokenCount)
    };
  }

  /**
   * Build phase-specific prompts for different reasoning stages
   */
  private buildPhasePrompt(
    type: ReasoningPhaseType,
    query: string,
    previousPhases: ReasoningPhase[],
    config: ReasoningConfig
  ): string {
    const context = previousPhases.map(p => `${p.title}: ${p.content}`).join('\n\n');
    
    const basePrompt = `You are an expert AI reasoning assistant. Your task is to perform the ${type} stage of reasoning for this query.

Previous reasoning context:
${context}

Current query: "${query}"

`;

    switch (type) {
      case 'understanding':
        return basePrompt + `Focus on clearly understanding what the user is asking. Break down the query components, identify key terms, and clarify any ambiguities. Be thorough but concise.`;
      
      case 'planning':
        return basePrompt + `Based on your understanding, create a structured plan for addressing this query. Outline the steps you'll take and the approach you'll use.`;
      
      case 'execution':
        return basePrompt + `Execute your plan and provide the solution. Be comprehensive and ensure you address all aspects of the query.`;
      
      case 'decomposition':
        return basePrompt + `Break down this complex problem into smaller, manageable sub-problems. Identify dependencies and relationships between components.`;
      
      case 'knowledge_gathering':
        return basePrompt + `Gather relevant knowledge and information needed to address this query. Consider what facts, principles, or methods are applicable.`;
      
      case 'approach_planning':
        return basePrompt + `Plan multiple approaches for solving this problem. Consider different methodologies and their trade-offs.`;
      
      case 'detailed_reasoning':
        return basePrompt + `Work through the problem systematically using your chosen approach. Show detailed reasoning steps and intermediate conclusions.`;
      
      case 'self_critique':
        return basePrompt + `Critically examine your reasoning so far. Look for potential errors, gaps in logic, or alternative interpretations. Be honest about limitations.`;
      
      case 'alternative_exploration':
        return basePrompt + `Explore alternative approaches or solutions. Consider different perspectives and edge cases you might have missed.`;
      
      case 'synthesis':
        return basePrompt + `Synthesize all your reasoning into a coherent, comprehensive response. Integrate insights from all previous stages.`;
      
      case 'brainstorming':
        return basePrompt + `Generate creative ideas and possibilities related to this query. Think outside the box and explore unconventional approaches. Be imaginative and expansive.`;
      
      case 'convergence':
        return basePrompt + `Converge your creative ideas into practical, actionable solutions. Evaluate and refine your best concepts.`;
      
      default:
        return basePrompt + `Perform thoughtful reasoning for this stage of the process.`;
    }
  }

  /**
   * Detect self-correction patterns in reasoning content
   */
  private async detectSelfCorrection(
    phase: ReasoningPhase,
    sessionId: string
  ): Promise<CorrectionEvent[]> {
    const corrections: CorrectionEvent[] = [];
    const content = (phase.content || '').toString().toLowerCase();

    for (const trigger of CORRECTION_TRIGGERS) {
      if (content.includes(trigger)) {
        const correction: CorrectionEvent = {
          id: `${sessionId}-correction-${Date.now()}`,
          phaseId: phase.id,
          originalContent: phase.content,
          correctedContent: '', // Will be filled when re-executed
          trigger,
          timestamp: Date.now(),
          confidence: 0.8
        };
        
        corrections.push(correction);
        
        // Store in session corrections
        const sessionCorrections = this.sessionCorrections.get(sessionId) || [];
        sessionCorrections.push(correction);
        this.sessionCorrections.set(sessionId, sessionCorrections);
        
        // Emit correction event
        this.emitStream({
          type: 'correction',
          data: {
            correctionId: correction.id,
            content: `Self-correction detected: "${trigger}"`,
            timestamp: correction.timestamp
          }
        });
      }
    }
    
    return corrections;
  }

  /**
   * Generate final answer based on all reasoning phases
   */
  private async generateFinalAnswer(
    query: string,
    phases: ReasoningPhase[],
    config: ReasoningConfig,
    model: string
  ): Promise<{ content: string; tokenCount: number }> {
    const reasoning = phases.map(p => `${p.title}:\n${p.content}`).join('\n\n');
    
    const systemPrompt = `You are an expert AI assistant. Based on the detailed reasoning process below, provide a comprehensive, well-structured final answer to the user's question.

Reasoning process:
${reasoning}

Guidelines:
- Synthesize insights from all reasoning stages
- Provide a clear, actionable response
- Include relevant examples or explanations
- Be comprehensive but well-organized
- Use markdown formatting for clarity

Original query: "${query}"`;

    this.emitStream({
      type: 'answer_start',
      data: { timestamp: Date.now() }
    });

    // Prepare API parameters for final answer generation
    let response;
    let apiParams: any;

    if (model === 'gpt-5-nano' || model === 'gpt-5' || model === 'gpt-5-mini') {
      try {
        // Use GPT-5 responses.create() API
        apiParams = {
          model,
          input: systemPrompt + '\n\nQuery: ' + query,
          reasoning: { effort: 'standard' }, // Medium reasoning for final answer
          text: { verbosity: 'high' },
          max_output_tokens: 1000
        };

        // @ts-ignore - GPT-5 responses API might not be fully typed yet
        response = await this.openai.responses.create(apiParams, {
          signal: this.abortController?.signal
        });
      } catch (error) {
        console.warn(`GPT-5 responses API not available for final answer, falling back: ${error}`);
        // Fallback to standard chat completions
        apiParams = {
          model: 'gpt-5-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: query }
          ],
          max_completion_tokens: 1000,
          temperature: 0.7,
          stream: true
        };

        response = await this.openai.chat.completions.create(apiParams, {
          signal: this.abortController?.signal
        });
      }
    } else {
      // Standard chat completion for other models
      apiParams = {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        max_completion_tokens: 1000,
        temperature: 0.7,
        stream: true
      };

      response = await this.openai.chat.completions.create(apiParams, {
        signal: this.abortController?.signal
      });
    }

    let content = '';
    let tokenCount = 0;

    // Handle GPT-5 responses or streaming responses
    if ((model === 'gpt-5-nano' || model === 'gpt-5' || model === 'gpt-5-mini') && response.text) {
      // Handle GPT-5 responses.create() response
      content = response.text || '';
      tokenCount = response.usage?.total_tokens || (content || '').toString().split(' ').length;

      // Emit the complete response as chunks for streaming effect
      const words = (content || '').toString().split(' ');
      for (const word of words) {
        if (this.abortController?.signal.aborted) break;

        this.emitStream({
          type: 'answer_chunk',
          data: {
            content: word + ' ',
            tokenCount,
            timestamp: Date.now()
          }
        });

        // Small delay to simulate streaming
        await new Promise(resolve => setTimeout(resolve, 30));
      }
    } else {
      // Handle standard streaming response
      for await (const chunk of response) {
        if (this.abortController?.signal.aborted) break;

        const deltaContent = chunk.choices[0]?.delta?.content || '';
        if (deltaContent) {
          content += deltaContent;
          tokenCount++;

          this.emitStream({
            type: 'answer_chunk',
            data: {
              content: deltaContent,
              tokenCount,
              timestamp: Date.now()
            }
          });
        }
      }
    }

    return { content, tokenCount };
  }

  /**
   * Process complex queries with parallel reasoning paths
   */
  private async processComplexParallel(
    query: string,
    config: ReasoningConfig,
    sessionId: string
  ): Promise<ReasoningResult> {
    // This will be implemented in the ParallelReasoning service
    // For now, fall back to sequential processing
    return await this.processComplex(query, { ...config, enableParallel: false }, sessionId);
  }

  /**
   * Build context messages from conversation history
   */
  private buildContextMessages(contextHistory?: ContextMessage[]) {
    if (!contextHistory || contextHistory.length === 0) return [];
    
    return contextHistory.slice(-5).map(msg => ({
      role: msg.isUser ? 'user' as const : 'assistant' as const,
      content: msg.text
    }));
  }

  /**
   * Get token limit for specific phases
   */
  private getPhaseTokenLimit(type: ReasoningPhaseType): number {
    const limits = {
      understanding: 300,
      planning: 400,
      execution: 800,
      decomposition: 500,
      knowledge_gathering: 600,
      approach_planning: 500,
      detailed_reasoning: 1000,
      self_critique: 400,
      alternative_exploration: 600,
      synthesis: 800,
      brainstorming: 700,
      convergence: 600
    };
    
    return limits[type] || 500;
  }

  /**
   * Estimate confidence for a reasoning phase
   */
  private estimatePhaseConfidence(
    type: ReasoningPhaseType,
    content: string,
    tokenCount: number
  ): number {
    const baseConfidence = 0.7;
    const lengthBonus = Math.min(0.2, tokenCount / 1000); // Longer responses get slight bonus
    const structureBonus = (content || '').toString().includes('\n') ? 0.05 : 0; // Structured responses get bonus
    
    return Math.min(0.95, baseConfidence + lengthBonus + structureBonus);
  }

  /**
   * Calculate cost based on tokens and model
   */
  private calculateCost(tokens: number, model: string): number {
    const pricing = {
      'gpt-5': 0.00003, // Approximate output pricing
      'gpt-5-mini': 0.000003, // GPT-5 mini pricing
      'gpt-5-nano': 0.000001, // GPT-5 nano pricing (even more efficient)
      'gpt-5-mini': 0.000003
    };

    return tokens * (pricing[model as keyof typeof pricing] || pricing['gpt-5-mini']);
  }

  /**
   * Emit stream events
   */
  private emitStream(event: StreamEvent) {
    if (this.streamCallback) {
      this.streamCallback(event);
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clean up session data
   */
  private cleanup(sessionId: string) {
    this.sessionPhases.delete(sessionId);
    this.sessionCorrections.delete(sessionId);
    this.activeSession = null;
    this.abortController = undefined;
  }

  /**
   * Stop the current reasoning session
   */
  stop() {
    if (this.abortController) {
      this.abortController.abort();
      this.emitStream({
        type: 'error',
        data: {
          content: 'Reasoning stopped by user',
          timestamp: Date.now()
        }
      });
    }
  }

  /**
   * Get current session status
   */
  getStatus() {
    return {
      activeSession: this.activeSession,
      isProcessing: !!this.activeSession,
      sessionsInMemory: this.sessionPhases.size
    };
  }
}

// Export singleton instance
export const reasoningEngine = new ReasoningEngine();