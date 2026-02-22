/**
 * POST /api/cipher/extract-features
 *
 * Extracts ML features from a survey response and stores them in cipher_features table.
 * Called automatically after a response is submitted.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { extractFeatures, featuresToDbRow } from '@/lib/cipher/feature-extraction';
import type { SurveyResponseData } from '@/lib/cipher/types';

interface ExtractFeaturesRequest {
  responseId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ExtractFeaturesRequest = await request.json();
    const { responseId } = body;

    if (!responseId) {
      return NextResponse.json(
        { error: 'responseId is required' },
        { status: 400 }
      );
    }

    // Fetch the survey response
    const { data: response, error: responseError } = await supabaseAdmin
      .from('survey_responses')
      .select('*')
      .eq('id', responseId)
      .single();

    if (responseError || !response) {
      console.error('Error fetching response:', responseError);
      return NextResponse.json(
        { error: 'Response not found' },
        { status: 404 }
      );
    }

    // Check if features already exist for this response
    const { data: existingFeatures } = await supabaseAdmin
      .from('cipher_features')
      .select('id')
      .eq('response_id', responseId)
      .single();

    if (existingFeatures) {
      return NextResponse.json({
        success: true,
        message: 'Features already extracted',
        featureId: existingFeatures.id,
      });
    }

    // Convert database row to SurveyResponseData format
    const responseData: SurveyResponseData = {
      id: response.id,
      surveyId: response.survey_id,
      responses: response.responses || {},
      completedAt: response.completed_at || response.created_at,
      mouseData: response.mouse_data || null,
      keystrokeData: response.keystroke_data || null,
      timingData: response.timing_data || null,
      deviceData: response.device_data || null,
      fraudScore: response.fraud_score || null,
      isFlagged: response.is_flagged || false,
      flagReasons: response.flag_reasons || null,
      sessionId: response.session_id || null,
      ipAddress: response.ip_address || null,
      createdAt: response.created_at,
    };

    // Extract features
    const features = extractFeatures(responseData);

    // Convert to database row format
    const dbRow = featuresToDbRow(responseId, response.survey_id, features);

    // Store features in database
    const { data: insertedFeatures, error: insertError } = await supabaseAdmin
      .from('cipher_features')
      .insert(dbRow)
      .select('id')
      .single();

    if (insertError) {
      console.error('Error inserting features:', insertError);
      return NextResponse.json(
        { error: 'Failed to store features', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      featureId: insertedFeatures.id,
      featureCount: dbRow.feature_vector.length,
    });
  } catch (error) {
    console.error('Error in extract-features:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cipher/extract-features?responseId=xxx
 *
 * Get extracted features for a specific response
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const responseId = searchParams.get('responseId');

    if (!responseId) {
      return NextResponse.json(
        { error: 'responseId query parameter is required' },
        { status: 400 }
      );
    }

    const { data: features, error } = await supabaseAdmin
      .from('cipher_features')
      .select('*')
      .eq('response_id', responseId)
      .single();

    if (error || !features) {
      return NextResponse.json(
        { error: 'Features not found for this response' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      features,
    });
  } catch (error) {
    console.error('Error in get features:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
