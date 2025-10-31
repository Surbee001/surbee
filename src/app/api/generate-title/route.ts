import { NextRequest } from 'next/server';
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt?.trim()) {
      return new Response('Missing prompt', { status: 400 });
    }

    const result = await streamText({
      model: openai('gpt-5-nano'),
      system: `You generate concise 2-3 word titles for survey projects based on user prompts.
Rules:
- ONLY output the title, nothing else
- 2-3 words maximum
- Capitalize each word
- No punctuation
- No quotes or extra formatting
Examples:
User: "create a customer satisfaction survey" -> Customer Satisfaction
User: "I need an employee feedback form" -> Employee Feedback
User: "make a product review questionnaire" -> Product Review`,
      prompt: `Generate a 2-3 word title for this survey project: "${prompt}"`,
      maxTokens: 10,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error('Title generation error:', error);
    return new Response(error?.message || 'Failed to generate title', {
      status: 500
    });
  }
}
