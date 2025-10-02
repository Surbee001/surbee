/**
 * Reasoning Templates for Common Query Patterns
 * 
 * Pre-built reasoning patterns that optimize the thinking process for frequently encountered query types:
 * - Code debugging: Error analysis → Root cause → Solution → Testing
 * - Math problems: Given → Find → Approach → Solve → Verify
 * - Creative writing: Theme → Structure → Details → Polish
 * - Analysis tasks: Data → Patterns → Insights → Conclusions
 * - Survey design: Research objectives → Methodology → Questions → Validation
 */

import {
  ReasoningTemplate,
  ComplexityLevel,
  ReasoningPhaseType
} from '@/types/reasoning.types';

export class ReasoningTemplateManager {
  private templates: Map<string, ReasoningTemplate> = new Map();
  private templateStats: Map<string, {
    usage: number;
    successRate: number;
    avgDuration: number;
    avgCost: number;
    lastUsed: number;
  }> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Initialize all built-in templates
   */
  private initializeTemplates(): void {
    const templates: ReasoningTemplate[] = [
      // CODE DEBUGGING TEMPLATE
      {
        id: 'code_debugging',
        name: 'Code Debugging & Problem Solving',
        description: 'Systematic approach to debugging code issues and finding solutions',
        queryPatterns: [
          /\b(debug|error|bug|fix|broken|not working|issue|problem)\b.*\b(code|function|method|script|program)\b/gi,
          /```[\s\S]*?```/g, // Code blocks
          /\b(traceback|exception|syntax error|runtime error)\b/gi,
          /\b(javascript|python|typescript|java|c\+\+|php|ruby)\b.*\b(error|issue|problem|debug)\b/gi
        ],
        complexity: 'COMPLEX',
        phases: [
          {
            type: 'understanding',
            title: 'Error Analysis',
            prompt: 'Analyze the error message, stack trace, or problematic behavior. Identify the specific symptoms and context where the issue occurs.',
            temperature: 0.3,
            expectedTokens: 300
          },
          {
            type: 'knowledge_gathering',
            title: 'Code Context Review',
            prompt: 'Examine the relevant code sections, dependencies, and environment. Understand the intended functionality and current behavior.',
            temperature: 0.3,
            expectedTokens: 400
          },
          {
            type: 'approach_planning',
            title: 'Root Cause Identification',
            prompt: 'Based on the error analysis and code review, identify the most likely root causes. Prioritize hypotheses based on probability and impact.',
            temperature: 0.4,
            expectedTokens: 350
          },
          {
            type: 'detailed_reasoning',
            title: 'Solution Development',
            prompt: 'Develop specific solutions for each identified root cause. Include code fixes, configuration changes, or architectural improvements.',
            temperature: 0.4,
            expectedTokens: 500
          },
          {
            type: 'self_critique',
            title: 'Solution Validation',
            prompt: 'Critically review the proposed solutions. Consider edge cases, potential side effects, and alternative approaches.',
            temperature: 0.3,
            expectedTokens: 300
          },
          {
            type: 'synthesis',
            title: 'Implementation Plan',
            prompt: 'Create a step-by-step implementation plan with testing strategies and rollback procedures.',
            temperature: 0.3,
            expectedTokens: 400
          }
        ],
        examples: [
          'My JavaScript function is throwing "Cannot read property of undefined" error',
          'Python script fails with KeyError when processing data',
          'React component not re-rendering when state changes'
        ],
        metadata: {
          category: 'programming',
          tags: ['debugging', 'error-solving', 'code-analysis'],
          successRate: 0.87,
          avgDuration: 42,
          avgCost: 0.15
        }
      },

      // MATH PROBLEM TEMPLATE
      {
        id: 'math_problem_solving',
        name: 'Mathematical Problem Solving',
        description: 'Structured approach to solving mathematical problems with verification',
        queryPatterns: [
          /\b(solve|calculate|find|compute|determine)\b.*\b(equation|formula|integral|derivative|limit)\b/gi,
          /\b(algebra|calculus|geometry|statistics|probability|optimization)\b/gi,
          /\b(prove|theorem|lemma|show that|demonstrate)\b/gi,
          /[∫∑∏√±≠≤≥∞∂∇∆]/g,
          /\b\d+\s*[+\-*/^=]\s*\d+/g
        ],
        complexity: 'COMPLEX',
        phases: [
          {
            type: 'understanding',
            title: 'Problem Analysis',
            prompt: 'Carefully read and understand the problem. Identify given information, what needs to be found, and any constraints or conditions.',
            temperature: 0.2,
            expectedTokens: 250
          },
          {
            type: 'knowledge_gathering',
            title: 'Method Selection',
            prompt: 'Identify relevant mathematical concepts, formulas, and techniques that apply to this problem type.',
            temperature: 0.3,
            expectedTokens: 300
          },
          {
            type: 'approach_planning',
            title: 'Solution Strategy',
            prompt: 'Choose the most appropriate method and outline the step-by-step approach to solve the problem.',
            temperature: 0.3,
            expectedTokens: 350
          },
          {
            type: 'detailed_reasoning',
            title: 'Mathematical Computation',
            prompt: 'Execute the solution step by step with clear mathematical reasoning and calculations.',
            temperature: 0.2,
            expectedTokens: 600
          },
          {
            type: 'self_critique',
            title: 'Verification',
            prompt: 'Check the solution by substituting back into the original problem, using alternative methods, or checking units and reasonableness.',
            temperature: 0.2,
            expectedTokens: 300
          }
        ],
        examples: [
          'Solve the differential equation dy/dx = x² + 2x',
          'Find the maximum value of f(x) = x³ - 6x² + 9x + 1',
          'Calculate the probability of getting at least 2 heads in 5 coin flips'
        ],
        metadata: {
          category: 'mathematics',
          tags: ['problem-solving', 'calculation', 'proof', 'verification'],
          successRate: 0.91,
          avgDuration: 38,
          avgCost: 0.12
        }
      },

      // CREATIVE WRITING TEMPLATE
      {
        id: 'creative_writing',
        name: 'Creative Writing & Content Creation',
        description: 'Structured creative process for stories, poems, and original content',
        queryPatterns: [
          /\b(write|create|compose|craft)\b.*\b(story|poem|song|script|article|essay)\b/gi,
          /\b(creative|imaginative|original|artistic)\b.*\b(writing|content|piece)\b/gi,
          /\b(character|plot|theme|narrative|dialogue)\b/gi,
          /\b(brainstorm|generate ideas|inspiration)\b/gi
        ],
        complexity: 'CREATIVE',
        phases: [
          {
            type: 'brainstorming',
            title: 'Concept Development',
            prompt: 'Generate creative ideas, themes, and concepts. Explore different angles, moods, and approaches for the requested content.',
            temperature: 0.8,
            expectedTokens: 400
          },
          {
            type: 'approach_planning',
            title: 'Structure Planning',
            prompt: 'Organize the creative concepts into a coherent structure. Plan the flow, key elements, and overall organization.',
            temperature: 0.6,
            expectedTokens: 350
          },
          {
            type: 'detailed_reasoning',
            title: 'Content Creation',
            prompt: 'Write the creative content, incorporating the planned themes and structure. Focus on engaging language and vivid details.',
            temperature: 0.7,
            expectedTokens: 700
          },
          {
            type: 'convergence',
            title: 'Refinement & Polish',
            prompt: 'Review and refine the content. Improve flow, clarity, and impact. Ensure consistency with the intended theme and style.',
            temperature: 0.5,
            expectedTokens: 350
          }
        ],
        examples: [
          'Write a short story about time travel with a twist ending',
          'Create a poem about the changing seasons',
          'Compose a dialogue between two characters meeting for the first time'
        ],
        metadata: {
          category: 'creative',
          tags: ['writing', 'storytelling', 'creativity', 'content-creation'],
          successRate: 0.83,
          avgDuration: 28,
          avgCost: 0.18
        }
      },

      // ANALYSIS TEMPLATE
      {
        id: 'analysis_research',
        name: 'Analysis & Research Tasks',
        description: 'Systematic approach to analyzing data, trends, and drawing insights',
        queryPatterns: [
          /\b(analyze|examine|study|investigate|research|assess|evaluate)\b/gi,
          /\b(data|statistics|trends|patterns|findings|results)\b/gi,
          /\b(compare|contrast|relationship|correlation|impact|effect)\b/gi,
          /\b(insights|conclusions|recommendations|implications)\b/gi
        ],
        complexity: 'COMPLEX',
        phases: [
          {
            type: 'understanding',
            title: 'Scope Definition',
            prompt: 'Define the analysis objectives, key questions to answer, and the scope of investigation.',
            temperature: 0.3,
            expectedTokens: 300
          },
          {
            type: 'knowledge_gathering',
            title: 'Data Collection',
            prompt: 'Gather relevant information, data points, and context needed for the analysis.',
            temperature: 0.3,
            expectedTokens: 400
          },
          {
            type: 'detailed_reasoning',
            title: 'Pattern Analysis',
            prompt: 'Systematically analyze the data to identify patterns, trends, anomalies, and relationships.',
            temperature: 0.4,
            expectedTokens: 500
          },
          {
            type: 'alternative_exploration',
            title: 'Multiple Perspectives',
            prompt: 'Consider alternative interpretations, potential biases, and different analytical frameworks.',
            temperature: 0.5,
            expectedTokens: 400
          },
          {
            type: 'synthesis',
            title: 'Insights & Conclusions',
            prompt: 'Synthesize findings into clear insights, actionable conclusions, and evidence-based recommendations.',
            temperature: 0.3,
            expectedTokens: 450
          }
        ],
        examples: [
          'Analyze the impact of remote work on productivity trends',
          'Examine the relationship between social media usage and mental health',
          'Investigate factors affecting customer satisfaction in e-commerce'
        ],
        metadata: {
          category: 'analysis',
          tags: ['research', 'data-analysis', 'insights', 'conclusions'],
          successRate: 0.89,
          avgDuration: 45,
          avgCost: 0.16
        }
      },

      // SURVEY DESIGN TEMPLATE (specific to this application)
      {
        id: 'survey_design',
        name: 'Survey Design & Methodology',
        description: 'Research-grade survey design with methodological rigor and bias reduction',
        queryPatterns: [
          /\b(survey|questionnaire|poll|form)\b.*\b(design|create|build|develop)\b/gi,
          /\b(research|study|data collection|feedback)\b/gi,
          /\b(questions|responses|participants|methodology)\b/gi,
          /\b(bias|validation|reliability|validity)\b/gi
        ],
        complexity: 'COMPLEX',
        phases: [
          {
            type: 'understanding',
            title: 'Research Objectives',
            prompt: 'Define clear research objectives, target population, and key metrics to be measured. Identify the purpose and scope of the survey.',
            temperature: 0.3,
            expectedTokens: 350
          },
          {
            type: 'knowledge_gathering',
            title: 'Methodological Framework',
            prompt: 'Apply survey methodology principles: sampling strategies, question types, response scales, and bias mitigation techniques.',
            temperature: 0.3,
            expectedTokens: 400
          },
          {
            type: 'approach_planning',
            title: 'Question Design Strategy',
            prompt: 'Plan the question structure, flow, and logic. Consider question types, response options, and skip patterns.',
            temperature: 0.4,
            expectedTokens: 450
          },
          {
            type: 'detailed_reasoning',
            title: 'Survey Construction',
            prompt: 'Create well-crafted questions with appropriate response scales. Ensure clarity, neutrality, and comprehensive coverage of research objectives.',
            temperature: 0.4,
            expectedTokens: 600
          },
          {
            type: 'self_critique',
            title: 'Bias & Validity Check',
            prompt: 'Review for potential biases: leading questions, social desirability, order effects. Validate content and construct validity.',
            temperature: 0.3,
            expectedTokens: 350
          },
          {
            type: 'synthesis',
            title: 'Implementation & Analytics',
            prompt: 'Finalize survey with user experience optimization, accessibility considerations, and analytical framework for response processing.',
            temperature: 0.3,
            expectedTokens: 400
          }
        ],
        examples: [
          'Create a customer satisfaction survey for an e-commerce platform',
          'Design a research questionnaire about workplace culture',
          'Build a feedback form for event attendees with analytics'
        ],
        metadata: {
          category: 'survey',
          tags: ['survey-design', 'methodology', 'research', 'data-collection'],
          successRate: 0.92,
          avgDuration: 35,
          avgCost: 0.14
        }
      },

      // DECISION MAKING TEMPLATE
      {
        id: 'decision_making',
        name: 'Decision Analysis & Problem Solving',
        description: 'Structured approach to complex decisions with trade-off analysis',
        queryPatterns: [
          /\b(decide|choose|select|pick)\b.*\b(between|among|from)\b/gi,
          /\b(decision|choice|option|alternative)\b/gi,
          /\b(pros and cons|advantages|disadvantages|trade-offs)\b/gi,
          /\b(should I|what would|which is better|recommend)\b/gi
        ],
        complexity: 'MODERATE',
        phases: [
          {
            type: 'understanding',
            title: 'Decision Context',
            prompt: 'Clearly define the decision to be made, the available options, and the decision criteria or constraints.',
            temperature: 0.3,
            expectedTokens: 300
          },
          {
            type: 'planning',
            title: 'Option Analysis',
            prompt: 'Systematically analyze each option, listing advantages, disadvantages, costs, benefits, and potential outcomes.',
            temperature: 0.4,
            expectedTokens: 450
          },
          {
            type: 'execution',
            title: 'Recommendation',
            prompt: 'Based on the analysis, provide a clear recommendation with reasoning. Address potential concerns and implementation considerations.',
            temperature: 0.3,
            expectedTokens: 350
          }
        ],
        examples: [
          'Should I use React or Vue.js for my new web application?',
          'Help me choose between different career opportunities',
          'Which cloud provider is best for my startup needs?'
        ],
        metadata: {
          category: 'decision-making',
          tags: ['decision-analysis', 'comparison', 'recommendation'],
          successRate: 0.85,
          avgDuration: 22,
          avgCost: 0.08
        }
      }
    ];

    // Initialize templates and stats
    templates.forEach(template => {
      this.templates.set(template.id, template);
      this.templateStats.set(template.id, {
        usage: 0,
        successRate: template.metadata.successRate || 0.8,
        avgDuration: template.metadata.avgDuration || 30,
        avgCost: template.metadata.avgCost || 0.10,
        lastUsed: 0
      });
    });
  }

