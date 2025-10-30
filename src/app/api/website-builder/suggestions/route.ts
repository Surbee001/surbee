/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { html } = await req.json();
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
          { role: 'system', content: 'You are Surbee, a sharp UI/UX reviewer. Propose concise, actionable next-step suggestions tailored to the current HTML survey UI. Focus on hierarchy, spacing, accessibility, responsiveness, and motion. Output as a short comma-separated list of 3-8 pill texts.' },
          { role: 'user', content: `HTML (truncated ok):\n\n\`\`\`html\n${String(html || '').slice(0, 10000)}\n\`\`\`\n\nReturn only pill texts, no commentary.` },
        ],
        max_tokens: 300,
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      return NextResponse.json({ ok: false, error: t }, { status: 500 });
    }
    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content || '';
    const suggestions = raw
      .split(/[,\n]/)
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0)
      .slice(0, 8);
    return NextResponse.json({ ok: true, suggestions });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'suggestions error' }, { status: 500 });
  }
}


