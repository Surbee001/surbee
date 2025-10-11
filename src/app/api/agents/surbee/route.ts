import { NextRequest, NextResponse } from "next/server";
import { runWorkflow } from "@/lib/agents/surbeeWorkflow";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = typeof body?.input === "string" ? body.input : body?.input_as_text;

    if (!input || typeof input !== "string") {
      return NextResponse.json({ error: "Missing input" }, { status: 400 });
    }

    const result = await runWorkflow({ input_as_text: input });

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Failed to run Surbee agent workflow", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
