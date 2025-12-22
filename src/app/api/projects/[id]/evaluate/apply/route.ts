import { NextRequest, NextResponse } from 'next/server';
import { applySuggestion, dismissSuggestion } from '@/lib/agents/evaluationAgent';
import { ApplySuggestionRequestSchema } from '@/lib/schemas/evaluation-schemas';

export const runtime = 'nodejs';

// POST - Apply a suggestion
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();

    // Validate request
    const parsed = ApplySuggestionRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { userId, suggestionId } = parsed.data;

    const result = await applySuggestion(suggestionId, projectId, userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error applying suggestion:', error);
    return NextResponse.json(
      { error: 'Failed to apply suggestion' },
      { status: 500 }
    );
  }
}

// DELETE - Dismiss a suggestion
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const suggestionId = searchParams.get('suggestionId');

    if (!suggestionId) {
      return NextResponse.json(
        { error: 'Missing suggestionId' },
        { status: 400 }
      );
    }

    const result = await dismissSuggestion(suggestionId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error dismissing suggestion:', error);
    return NextResponse.json(
      { error: 'Failed to dismiss suggestion' },
      { status: 500 }
    );
  }
}