  /**
   * Find the best matching template for a query
   */
  findBestTemplate(query: string, complexity?: ComplexityLevel): ReasoningTemplate | null {
    const queryLower = query.toLowerCase();
    const matches: Array<{ template: ReasoningTemplate; score: number }> = [];

    for (const template of this.templates.values()) {
      // Skip templates that don't match complexity if specified
      if (complexity && template.complexity !== complexity) {
        continue;
      }

      let score = 0;
      let matchCount = 0;

      // Check pattern matches
      for (const pattern of template.queryPatterns) {
        const patternMatches = query.match(pattern);
        if (patternMatches) {
          matchCount += patternMatches.length;
          score += patternMatches.length * 10; // Base score for pattern match
        }
      }

      // Boost score for keywords in description
      const keywords = template.metadata.tags;
      for (const keyword of keywords) {
        if (queryLower.includes(keyword.replace('-', ' '))) {
          score += 5;
        }
      }

      // Factor in template performance
      const stats = this.templateStats.get(template.id);
      if (stats) {
        score *= (stats.successRate * 1.2); // Boost successful templates
        
        // Slight boost for recently used templates (they might be relevant)
        const recencyBoost = Date.now() - stats.lastUsed < 24 * 60 * 60 * 1000 ? 1.1 : 1.0;
        score *= recencyBoost;
      }

      if (score > 0) {
        matches.push({ template, score });
      }
    }

    // Sort by score and return the best match
    matches.sort((a, b) => b.score - a.score);
    
    const bestMatch = matches[0];
    if (bestMatch && bestMatch.score >= 10) { // Minimum threshold for template selection
      return bestMatch.template;
    }

    return null;
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): ReasoningTemplate | null {
    return this.templates.get(templateId) || null;
  }

