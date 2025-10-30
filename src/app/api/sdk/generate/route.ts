/**
 * Surbee Platform API - Survey Generation Endpoint
 * Handles SDK requests for survey generation
 */

import { NextRequest, NextResponse } from "next/server";
import { buildSurvey } from "@/orchestrator";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Verify API key and get user info
 */
async function verifyApiKey(apiKey: string): Promise<{ userId: string; tier: string } | null> {
  // TODO: Implement actual API key validation with database
  // For now, accept any key starting with "surbee_"
  if (!apiKey || !apiKey.startsWith("surbee_")) {
    return null;
  }

  // Mock user for now
  return {
    userId: "sdk_user",
    tier: "pro",
  };
}

/**
 * Check rate limits for user
 */
async function checkRateLimit(userId: string): Promise<boolean> {
  // TODO: Implement actual rate limiting
  // For now, allow all requests
  return true;
}

/**
 * POST /api/sdk/generate
 * Generate a survey via SDK
 */
export async function POST(request: NextRequest) {
  try {
    // Extract API key from Authorization header
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

    // Check rate limits
    const allowed = await checkRateLimit(user.userId);
    if (!allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { prompt, options = {} } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required and must be a string" },
        { status: 400 }
      );
    }

    // Track usage (TODO: implement)
    console.log(`[SDK] User ${user.userId} generating survey`);

    const startTime = Date.now();

    // Generate survey using existing orchestrator
    const result = await buildSurvey(prompt);

    const generationTime = Date.now() - startTime;

    // Extract generated HTML/code
    const code = result.artifacts.artifact.content;
    const format = options.format || "tsx_component";

    // Return result
    return NextResponse.json({
      code,
      format,
      metadata: {
        model: "gpt-5",
        provider: "openai",
        generationTime,
        tokensUsed: 0, // TODO: track actual tokens
      },
      spec: result.artifacts.spec,
    });
  } catch (error) {
    console.error("[SDK] Generation error:", error);

    return NextResponse.json(
      {
        error: "Survey generation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sdk/generate
 * Health check
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    version: "1.0",
    endpoint: "survey-generation",
  });
}
