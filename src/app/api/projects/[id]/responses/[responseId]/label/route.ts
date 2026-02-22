/**
 * POST /api/projects/[id]/responses/[responseId]/label
 *
 * Customer feedback endpoint for labeling responses as fraud/legitimate.
 * Allows survey owners to provide ground truth labels for ML training.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

interface RouteContext {
  params: Promise<{ id: string; responseId: string }>;
}

interface LabelFeedbackRequest {
  isFraud: boolean;
  userId: string;
  reason?: string;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: projectId, responseId } = await context.params;
    const body: LabelFeedbackRequest = await request.json();
    const { isFraud, userId, reason } = body;

    if (typeof isFraud !== 'boolean') {
      return NextResponse.json(
        { error: 'isFraud (boolean) is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Verify user owns the project
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found or unauthorized' },
        { status: 403 }
      );
    }

    // Verify response belongs to this project
    const { data: response, error: responseError } = await supabaseAdmin
      .from('survey_responses')
      .select('id')
      .eq('id', responseId)
      .eq('survey_id', projectId)
      .single();

    if (responseError || !response) {
      return NextResponse.json(
        { error: 'Response not found in this project' },
        { status: 404 }
      );
    }

    // Check if label already exists
    const { data: existingLabel } = await supabaseAdmin
      .from('cipher_labels')
      .select('id, label_source')
      .eq('response_id', responseId)
      .single();

    if (existingLabel) {
      // Update existing label if it was auto-generated
      // Customer feedback overrides auto-rules
      const { data: updatedLabel, error: updateError } = await supabaseAdmin
        .from('cipher_labels')
        .update({
          is_fraud: isFraud,
          confidence: 0.9, // Customer feedback is high confidence
          label_source: 'customer_feedback',
          label_reason: reason || (isFraud ? 'Marked as suspicious by survey owner' : 'Marked as legitimate by survey owner'),
          labeled_by: userId,
          updated_at: new Date().toISOString(),
        })
        .eq('response_id', responseId)
        .select('id')
        .single();

      if (updateError) {
        console.error('Error updating label:', updateError);
        return NextResponse.json(
          { error: 'Failed to update label' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        action: 'updated',
        labelId: updatedLabel.id,
        isFraud,
        previousSource: existingLabel.label_source,
      });
    }

    // Create new label
    const { data: newLabel, error: insertError } = await supabaseAdmin
      .from('cipher_labels')
      .insert({
        response_id: responseId,
        is_fraud: isFraud,
        confidence: 0.9, // Customer feedback is high confidence
        label_source: 'customer_feedback',
        label_reason: reason || (isFraud ? 'Marked as suspicious by survey owner' : 'Marked as legitimate by survey owner'),
        labeled_by: userId,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error inserting label:', insertError);
      return NextResponse.json(
        { error: 'Failed to create label' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      action: 'created',
      labelId: newLabel.id,
      isFraud,
    });
  } catch (error) {
    console.error('Error in label feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/projects/[id]/responses/[responseId]/label
 *
 * Get the current label for a response
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: projectId, responseId } = await context.params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 }
      );
    }

    // Verify user owns the project
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found or unauthorized' },
        { status: 403 }
      );
    }

    // Get label
    const { data: label, error: labelError } = await supabaseAdmin
      .from('cipher_labels')
      .select('*')
      .eq('response_id', responseId)
      .single();

    if (labelError || !label) {
      return NextResponse.json({
        success: true,
        hasLabel: false,
      });
    }

    return NextResponse.json({
      success: true,
      hasLabel: true,
      label: {
        id: label.id,
        isFraud: label.is_fraud,
        confidence: label.confidence,
        source: label.label_source,
        reason: label.label_reason,
        labeledBy: label.labeled_by,
        createdAt: label.created_at,
        updatedAt: label.updated_at,
      },
    });
  } catch (error) {
    console.error('Error getting label:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[id]/responses/[responseId]/label
 *
 * Remove a customer-provided label (only if it was customer_feedback)
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id: projectId, responseId } = await context.params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 }
      );
    }

    // Verify user owns the project
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found or unauthorized' },
        { status: 403 }
      );
    }

    // Only allow deletion of customer_feedback labels
    const { data: label, error: labelError } = await supabaseAdmin
      .from('cipher_labels')
      .select('id, label_source')
      .eq('response_id', responseId)
      .single();

    if (labelError || !label) {
      return NextResponse.json(
        { error: 'Label not found' },
        { status: 404 }
      );
    }

    if (label.label_source !== 'customer_feedback') {
      return NextResponse.json(
        { error: 'Can only delete customer feedback labels' },
        { status: 403 }
      );
    }

    const { error: deleteError } = await supabaseAdmin
      .from('cipher_labels')
      .delete()
      .eq('id', label.id);

    if (deleteError) {
      console.error('Error deleting label:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete label' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Label deleted',
    });
  } catch (error) {
    console.error('Error deleting label:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
