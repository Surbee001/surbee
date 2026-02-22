/**
 * Cipher ML Pipeline
 *
 * Helper functions to run the ML data collection pipeline after response submission.
 * This runs asynchronously and non-blocking to not affect response submission latency.
 */

import { extractFeatures, featuresToDbRow } from './feature-extraction';
import { autoLabel, labelResultToDbRow } from './auto-labeling';
import { predictFraud, healthCheck } from './inference';
import { detectContradictions, buildQuestionMetadata, updateFeaturesWithContradictions } from './contradiction-detection';
import { detectFraudRing } from './fraud-ring-detection';
import type { SurveyResponseData, CipherFeaturesRow, CipherFeatures } from './types';

/**
 * Run the complete ML pipeline for a response
 * This extracts features and auto-labels in one call
 *
 * @param supabase - Supabase admin client
 * @param responseId - The survey response ID
 * @param surveyId - The survey/project ID
 */
export async function runMLPipeline(
  supabase: any,
  responseId: string,
  surveyId: string,
  options?: { mlEnabled?: boolean }
): Promise<{ success: boolean; featureId?: string; labelId?: string; predictionId?: string; error?: string }> {
  // Default mlEnabled to true if not specified
  const mlEnabled = options?.mlEnabled ?? true;

  try {
    // Fetch the response data
    const { data: response, error: responseError } = await supabase
      .from('survey_responses')
      .select('*')
      .eq('id', responseId)
      .single();

    if (responseError || !response) {
      console.error('[ML Pipeline] Error fetching response:', responseError);
      return { success: false, error: 'Response not found' };
    }

    // Convert to SurveyResponseData format
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

    // Check if features already exist
    const { data: existingFeatures } = await supabase
      .from('cipher_features')
      .select('id')
      .eq('response_id', responseId)
      .single();

    let featureId: string | undefined;

    if (existingFeatures) {
      featureId = existingFeatures.id;
    } else {
      // Extract features
      let features = extractFeatures(responseData);

      // Run contradiction detection on responses
      if (responseData.responses && Object.keys(responseData.responses).length > 0) {
        try {
          // Fetch survey definition for question metadata (optional)
          const { data: survey } = await supabase
            .from('surveys')
            .select('questions')
            .eq('id', surveyId)
            .single();

          const questionMetadata = survey?.questions
            ? buildQuestionMetadata({ questions: survey.questions })
            : undefined;

          const contradictionResult = detectContradictions(responseData.responses, questionMetadata);

          if (contradictionResult.hasContradictions) {
            console.log(`[ML Pipeline] Detected ${contradictionResult.contradictions.length} contradictions (score: ${contradictionResult.score.toFixed(2)})`);
            // Update features with contradiction score
            features = updateFeaturesWithContradictions(features, contradictionResult) as CipherFeatures;
          }
        } catch (contradictionError) {
          console.warn('[ML Pipeline] Contradiction detection failed:', contradictionError);
          // Continue without contradiction detection
        }
      }

      const dbRow = featuresToDbRow(responseId, surveyId, features);

      // Store features
      const { data: insertedFeatures, error: featureError } = await supabase
        .from('cipher_features')
        .insert(dbRow)
        .select('id')
        .single();

      if (featureError) {
        console.error('[ML Pipeline] Error inserting features:', featureError);
        return { success: false, error: 'Failed to store features' };
      }

      featureId = insertedFeatures.id;

      // Run fraud ring detection asynchronously (non-blocking)
      detectFraudRing(supabase, responseId, surveyId)
        .then((ringResult) => {
          if (ringResult.isSuspicious) {
            console.log(`[ML Pipeline] Fraud ring detected: ${ringResult.ringId} (score: ${ringResult.score.toFixed(2)}, signals: ${ringResult.signals.length})`);
            // Store fraud ring result
            supabase
              .from('survey_responses')
              .update({
                fraud_ring_id: ringResult.ringId,
                fraud_ring_score: ringResult.score,
                fraud_ring_signals: ringResult.signals.map(s => s.type),
              })
              .eq('id', responseId)
              .then(() => {});
          }
        })
        .catch((ringError) => {
          console.warn('[ML Pipeline] Fraud ring detection failed:', ringError);
        });
    }

    // Check if label already exists
    const { data: existingLabel } = await supabase
      .from('cipher_labels')
      .select('id')
      .eq('response_id', responseId)
      .single();

    let labelId: string | undefined;

    if (existingLabel) {
      labelId = existingLabel.id;
    } else {
      // Get features for auto-labeling
      const { data: featuresRow } = await supabase
        .from('cipher_features')
        .select('*')
        .eq('response_id', responseId)
        .single();

      if (featuresRow) {
        // Convert to CipherFeatures and run auto-labeling
        const features = dbRowToFeatures(featuresRow as CipherFeaturesRow);
        const labelResult = autoLabel(features);

        if (labelResult && labelResult.shouldLabel) {
          const labelRow = labelResultToDbRow(responseId, labelResult);

          const { data: insertedLabel, error: labelError } = await supabase
            .from('cipher_labels')
            .insert(labelRow)
            .select('id')
            .single();

          if (!labelError && insertedLabel) {
            labelId = insertedLabel.id;
          }
        }
      }
    }

    // Step 3: Get ML prediction from the model (if enabled)
    let predictionId: string | undefined;

    if (!mlEnabled) {
      console.log('[ML Pipeline] ML inference disabled for this project');
      return { success: true, featureId, labelId };
    }

    // Check if prediction already exists
    const { data: existingPrediction } = await supabase
      .from('cipher_ml_predictions')
      .select('id')
      .eq('response_id', responseId)
      .single();

    if (existingPrediction) {
      predictionId = existingPrediction.id;
    } else {
      // Call ML inference endpoint
      const isMLHealthy = await healthCheck();

      if (isMLHealthy) {
        // Get features for prediction
        const { data: featuresRow } = await supabase
          .from('cipher_features')
          .select('*')
          .eq('response_id', responseId)
          .single();

        if (featuresRow) {
          const features = dbRowToFeatures(featuresRow as CipherFeaturesRow);

          try {
            const prediction = await predictFraud(features, 'latest');

            // Store prediction in database
            const { data: insertedPrediction, error: predictionError } = await supabase
              .from('cipher_ml_predictions')
              .insert({
                response_id: responseId,
                fraud_probability: prediction.fraudProbability,
                fraud_verdict: prediction.fraudVerdict,
                confidence: prediction.confidence,
                top_signals: prediction.topSignals,
                model_version: prediction.modelVersion,
                feature_version: 1,
                inference_time_ms: prediction.inferenceTimeMs,
              })
              .select('id')
              .single();

            if (!predictionError && insertedPrediction) {
              predictionId = insertedPrediction.id;

              // Update the response with ML score (combine with rule-based)
              const existingFraudScore = responseData.fraudScore ?? 0;
              const combinedScore = Math.max(existingFraudScore, prediction.fraudProbability);

              await supabase
                .from('survey_responses')
                .update({
                  ml_fraud_probability: prediction.fraudProbability,
                  ml_fraud_verdict: prediction.fraudVerdict,
                  combined_fraud_score: combinedScore,
                })
                .eq('id', responseId);

              console.log(`[ML Pipeline] ML prediction: ${(prediction.fraudProbability * 100).toFixed(1)}% fraud probability`);
            }
          } catch (mlError) {
            console.warn('[ML Pipeline] ML inference failed:', mlError);
            // Continue without ML prediction - rule-based still works
          }
        }
      } else {
        console.log('[ML Pipeline] ML service unavailable, skipping prediction');
      }
    }

    return { success: true, featureId, labelId, predictionId };
  } catch (error) {
    console.error('[ML Pipeline] Unexpected error:', error);
    return { success: false, error: 'Internal pipeline error' };
  }
}

