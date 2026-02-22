import { NextRequest, NextResponse } from 'next/server';
import { ProjectsService } from '@/lib/services/projects';
import { requireAuth } from '@/lib/auth-utils';
import { getCorsHeaders, handleCorsPreflightRequest } from '@/lib/cors';

// Store active connections for live metrics per project
const activeMetricsConnections = new Map<string, Set<ReadableStreamDefaultController>>();

// Store current session metrics per project (in-memory cache)
const activeSessionMetrics = new Map<string, Map<string, LiveSessionMetrics>>();

interface LiveSessionMetrics {
  sessionId: string;
  startedAt: number;
  lastActiveAt: number;
  currentQuestionIndex: number;
  responseCount: number;
  mouseMovementCount: number;
  keypressCount: number;
  tabSwitchCount: number;
  avgMouseVelocity: number;
  tier: number;
}

interface MetricsUpdate {
  type: 'metrics_update' | 'session_started' | 'session_completed' | 'session_timeout';
  projectId: string;
  sessionId?: string;
  data?: LiveSessionMetrics;
  summary?: {
    activeSessions: number;
    totalResponsesInProgress: number;
    avgQuestionProgress: number;
  };
  timestamp: number;
}

/**
 * Broadcast live metrics update to all connected clients for a project
 */
export function broadcastLiveMetrics(projectId: string, update: MetricsUpdate) {
  const connections = activeMetricsConnections.get(projectId);
  if (connections) {
    for (const controller of connections) {
      try {
        const data = `data: ${JSON.stringify(update)}\n\n`;
        controller.enqueue(new TextEncoder().encode(data));
      } catch (error) {
        console.error('Error broadcasting live metrics:', error);
      }
    }
  }
}

/**
 * Update session metrics (called from survey pages via API)
 */
export function updateSessionMetrics(
  projectId: string,
  sessionId: string,
  metrics: Partial<LiveSessionMetrics>
) {
  if (!activeSessionMetrics.has(projectId)) {
    activeSessionMetrics.set(projectId, new Map());
  }

  const projectSessions = activeSessionMetrics.get(projectId)!;
  const existingMetrics = projectSessions.get(sessionId);

  const updatedMetrics: LiveSessionMetrics = {
    sessionId,
    startedAt: existingMetrics?.startedAt ?? Date.now(),
    lastActiveAt: Date.now(),
    currentQuestionIndex: metrics.currentQuestionIndex ?? existingMetrics?.currentQuestionIndex ?? 0,
    responseCount: metrics.responseCount ?? existingMetrics?.responseCount ?? 0,
    mouseMovementCount: metrics.mouseMovementCount ?? existingMetrics?.mouseMovementCount ?? 0,
    keypressCount: metrics.keypressCount ?? existingMetrics?.keypressCount ?? 0,
    tabSwitchCount: metrics.tabSwitchCount ?? existingMetrics?.tabSwitchCount ?? 0,
    avgMouseVelocity: metrics.avgMouseVelocity ?? existingMetrics?.avgMouseVelocity ?? 0,
    tier: metrics.tier ?? existingMetrics?.tier ?? 3,
  };

  projectSessions.set(sessionId, updatedMetrics);

  // Calculate summary
  const sessions = Array.from(projectSessions.values());
  const summary = {
    activeSessions: sessions.length,
    totalResponsesInProgress: sessions.reduce((sum, s) => sum + s.responseCount, 0),
    avgQuestionProgress: sessions.length > 0
      ? sessions.reduce((sum, s) => sum + s.currentQuestionIndex, 0) / sessions.length
      : 0,
  };

  // Broadcast update
  broadcastLiveMetrics(projectId, {
    type: 'metrics_update',
    projectId,
    sessionId,
    data: updatedMetrics,
    summary,
    timestamp: Date.now(),
  });

  return updatedMetrics;
}

/**
 * Remove a session (completed or timed out)
 */
export function removeSession(
  projectId: string,
  sessionId: string,
  reason: 'completed' | 'timeout' = 'completed'
) {
  const projectSessions = activeSessionMetrics.get(projectId);
  if (projectSessions) {
    const session = projectSessions.get(sessionId);
    projectSessions.delete(sessionId);

    // Broadcast session removal
    broadcastLiveMetrics(projectId, {
      type: reason === 'completed' ? 'session_completed' : 'session_timeout',
      projectId,
      sessionId,
      data: session,
      summary: {
        activeSessions: projectSessions.size,
        totalResponsesInProgress: Array.from(projectSessions.values())
          .reduce((sum, s) => sum + s.responseCount, 0),
        avgQuestionProgress: projectSessions.size > 0
          ? Array.from(projectSessions.values())
              .reduce((sum, s) => sum + s.currentQuestionIndex, 0) / projectSessions.size
          : 0,
      },
      timestamp: Date.now(),
    });
  }
}