  /**
   * Get all templates, optionally filtered by category or complexity
   */
  getTemplates(options: {
    category?: string;
    complexity?: ComplexityLevel;
    sortBy?: 'usage' | 'success_rate' | 'name';
  } = {}): ReasoningTemplate[] {
    let templates = Array.from(this.templates.values());

    // Apply filters
    if (options.category) {
      templates = templates.filter(t => t.metadata.category === options.category);
    }

    if (options.complexity) {
      templates = templates.filter(t => t.complexity === options.complexity);
    }

    // Apply sorting
    if (options.sortBy) {
      templates.sort((a, b) => {
        const statsA = this.templateStats.get(a.id)!;
        const statsB = this.templateStats.get(b.id)!;

        switch (options.sortBy) {
          case 'usage':
            return statsB.usage - statsA.usage;
          case 'success_rate':
            return statsB.successRate - statsA.successRate;
          case 'name':
            return a.name.localeCompare(b.name);
          default:
            return 0;
        }
      });
    }

    return templates;
  }

  /**
   * Record template usage for analytics
   */
  recordUsage(
    templateId: string,
    duration: number,
    cost: number,
    success: boolean
  ): void {
    const stats = this.templateStats.get(templateId);
    if (!stats) return;

    stats.usage++;
    stats.lastUsed = Date.now();
    
    // Update running averages
    const alpha = 0.1; // Learning rate for exponential moving average
    stats.avgDuration = stats.avgDuration * (1 - alpha) + duration * alpha;
    stats.avgCost = stats.avgCost * (1 - alpha) + cost * alpha;
    
    // Update success rate
    const currentSuccessCount = Math.round(stats.successRate * (stats.usage - 1));
    const newSuccessCount = currentSuccessCount + (success ? 1 : 0);
    stats.successRate = newSuccessCount / stats.usage;
  }

