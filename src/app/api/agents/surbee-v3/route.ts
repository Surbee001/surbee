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
    console.log('📦 Body.images:', body.images ? `${body.images.length} images` : 'no images');

    // Support both formats: useChat messages array OR legacy input+context format
    let messages: ChatMessage[];
    const selectedModel = body.model || 'gpt-5'; // Default to gpt-5

    // CRITICAL DEBUG: Log exactly what model we're using
    console.log('🎯 SELECTED MODEL:', selectedModel);
    console.log('🎯 IS CLAUDE-HAIKU?', selectedModel === 'claude-haiku');

    if (body.messages) {
      // New format: direct messages array from useChat
      messages = body.messages.map((msg: any) => {
        // Handle string content (text messages)
        if (typeof msg.content === 'string') {
          return {
            role: msg.role,
            parts: [{ type: 'text', text: msg.content }]
          };
        }

        // Handle array content (multi-part messages)
        if (Array.isArray(msg.content)) {
          const parts = msg.content.map((part: any) => {
            if (part.type === 'text') return part;
            if (part.type === 'image') return part;
            return part;
          });
          return {
            role: msg.role,
            parts
          };
        }

        // Handle parts array (already in our format)
        if (msg.parts) {
          return msg;
        }

        // Fallback: create text part from content
        return {
          role: msg.role,
          parts: [{ type: 'text', text: String(msg.content || '') }]
        };
      });

      // If images are provided in body, add them to the last user message
      if (body.images && Array.isArray(body.images) && body.images.length > 0) {
        console.log('📷 Found', body.images.length, 'images in body, adding to last user message');

        // Find last user message
        for (let i = messages.length - 1; i >= 0; i--) {
          if (messages[i].role === 'user') {
            // Add image parts
            body.images.forEach((img: string) => {
              messages[i].parts.push({
                type: 'image',
                image: img
              });
            });
            break;
          }
        }
      }
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

    console.log('📥 Final messages count:', messages?.length || 0);
    console.log('🤖 Using model:', selectedModel);

    // Count images in messages
    const imageCount = messages.reduce((count, msg) => {
      const imgs = msg.parts?.filter((p: any) => p.type === 'image').length || 0;
      return count + imgs;
    }, 0);
    if (imageCount > 0) {
      console.log(`📷 Total images in all messages: ${imageCount}`);
    }

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
