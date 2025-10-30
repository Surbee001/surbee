import { NextRequest } from 'next/server';
import { streamWorkflowV3, type ChatMessage } from '@/lib/agents/surbeeWorkflowV3';

export const runtime = 'nodejs';
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Support both formats: useChat messages array OR legacy input+context format
    let messages: ChatMessage[];

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

    // Use the streaming workflow - it returns a streamText result
    const result = streamWorkflowV3({ messages });

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