/**
 * Clean up stale sessions (inactive for more than 10 minutes)
 */
function cleanupStaleSessions() {
  const staleThreshold = 10 * 60 * 1000; // 10 minutes
  const now = Date.now();

  for (const [projectId, sessions] of activeSessionMetrics) {
    for (const [sessionId, metrics] of sessions) {
      if (now - metrics.lastActiveAt > staleThreshold) {
        removeSession(projectId, sessionId, 'timeout');
      }
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupStaleSessions, 5 * 60 * 1000);

/**
 * GET /api/projects/[id]/live-metrics
 *
 * SSE endpoint for real-time survey metrics monitoring.
 * Returns a stream of live session data for the dashboard.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Security: Authenticate user
    const [user, errorResponse] = await requireAuth();
    if (!user) return errorResponse;

    const projectId = params.id;

    // Verify project ownership
    const { data: project, error } = await ProjectsService.getProject(projectId, user.id);
    if (error || !project) {
      return NextResponse.json(
        { error: 'Project not found or you do not have permission' },
        { status: 404 }
      );
    }

    // Create SSE stream
    const customReadable = new ReadableStream({
      start(controller) {
        // Store connection
        if (!activeMetricsConnections.has(projectId)) {
          activeMetricsConnections.set(projectId, new Set());
        }
        activeMetricsConnections.get(projectId)!.add(controller);

        // Send initial connection message
        const initialData = `data: ${JSON.stringify({
          type: 'connected',
          message: 'Connected to live metrics stream',
          projectId,
          timestamp: Date.now(),
        })}\n\n`;
        controller.enqueue(new TextEncoder().encode(initialData));

        // Send current session summary if available
        const projectSessions = activeSessionMetrics.get(projectId);
        if (projectSessions && projectSessions.size > 0) {
          const sessions = Array.from(projectSessions.values());
          const initialSummary = `data: ${JSON.stringify({
            type: 'initial_state',
            projectId,
            sessions: sessions,
            summary: {
              activeSessions: sessions.length,
              totalResponsesInProgress: sessions.reduce((sum, s) => sum + s.responseCount, 0),
              avgQuestionProgress: sessions.length > 0
                ? sessions.reduce((sum, s) => sum + s.currentQuestionIndex, 0) / sessions.length
                : 0,
            },
            timestamp: Date.now(),
          })}\n\n`;
          controller.enqueue(new TextEncoder().encode(initialSummary));
        }

        // Cleanup on disconnect
        const onClose = () => {
          const connections = activeMetricsConnections.get(projectId);
          if (connections) {
            connections.delete(controller);
            if (connections.size === 0) {
              activeMetricsConnections.delete(projectId);
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
        ...getCorsHeaders(request),
      }
    });
  } catch (error) {
    console.error('Error setting up live metrics stream:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/[id]/live-metrics
 *
 * Receives metrics updates from survey pages.
 * Called periodically by the survey page with accumulated metrics.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const body = await request.json();

    const {
      sessionId,
      metrics,
      eventType, // 'update' | 'complete' | 'timeout'
    } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    // Handle different event types
    if (eventType === 'complete') {
      removeSession(projectId, sessionId, 'completed');
      return NextResponse.json({ success: true, status: 'session_completed' });
    }

    if (eventType === 'timeout') {
      removeSession(projectId, sessionId, 'timeout');
      return NextResponse.json({ success: true, status: 'session_timeout' });
    }

    // Update session metrics
    const updatedMetrics = updateSessionMetrics(projectId, sessionId, {
      currentQuestionIndex: metrics?.currentQuestionIndex,
      responseCount: metrics?.questionAnswers?.length ?? metrics?.responseCount,
      mouseMovementCount: metrics?.metricsSnapshot?.mouseMovementCount,
      keypressCount: metrics?.metricsSnapshot?.keypressCount,
      tabSwitchCount: metrics?.metricsSnapshot?.tabSwitchCount,
      avgMouseVelocity: metrics?.metricsSnapshot?.avgMouseVelocity,
      tier: metrics?.metricsSnapshot?.tier,
    });

    return NextResponse.json({
      success: true,
      metrics: updatedMetrics,
    });
  } catch (error) {
    console.error('Error processing metrics update:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflightRequest(request);
}
