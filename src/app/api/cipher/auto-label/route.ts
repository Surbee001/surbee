/**
 * POST /api/cipher/auto-label
 *
 * Runs auto-labeling rules on a response's extracted features.
 * Creates a label in cipher_labels table if a rule matches with high confidence.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { autoLabel, labelResultToDbRow } from '@/lib/cipher/auto-labeling';
import type { CipherFeatures, CipherFeaturesRow } from '@/lib/cipher/types';

interface AutoLabelRequest {
  responseId: string;
}

/**
 * Convert database feature row to CipherFeatures object
 */
function dbRowToFeatures(row: CipherFeaturesRow): CipherFeatures {
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

export async function POST(request: NextRequest) {
  try {
    const body: AutoLabelRequest = await request.json();
    const { responseId } = body;

    if (!responseId) {
      return NextResponse.json(
        { error: 'responseId is required' },
        { status: 400 }
      );
    }

    // Check if label already exists
    const { data: existingLabel } = await supabaseAdmin
      .from('cipher_labels')
      .select('id, is_fraud, confidence, label_source')
      .eq('response_id', responseId)
      .single();

    if (existingLabel) {
      return NextResponse.json({
        success: true,
        message: 'Label already exists',
        labelId: existingLabel.id,
        isFraud: existingLabel.is_fraud,
        confidence: existingLabel.confidence,
        source: existingLabel.label_source,
      });
    }

    // Get extracted features
    const { data: featuresRow, error: featuresError } = await supabaseAdmin
      .from('cipher_features')
      .select('*')
      .eq('response_id', responseId)
      .single();

    if (featuresError || !featuresRow) {
      return NextResponse.json(
        { error: 'Features not found. Run extract-features first.' },
        { status: 404 }
      );
    }

    // Convert to CipherFeatures object
    const features = dbRowToFeatures(featuresRow as CipherFeaturesRow);

    // Run auto-labeling rules
    const labelResult = autoLabel(features);

    if (!labelResult || !labelResult.shouldLabel) {
      return NextResponse.json({
        success: true,
        labeled: false,
        message: 'No auto-label rule matched with sufficient confidence',
      });
    }

    // Convert to database row and insert
    const labelRow = labelResultToDbRow(responseId, labelResult);

    const { data: insertedLabel, error: insertError } = await supabaseAdmin
      .from('cipher_labels')
      .insert(labelRow)
      .select('id')
      .single();

    if (insertError) {
      // Handle unique constraint violation (label already exists)
      if (insertError.code === '23505') {
        const { data: existing } = await supabaseAdmin
          .from('cipher_labels')
          .select('id, is_fraud, confidence')
          .eq('response_id', responseId)
          .single();

        return NextResponse.json({
          success: true,
          message: 'Label already exists (concurrent insert)',
          labelId: existing?.id,
          isFraud: existing?.is_fraud,
          confidence: existing?.confidence,
        });
      }

      console.error('Error inserting label:', insertError);
      return NextResponse.json(
        { error: 'Failed to store label', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      labeled: true,
      labelId: insertedLabel.id,
      isFraud: labelResult.isFraud,
      confidence: labelResult.confidence,
      reason: labelResult.reason,
      ruleId: labelResult.ruleId,
    });
  } catch (error) {
    console.error('Error in auto-label:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cipher/auto-label?responseId=xxx
 *
 * Get the label for a specific response
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

    const { data: label, error } = await supabaseAdmin
      .from('cipher_labels')
      .select('*')
      .eq('response_id', responseId)
      .single();

    if (error || !label) {
      return NextResponse.json({
        success: true,
        labeled: false,
        message: 'No label found for this response',
      });
    }

    return NextResponse.json({
      success: true,
      labeled: true,
      label: {
        id: label.id,
        isFraud: label.is_fraud,
        confidence: label.confidence,
        source: label.label_source,
        reason: label.label_reason,
        createdAt: label.created_at,
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
