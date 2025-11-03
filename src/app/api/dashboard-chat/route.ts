import { NextRequest } from 'next/server';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';

// Create Anthropic provider with explicit API key
const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, model = 'gpt-5', sessionId } = body;

    if (!message) {
      return Response.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const systemMessage = 'You are a helpful AI assistant for Surbee, a survey creation platform. Help users create effective surveys and analyze feedback.';

    // Select the appropriate model based on user choice
    const selectedModel = model === 'claude-haiku'
      ? anthropic('claude-haiku-4-5-20251001')
      : openai('gpt-5');

    // Use Vercel AI SDK streamText
    // Note: No providerOptions needed - this was causing the routing issue
    const result = streamText({
      model: selectedModel,
      system: systemMessage,
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
      maxTokens: 4096,
    });

    // Return streaming response in Data Stream format
    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Error in dashboard chat API:', error);
    return Response.json(
      {
        error: 'Failed to process chat',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
