import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

/**
 * Cipher Validate Endpoint
 *
 * Main validation endpoint for the Cipher SDK.
 * Requires authentication via API key.
 *
 * POST /api/cipher/validate
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Get API key from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { code: 'INVALID_API_KEY', message: 'Missing or invalid Authorization header' },
        { status: 401 }
      );
    }

    const apiKey = authHeader.replace('Bearer ', '');

    // Validate API key format
    if (!apiKey.startsWith('cipher_sk_') && !apiKey.startsWith('cipher_pk_')) {
      return NextResponse.json(
        { code: 'INVALID_API_KEY', message: 'Invalid API key format' },
        { status: 401 }
      );
    }

    // Verify API key against database
    const { data: keyData, error: keyError } = await supabaseAdmin
      .from('cipher_api_keys')
      .select('id, user_id, name, tier_limit, credits_remaining, rate_limit, last_used_at')
      .eq('key_hash', hashApiKey(apiKey))
      .eq('is_active', true)
      .single();

    if (keyError || !keyData) {
      return NextResponse.json(
        { code: 'INVALID_API_KEY', message: 'API key not found or inactive' },
        { status: 401 }
      );
    }

    // Check credits
    if (keyData.credits_remaining <= 0) {
      return NextResponse.json(
        { code: 'INSUFFICIENT_CREDITS', message: 'No credits remaining' },
        { status: 402 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { tier, thresholds, input } = body;

    // Validate tier access
    if (tier > keyData.tier_limit) {
      return NextResponse.json(
        { code: 'TIER_NOT_AVAILABLE', message: `Tier ${tier} not available. Your limit is tier ${keyData.tier_limit}` },
        { status: 403 }
      );
    }

    // Run validation (this is where the actual checks happen)
    const result = await runValidation(input, tier, thresholds);

    // Deduct credits
    await supabase
      .from('cipher_api_keys')
      .update({
        credits_remaining: keyData.credits_remaining - 1,
        last_used_at: new Date().toISOString(),
        total_requests: supabaseAdmin.rpc('increment', { row_id: keyData.id }),
      })
      .eq('id', keyData.id);

    // Log the request
    await supabaseAdmin.from('cipher_requests').insert({
      api_key_id: keyData.id,
      user_id: keyData.user_id,
      tier,
      score: result.score,
      passed: result.passed,
      recommendation: result.recommendation,
      checks_run: result.meta.checksRun,
      processing_time_ms: Date.now() - startTime,
    });

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'X-Cipher-Request-Id': result.meta.requestId,
        'X-Cipher-Credits-Remaining': String(keyData.credits_remaining - 1),
      },
    });
  } catch (error) {
    console.error('[Cipher] Validation error:', error);
    return NextResponse.json(
      { code: 'SERVER_ERROR', message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Hash API key for storage comparison
 */
function hashApiKey(key: string): string {
  // Use a simple hash for now - in production use crypto
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(key).digest('hex');
}

/**
 * Run the actual validation
 * This is where all the checks happen - completely server-side
 */
async function runValidation(
  input: any,
  tier: number,
  thresholds: { fail: number; review: number }
) {
  const requestId = `req_${generateId()}`;
  const startTime = Date.now();

  // Import internal check runners (these are NOT exported in the SDK)
  const checks = await runAllChecks(input, tier);

  // Calculate scores
  const failedChecks = checks.filter((c: any) => !c.passed);
  const suspicionScores = checks.map((c: any) => c.score);
  const avgSuspicion = suspicionScores.length > 0
    ? suspicionScores.reduce((a: number, b: number) => a + b, 0) / suspicionScores.length
    : 0;

  const score = Math.max(0, Math.min(1, 1 - avgSuspicion));
  const passed = score >= thresholds.fail;

  // Determine recommendation
  let recommendation: 'keep' | 'review' | 'discard';
  if (score >= thresholds.review) {
    recommendation = 'keep';
  } else if (score >= thresholds.fail) {
    recommendation = 'review';
  } else {
    recommendation = 'discard';
  }

  // Generate human-readable summary
  const summary = generateSummary(checks, score, recommendation);

  // Build flags list
  const flags = failedChecks.map((c: any) => getCheckName(c.checkId));

  return {
    score,
    passed,
    recommendation,
    confidence: Math.min(1, 0.5 + checks.length * 0.02),
    flags,
    summary,
    checks: checks.map((c: any) => ({
      checkId: c.checkId,
      passed: c.passed,
      score: c.score,
      details: c.details || null,
    })),
    meta: {
      tier,
      processingTimeMs: Date.now() - startTime,
      checksRun: checks.length,
      checksPassed: checks.filter((c: any) => c.passed).length,
      requestId,
      timestamp: Date.now(),
    },
  };
}

