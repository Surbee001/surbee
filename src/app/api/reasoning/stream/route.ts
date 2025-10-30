/**
 * Real-time Reasoning Stream API Endpoint
 * 
 * Provides Server-Sent Events (SSE) streaming for real-time reasoning updates.
 * Used for:
 * - Live thinking process display
 * - Progress tracking
 * - Token counting and cost updates
 * - Error handling and recovery
 */

import { NextRequest } from 'next/server';
import { complexityAnalyzer } from '@/services/reasoning/ComplexityAnalyzer';
import { reasoningEngine } from '@/services/reasoning/ReasoningEngine';
import { memoryManager } from '@/services/reasoning/MemoryManager';
import { reasoningTemplateManager } from '@/services/reasoning/ReasoningTemplates';
import {
  ReasoningConfig,
  StreamEvent,
  ComplexityLevel,
  ContextMessage,
  ReasoningResult
} from '@/types/reasoning.types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface StreamRequest {
  query: string;
  forceThinking?: boolean;
  complexity?: ComplexityLevel;
  templateId?: string;
  contextHistory?: ContextMessage[];
  userId?: string;
  projectId?: string;
  model?: string;
  enableParallel?: boolean;
}

// Server-Sent Events helper
function createSSEResponse() {
  const stream = new ReadableStream({
    start(controller) {
      // Store controller for later use
      (this as any).controller = controller;
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

function sendSSEEvent(controller: ReadableStreamDefaultController, event: StreamEvent) {
  try {
    const data = `event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`;
    controller.enqueue(new TextEncoder().encode(data));
  } catch (err) {
    // Ignore writes after the controller is closed or in invalid state
    // This can happen if the reasoning engine emits late events
    // eslint-disable-next-line no-console
    console.warn('SSE enqueue after close/invalid state:', (err as any)?.message || err);
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Parse query parameters
  const query = searchParams.get('query');
  const forceThinking = searchParams.get('forceThinking') === 'true';
  const complexity = searchParams.get('complexity') as ComplexityLevel;
  const templateId = searchParams.get('templateId');
  const userId = searchParams.get('userId');
  const projectId = searchParams.get('projectId');
  const model = searchParams.get('model');
  const enableParallel = searchParams.get('enableParallel') === 'true';

  if (!query) {
    return new Response('Query parameter is required', { status: 400 });
  }

  const encoder = new TextEncoder();
  let sessionId: string | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      const startTime = Date.now();
      try {
        // Send initial connection event
        sendSSEEvent(controller, {
          type: 'thinking_start',
          data: {
            timestamp: startTime,
            content: 'Initializing reasoning process...'
          }
        });

        // Initialize session
        sessionId = `stream-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await memoryManager.initializeSession(sessionId, userId || undefined);

        // Assess complexity
        const relevantContext: ContextMessage[] = []; // Would get from session if provided
        const complexityAssessment = complexity
          ? { level: complexity, confidence: 1.0, reason: 'User specified', patterns: [], estimatedDuration: 30, tokenEstimate: 1000, costEstimate: 0.03, canUseCache: false }
          : await complexityAnalyzer.assessComplexity(query, relevantContext, forceThinking, userId || undefined);

        // Send complexity assessment
        sendSSEEvent(controller, {
          type: 'phase_change',
          data: {
            content: `Assessed as ${complexityAssessment.level} complexity (${Math.round(complexityAssessment.confidence * 100)}% confidence)`,
            timestamp: Date.now(),
            metadata: {
              complexity: complexityAssessment,
              estimatedDuration: complexityAssessment.estimatedDuration,
              estimatedCost: complexityAssessment.costEstimate
            }
          }
        });

        // Find template
        let selectedTemplate = null;
        if (templateId) {
          selectedTemplate = reasoningTemplateManager.getTemplate(templateId);
        } else {
          selectedTemplate = reasoningTemplateManager.findBestTemplate(query, complexityAssessment.level);
        }

        if (selectedTemplate) {
          sendSSEEvent(controller, {
            type: 'progress',
            data: {
              content: `Using ${selectedTemplate.name} template`,
              timestamp: Date.now(),
              metadata: { templateId: selectedTemplate.id, templateName: selectedTemplate.name }
            }
          });
        }

        // Build configuration
        const config: ReasoningConfig = {
          complexity: complexityAssessment.level,
          forceThinking,
          useCache: false, // Don't use cache for streaming
          maxTokens: getDefaultTokens(complexityAssessment.level),
          temperature: 0.4,
          enableParallel: enableParallel && complexityAssessment.level === 'COMPLEX',
          model: model || getDefaultModel(complexityAssessment.level),
          templateId: selectedTemplate?.id,
          userId: userId || undefined,
          projectId: projectId || undefined,
          contextHistory: relevantContext,
          timeoutMs: getTimeoutForComplexity(complexityAssessment.level)
        };

        // Execute reasoning with streaming BUT suppress the final answer
        // We'll generate our own final answer after implementation
        let reasoningResult: any = null;
        const result = await reasoningEngine.processQuery(
          query,
          config,
          (event: StreamEvent) => {
            // Forward all reasoning events EXCEPT the final answer
            // We'll do implementation first, then final answer
            if (event.type !== 'answer_start' && event.type !== 'answer_chunk' && event.type !== 'answer_complete') {
              sendSSEEvent(controller, event);
            }
            // Store the reasoning result when we see thinking_complete
            if (event.type === 'thinking_complete' && event.data?.metadata) {
              reasoningResult = event.data.metadata;
            }
          }
        );

        // Now do implementation as the next logical step (before any final answer)
        if (projectId) {
          // Announce building phase as continuation of thinking
          sendSSEEvent(controller, {
            type: 'phase_change',
            data: {
              content: 'Implementation',
              timestamp: Date.now(),
              phaseType: 'implementation',
              metadata: {
                description: 'Now implementing the solution based on the analysis...'
              }
            }
          });

          // Start the implementation thinking step
          sendSSEEvent(controller, {
            type: 'thinking_step',
            data: {
              step: 'implementation',
              content: 'Starting to build based on the planning phase...\n',
              timestamp: Date.now()
            }
          });

          try {
            // Call the ask-ai builder internally with same complexity and config
            const buildResult = await triggerInternalBuild({
              prompt: query,
              planningNote: result.phases.map(p => p.content).join('\n\n'),
              projectId,
              userId,
              sessionId,
              complexity: complexityAssessment.level,
              config
            }, controller);

            // Send final answer with a summary of what was built
            sendSSEEvent(controller, {
              type: 'answer_start',
              data: {
                timestamp: Date.now()
              }
            });

            // Send a proper final answer summary (not the full HTML)
            const finalAnswerContent = `Implementation completed successfully!

${buildResult.summary || 'Survey created based on the reasoning analysis above.'}

The survey has been built and is now ready for use. All HTML, styling, and interactive features have been implemented according to the planned specifications.`;

            sendSSEEvent(controller, {
              type: 'answer_chunk',
              data: {
                content: finalAnswerContent,
                timestamp: Date.now()
              }
            });

            // Complete the entire thinking + building process
            sendSSEEvent(controller, {
              type: 'thinking_complete',
              data: {
                content: 'Implementation completed successfully',
                timestamp: Date.now(),
                metadata: {
                  totalTokens: result.totalTokens + (buildResult.html.length / 4),
                  totalCost: result.totalCost + 0.01,
                  duration: result.duration + (Date.now() - startTime),
                  confidence: result.confidence,
                  phases: result.phases.length + 1,
                  corrections: result.corrections?.length || 0,
                  buildResult,
                  summary: buildResult.summary
                }
              }
            });
          } catch (buildError: any) {
            console.error('Build phase failed:', buildError);
            sendSSEEvent(controller, {
              type: 'error',
              data: {
                content: `Build failed: ${buildError.message}`,
                timestamp: Date.now(),
                metadata: {
                  buildError: true,
                  reasoning: result
                }
              }
            });
          }
        } else {
          // No projectId provided - just complete reasoning
          sendSSEEvent(controller, {
            type: 'answer_complete',
            data: {
              content: 'Reasoning process completed',
              timestamp: Date.now(),
              metadata: {
                totalTokens: result.totalTokens,
                totalCost: result.totalCost,
                duration: result.duration,
                confidence: result.confidence,
                phases: result.phases.length,
                corrections: result.corrections?.length || 0
              }
            }
          });
        }

        // Store result if user provided
        if (userId) {
          try {
            await memoryManager.storeReasoningSession(userId, sessionId, result);
            
            // Update template analytics
            if (selectedTemplate) {
              reasoningTemplateManager.recordUsage(
                selectedTemplate.id,
                result.duration,
                result.totalCost,
                result.confidence > 0.7
              );
            }

            sendSSEEvent(controller, {
              type: 'progress',
              data: {
                content: 'Results saved to memory',
                timestamp: Date.now()
              }
            });
          } catch (storeError) {
            console.error('Failed to store streaming result:', storeError);
            sendSSEEvent(controller, {
              type: 'error',
              data: {
                content: 'Failed to save results, but reasoning completed successfully',
                timestamp: Date.now()
              }
            });
          }
        }

        // Close the stream
        controller.close();

      } catch (error: any) {
        console.error('Streaming error:', error);
        
        sendSSEEvent(controller, {
          type: 'error',
          data: {
            content: error.message || 'An error occurred during reasoning',
            timestamp: Date.now(),
            metadata: { 
              code: error.code || 'STREAMING_ERROR',
              recoverable: error.recoverable || false
            }
          }
        });

        // Cleanup on error
        if (sessionId) {
          memoryManager.cleanupSession(sessionId);
        }

        controller.close();
      }
    },

    cancel() {
      console.log('Stream cancelled by client');
      if (sessionId) {
        memoryManager.cleanupSession(sessionId);
        // Stop the reasoning engine if running
        reasoningEngine.stop();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

// POST method for complex requests with body
export async function POST(request: NextRequest) {
  try {
    const body: StreamRequest = await request.json();
    const { 
      query,
      forceThinking = false,
      complexity,
      templateId,
      contextHistory,
      userId,
      projectId,
      model,
      enableParallel = false
    } = body;

    if (!query) {
      return new Response('Query is required', { status: 400 });
    }

    let sessionId: string | null = null;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial connection event
          sendSSEEvent(controller, {
            type: 'thinking_start',
            data: {
              timestamp: Date.now(),
              content: 'Starting reasoning process...'
            }
          });

          // Initialize session with context
          sessionId = `stream-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          await memoryManager.initializeSession(sessionId, userId);

          // Add context history to memory
          if (contextHistory && contextHistory.length > 0) {
            for (const message of contextHistory) {
              memoryManager.addMessage(sessionId, message);
            }
          }

          // Get relevant context for complexity assessment
          const relevantContext = await memoryManager.getRelevantContext(sessionId, query);

          // Assess complexity
          const complexityAssessment = complexity
            ? { level: complexity, confidence: 1.0, reason: 'User specified', patterns: [], estimatedDuration: 30, tokenEstimate: 1000, costEstimate: 0.03, canUseCache: false }
            : await complexityAnalyzer.assessComplexity(query, relevantContext, forceThinking, userId);

          memoryManager.addComplexityAssessment(sessionId, complexityAssessment);

          // Send complexity info
          sendSSEEvent(controller, {
            type: 'phase_change',
            data: {
              content: `Query complexity: ${complexityAssessment.level} (${Math.round(complexityAssessment.confidence * 100)}% confidence)`,
              timestamp: Date.now(),
              metadata: {
                complexity: complexityAssessment,
                patterns: complexityAssessment.patterns,
                estimatedDuration: complexityAssessment.estimatedDuration,
                estimatedCost: complexityAssessment.costEstimate
              }
            }
          });

          // Find and apply template
          let selectedTemplate = null;
          if (templateId) {
            selectedTemplate = reasoningTemplateManager.getTemplate(templateId);
            if (!selectedTemplate) {
              sendSSEEvent(controller, {
                type: 'error',
                data: {
                  content: `Template '${templateId}' not found, proceeding without template`,
                  timestamp: Date.now()
                }
              });
            }
          } else {
            selectedTemplate = reasoningTemplateManager.findBestTemplate(query, complexityAssessment.level);
          }

          if (selectedTemplate) {
            sendSSEEvent(controller, {
              type: 'progress',
              data: {
                content: `Applying ${selectedTemplate.name} reasoning template`,
                timestamp: Date.now(),
                metadata: { 
                  templateId: selectedTemplate.id, 
                  templateName: selectedTemplate.name,
                  phaseCount: selectedTemplate.phases.length
                }
              }
            });
          }

          // Build reasoning configuration
          const config: ReasoningConfig = {
            complexity: complexityAssessment.level,
            forceThinking,
            useCache: false,
            maxTokens: getDefaultTokens(complexityAssessment.level),
            temperature: 0.4,
            enableParallel: enableParallel && complexityAssessment.level === 'COMPLEX',
            model: model || getDefaultModel(complexityAssessment.level),
            templateId: selectedTemplate?.id,
            userId,
            projectId,
            contextHistory: relevantContext,
            timeoutMs: getTimeoutForComplexity(complexityAssessment.level)
          };

          // Execute reasoning with real-time streaming
          const result = await reasoningEngine.processQuery(
            query,
            config,
            (event: StreamEvent) => {
              sendSSEEvent(controller, event);
            }
          );

          // Store results and update analytics
          if (userId) {
            try {
              await memoryManager.storeReasoningSession(userId, sessionId, result);
              
              if (selectedTemplate) {
                reasoningTemplateManager.recordUsage(
                  selectedTemplate.id,
                  result.duration,
                  result.totalCost,
                  result.confidence > 0.7
                );
              }
            } catch (storeError) {
              console.warn('Failed to store streaming result:', storeError);
            }
          }

          // Continue with implementation phase as part of the thinking process
          if (projectId) {
            const buildStartTime = Date.now();

            // Announce implementation phase as continuation of thinking
            sendSSEEvent(controller, {
              type: 'phase_change',
              data: {
                content: 'Implementation',
                timestamp: Date.now(),
                phaseType: 'implementation',
                metadata: {
                  description: 'Now implementing the solution based on the analysis...'
                }
              }
            });

            // Start the implementation thinking step
            sendSSEEvent(controller, {
              type: 'thinking_step',
              data: {
                step: 'implementation',
                content: 'Starting to build based on the planning phase...\n',
                timestamp: Date.now()
              }
            });

            try {
              // Call the ask-ai builder internally with same complexity and config
              const buildResult = await triggerInternalBuild({
                prompt: query,
                planningNote: result.phases.map(p => p.content).join('\n\n'),
                projectId,
                userId,
                sessionId,
                complexity: complexityAssessment.level,
                config
              }, controller);

              // Send final answer with a summary of what was built
              sendSSEEvent(controller, {
                type: 'answer_start',
                data: {
                  timestamp: Date.now()
                }
              });

              // Send a proper final answer summary (not the full HTML)
              const finalAnswerContent = `Implementation completed successfully!

${buildResult.summary || 'Survey created based on the reasoning analysis above.'}

The survey has been built and is now ready for use. All HTML, styling, and interactive features have been implemented according to the planned specifications.`;

              sendSSEEvent(controller, {
                type: 'answer_chunk',
                data: {
                  content: finalAnswerContent,
                  timestamp: Date.now()
                }
              });

              // Complete the entire thinking + building process
              sendSSEEvent(controller, {
                type: 'thinking_complete',
                data: {
                  content: 'Implementation completed successfully',
                  timestamp: Date.now(),
                  metadata: {
                    sessionId,
                    summary: {
                      totalTokens: result.totalTokens + (buildResult.html.length / 4),
                      totalCost: (result.totalCost + 0.01).toFixed(4),
                      duration: `${((result.duration + (Date.now() - buildStartTime)) / 1000).toFixed(1)}s`,
                      confidence: `${Math.round(result.confidence * 100)}%`,
                      phasesCompleted: result.phases.length + 1,
                      correctionsApplied: result.corrections?.length || 0,
                      templateUsed: selectedTemplate?.name || 'None',
                      buildSummary: buildResult.summary
                    },
                    buildResult
                  }
                }
              });
            } catch (buildError: any) {
              console.error('Build phase failed:', buildError);
              sendSSEEvent(controller, {
                type: 'error',
                data: {
                  content: `Build failed: ${buildError.message}`,
                  timestamp: Date.now(),
                  metadata: {
                    buildError: true,
                    reasoning: result
                  }
                }
              });
            }
          } else {
            // No projectId provided - just complete thinking
            sendSSEEvent(controller, {
              type: 'thinking_complete',
              data: {
                content: 'Reasoning completed successfully',
                timestamp: Date.now(),
                metadata: {
                  sessionId,
                  summary: {
                    totalTokens: result.totalTokens,
                    totalCost: result.totalCost.toFixed(4),
                    duration: `${(result.duration / 1000).toFixed(1)}s`,
                    confidence: `${Math.round(result.confidence * 100)}%`,
                    phasesCompleted: result.phases.length,
                    correctionsApplied: result.corrections?.length || 0,
                    templateUsed: selectedTemplate?.name || 'None'
                  }
                }
              }
            });
          }

          controller.close();

        } catch (error: any) {
          console.error('POST streaming error:', error);
          
          sendSSEEvent(controller, {
            type: 'error',
            data: {
              content: error.message || 'An error occurred during reasoning',
              timestamp: Date.now(),
              metadata: { 
                code: error.code || 'STREAMING_ERROR',
                phase: error.phase || 'unknown',
                recoverable: !!error.recoverable
              }
            }
          });

          if (sessionId) {
            memoryManager.cleanupSession(sessionId);
          }

          controller.close();
        }
      },

      cancel() {
        console.log('POST stream cancelled by client');
        if (sessionId) {
          memoryManager.cleanupSession(sessionId);
          reasoningEngine.stop();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error: any) {
    console.error('POST stream setup error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to setup streaming',
        details: error.message
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Utility functions (same as in process route)
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
  switch (complexity) {
    case 'SIMPLE':
      return 'gpt-5-mini';
    case 'MODERATE':
      return 'gpt-5-mini';
    case 'COMPLEX':
      return 'gpt-5';
    case 'CREATIVE':
      return 'gpt-5';
    default:
      return 'gpt-5-mini';
  }
}

function getTimeoutForComplexity(complexity: ComplexityLevel): number {
  const timeouts = {
    SIMPLE: 15000,    // 15 seconds
    MODERATE: 45000,  // 45 seconds
    COMPLEX: 90000,   // 90 seconds
    CREATIVE: 60000   // 60 seconds
  };
  return timeouts[complexity];
}

/**
 * Trigger internal build process using ask-ai API logic
 */
async function triggerInternalBuild(
  params: {
    prompt: string;
    planningNote: string;
    projectId: string;
    userId?: string;
    sessionId: string;
    complexity: ComplexityLevel;
    config: ReasoningConfig;
  },
  controller: ReadableStreamDefaultController
): Promise<{ html: string; summary: string }> {
  const { prompt, planningNote, projectId, userId, sessionId, complexity, config } = params;

  // Import OpenAI and required modules
  const OpenAI = (await import('openai')).default;

  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const openai = new OpenAI({ apiKey: openaiApiKey });
  const builderModel = 'gpt-5-mini'; // Use GPT-5-mini for building (better than nano)

  // Determine reasoning effort and verbosity for implementation based on complexity
  const getImplementationParams = (complexity: ComplexityLevel) => {
    switch (complexity) {
      case 'SIMPLE':
        return { reasoning: 'low' as const, verbosity: 'low' as const };
      case 'MODERATE':
        return { reasoning: 'medium' as const, verbosity: 'medium' as const };
      case 'COMPLEX':
        return { reasoning: 'medium' as const, verbosity: 'high' as const };
      case 'CREATIVE':
        return { reasoning: 'high' as const, verbosity: 'high' as const };
      default:
        return { reasoning: 'medium' as const, verbosity: 'medium' as const };
    }
  };

  const { reasoning, verbosity } = getImplementationParams(complexity);

  // Build instruction that tells the AI to implement what was already thought through
  const buildInstruction = `You are an expert web developer. Based on the comprehensive analysis below, implement the exact solution that was planned.

ANALYSIS AND PLANNING COMPLETED:
${planningNote}

IMPORTANT: The thinking and planning is already done above. Now just implement it exactly as planned.

Your task:
1. Create the HTML/CSS/JavaScript code for what was designed above
2. Follow the exact specifications from the planning phase
3. Use Tailwind CSS for styling
4. Make it beautiful, responsive, and accessible
5. Return ONLY the complete HTML document (<!DOCTYPE html>...</html>)

Do NOT re-analyze or re-think the problem. Simply build what was already planned above.`;

  try {
    // Create stream for building
    let completeResponse = '';

    // Simple system prompt - no thinking needed, just build
    const simpleSystemPrompt = `You are an expert web developer. Generate clean, modern HTML with embedded CSS and JavaScript. Use Tailwind CSS for styling. Create responsive, accessible, and beautiful designs.`;

    let response;

    // Try GPT-5 responses API with reasoning and verbosity
    if (builderModel === 'gpt-5-nano' || builderModel === 'gpt-5' || builderModel === 'gpt-5-mini') {
      try {
        // Use GPT-5 responses.create() API with reasoning and verbosity
        response = await openai.responses.create({
          model: builderModel,
          input: buildInstruction, // No system prompt needed, all in input
          reasoning: { effort: reasoning },
          text: { verbosity: verbosity },
          max_output_tokens: 16384
        });

        // Handle non-streaming GPT-5 response
        if (response.text) {
          completeResponse = response.text;
          // Send as chunks for UI consistency
          const chunks = completeResponse.match(/.{1,100}/g) || [];
          for (const chunk of chunks) {
            sendSSEEvent(controller, {
              type: 'thinking_step',
              data: {
                step: 'implementation',
                content: chunk,
                timestamp: Date.now()
              }
            });
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        }
      } catch (error) {
        console.warn('GPT-5 responses API not available, falling back:', error);
        // Fallback to chat completions
        response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: simpleSystemPrompt },
            { role: 'user', content: buildInstruction }
          ],
          max_completion_tokens: 16384,
          stream: true
        });
      }
    } else {
      // Non-GPT-5 models: use chat completions
      response = await openai.chat.completions.create({
        model: builderModel,
        messages: [
          { role: 'system', content: simpleSystemPrompt },
          { role: 'user', content: buildInstruction }
        ],
        max_completion_tokens: 16384,
        stream: true
      });
    }

    // Handle streaming response if we have one
    if (!completeResponse && response) {
      // Stream the HTML generation
      for await (const chunk of response) {
        const deltaContent = chunk.choices[0]?.delta?.content || '';
        if (deltaContent) {
          completeResponse += deltaContent;

        // Send implementation progress as thinking step
        sendSSEEvent(controller, {
          type: 'thinking_step',
          data: {
            step: 'implementation',
            content: deltaContent,
            timestamp: Date.now(),
            metadata: { totalLength: completeResponse.length }
          }
        });

          // Break if we have complete HTML
          if (completeResponse.toLowerCase().includes('</html>')) break;
        }
      }
    }

    if (!completeResponse.trim()) {
      throw new Error('No response from build model');
    }

    // Generate summary
    const summaryResponse = await openai.chat.completions.create({
      model: builderModel,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. Provide a brief summary of what was built in 1-2 sentences.'
        },
        {
          role: 'user',
          content: `Summarize what this survey/form does:\n\n${completeResponse.slice(0, 2000)}...`
        }
      ],
      max_completion_tokens: 150,
      temperature: 0.3
    });

    const summary = summaryResponse.choices[0]?.message?.content || 'Survey created successfully';

    return {
      html: completeResponse,
      summary
    };

  } catch (error: any) {
    console.error('Internal build error:', error);
    throw new Error(`Build failed: ${error.message}`);
  }
}
