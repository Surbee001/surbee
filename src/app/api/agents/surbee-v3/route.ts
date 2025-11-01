import { NextRequest } from 'next/server';
import { streamWorkflowV3, type ChatMessage } from '@/lib/agents/surbeeWorkflowV3';

export const runtime = 'nodejs';
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('📦 Received body keys:', Object.keys(body));
    console.log('📦 Body.model:', body.model);
    console.log('📦 Body.messages:', body.messages ? `${body.messages.length} messages` : 'no messages');

    // Support both formats: useChat messages array OR legacy input+context format
    let messages: ChatMessage[];
    const selectedModel = body.model || 'gpt-5'; // Default to gpt-5

    // CRITICAL DEBUG: Log exactly what model we're using
    console.log('🎯 SELECTED MODEL:', selectedModel);
    console.log('🎯 IS CLAUDE-HAIKU?', selectedModel === 'claude-haiku');

    if (body.messages) {
      // New format: direct messages array from useChat
      messages = body.messages;
    } else if (body.input) {
      // Legacy format: { input, images, context } from project page
      // Convert to messages format
      const userMessage: any = {
        role: 'user',
        parts: [
          { type: 'text', text: body.input }
        ]
      };

      // Add images if present
      if (body.images && body.images.length > 0) {
        body.images.forEach((img: string) => {
          userMessage.parts.push({ type: 'image', image: img });
        });
      }

      messages = [userMessage] as ChatMessage[];
    } else {
      throw new Error('Invalid request format: expected messages or input');
    }

    console.log('📥 Received', messages?.length || 0, 'messages');
    console.log('🤖 Using model:', selectedModel);

    // Debug: Log if any messages have image parts
    messages.forEach((msg, idx) => {
      const imageParts = msg.parts?.filter((p: any) => p.type === 'image') || [];
      if (imageParts.length > 0) {
        console.log(`📷 Message ${idx} has ${imageParts.length} image(s)`);
      }
    });

    // Use the streaming workflow - it returns a streamText result
    const result = streamWorkflowV3({ messages, model: selectedModel });

    // Return the UI message stream response for useChat
    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error('❌ API error:', error);
    return Response.json(
      { error: 'Failed to process request', details: error?.message },
      { status: 500 }
    );
  }
}
