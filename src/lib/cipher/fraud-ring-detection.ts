/**
 * Fraud Ring Detection
 *
 * Detects coordinated fraudulent activity across multiple survey responses.
 * Identifies patterns that indicate organized fraud operations.
 *
 * Detection Signals:
 * 1. Same fingerprint, multiple responses
 * 2. Same IP, multiple responses in short time
 * 3. Similar answer patterns across responses
 * 4. Velocity anomalies (too many responses too fast)
 * 5. Clustered submission times
 * 6. Similar behavioral signatures
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export interface FraudRingResult {
  isSuspicious: boolean;
  ringId?: string;
  signals: FraudRingSignal[];
  score: number; // 0-1
  linkedResponses: LinkedResponse[];
  recommendation: 'allow' | 'review' | 'reject';
}

export interface FraudRingSignal {
  type: FraudRingSignalType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  details: string;
  linkedResponseIds: string[];
}

export type FraudRingSignalType =
  | 'same_fingerprint'
  | 'same_ip'
  | 'ip_cluster'
  | 'velocity_anomaly'
  | 'answer_similarity'
  | 'behavioral_similarity'
  | 'submission_time_cluster'
  | 'device_farm'
  | 'datacenter_cluster';

export interface LinkedResponse {
  id: string;
  surveyId: string;
  fingerprint?: string;
  ipAddress?: string;
  submittedAt: string;
  fraudScore: number;
  similarityScore: number;
}

export interface FraudRingConfig {
  // Fingerprint thresholds
  maxResponsesPerFingerprint: number;
  fingerprintLookbackHours: number;

  // IP thresholds
  maxResponsesPerIpPerHour: number;
  ipLookbackHours: number;

  // Answer similarity
  minAnswerSimilarityThreshold: number;

  // Behavioral similarity
  minBehavioralSimilarityThreshold: number;

  // Time clustering
  timeClusterWindowMinutes: number;
  minTimeClusterSize: number;
}

const DEFAULT_CONFIG: FraudRingConfig = {
  maxResponsesPerFingerprint: 3,
  fingerprintLookbackHours: 24,
  maxResponsesPerIpPerHour: 5,
  ipLookbackHours: 1,
  minAnswerSimilarityThreshold: 0.85,
  minBehavioralSimilarityThreshold: 0.9,
  timeClusterWindowMinutes: 5,
  minTimeClusterSize: 3,
};

/**
 * Analyze a response for fraud ring indicators
 */
export async function detectFraudRing(
  supabase: SupabaseClient,
  responseId: string,
  surveyId: string,
  config: Partial<FraudRingConfig> = {},
): Promise<FraudRingResult> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const signals: FraudRingSignal[] = [];
  const linkedResponses: LinkedResponse[] = [];

  // Fetch the current response
  const { data: response, error } = await supabase
    .from('survey_responses')
    .select('*')
    .eq('id', responseId)
    .single();

  if (error || !response) {
    return {
      isSuspicious: false,
      signals: [],
      score: 0,
      linkedResponses: [],
      recommendation: 'allow',
    };
  }

  const fingerprint = response.device_data?.fingerprint;
  const ipAddress = response.ip_address;
  const submittedAt = new Date(response.completed_at || response.created_at);

  // Run all detection checks in parallel
  const [
    fingerprintSignal,
    ipSignal,
    velocitySignal,
    timeClusterSignal,
    answerSimilaritySignal,
    behavioralSimilaritySignal,
    datacenterSignal,
  ] = await Promise.all([
    fingerprint ? checkFingerprintDuplication(supabase, surveyId, fingerprint, responseId, cfg) : null,
    ipAddress ? checkIpVelocity(supabase, surveyId, ipAddress, submittedAt, responseId, cfg) : null,
    checkVelocityAnomaly(supabase, surveyId, submittedAt, cfg),
    checkTimeCluster(supabase, surveyId, submittedAt, responseId, cfg),
    checkAnswerSimilarity(supabase, surveyId, response.responses, responseId, cfg),
    checkBehavioralSimilarity(supabase, surveyId, response, responseId, cfg),
    checkDatacenterCluster(supabase, surveyId, ipAddress, responseId),
  ]);

  // Collect valid signals
  if (fingerprintSignal) {
    signals.push(fingerprintSignal.signal);
    linkedResponses.push(...fingerprintSignal.linked);
  }
  if (ipSignal) {
    signals.push(ipSignal.signal);
    linkedResponses.push(...ipSignal.linked);
  }
  if (velocitySignal) signals.push(velocitySignal);
  if (timeClusterSignal) {
    signals.push(timeClusterSignal.signal);
    linkedResponses.push(...timeClusterSignal.linked);
  }
  if (answerSimilaritySignal) {
    signals.push(answerSimilaritySignal.signal);
    linkedResponses.push(...answerSimilaritySignal.linked);
  }
  if (behavioralSimilaritySignal) {
    signals.push(behavioralSimilaritySignal.signal);
    linkedResponses.push(...behavioralSimilaritySignal.linked);
  }
  if (datacenterSignal) {
    signals.push(datacenterSignal.signal);
    linkedResponses.push(...datacenterSignal.linked);
  }

  // Deduplicate linked responses
  const uniqueLinked = deduplicateLinkedResponses(linkedResponses);

  // Calculate overall score
  const score = calculateFraudRingScore(signals);

  // Generate ring ID if suspicious
  const ringId = signals.length > 0 ? generateRingId(fingerprint, ipAddress, signals) : undefined;

  // Determine recommendation
  const recommendation = getRecommendation(score, signals);

  return {
    isSuspicious: score > 0.3,
    ringId,
    signals,
    score,
    linkedResponses: uniqueLinked,
    recommendation,
  };
}