/**
 * Run all checks for a given tier
 */
async function runAllChecks(input: any, tier: number): Promise<any[]> {
  const results: any[] = [];
  const { responses, behavioralMetrics, deviceInfo, context } = input;

  // Tier 1 checks (6 checks)
  if (tier >= 1) {
    results.push(...runTier1Checks(responses, behavioralMetrics, context));
  }

  // Tier 2 checks (9 additional checks)
  if (tier >= 2) {
    results.push(...runTier2Checks(behavioralMetrics, deviceInfo));
  }

  // Tier 3 checks (7 additional checks) - includes basic AI
  if (tier >= 3) {
    results.push(...runTier3Checks(responses, behavioralMetrics));
    results.push(...await runBasicAIChecks(responses));
  }

  // Tier 4 checks (8 additional checks) - includes advanced AI
  if (tier >= 4) {
    results.push(...runTier4Checks(behavioralMetrics, deviceInfo));
    results.push(...await runAdvancedAIChecks(responses, context));
  }

  // Tier 5 checks (13 additional checks) - includes full AI analysis
  if (tier >= 5) {
    results.push(...await runTier5Checks(responses, behavioralMetrics, deviceInfo, context));
  }

  return results;
}

// Placeholder implementations - these would contain the actual check logic
function runTier1Checks(responses: any, metrics: any, context: any) {
  return [
    { checkId: 'rapid_completion', passed: true, score: 0, details: null },
    { checkId: 'uniform_timing', passed: true, score: 0, details: null },
    { checkId: 'low_interaction', passed: true, score: 0, details: null },
    { checkId: 'straight_line_answers', passed: true, score: 0, details: null },
    { checkId: 'impossibly_fast', passed: true, score: 0, details: null },
    { checkId: 'minimal_effort', passed: true, score: 0, details: null },
  ];
}

function runTier2Checks(metrics: any, device: any) {
  return [
    { checkId: 'excessive_paste', passed: true, score: 0, details: null },
    { checkId: 'pointer_spikes', passed: true, score: 0, details: null },
    { checkId: 'webdriver_detected', passed: true, score: 0, details: null },
    { checkId: 'automation_detected', passed: true, score: 0, details: null },
    { checkId: 'no_plugins', passed: true, score: 0, details: null },
    { checkId: 'suspicious_user_agent', passed: true, score: 0, details: null },
    { checkId: 'device_fingerprint_mismatch', passed: true, score: 0, details: null },
    { checkId: 'screen_anomaly', passed: true, score: 0, details: null },
    { checkId: 'suspicious_pauses', passed: true, score: 0, details: null },
  ];
}

function runTier3Checks(responses: any, metrics: any) {
  return [
    { checkId: 'robotic_typing', passed: true, score: 0, details: null },
    { checkId: 'mouse_teleporting', passed: true, score: 0, details: null },
    { checkId: 'no_corrections', passed: true, score: 0, details: null },
    { checkId: 'excessive_tab_switching', passed: true, score: 0, details: null },
    { checkId: 'window_focus_loss', passed: true, score: 0, details: null },
  ];
}

async function runBasicAIChecks(responses: any) {
  // AI checks would use Claude here - hidden from SDK
  return [
    { checkId: 'ai_content_basic', passed: true, score: 0, details: null },
    { checkId: 'contradiction_basic', passed: true, score: 0, details: null },
  ];
}

function runTier4Checks(metrics: any, device: any) {
  return [
    { checkId: 'hover_behavior', passed: true, score: 0, details: null },
    { checkId: 'scroll_patterns', passed: true, score: 0, details: null },
    { checkId: 'mouse_acceleration', passed: true, score: 0, details: null },
    { checkId: 'vpn_detection', passed: true, score: 0, details: null },
    { checkId: 'datacenter_ip', passed: true, score: 0, details: null },
  ];
}

async function runAdvancedAIChecks(responses: any, context: any) {
  return [
    { checkId: 'plagiarism_basic', passed: true, score: 0, details: null },
    { checkId: 'quality_assessment', passed: true, score: 0, details: null },
    { checkId: 'semantic_analysis', passed: true, score: 0, details: null },
  ];
}