/**
 * Run ML pipeline asynchronously (fire-and-forget)
 * Use this to avoid blocking the response submission
 */
export function runMLPipelineAsync(
  supabase: any,
  responseId: string,
  surveyId: string,
  options?: { mlEnabled?: boolean }
): void {
  // Run in background without awaiting
  runMLPipeline(supabase, responseId, surveyId, options)
    .then((result) => {
      if (result.success) {
        console.log(`[ML Pipeline] Completed for response ${responseId.slice(0, 8)}`);
      } else {
        console.warn(`[ML Pipeline] Failed for response ${responseId.slice(0, 8)}: ${result.error}`);
      }
    })
    .catch((error) => {
      console.error(`[ML Pipeline] Error for response ${responseId.slice(0, 8)}:`, error);
    });
}

/**
 * Convert database row to CipherFeatures object
 * (Duplicated from auto-label route for use in pipeline)
 */
function dbRowToFeatures(row: CipherFeaturesRow): import('./types').CipherFeatures {
  return {
    // Behavioral
    mouseDistanceTotal: row.mouse_distance_total ?? 0,
    mouseVelocityMean: row.mouse_velocity_mean ?? 0,
    mouseVelocityStd: row.mouse_velocity_std ?? 0,
    mouseVelocityMax: row.mouse_velocity_max ?? 0,
    mouseAccelerationMean: row.mouse_acceleration_mean ?? 0,
    mouseCurvatureEntropy: row.mouse_curvature_entropy ?? 0,
    mouseStraightLineRatio: row.mouse_straight_line_ratio ?? 0,
    mousePauseCount: row.mouse_pause_count ?? 0,
    keystrokeCount: row.keystroke_count ?? 0,
    keystrokeTimingMean: row.keystroke_timing_mean ?? 0,
    keystrokeTimingStd: row.keystroke_timing_std ?? 0,
    keystrokeDwellMean: row.keystroke_dwell_mean ?? 0,
    keystrokeFlightMean: row.keystroke_flight_mean ?? 0,
    backspaceRatio: row.backspace_ratio ?? 0,
    pasteEventCount: row.paste_event_count ?? 0,
    pasteCharRatio: row.paste_char_ratio ?? 0,
    scrollCount: row.scroll_count ?? 0,
    scrollVelocityMean: row.scroll_velocity_mean ?? 0,
    scrollDirectionChanges: row.scroll_direction_changes ?? 0,
    focusLossCount: row.focus_loss_count ?? 0,
    focusLossDurationTotal: row.focus_loss_duration_total ?? 0,
    hoverCount: row.hover_count ?? 0,
    hoverDurationMean: row.hover_duration_mean ?? 0,
    clickCount: row.click_count ?? 0,
    hoverBeforeClickRatio: row.hover_before_click_ratio ?? 0,

    // Temporal
    completionTimeSeconds: row.completion_time_seconds ?? 0,
    timePerQuestionMean: row.time_per_question_mean ?? 0,
    timePerQuestionStd: row.time_per_question_std ?? 0,
    timePerQuestionMin: row.time_per_question_min ?? 0,
    timePerQuestionMax: row.time_per_question_max ?? 0,
    readingVsAnsweringRatio: row.reading_vs_answering_ratio ?? 0,
    firstInteractionDelayMs: row.first_interaction_delay_ms ?? 0,
    idleTimeTotal: row.idle_time_total ?? 0,
    activeTimeRatio: row.active_time_ratio ?? 0,
    responseAcceleration: row.response_acceleration ?? 0,
    timeOfDayHour: row.time_of_day_hour ?? 12,
    dayOfWeek: row.day_of_week ?? 0,

    // Device
    hasWebdriver: row.has_webdriver ?? false,
    hasAutomationFlags: row.has_automation_flags ?? false,
    pluginCount: row.plugin_count ?? 0,
    screenResolutionCommon: row.screen_resolution_common ?? true,
    timezoneOffsetMinutes: row.timezone_offset_minutes ?? 0,
    timezoneMatchesIp: row.timezone_matches_ip ?? true,
    fingerprintSeenCount: row.fingerprint_seen_count ?? 1,
    deviceMemoryGb: row.device_memory_gb ?? 4,
    hardwareConcurrency: row.hardware_concurrency ?? 4,
    touchSupport: row.touch_support ?? false,

    // Network
    isVpn: row.is_vpn ?? false,
    isDatacenter: row.is_datacenter ?? false,
    isTor: row.is_tor ?? false,
    isProxy: row.is_proxy ?? false,
    ipReputationScore: row.ip_reputation_score ?? 0.5,
    ipCountryCode: row.ip_country_code ?? 'US',
    geoTimezoneMatch: row.geo_timezone_match ?? true,
    ipSeenCount: row.ip_seen_count ?? 1,

    // Content
    questionCount: row.question_count ?? 0,
    openEndedCount: row.open_ended_count ?? 0,
    openEndedLengthMean: row.open_ended_length_mean ?? 0,
    openEndedLengthStd: row.open_ended_length_std ?? 0,
    openEndedWordCountMean: row.open_ended_word_count_mean ?? 0,
    openEndedUniqueWordRatio: row.open_ended_unique_word_ratio ?? 0,
    straightLineRatio: row.straight_line_ratio ?? 0,
    answerEntropy: row.answer_entropy ?? 0,
    firstOptionRatio: row.first_option_ratio ?? 0,
    lastOptionRatio: row.last_option_ratio ?? 0,
    middleOptionRatio: row.middle_option_ratio ?? 0,
    responseUniquenessScore: row.response_uniqueness_score ?? 0.5,
    duplicateAnswerRatio: row.duplicate_answer_ratio ?? 0,
    naRatio: row.na_ratio ?? 0,
    skipRatio: row.skip_ratio ?? 0,

    // Honeypot
    attentionCheckPassed: row.attention_check_passed ?? true,
    attentionCheckCount: row.attention_check_count ?? 0,
    consistencyCheckScore: row.consistency_check_score ?? 1,
    trapFieldFilled: row.trap_field_filled ?? false,
    honeypotScore: row.honeypot_score ?? 0,
  };
}