/**
 * Check for fingerprint duplication
 */
async function checkFingerprintDuplication(
  supabase: SupabaseClient,
  surveyId: string,
  fingerprint: string,
  excludeResponseId: string,
  config: FraudRingConfig,
): Promise<{ signal: FraudRingSignal; linked: LinkedResponse[] } | null> {
  const lookbackTime = new Date();
  lookbackTime.setHours(lookbackTime.getHours() - config.fingerprintLookbackHours);

  const { data: responses } = await supabase
    .from('survey_responses')
    .select('id, survey_id, device_data, ip_address, completed_at, created_at, fraud_score')
    .eq('survey_id', surveyId)
    .neq('id', excludeResponseId)
    .gte('created_at', lookbackTime.toISOString())
    .limit(100);

  // Filter by fingerprint (stored in device_data)
  const matchingResponses = (responses || []).filter(
    r => r.device_data?.fingerprint === fingerprint
  );

  if (matchingResponses.length === 0) return null;

  const count = matchingResponses.length + 1; // Including current response

  if (count <= config.maxResponsesPerFingerprint) return null;

  // Determine severity based on count
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (count >= 50) severity = 'critical';
  else if (count >= 20) severity = 'high';
  else if (count >= 10) severity = 'medium';

  const linked: LinkedResponse[] = matchingResponses.map(r => ({
    id: r.id,
    surveyId: r.survey_id,
    fingerprint: r.device_data?.fingerprint,
    ipAddress: r.ip_address,
    submittedAt: r.completed_at || r.created_at,
    fraudScore: r.fraud_score || 0,
    similarityScore: 1.0, // Exact fingerprint match
  }));

  return {
    signal: {
      type: 'same_fingerprint',
      severity,
      confidence: 0.95,
      details: `Same device fingerprint seen ${count} times in ${config.fingerprintLookbackHours}h`,
      linkedResponseIds: matchingResponses.map(r => r.id),
    },
    linked,
  };
}

/**
 * Check for IP velocity (too many submissions from same IP)
 */
async function checkIpVelocity(
  supabase: SupabaseClient,
  surveyId: string,
  ipAddress: string,
  submittedAt: Date,
  excludeResponseId: string,
  config: FraudRingConfig,
): Promise<{ signal: FraudRingSignal; linked: LinkedResponse[] } | null> {
  const lookbackTime = new Date(submittedAt);
  lookbackTime.setHours(lookbackTime.getHours() - config.ipLookbackHours);

  const { data: responses } = await supabase
    .from('survey_responses')
    .select('id, survey_id, device_data, ip_address, completed_at, created_at, fraud_score')
    .eq('survey_id', surveyId)
    .eq('ip_address', ipAddress)
    .neq('id', excludeResponseId)
    .gte('created_at', lookbackTime.toISOString())
    .limit(100);

  const count = (responses?.length || 0) + 1;

  if (count <= config.maxResponsesPerIpPerHour) return null;

  let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  if (count >= 20) severity = 'critical';
  else if (count >= 10) severity = 'high';

  const linked: LinkedResponse[] = (responses || []).map(r => ({
    id: r.id,
    surveyId: r.survey_id,
    fingerprint: r.device_data?.fingerprint,
    ipAddress: r.ip_address,
    submittedAt: r.completed_at || r.created_at,
    fraudScore: r.fraud_score || 0,
    similarityScore: 1.0,
  }));

  return {
    signal: {
      type: 'same_ip',
      severity,
      confidence: 0.85,
      details: `${count} responses from same IP in ${config.ipLookbackHours}h`,
      linkedResponseIds: responses?.map(r => r.id) || [],
    },
    linked,
  };
}

