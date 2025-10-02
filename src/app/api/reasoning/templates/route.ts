/**
 * Reasoning Templates API Endpoint
 * 
 * Manages reasoning templates:
 * - List available templates
 * - Get template details
 * - Template usage analytics
 * - Custom template management
 */

import { NextRequest, NextResponse } from 'next/server';
import { reasoningTemplateManager } from '@/services/reasoning/ReasoningTemplates';
import {
  ReasoningTemplate,
  ComplexityLevel
} from '@/types/reasoning.types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/reasoning/templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const complexity = searchParams.get('complexity') as ComplexityLevel || undefined;
    const sortBy = searchParams.get('sortBy') as 'usage' | 'success_rate' | 'name' || 'name';
    const includeStats = searchParams.get('includeStats') === 'true';
    const templateId = searchParams.get('id');

    // If specific template requested
    if (templateId) {
      const template = reasoningTemplateManager.getTemplate(templateId);
      if (!template) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        );
      }

      const response: any = { template };

      if (includeStats) {
        response.stats = reasoningTemplateManager.getTemplateStats(templateId);
      }

      return NextResponse.json(response);
    }

    // Get filtered templates
    const templates = reasoningTemplateManager.getTemplates({
      category,
      complexity,
      sortBy
    });

    const response = {
      templates: templates.map(template => {
        const baseTemplate = {
          id: template.id,
          name: template.name,
          description: template.description,
          complexity: template.complexity,
          category: template.metadata.category,
          tags: template.metadata.tags,
          exampleQueries: template.examples.slice(0, 2), // Limit examples for list view
          phaseCount: template.phases.length,
          estimatedDuration: template.metadata.avgDuration
        };

        if (includeStats) {
          const stats = reasoningTemplateManager.getTemplateStats(template.id);
          return {
            ...baseTemplate,
            stats: stats?.stats || null
          };
        }

        return baseTemplate;
      }),
      totalCount: templates.length,
      filters: {
        categories: [...new Set(templates.map(t => t.metadata.category))],
        complexityLevels: [...new Set(templates.map(t => t.complexity))]
      }
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Templates GET error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to retrieve templates',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// POST /api/reasoning/templates (Create custom template)
export async function POST(request: NextRequest) {
  try {
    const template: Omit<ReasoningTemplate, 'id'> = await request.json();

    // Validate required fields
    if (!template.name || typeof template.name !== 'string') {
      return NextResponse.json(
        { error: 'Template name is required' },
        { status: 400 }
      );
    }

    if (!template.description || typeof template.description !== 'string') {
      return NextResponse.json(
        { error: 'Template description is required' },
        { status: 400 }
      );
    }

    if (!template.phases || !Array.isArray(template.phases) || template.phases.length === 0) {
      return NextResponse.json(
        { error: 'Template must have at least one phase' },
        { status: 400 }
      );
    }

    if (!template.queryPatterns || !Array.isArray(template.queryPatterns) || template.queryPatterns.length === 0) {
      return NextResponse.json(
        { error: 'Template must have at least one query pattern' },
        { status: 400 }
      );
    }

    if (!['SIMPLE', 'MODERATE', 'COMPLEX', 'CREATIVE'].includes(template.complexity)) {
      return NextResponse.json(
        { error: 'Invalid complexity level' },
        { status: 400 }
      );
    }

    // Validate phases
    for (const phase of template.phases) {
      if (!phase.type || !phase.title || !phase.prompt) {
        return NextResponse.json(
          { error: 'Each phase must have type, title, and prompt' },
          { status: 400 }
        );
      }

      if (phase.temperature !== undefined && (phase.temperature < 0 || phase.temperature > 2)) {
        return NextResponse.json(
          { error: 'Phase temperature must be between 0 and 2' },
          { status: 400 }
        );
      }
    }

    // Convert regex patterns from strings to RegExp objects
    const processedTemplate = {
      ...template,
      queryPatterns: template.queryPatterns.map(pattern => {
        if (typeof pattern === 'string') {
          try {
            return new RegExp(pattern, 'gi');
          } catch {
            // If invalid regex, treat as literal string pattern
            return new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
          }
        }
        return pattern;
      })
    };

    const templateId = reasoningTemplateManager.createCustomTemplate(processedTemplate);

    return NextResponse.json({
      templateId,
      message: 'Template created successfully'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Templates POST error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create template',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// PUT /api/reasoning/templates/:id/usage (Record template usage)
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('id');
    const action = searchParams.get('action');

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    if (action === 'record_usage') {
      const { duration, cost, success } = await request.json();

      if (typeof duration !== 'number' || typeof cost !== 'number' || typeof success !== 'boolean') {
        return NextResponse.json(
          { error: 'Invalid usage data. Duration (number), cost (number), and success (boolean) are required' },
          { status: 400 }
        );
      }

      reasoningTemplateManager.recordUsage(templateId, duration, cost, success);

      return NextResponse.json({ message: 'Usage recorded successfully' });
    }

    if (action === 'export') {
      const exportedTemplate = reasoningTemplateManager.exportTemplate(templateId);
      
      if (!exportedTemplate) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        );
      }

      // Return as downloadable JSON
      return new NextResponse(exportedTemplate, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="template-${templateId}.json"`
        }
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Templates PUT error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update template',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}