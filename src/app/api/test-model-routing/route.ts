import { NextRequest } from 'next/server';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';

// Debug: Log API key presence
console.log('ENV CHECK - ANTHROPIC_API_KEY exists?', !!process.env.ANTHROPIC_API_KEY);
console.log('ENV CHECK - ANTHROPIC_API_KEY length:', process.env.ANTHROPIC_API_KEY?.length || 0);
console.log('ENV CHECK - ANTHROPIC_API_KEY starts with:', process.env.ANTHROPIC_API_KEY?.substring(0, 7));

// Create Anthropic provider with explicit API key
const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { model = 'gpt-5' } = body;

    console.log('TEST: Received model:', model);
    console.log('TEST: model === "claude-haiku"?', model === 'claude-haiku');

    // Select provider based on model
    const selectedModel = model === 'claude-haiku'
      ? anthropic('claude-haiku-4-5')
      : openai('gpt-5');

    console.log('TEST: Selected provider:', model === 'claude-haiku' ? 'ANTHROPIC' : 'OPENAI');

    // Simple test - generate a short text
    const result = await generateText({
      model: selectedModel,
      prompt: 'Say "Hello from ' + (model === 'claude-haiku' ? 'Anthropic' : 'OpenAI') + '"',
      maxTokens: 10,
    });

    return Response.json({
      success: true,
      model: model,
      provider: model === 'claude-haiku' ? 'Anthropic' : 'OpenAI',
      response: result.text,
    });
  } catch (error) {
    console.error('TEST ERROR:', error);
    return Response.json(
      {
        error: 'Failed to test model routing',
        message: error instanceof Error ? error.message : 'Unknown error',
        model: body.model,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Test endpoint to verify both providers work
  const tests = [];

  // Test OpenAI
  try {
    const openaiResult = await generateText({
      model: openai('gpt-5'),
      prompt: 'Say "Hello from OpenAI"',
      maxTokens: 10,
    });
    tests.push({ provider: 'OpenAI', status: 'success', response: openaiResult.text });
  } catch (e) {
    tests.push({ provider: 'OpenAI', status: 'error', error: (e as Error).message });
  }

  // Test Anthropic
  try {
    const anthropicResult = await generateText({
      model: anthropic('claude-haiku-4-5'),
      prompt: 'Say "Hello from Anthropic"',
      maxTokens: 10,
    });
    tests.push({ provider: 'Anthropic', status: 'success', response: anthropicResult.text });
  } catch (e) {
    tests.push({ provider: 'Anthropic', status: 'error', error: (e as Error).message });
  }

  return Response.json({ tests });
}