/**
 * Check for velocity anomalies (survey-wide submission rate spike)
 */
async function checkVelocityAnomaly(
  supabase: SupabaseClient,
  surveyId: string,
  submittedAt: Date,
  config: FraudRingConfig,
): Promise<FraudRingSignal | null> {
  // Get responses in the last hour
  const oneHourAgo = new Date(submittedAt);
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);

  const { count: recentCount } = await supabase
    .from('survey_responses')
    .select('*', { count: 'exact', head: true })
    .eq('survey_id', surveyId)
    .gte('created_at', oneHourAgo.toISOString());

  // Get baseline (previous 24 hours average per hour)
  const oneDayAgo = new Date(submittedAt);
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const { count: dayCount } = await supabase
    .from('survey_responses')
    .select('*', { count: 'exact', head: true })
    .eq('survey_id', surveyId)
    .gte('created_at', oneDayAgo.toISOString())
    .lt('created_at', oneHourAgo.toISOString());

  const avgPerHour = (dayCount || 0) / 23;
  const currentRate = recentCount || 0;

  // Flag if current rate is 5x normal
  if (avgPerHour < 1 || currentRate < avgPerHour * 5) return null;

  const severity: 'low' | 'medium' | 'high' = currentRate >= avgPerHour * 10 ? 'high' : 'medium';

  return {
    type: 'velocity_anomaly',
    severity,
    confidence: 0.7,
    details: `Submission rate ${(currentRate / avgPerHour).toFixed(1)}x above normal (${currentRate}/h vs avg ${avgPerHour.toFixed(1)}/h)`,
    linkedResponseIds: [],
  };
}

/**
 * Check for time clustering (many submissions in very short window)
 */
async function checkTimeCluster(
  supabase: SupabaseClient,
  surveyId: string,
  submittedAt: Date,
  excludeResponseId: string,
  config: FraudRingConfig,
): Promise<{ signal: FraudRingSignal; linked: LinkedResponse[] } | null> {
  const windowStart = new Date(submittedAt);
  windowStart.setMinutes(windowStart.getMinutes() - config.timeClusterWindowMinutes);
  const windowEnd = new Date(submittedAt);
  windowEnd.setMinutes(windowEnd.getMinutes() + config.timeClusterWindowMinutes);

  const { data: responses } = await supabase
    .from('survey_responses')
    .select('id, survey_id, device_data, ip_address, completed_at, created_at, fraud_score')
    .eq('survey_id', surveyId)
    .neq('id', excludeResponseId)
    .gte('created_at', windowStart.toISOString())
    .lte('created_at', windowEnd.toISOString())
    .limit(100);

  const clusterSize = (responses?.length || 0) + 1;

  if (clusterSize < config.minTimeClusterSize) return null;

  const severity: 'low' | 'medium' | 'high' = clusterSize >= 10 ? 'high' : 'medium';

  const linked: LinkedResponse[] = (responses || []).map(r => ({
    id: r.id,
    surveyId: r.survey_id,
    fingerprint: r.device_data?.fingerprint,
    ipAddress: r.ip_address,
    submittedAt: r.completed_at || r.created_at,
    fraudScore: r.fraud_score || 0,
    similarityScore: 0.8,
  }));

  return {
    signal: {
      type: 'submission_time_cluster',
      severity,
      confidence: 0.6,
      details: `${clusterSize} responses within ${config.timeClusterWindowMinutes * 2} minute window`,
      linkedResponseIds: responses?.map(r => r.id) || [],
    },
    linked,
  };
}

/**
 * Check for answer similarity across responses
 */
