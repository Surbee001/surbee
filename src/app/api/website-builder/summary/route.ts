/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { html, prompt } = await req.json();
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) return NextResponse.json({ ok: false, error: 'Missing API key' }, { status: 500 });

    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        stream: false,
        temperature: 1.3,
        messages: [
          { role: 'system', content: 'You are Surbee, a clear, precise, classy product assistant. Write concise, high-signal summaries of what was changed and why in a friendly voice.' },
          { role: 'user', content: `HTML (truncated ok):\n\n\`\`\`html\n${String(html || '').slice(0, 10000)}\n\`\`\`\n\nPrompt: ${prompt || ''}\n\nWrite a short summary (4-7 bullets or 3-5 short lines) of what you changed and why, focusing on clarity, hierarchy, responsiveness, and accessibility. Avoid generic fluff. Do not include code.` },
        ],
        max_tokens: 600,
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      return NextResponse.json({ ok: false, error: t }, { status: 500 });
    }
    const data = await res.json();
    const summary = data?.choices?.[0]?.message?.content || '';
    return NextResponse.json({ ok: true, summary });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'summary error' }, { status: 500 });
  }
}


