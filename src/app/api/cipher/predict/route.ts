import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { predictFraud, predictFraudBatch, healthCheck, listModels } from '@/lib/cipher/inference';
import { extractFeatures } from '@/lib/cipher/feature-extraction';
import { SurveyResponseData } from '@/lib/cipher/types';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/cipher/predict
 *
 * Get ML fraud prediction for a response.
 *
 * Body:
 * - responseId: string - The response ID to predict
 * - features?: CipherFeatures - Pre-extracted features (optional)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { responseId, features: preExtractedFeatures, modelVersion = 'latest' } = body;

    if (!responseId && !preExtractedFeatures) {
      return NextResponse.json(
        { error: 'Either responseId or features is required' },
        { status: 400 }
      );
    }

    let features = preExtractedFeatures;

    // If features not provided, extract from response
    if (!features && responseId) {
      // Check if we already have extracted features
      const { data: existingFeatures } = await supabaseAdmin
        .from('cipher_features')
        .select('*')
        .eq('response_id', responseId)
        .single();

      if (existingFeatures) {
        // Convert DB row to features object
        features = {
          mouseDistanceTotal: existingFeatures.mouse_distance_total,
          mouseVelocityMean: existingFeatures.mouse_velocity_mean,
          mouseVelocityStd: existingFeatures.mouse_velocity_std,
          mouseVelocityMax: existingFeatures.mouse_velocity_max,
          mouseAccelerationMean: existingFeatures.mouse_acceleration_mean,
          mouseCurvatureEntropy: existingFeatures.mouse_curvature_entropy,
          mouseStraightLineRatio: existingFeatures.mouse_straight_line_ratio,
          mousePauseCount: existingFeatures.mouse_pause_count,
          keystrokeCount: existingFeatures.keystroke_count,
          keystrokeTimingMean: existingFeatures.keystroke_timing_mean,
          keystrokeTimingStd: existingFeatures.keystroke_timing_std,
          keystrokeDwellMean: existingFeatures.keystroke_dwell_mean,
          keystrokeFlightMean: existingFeatures.keystroke_flight_mean,
          backspaceRatio: existingFeatures.backspace_ratio,
          pasteEventCount: existingFeatures.paste_event_count,
          pasteCharRatio: existingFeatures.paste_char_ratio,
          scrollCount: existingFeatures.scroll_count,
          scrollVelocityMean: existingFeatures.scroll_velocity_mean,
          scrollDirectionChanges: existingFeatures.scroll_direction_changes,
          focusLossCount: existingFeatures.focus_loss_count,
          focusLossDurationTotal: existingFeatures.focus_loss_duration_total,
          hoverCount: existingFeatures.hover_count,
          hoverDurationMean: existingFeatures.hover_duration_mean,
          clickCount: existingFeatures.click_count,
          hoverBeforeClickRatio: existingFeatures.hover_before_click_ratio,
          completionTimeSeconds: existingFeatures.completion_time_seconds,
          timePerQuestionMean: existingFeatures.time_per_question_mean,
          timePerQuestionStd: existingFeatures.time_per_question_std,
          timePerQuestionMin: existingFeatures.time_per_question_min,
          timePerQuestionMax: existingFeatures.time_per_question_max,
          readingVsAnsweringRatio: existingFeatures.reading_vs_answering_ratio,
          firstInteractionDelayMs: existingFeatures.first_interaction_delay_ms,
          idleTimeTotal: existingFeatures.idle_time_total,
          activeTimeRatio: existingFeatures.active_time_ratio,
          responseAcceleration: existingFeatures.response_acceleration,
          timeOfDayHour: existingFeatures.time_of_day_hour,
          dayOfWeek: existingFeatures.day_of_week,
          hasWebdriver: existingFeatures.has_webdriver,
          hasAutomationFlags: existingFeatures.has_automation_flags,
          pluginCount: existingFeatures.plugin_count,
          screenResolutionCommon: existingFeatures.screen_resolution_common,
          timezoneOffsetMinutes: existingFeatures.timezone_offset_minutes,
          timezoneMatchesIp: existingFeatures.timezone_matches_ip,
          fingerprintSeenCount: existingFeatures.fingerprint_seen_count,
          deviceMemoryGb: existingFeatures.device_memory_gb,
          hardwareConcurrency: existingFeatures.hardware_concurrency,
          touchSupport: existingFeatures.touch_support,
          isVpn: existingFeatures.is_vpn,
          isDatacenter: existingFeatures.is_datacenter,
          isTor: existingFeatures.is_tor,
          isProxy: existingFeatures.is_proxy,
          ipReputationScore: existingFeatures.ip_reputation_score,
          ipCountryCode: existingFeatures.ip_country_code || 'US',
          geoTimezoneMatch: existingFeatures.geo_timezone_match,
          ipSeenCount: existingFeatures.ip_seen_count,
          questionCount: existingFeatures.question_count,
          openEndedCount: existingFeatures.open_ended_count,
          openEndedLengthMean: existingFeatures.open_ended_length_mean,
          openEndedLengthStd: existingFeatures.open_ended_length_std,
          openEndedWordCountMean: existingFeatures.open_ended_word_count_mean,
          openEndedUniqueWordRatio: existingFeatures.open_ended_unique_word_ratio,
          straightLineRatio: existingFeatures.straight_line_ratio,
          answerEntropy: existingFeatures.answer_entropy,
          firstOptionRatio: existingFeatures.first_option_ratio,
          lastOptionRatio: existingFeatures.last_option_ratio,
          middleOptionRatio: existingFeatures.middle_option_ratio,
          responseUniquenessScore: existingFeatures.response_uniqueness_score,
          duplicateAnswerRatio: existingFeatures.duplicate_answer_ratio,
          naRatio: existingFeatures.na_ratio,
          skipRatio: existingFeatures.skip_ratio,
          attentionCheckPassed: existingFeatures.attention_check_passed,
          attentionCheckCount: existingFeatures.attention_check_count,
          consistencyCheckScore: existingFeatures.consistency_check_score,
          trapFieldFilled: existingFeatures.trap_field_filled,
          honeypotScore: existingFeatures.honeypot_score,
        };
      } else {
        // Need to extract features from response
        const { data: response, error } = await supabaseAdmin
          .from('survey_responses')
          .select('*')
          .eq('id', responseId)
          .single();

        if (error || !response) {
          return NextResponse.json({ error: 'Response not found' }, { status: 404 });
        }

        // Convert to SurveyResponseData format
        const responseData: SurveyResponseData = {
          id: response.id,
          surveyId: response.survey_id,
          responses: response.responses || {},
          completedAt: response.completed_at || response.created_at,
          mouseData: response.mouse_data,
          keystrokeData: response.keystroke_data,
          timingData: response.timing_data,
          deviceData: response.device_data,
          fraudScore: response.fraud_score,
          isFlagged: response.is_flagged || false,
          flagReasons: response.flag_reasons,
          sessionId: response.session_id,
          ipAddress: response.ip_address,
          createdAt: response.created_at,
        };

        features = extractFeatures(responseData);
      }
    }

    // Get prediction from ML model
    const prediction = await predictFraud(features, modelVersion);

    // Store prediction in database
    if (responseId) {
      await supabaseAdmin.from('cipher_ml_predictions').upsert(
        {
          response_id: responseId,
          fraud_probability: prediction.fraudProbability,
          fraud_verdict: prediction.fraudVerdict,
          confidence: prediction.confidence,
          top_signals: prediction.topSignals,
          model_version: prediction.modelVersion,
          feature_version: 1,
          inference_time_ms: prediction.inferenceTimeMs,
        },
        { onConflict: 'response_id' }
      );
    }

    return NextResponse.json(prediction);
  } catch (error) {
    console.error('[Cipher ML] Prediction error:', error);
    return NextResponse.json(
      { error: 'Prediction failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cipher/predict
 *
 * Check ML service health and list available models.
 */
export async function GET() {
  try {
    const isHealthy = await healthCheck();

    if (!isHealthy) {
      return NextResponse.json({
        status: 'unavailable',
        message: 'ML service is not available',
      });
    }

    const models = await listModels();

    return NextResponse.json({
      status: 'healthy',
      models,
      latestModel: models.length > 0 ? models[0].version : null,
    });
  } catch (error) {
    console.error('[Cipher ML] Health check error:', error);
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