  /**
   * Get template statistics
   */
  getTemplateStats(templateId: string) {
    const template = this.templates.get(templateId);
    const stats = this.templateStats.get(templateId);
    
    if (!template || !stats) return null;

    return {
      template: {
        id: template.id,
        name: template.name,
        category: template.metadata.category,
        complexity: template.complexity
      },
      stats: {
        usage: stats.usage,
        successRate: Math.round(stats.successRate * 100),
        avgDuration: Math.round(stats.avgDuration),
        avgCost: stats.avgCost.toFixed(3),
        lastUsed: stats.lastUsed
      }
    };
  }

  /**
   * Get overall template system statistics
   */
  getSystemStats() {
    const templates = Array.from(this.templates.values());
    const allStats = Array.from(this.templateStats.values());

    const totalUsage = allStats.reduce((sum, stats) => sum + stats.usage, 0);
    const avgSuccessRate = allStats.reduce((sum, stats) => sum + stats.successRate, 0) / allStats.length;
    
    const categoryStats = templates.reduce((acc, template) => {
      const category = template.metadata.category;
      if (!acc[category]) {
        acc[category] = { count: 0, usage: 0 };
      }
      acc[category].count++;
      acc[category].usage += this.templateStats.get(template.id)?.usage || 0;
      return acc;
    }, {} as Record<string, { count: number; usage: number }>);

    return {
      totalTemplates: templates.length,
      totalUsage,
      avgSuccessRate: Math.round(avgSuccessRate * 100),
      categories: Object.keys(categoryStats).length,
      categoryBreakdown: categoryStats,
      mostUsedTemplate: this.getMostUsedTemplate()
    };
  }

