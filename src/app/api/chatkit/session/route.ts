import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  if (!process.env.OPENAI_CHATKIT_WORKFLOW_ID) {
    return NextResponse.json(
      { error: "Missing OPENAI_CHATKIT_WORKFLOW_ID" },
      { status: 500 }
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY" },
      { status: 500 }
    );
  }

  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    // ignore invalid JSON; treat as empty body
  }

  const requestedDeviceId = typeof body.deviceId === "string" ? body.deviceId.trim() : "";
  const requestedUserId = typeof body.userId === "string" ? body.userId.trim() : "";
  const sessionUser = requestedUserId || requestedDeviceId || "anonymous";

  try {
    // Call the OpenAI ChatKit API directly
    const response = await fetch("https://api.openai.com/v1/chatkit/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "OpenAI-Beta": "chatkit_beta=v1",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        workflow: { id: process.env.OPENAI_CHATKIT_WORKFLOW_ID },
        user: sessionUser,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ChatKit API error: ${response.status} ${errorText}`);
    }

    const { client_secret } = await response.json();

    return NextResponse.json({ client_secret });
  } catch (error) {
    console.error("[chatkit] session creation failed", error);
    return NextResponse.json(
      { error: "Failed to create ChatKit session" },
      { status: 500 }
    );
  }
}
