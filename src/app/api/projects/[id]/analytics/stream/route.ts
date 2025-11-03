import { NextRequest, NextResponse } from 'next/server';
import { ProjectsService } from '@/lib/services/projects';
import { AnalyticsService } from '@/lib/services/analytics';
import type { SurveyResponse } from '@/types/database';

// Store active connections for each project
const activeConnections = new Map<string, Set<ReadableStreamDefaultController>>();

// Function to broadcast analytics update to all connected clients
export function broadcastAnalyticsUpdate(projectId: string, analytics: any) {
  const connections = activeConnections.get(projectId);
  if (connections) {
    for (const controller of connections) {
      try {
        const data = `data: ${JSON.stringify(analytics)}\n\n`;
        controller.enqueue(new TextEncoder().encode(data));
      } catch (error) {
        console.error('Error broadcasting to client:', error);
      }
    }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Verify project ownership
    const { data: project, error } = await ProjectsService.getProject(projectId, userId);
    if (error || !project) {
      return NextResponse.json(
        { error: 'Project not found or you do not have permission' },
        { status: 404 }
      );
    }

    // Create a stream for SSE
    const customReadable = new ReadableStream({
      start(controller) {
        // Store the controller for this connection
        if (!activeConnections.has(projectId)) {
          activeConnections.set(projectId, new Set());
        }
        activeConnections.get(projectId)!.add(controller);

        // Send initial connection message
        const initialData = `data: ${JSON.stringify({ type: 'connected', message: 'Connected to analytics stream' })}\n\n`;
        controller.enqueue(new TextEncoder().encode(initialData));

        // Send initial analytics (empty or based on survey schema)
        if (project.survey_schema) {
          const initialAnalytics = {
            type: 'analytics_update',
            projectId,
            surveyTitle: project.title,
            totalResponses: 0,
            completionRate: 0,
            questionsAnalytics: [],
            responses: [],
            lastUpdated: new Date().toISOString()
          };
          const analyticsData = `data: ${JSON.stringify(initialAnalytics)}\n\n`;
          controller.enqueue(new TextEncoder().encode(analyticsData));
        }

        // Cleanup on client disconnect
        const onClose = () => {
          const connections = activeConnections.get(projectId);
          if (connections) {
            connections.delete(controller);
            if (connections.size === 0) {
              activeConnections.delete(projectId);
            }
          }
        };

        request.signal.addEventListener('abort', onClose);
      }
    });

    // Return SSE response
    return new NextResponse(customReadable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error) {
    console.error('Error setting up analytics stream:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
