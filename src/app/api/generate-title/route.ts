import { NextRequest } from 'next/server';
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { prompt, model } = await req.json();

    if (!prompt?.trim()) {
      return new Response('Missing prompt', { status: 400 });
    }

    // Determine which model to use
    let selectedModel;
    const modelName = model || 'gpt-5'; // Default to gpt-5

    if (modelName === 'claude-haiku') {
      selectedModel = anthropic('claude-3-5-haiku-20241022');
    } else if (modelName === 'mistral') {
      // For mistral, fall back to gpt-5-nano for title generation
      selectedModel = openai('gpt-5-nano');
    } else {
      // Use the corresponding OpenAI model
      // Map gpt-5 to gpt-5-nano for faster title generation
      selectedModel = openai('gpt-5-nano');
    }

    const systemPrompt = `You generate concise 3-4 word titles for survey projects based on user prompts.
Rules:
- ONLY output the title, nothing else
- 3-4 words for better context
- Capitalize each word
- No punctuation
- No quotes or extra formatting
Examples:
User: "create a customer satisfaction survey" -> Customer Satisfaction Survey
User: "I need an employee feedback form" -> Employee Feedback Form
User: "make a product review questionnaire" -> Product Review Questionnaire
User: "help me build a market research survey" -> Market Research Survey`;

    const result = await streamText({
      model: selectedModel,
      system: systemPrompt,
      prompt: `Generate a 3-4 word title for this survey project: "${prompt}"`,
      maxTokens: 15,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error('Title generation error:', error);
    return new Response(error?.message || 'Failed to generate title', {
      status: 500
    });
  }
}