async function checkAnswerSimilarity(
  supabase: SupabaseClient,
  surveyId: string,
  answers: Record<string, any>,
  excludeResponseId: string,
  config: FraudRingConfig,
): Promise<{ signal: FraudRingSignal; linked: LinkedResponse[] } | null> {
  // Get recent responses
  const lookbackTime = new Date();
  lookbackTime.setHours(lookbackTime.getHours() - 24);

  const { data: responses } = await supabase
    .from('survey_responses')
    .select('id, survey_id, device_data, ip_address, completed_at, created_at, fraud_score, responses')
    .eq('survey_id', surveyId)
    .neq('id', excludeResponseId)
    .gte('created_at', lookbackTime.toISOString())
    .limit(200);

  if (!responses || responses.length === 0) return null;

  const similarResponses: Array<{ response: any; similarity: number }> = [];

  for (const r of responses) {
    if (!r.responses) continue;
    const similarity = calculateAnswerSimilarity(answers, r.responses);
    if (similarity >= config.minAnswerSimilarityThreshold) {
      similarResponses.push({ response: r, similarity });
    }
  }

  if (similarResponses.length === 0) return null;

  const avgSimilarity = similarResponses.reduce((sum, s) => sum + s.similarity, 0) / similarResponses.length;
  const severity: 'low' | 'medium' | 'high' = avgSimilarity >= 0.95 ? 'high' : 'medium';

  const linked: LinkedResponse[] = similarResponses.map(s => ({
    id: s.response.id,
    surveyId: s.response.survey_id,
    fingerprint: s.response.device_data?.fingerprint,
    ipAddress: s.response.ip_address,
    submittedAt: s.response.completed_at || s.response.created_at,
    fraudScore: s.response.fraud_score || 0,
    similarityScore: s.similarity,
  }));

  return {
    signal: {
      type: 'answer_similarity',
      severity,
      confidence: avgSimilarity,
      details: `Answers ${(avgSimilarity * 100).toFixed(0)}% similar to ${similarResponses.length} other responses`,
      linkedResponseIds: similarResponses.map(s => s.response.id),
    },
    linked,
  };
}

/**
 * Calculate similarity between two response objects
 */
function calculateAnswerSimilarity(a1: Record<string, any>, a2: Record<string, any>): number {
  const keys1 = Object.keys(a1);
  const keys2 = Object.keys(a2);
  const allKeys = new Set([...keys1, ...keys2]);

  if (allKeys.size === 0) return 0;

  let matches = 0;
  for (const key of allKeys) {
    const v1 = a1[key];
    const v2 = a2[key];

    if (v1 === v2) {
      matches++;
    } else if (typeof v1 === 'string' && typeof v2 === 'string') {
      // Partial match for strings
      const similarity = stringSimilarity(v1, v2);
      matches += similarity;
    }
  }

  return matches / allKeys.size;
}

/**
 * Simple string similarity (Jaccard on words)
 */
function stringSimilarity(s1: string, s2: string): number {
  const words1 = new Set(s1.toLowerCase().split(/\s+/));
  const words2 = new Set(s2.toLowerCase().split(/\s+/));

  const intersection = [...words1].filter(w => words2.has(w)).length;
  const union = new Set([...words1, ...words2]).size;

  return union > 0 ? intersection / union : 0;
}

/**
 * Check for behavioral similarity (mouse patterns, timing, etc.)
 */
