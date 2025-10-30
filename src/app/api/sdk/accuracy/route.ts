/**
 * Surbee Platform API - Accuracy Detection Endpoint
 * Handles SDK requests for response accuracy analysis
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Verify API key
 */
async function verifyApiKey(apiKey: string): Promise<{ userId: string } | null> {
  if (!apiKey || !apiKey.startsWith("surbee_")) {
    return null;
  }

  return {
    userId: "sdk_user",
  };
}

/**
 * POST /api/sdk/accuracy
 * Analyze survey response accuracy
 */
export async function POST(request: NextRequest) {
  try {
    // Extract API key
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid Authorization header" },
        { status: 401 }
      );
    }

    const apiKey = authHeader.substring(7);

    // Verify API key
    const user = await verifyApiKey(apiKey);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { surveyId, responseData } = body;

    if (!surveyId || !responseData) {
      return NextResponse.json(
        { error: "surveyId and responseData are required" },
        { status: 400 }
      );
    }

    // PLACEHOLDER: Implement actual ML-based accuracy detection
    // For now, return mock data
    console.log(`[SDK] Analyzing accuracy for survey ${surveyId}`);

    const score = calculateMockScore(responseData);

    return NextResponse.json({
      score: score.score,
      confidence: score.confidence,
      flags: score.flags,
      metrics: score.metrics,
    });
  } catch (error) {
    console.error("[SDK] Accuracy analysis error:", error);

    return NextResponse.json(
      {
        error: "Accuracy analysis failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Mock score calculation (placeholder)
 */
function calculateMockScore(responseData: any) {
  const questionTimes = responseData.questionTimes || [];
  const avgTime = questionTimes.length > 0
    ? questionTimes.reduce((sum: number, t: number) => sum + t, 0) / questionTimes.length
    : 5000;

  const rushed = avgTime < 3000;
  let score = 100;

  const flags: any[] = [];

  if (rushed) {
    score -= 20;
    flags.push({
      type: "rushed",
      severity: "high",
      description: `Average time per question (${(avgTime / 1000).toFixed(1)}s) is unusually low`,
    });
  }

  return {
    score: Math.max(0, score),
    confidence: 0.75,
    flags,
    metrics: {
      avgTimePerQuestion: avgTime,
      mouseMovementVariance: Math.random() * 100,
      consistencyScore: 0.8,
    },
  };
}

/**
 * GET /api/sdk/accuracy
 * Health check
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    version: "1.0",
    endpoint: "accuracy-detection",
  });
}