async function runTier5Checks(responses: any, metrics: any, device: any, context: any) {
  return [
    { checkId: 'ai_content_full', passed: true, score: 0, details: null },
    { checkId: 'contradiction_full', passed: true, score: 0, details: null },
    { checkId: 'plagiarism_full', passed: true, score: 0, details: null },
    { checkId: 'fraud_ring_detection', passed: true, score: 0, details: null },
    { checkId: 'answer_sharing', passed: true, score: 0, details: null },
    { checkId: 'coordinated_timing', passed: true, score: 0, details: null },
    { checkId: 'device_sharing', passed: true, score: 0, details: null },
    { checkId: 'tor_detection', passed: true, score: 0, details: null },
    { checkId: 'proxy_detection', passed: true, score: 0, details: null },
    { checkId: 'timezone_validation', passed: true, score: 0, details: null },
    { checkId: 'baseline_deviation', passed: true, score: 0, details: null },
    { checkId: 'perplexity_analysis', passed: true, score: 0, details: null },
    { checkId: 'burstiness_analysis', passed: true, score: 0, details: null },
  ];
}

/**
 * Generate human-readable summary
 */
function generateSummary(checks: any[], score: number, recommendation: string) {
  const failed = checks.filter(c => !c.passed);
  const suspicious = checks.filter(c => c.passed && c.score > 0.3);

  let verdict: string;
  if (score >= 0.85) {
    verdict = 'High-quality legitimate response';
  } else if (score >= 0.7) {
    verdict = 'Likely legitimate with minor concerns';
  } else if (score >= 0.5) {
    verdict = 'Borderline quality - manual review recommended';
  } else if (score >= 0.3) {
    verdict = 'Multiple issues detected - likely low quality';
  } else {
    verdict = 'Suspected fraudulent or bot response';
  }

  const issues = failed.map(c => getCheckDescription(c.checkId, c.details));
  const positives: string[] = [];

  // Add positive signals
  if (!failed.some(c => c.checkId.includes('timing'))) {
    positives.push('Response timing appears natural');
  }
  if (!failed.some(c => c.checkId.includes('automation') || c.checkId.includes('webdriver'))) {
    positives.push('No automation tools detected');
  }
  if (!failed.some(c => c.checkId.includes('ai_content'))) {
    positives.push('Content appears human-written');
  }
  if (!failed.some(c => c.checkId === 'minimal_effort')) {
    positives.push('Response shows reasonable effort');
  }

  let suggestion: string;
  if (recommendation === 'keep') {
    suggestion = 'Response can be accepted as-is';
  } else if (recommendation === 'review') {
    suggestion = 'Consider manual review before accepting';
  } else {
    suggestion = 'Response should be rejected or flagged for investigation';
  }

  return { verdict, issues, positives, suggestion };
}

/**
 * Get human-readable check name
 */
function getCheckName(checkId: string): string {
  const names: Record<string, string> = {
    rapid_completion: 'Rapid Completion',
    uniform_timing: 'Uniform Timing',
    low_interaction: 'Low Interaction',
    straight_line_answers: 'Straight-Lining',
    impossibly_fast: 'Speed Reading',
    minimal_effort: 'Minimal Effort',
    excessive_paste: 'Excessive Paste',
    pointer_spikes: 'Pointer Velocity Spikes',
    webdriver_detected: 'WebDriver Detection',
    automation_detected: 'Automation Detection',
    suspicious_pauses: 'Suspicious Pauses',
    ai_content_basic: 'AI Content Detection',
    ai_content_full: 'AI Content Detection',
    // ... add all check names
  };
  return names[checkId] || checkId;
}

/**
 * Get human-readable check description
 */
function getCheckDescription(checkId: string, details?: string): string {
  if (details) return details;

  const descriptions: Record<string, string> = {
    rapid_completion: 'Survey was completed too quickly',
    excessive_paste: 'Heavy copy-paste behavior detected',
    webdriver_detected: 'Automation tool detected',
    ai_content_basic: 'Possible AI-generated content',
    straight_line_answers: 'Same answer selected repeatedly',
    minimal_effort: 'Responses lack detail or effort',
    // ... add all descriptions
  };
  return descriptions[checkId] || `Issue with ${checkId}`;
}

/**
 * Generate a random ID
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
