import type { NextRequest } from "next/server";
import { buildSurvey } from "@/orchestrator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const message = typeof body?.message === "string" ? body.message : "";
    const result = await buildSurvey(message);
    return Response.json(result);
  } catch (error: any) {
    console.error("/api/ai/survey/build error", error);
    return Response.json({ error: error?.message ?? "survey_build_failed" }, { status: 500 });
  }
}

export async function GET() {
  return new Response(null, { status: 405 });
}

export async function PUT() {
  return new Response(null, { status: 405 });
}