async function checkBehavioralSimilarity(
  supabase: SupabaseClient,
  surveyId: string,
  response: any,
  excludeResponseId: string,
  config: FraudRingConfig,
): Promise<{ signal: FraudRingSignal; linked: LinkedResponse[] } | null> {
  // Get feature vectors for comparison
  const { data: currentFeatures } = await supabase
    .from('cipher_features')
    .select('*')
    .eq('response_id', response.id)
    .single();

  if (!currentFeatures) return null;

  // Get recent feature vectors
  const lookbackTime = new Date();
  lookbackTime.setHours(lookbackTime.getHours() - 24);

  const { data: otherFeatures } = await supabase
    .from('cipher_features')
    .select('*, survey_responses!inner(id, survey_id, device_data, ip_address, completed_at, created_at, fraud_score)')
    .eq('survey_id', surveyId)
    .neq('response_id', excludeResponseId)
    .gte('created_at', lookbackTime.toISOString())
    .limit(200);

  if (!otherFeatures || otherFeatures.length === 0) return null;

  const similarFeatures: Array<{ features: any; similarity: number }> = [];

  for (const f of otherFeatures) {
    const similarity = calculateFeatureSimilarity(currentFeatures, f);
    if (similarity >= config.minBehavioralSimilarityThreshold) {
      similarFeatures.push({ features: f, similarity });
    }
  }

  if (similarFeatures.length === 0) return null;

  const avgSimilarity = similarFeatures.reduce((sum, s) => sum + s.similarity, 0) / similarFeatures.length;
  const severity: 'low' | 'medium' | 'high' = avgSimilarity >= 0.95 ? 'high' : 'medium';

  const linked: LinkedResponse[] = similarFeatures.map(s => {
    const r = s.features.survey_responses;
    return {
      id: r.id,
      surveyId: r.survey_id,
      fingerprint: r.device_data?.fingerprint,
      ipAddress: r.ip_address,
      submittedAt: r.completed_at || r.created_at,
      fraudScore: r.fraud_score || 0,
      similarityScore: s.similarity,
    };
  });

  return {
    signal: {
      type: 'behavioral_similarity',
      severity,
      confidence: avgSimilarity,
      details: `Behavioral patterns ${(avgSimilarity * 100).toFixed(0)}% similar to ${similarFeatures.length} responses`,
      linkedResponseIds: similarFeatures.map(s => s.features.response_id),
    },
    linked,
  };
}

/**
 * Calculate similarity between two feature vectors
 */
function calculateFeatureSimilarity(f1: any, f2: any): number {
  // Key behavioral features to compare
  const keys = [
    'mouse_velocity_mean', 'mouse_velocity_std', 'keystroke_timing_mean',
    'keystroke_timing_std', 'completion_time_seconds', 'time_per_question_mean',
    'scroll_velocity_mean', 'idle_time_total', 'active_time_ratio',
  ];

  let totalDiff = 0;
  let count = 0;

  for (const key of keys) {
    const v1 = f1[key];
    const v2 = f2[key];

    if (v1 != null && v2 != null && v1 !== 0) {
      // Relative difference
      const diff = Math.abs(v1 - v2) / Math.max(Math.abs(v1), Math.abs(v2), 1);
      totalDiff += diff;
      count++;
    }
  }

  if (count === 0) return 0;

  // Convert average difference to similarity
  const avgDiff = totalDiff / count;
  return Math.max(0, 1 - avgDiff);
}

/**
 * Check for datacenter IP clustering
 */
async function checkDatacenterCluster(
  supabase: SupabaseClient,
  surveyId: string,
  ipAddress: string | undefined,
  excludeResponseId: string,
): Promise<{ signal: FraudRingSignal; linked: LinkedResponse[] } | null> {
  // Get responses from datacenter IPs
  const lookbackTime = new Date();
  lookbackTime.setHours(lookbackTime.getHours() - 24);

  const { data: features } = await supabase
    .from('cipher_features')
    .select('response_id, is_datacenter, survey_responses!inner(id, survey_id, device_data, ip_address, completed_at, created_at, fraud_score)')
    .eq('survey_id', surveyId)
    .eq('is_datacenter', true)
    .neq('response_id', excludeResponseId)
    .gte('created_at', lookbackTime.toISOString())
    .limit(100);

  if (!features || features.length < 3) return null;

  const severity: 'low' | 'medium' | 'high' | 'critical' =
    features.length >= 20 ? 'critical' :
    features.length >= 10 ? 'high' : 'medium';

  const linked: LinkedResponse[] = features.map(f => {
    const r = f.survey_responses as any;
    return {
      id: r.id,
      surveyId: r.survey_id,
      fingerprint: r.device_data?.fingerprint,
      ipAddress: r.ip_address,
      submittedAt: r.completed_at || r.created_at,
      fraudScore: r.fraud_score || 0,
      similarityScore: 0.9,
    };
  });

  return {
    signal: {
      type: 'datacenter_cluster',
      severity,
      confidence: 0.8,
      details: `${features.length} responses from datacenter IPs in 24h`,
      linkedResponseIds: features.map(f => f.response_id),
    },
    linked,
  };
}

/**
 * Calculate overall fraud ring score
 */
