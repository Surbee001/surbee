/**
 * Fraud Ring Detection API
 *
 * Endpoints for detecting coordinated fraudulent activity across survey responses.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { detectFraudRing, batchDetectFraudRings, getFraudRingSummary } from '@/lib/cipher';

/**
 * POST /api/cipher/fraud-ring
 *
 * Analyze a single response or batch of responses for fraud ring indicators.
 *
 * Body:
 * - surveyId: string (required)
 * - responseId?: string (for single response analysis)
 * - responseIds?: string[] (for batch analysis)
 * - summary?: boolean (get summary instead of detailed results)
 */
export async function POST(req: NextRequest) {
  try {
    const { surveyId, responseId, responseIds, summary } = await req.json();

    if (!surveyId) {
      return NextResponse.json(
        { success: false, error: 'surveyId is required' },
        { status: 400 }
      );
    }

    // Summary mode - get overall fraud ring statistics
    if (summary) {
      const summaryResult = await getFraudRingSummary(supabaseAdmin, surveyId);
      return NextResponse.json({
        success: true,
        summary: summaryResult,
      });
    }

    // Single response analysis
    if (responseId) {
      const result = await detectFraudRing(supabaseAdmin, responseId, surveyId);

      // Update response with fraud ring info if suspicious
      if (result.isSuspicious) {
        await supabaseAdmin
          .from('survey_responses')
          .update({
            fraud_ring_id: result.ringId,
            fraud_ring_score: result.score,
            fraud_ring_signals: result.signals.map(s => s.type),
          })
          .eq('id', responseId);
      }

      return NextResponse.json({
        success: true,
        result,
      });
    }

    // Batch analysis
    if (responseIds && Array.isArray(responseIds)) {
      const results = await batchDetectFraudRings(supabaseAdmin, surveyId, responseIds);

      // Update suspicious responses
      const updates: Promise<any>[] = [];
      for (const [id, result] of results.entries()) {
        if (result.isSuspicious) {
          updates.push(
            supabaseAdmin
              .from('survey_responses')
              .update({
                fraud_ring_id: result.ringId,
                fraud_ring_score: result.score,
                fraud_ring_signals: result.signals.map(s => s.type),
              })
              .eq('id', id)
          );
        }
      }
      await Promise.all(updates);

      // Convert Map to serializable format
      const resultsObj: Record<string, any> = {};
      for (const [id, result] of results.entries()) {
        resultsObj[id] = result;
      }

      return NextResponse.json({
        success: true,
        results: resultsObj,
        summary: {
          total: results.size,
          suspicious: [...results.values()].filter(r => r.isSuspicious).length,
          rings: new Set([...results.values()].map(r => r.ringId).filter(Boolean)).size,
        },
      });
    }

    // No specific targets - analyze all recent responses
    const results = await batchDetectFraudRings(supabaseAdmin, surveyId);

    const resultsObj: Record<string, any> = {};
    for (const [id, result] of results.entries()) {
      resultsObj[id] = result;
    }

    return NextResponse.json({
      success: true,
      results: resultsObj,
      summary: {
        total: results.size,
        suspicious: [...results.values()].filter(r => r.isSuspicious).length,
        rings: new Set([...results.values()].map(r => r.ringId).filter(Boolean)).size,
      },
    });
  } catch (error: any) {
    console.error('[Fraud Ring API] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cipher/fraud-ring?surveyId=xxx
 *
 * Get fraud ring summary for a survey.
 */
export async function GET(req: NextRequest) {
  try {
    const surveyId = req.nextUrl.searchParams.get('surveyId');

    if (!surveyId) {
      return NextResponse.json(
        { success: false, error: 'surveyId query parameter is required' },
        { status: 400 }
      );
    }

    const summary = await getFraudRingSummary(supabaseAdmin, surveyId);

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error: any) {
    console.error('[Fraud Ring API] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