  /**
   * Get the most used template
   */
  private getMostUsedTemplate(): { name: string; usage: number } | null {
    let maxUsage = 0;
    let mostUsed: ReasoningTemplate | null = null;

    for (const [templateId, stats] of this.templateStats.entries()) {
      if (stats.usage > maxUsage) {
        maxUsage = stats.usage;
        mostUsed = this.templates.get(templateId) || null;
      }
    }

    return mostUsed ? { name: mostUsed.name, usage: maxUsage } : null;
  }

  /**
   * Create a custom template (for advanced users)
   */
  createCustomTemplate(template: Omit<ReasoningTemplate, 'id'>): string {
    const id = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullTemplate: ReasoningTemplate = {
      ...template,
      id,
      metadata: {
        ...template.metadata,
        category: template.metadata.category || 'custom'
      }
    };

    this.templates.set(id, fullTemplate);
    this.templateStats.set(id, {
      usage: 0,
      successRate: 0.8, // Default
      avgDuration: 30, // Default
      avgCost: 0.10, // Default
      lastUsed: 0
    });

    return id;
  }

  /**
   * Export template for sharing
   */
  exportTemplate(templateId: string): string | null {
    const template = this.templates.get(templateId);
    if (!template) return null;

    return JSON.stringify(template, null, 2);
  }

  /**
   * Import template from JSON
   */
  importTemplate(templateJson: string): string {
    try {
      const template: ReasoningTemplate = JSON.parse(templateJson);
      
      // Validate required fields
      if (!template.name || !template.phases || !template.queryPatterns) {
        throw new Error('Invalid template format');
      }

      return this.createCustomTemplate(template);
    } catch (error) {
      throw new Error(`Failed to import template: ${error}`);
    }
  }
}

// Export singleton instance
export const reasoningTemplateManager = new ReasoningTemplateManager();