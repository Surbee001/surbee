import { NextRequest, NextResponse } from 'next/server';
import { runEvaluation, getEvaluationHistory, getEvaluationSuggestions } from '@/lib/agents/evaluationAgent';
import { StartEvaluationRequestSchema, EvaluationEvent } from '@/lib/schemas/evaluation-schemas';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes max for evaluation

// GET - Fetch evaluation history or specific evaluation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const evaluationId = searchParams.get('evaluationId');

    if (evaluationId) {
      // Fetch specific evaluation with suggestions
      const { suggestions, error } = await getEvaluationSuggestions(evaluationId);
      if (error) {
        return NextResponse.json({ error }, { status: 500 });
      }
      return NextResponse.json({ suggestions });
    }

    // Fetch evaluation history
    const limit = parseInt(searchParams.get('limit') || '10');
    const { runs, error } = await getEvaluationHistory(projectId, limit);

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ runs });
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch evaluations' },
      { status: 500 }
    );
  }
}

// POST - Start a new evaluation (SSE streaming)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();

    // Validate request
    const parsed = StartEvaluationRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { userId, mode, model, customCriteria, includeResponseData } = parsed.data;

    // Create SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: EvaluationEvent) => {
          try {
            const data = JSON.stringify(event);
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          } catch (e) {
            console.error('Error sending event:', e);
          }
        };

        try {
          await runEvaluation({
            projectId,
            userId,
            mode,
            modelId: model,
            customCriteria,
            includeResponseData,
            onEvent: sendEvent,
          });
        } catch (error) {
          console.error('Evaluation error:', error);
          sendEvent({
            type: 'error',
            message: error instanceof Error ? error.message : 'Evaluation failed',
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('Error starting evaluation:', error);
    return NextResponse.json(
      { error: 'Failed to start evaluation' },
      { status: 500 }
    );
  }
}
