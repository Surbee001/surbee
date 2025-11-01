import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { computeSuspicionScore } from '@/features/survey/behavior/scoring'

// In-memory rate limiting store for anonymous users
const anonSubmissionLog = new Map<string, number[]>(); // IP -> timestamps of submissions
const RATE_LIMIT_WINDOW = 60000; // 1 minute in milliseconds
const RATE_LIMIT_MAX_SUBMISSIONS = 5; // Max submissions per minute per IP

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0].trim() || realIP || 'unknown';
}

function checkRateLimit(ipAddress: string): { allowed: boolean; remainingRequests: number } {
  const now = Date.now();
  const submissions = anonSubmissionLog.get(ipAddress) || [];

  // Remove timestamps outside the window
  const validSubmissions = submissions.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);

  if (validSubmissions.length >= RATE_LIMIT_MAX_SUBMISSIONS) {
    return {
      allowed: false,
      remainingRequests: 0
    };
  }

  // Add current submission timestamp
  validSubmissions.push(now);
  anonSubmissionLog.set(ipAddress, validSubmissions);

  return {
    allowed: true,
    remainingRequests: RATE_LIMIT_MAX_SUBMISSIONS - validSubmissions.length
  };
}

export async function POST(req: NextRequest) {
  try {
    const { surveyId, respondentId, responses, metrics, userId, sessionId } = await req.json()
    const clientIP = getClientIP(req);

    // Validate that we have a sessionId (for anonymous tracking)
    // If not provided, we should still track by IP
    const trackingSessionId = sessionId || `session_${clientIP}`;

    // Check rate limiting for anonymous users (no userId)
    if (!userId) {
      const { allowed, remainingRequests } = checkRateLimit(clientIP);
      if (!allowed) {
        return NextResponse.json(
          {
            success: false,
            error: 'Rate limit exceeded. Please wait before submitting again.',
            retryAfter: 60
          },
          { status: 429, headers: { 'Retry-After': '60' } }
        );
      }
    }

    const { score, flags } = computeSuspicionScore(metrics)
    const db = await getDb()

    const responseData = {
      survey_id: surveyId,
      respondent_id: respondentId,
      responses,
      completed_at: new Date().toISOString(),
      mouse_data: metrics?.mouseMovements || undefined,
      keystroke_data: metrics?.keystrokeDynamics || undefined,
      timing_data: metrics?.responseTime || [],
      device_data: metrics?.deviceFingerprint || {},
      fraud_score: score,
      is_flagged: score >= 0.5,
      flag_reasons: flags.map((f: any) => f.code),
      user_id: userId || undefined,
      session_id: trackingSessionId,
      ip_address: clientIP,
      created_at: new Date().toISOString()
    }

    const result = await db.collection('survey_responses').insertOne(responseData)

    // Update analytics aggregates
    await db.collection('survey_analytics').updateOne(
      { survey_id: surveyId },
      {
        $inc: { total_completions: 1 },
        $set: { updated_at: new Date().toISOString() }
      },
      { upsert: true }
    )

    return NextResponse.json({ success: true, id: result.insertedId.toString(), fraudScore: score, flags })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'submit_failed' }, { status: 400 })
  }
}

