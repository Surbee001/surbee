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

    // Debug: Log the structure of each message to understand the format
    if (body.messages) {
      body.messages.forEach((msg: any, idx: number) => {
        console.log(`📦 Message ${idx} [${msg.role}]:`, {
          hasContent: !!msg.content,
          contentType: typeof msg.content,
          hasParts: !!msg.parts,
          partsCount: msg.parts?.length,
          partTypes: msg.parts?.map((p: any) => p.type),
        });
        // Log file parts specifically
        const fileParts = msg.parts?.filter((p: any) => p.type === 'file') || [];
        if (fileParts.length > 0) {
          console.log(`📷 Message ${idx} has ${fileParts.length} file parts:`, fileParts.map((p: any) => ({
            type: p.type,
            filename: p.filename,
            mediaType: p.mediaType,
            urlPrefix: p.url?.substring(0, 50)
          })));
        }
      });
    }

    // Support both formats: useChat messages array OR legacy input+context format
    let messages: ChatMessage[];
    const selectedModel = body.model || 'gpt-5'; // Default to gpt-5

    // Extract project context
    const projectId = body.projectId;
    const userId = body.userId;

    // CRITICAL DEBUG: Log exactly what model we're using
    console.log('🎯 SELECTED MODEL:', selectedModel);
    console.log('🎯 PROJECT CONTEXT:', { projectId, userId });

    if (body.messages) {
      // New format: direct messages array from useChat
      messages = body.messages
        .map((msg: any) => {
          // Handle string content (text messages)
          if (typeof msg.content === 'string') {
            return {
              role: msg.role,
              parts: [{ type: 'text', text: msg.content }]
            };
          }

          // Handle array content (multi-part messages with text/image/file)
          if (Array.isArray(msg.content)) {
            const parts = msg.content.map((part: any) => {
              // Pass through all part types including 'file' parts
              return part;
            });
            return {
              role: msg.role,
              parts
            };
          }

          // Handle parts array (already in our format - from AI SDK useChat)
          if (msg.parts) {
            // Parts already include file parts when using sendMessage({ text, files })
            return {
              role: msg.role,
              parts: msg.parts
            };
          }

          // Fallback: create text part from content
          return {
            role: msg.role,
            parts: [{ type: 'text', text: String(msg.content || '') }]
          };
        })
        // Filter out messages with empty content
        .filter((msg: any) => {
          // Check if message has any meaningful content
          if (!msg.parts || msg.parts.length === 0) return false;

          // Check if any part has actual content
          const hasContent = msg.parts.some((part: any) => {
            if (part.type === 'text') return part.text && part.text.trim() !== '';
            if (part.type === 'image') return !!part.image;
            if (part.type === 'file') return !!part.url || !!part.data;
            return true; // Keep other part types
          });

          // Always keep assistant messages (they may have tool calls)
          if (msg.role === 'assistant') return true;

          return hasContent;
        });
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

    // Count images and files in messages
    const imageCount = messages.reduce((count, msg) => {
      const imgs = msg.parts?.filter((p: any) => p.type === 'image').length || 0;
      const files = msg.parts?.filter((p: any) => p.type === 'file' && p.mediaType?.startsWith('image/')).length || 0;
      return count + imgs + files;
    }, 0);
    console.log(`📷 Total images/files in all messages: ${imageCount}`);

    // Debug: Log final message parts structure
    messages.forEach((msg, idx) => {
      console.log(`📦 Final message ${idx} parts:`, msg.parts?.map((p: any) => ({
        type: p.type,
        ...(p.type === 'text' ? { textLength: p.text?.length } : {}),
        ...(p.type === 'file' ? { filename: p.filename, mediaType: p.mediaType, urlLength: p.url?.length } : {}),
        ...(p.type === 'image' ? { imageType: typeof p.image, imageLength: typeof p.image === 'string' ? p.image.length : 'not string' } : {}),
      })));
    });

    // Use the streaming workflow - it returns a streamText result
    const result = streamWorkflowV3({
      messages,
      model: selectedModel,
      projectId,
      userId
    });

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