function calculateFraudRingScore(signals: FraudRingSignal[]): number {
  if (signals.length === 0) return 0;

  const severityWeights = {
    low: 0.15,
    medium: 0.35,
    high: 0.6,
    critical: 1.0,
  };

  let totalWeight = 0;
  for (const signal of signals) {
    totalWeight += severityWeights[signal.severity] * signal.confidence;
  }

  // Normalize to 0-1, capped at sum of 2 critical signals
  return Math.min(totalWeight / 2, 1.0);
}

/**
 * Generate a unique ring ID for grouping related fraud
 */
function generateRingId(fingerprint?: string, ipAddress?: string, signals?: FraudRingSignal[]): string {
  const components: string[] = [];

  if (fingerprint) components.push(`fp:${fingerprint.slice(0, 8)}`);
  if (ipAddress) components.push(`ip:${ipAddress.replace(/\./g, '-')}`);

  if (components.length === 0 && signals && signals.length > 0) {
    // Use first signal type
    components.push(`sig:${signals[0].type}`);
  }

  const timestamp = Date.now().toString(36);
  return `ring_${components.join('_')}_${timestamp}`;
}

/**
 * Get recommendation based on score and signals
 */
function getRecommendation(score: number, signals: FraudRingSignal[]): 'allow' | 'review' | 'reject' {
  // Critical signals always reject
  if (signals.some(s => s.severity === 'critical')) {
    return 'reject';
  }

  // High score or multiple high signals
  if (score >= 0.7 || signals.filter(s => s.severity === 'high').length >= 2) {
    return 'reject';
  }

  // Medium signals need review
  if (score >= 0.3 || signals.some(s => s.severity === 'high' || s.severity === 'medium')) {
    return 'review';
  }

  return 'allow';
}

/**
 * Deduplicate linked responses
 */
function deduplicateLinkedResponses(responses: LinkedResponse[]): LinkedResponse[] {
  const seen = new Map<string, LinkedResponse>();

  for (const r of responses) {
    const existing = seen.get(r.id);
    if (!existing || r.similarityScore > existing.similarityScore) {
      seen.set(r.id, r);
    }
  }

  return Array.from(seen.values()).sort((a, b) => b.similarityScore - a.similarityScore);
}

/**
 * Batch analyze responses for fraud rings
 */
export async function batchDetectFraudRings(
  supabase: SupabaseClient,
  surveyId: string,
  responseIds?: string[],
): Promise<Map<string, FraudRingResult>> {
  const results = new Map<string, FraudRingResult>();

  // If no specific IDs, get recent responses
  if (!responseIds) {
    const lookbackTime = new Date();
    lookbackTime.setHours(lookbackTime.getHours() - 24);

    const { data: responses } = await supabase
      .from('survey_responses')
      .select('id')
      .eq('survey_id', surveyId)
      .gte('created_at', lookbackTime.toISOString())
      .limit(500);

    responseIds = (responses || []).map(r => r.id);
  }

  // Process in parallel batches of 10
  const batchSize = 10;
  for (let i = 0; i < responseIds.length; i += batchSize) {
    const batch = responseIds.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(id => detectFraudRing(supabase, id, surveyId))
    );

    for (let j = 0; j < batch.length; j++) {
      results.set(batch[j], batchResults[j]);
    }
  }

  return results;
}

/**
 * Get fraud ring summary for a survey
 */
export async function getFraudRingSummary(
  supabase: SupabaseClient,
  surveyId: string,
): Promise<{
  totalResponses: number;
  suspiciousResponses: number;
  identifiedRings: number;
  topSignalTypes: Array<{ type: FraudRingSignalType; count: number }>;
}> {
  const results = await batchDetectFraudRings(supabase, surveyId);

  const suspicious = [...results.values()].filter(r => r.isSuspicious);
  const ringIds = new Set(suspicious.map(r => r.ringId).filter(Boolean));

  // Count signal types
  const signalCounts = new Map<FraudRingSignalType, number>();
  for (const result of suspicious) {
    for (const signal of result.signals) {
      signalCounts.set(signal.type, (signalCounts.get(signal.type) || 0) + 1);
    }
  }

  const topSignalTypes = [...signalCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([type, count]) => ({ type, count }));

  return {
    totalResponses: results.size,
    suspiciousResponses: suspicious.length,
    identifiedRings: ringIds.size,
    topSignalTypes,
  };
}
