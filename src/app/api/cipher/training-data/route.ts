/**
 * GET /api/cipher/training-data
 *
 * Returns labeled training data for ML model training.
 * Used by the training pipeline to fetch feature vectors and labels.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { checkTrainingReadiness } from '@/lib/cipher/auto-labeling';

interface TrainingDataRow {
  features: {
    id: string;
    feature_vector: number[];
    feature_version: number;
    response_id: string;
  };
  label: {
    is_fraud: boolean;
    confidence: number;
    label_source: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const limit = parseInt(searchParams.get('limit') || '1000', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Filters
    const minConfidence = parseFloat(searchParams.get('minConfidence') || '0.8');
    const excludeUsedInTraining = searchParams.get('excludeUsed') === 'true';
    const featureVersion = searchParams.get('featureVersion');

    // Get stats endpoint
    if (searchParams.get('stats') === 'true') {
      return getTrainingStats();
    }

    // Build the query to join features with labels
    let query = supabaseAdmin
      .from('cipher_labels')
      .select(`
        id,
        response_id,
        is_fraud,
        confidence,
        label_source,
        cipher_features!inner (
          id,
          feature_vector,
          feature_version,
          response_id
        )
      `)
      .gte('confidence', minConfidence)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (excludeUsedInTraining) {
      query = query.eq('used_in_training', false);
    }

    const { data: rows, error, count } = await query;

    if (error) {
      console.error('Error fetching training data:', error);
      return NextResponse.json(
        { error: 'Failed to fetch training data', details: error.message },
        { status: 500 }
      );
    }

    // Filter by feature version if specified
    let filteredRows = rows || [];
    if (featureVersion) {
      const version = parseInt(featureVersion, 10);
      filteredRows = filteredRows.filter((row: any) =>
        row.cipher_features?.feature_version === version
      );
    }

    // Format response
    const trainingData = filteredRows.map((row: any) => ({
      responseId: row.response_id,
      featureVector: row.cipher_features?.feature_vector || [],
      featureVersion: row.cipher_features?.feature_version,
      label: row.is_fraud ? 1 : 0,
      confidence: row.confidence,
      labelSource: row.label_source,
    }));

    return NextResponse.json({
      success: true,
      data: trainingData,
      pagination: {
        limit,
        offset,
        total: count,
        hasMore: (offset + limit) < (count || 0),
      },
    });
  } catch (error) {
    console.error('Error in training-data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get training data statistics
 */
async function getTrainingStats() {
  try {
    // Get all labels
    const { data: labels, error: labelsError } = await supabaseAdmin
      .from('cipher_labels')
      .select('*');

    if (labelsError) {
      return NextResponse.json(
        { error: 'Failed to fetch labels' },
        { status: 500 }
      );
    }

    // Get feature count
    const { count: featureCount, error: featureError } = await supabaseAdmin
      .from('cipher_features')
      .select('id', { count: 'exact', head: true });

    if (featureError) {
      return NextResponse.json(
        { error: 'Failed to count features' },
        { status: 500 }
      );
    }

    // Calculate readiness
    const readiness = checkTrainingReadiness(labels || []);

    // Get label distribution by source
    const labelsBySource: Record<string, { fraud: number; legitimate: number }> = {};
    for (const label of labels || []) {
      if (!labelsBySource[label.label_source]) {
        labelsBySource[label.label_source] = { fraud: 0, legitimate: 0 };
      }
      if (label.is_fraud) {
        labelsBySource[label.label_source].fraud++;
      } else {
        labelsBySource[label.label_source].legitimate++;
      }
    }

    // Get unused labels count (for next training run)
    const unusedLabels = (labels || []).filter((l: any) => !l.used_in_training).length;

    // Get confidence distribution
    const confidenceBuckets = [0, 0, 0, 0, 0]; // [0.6-0.7, 0.7-0.8, 0.8-0.9, 0.9-0.95, 0.95-1.0]
    for (const label of labels || []) {
      const conf = label.confidence;
      if (conf >= 0.95) confidenceBuckets[4]++;
      else if (conf >= 0.9) confidenceBuckets[3]++;
      else if (conf >= 0.8) confidenceBuckets[2]++;
      else if (conf >= 0.7) confidenceBuckets[1]++;
      else if (conf >= 0.6) confidenceBuckets[0]++;
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalFeatures: featureCount || 0,
        totalLabels: readiness.totalLabels,
        fraudLabels: readiness.fraudLabels,
        legitimateLabels: readiness.legitimateLabels,
        unusedLabels,
        labelsBySource,
        confidenceDistribution: {
          '0.6-0.7': confidenceBuckets[0],
          '0.7-0.8': confidenceBuckets[1],
          '0.8-0.9': confidenceBuckets[2],
          '0.9-0.95': confidenceBuckets[3],
          '0.95-1.0': confidenceBuckets[4],
        },
        readiness: {
          isReady: readiness.isReady,
          percentageReady: readiness.percentageReady,
          message: readiness.message,
          requirements: {
            minTotal: readiness.minLabelsRequired,
            minFraud: readiness.minFraudLabelsRequired,
            minLegitimate: readiness.minLegitimateLabelsRequired,
          },
        },
      },
    });
  } catch (error) {
    console.error('Error getting training stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cipher/training-data
 *
 * Mark training data as used in a training run
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { responseIds, trainingRunId } = body;

    if (!responseIds || !Array.isArray(responseIds)) {
      return NextResponse.json(
        { error: 'responseIds array is required' },
        { status: 400 }
      );
    }

    if (!trainingRunId) {
      return NextResponse.json(
        { error: 'trainingRunId is required' },
        { status: 400 }
      );
    }

    // Mark labels as used in training
    const { error: updateError, count } = await supabaseAdmin
      .from('cipher_labels')
      .update({
        used_in_training: true,
        training_run_id: trainingRunId,
      })
      .in('response_id', responseIds);

    if (updateError) {
      console.error('Error marking labels as used:', updateError);
      return NextResponse.json(
        { error: 'Failed to update labels' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      updatedCount: count,
      trainingRunId,
    });
  } catch (error) {
    console.error('Error in mark-used:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
