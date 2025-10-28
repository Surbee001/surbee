import { NextRequest, NextResponse } from 'next/server'
import { createClient, ChatDetail } from 'v0-sdk'

const v0Client = createClient({
  apiKey: process.env.V0_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, chatId, streaming = true, attachments = [] } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 },
      )
    }

    console.log('Chat API request:', { message, chatId, streaming })

    let chat

    if (chatId) {
      // Continue existing chat
      if (streaming) {
        chat = await v0Client.chats.sendMessage({
          chatId: chatId,
          message,
          responseMode: 'experimental_stream',
          ...(attachments && attachments.length > 0 && { attachments }),
        })

        // Return the stream directly
        return new Response(chat as ReadableStream<Uint8Array>, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          },
        })
      } else {
        chat = await v0Client.chats.sendMessage({
          chatId: chatId,
          message,
          ...(attachments && attachments.length > 0 && { attachments }),
        })
      }
    } else {
      // Create new chat
      if (streaming) {
        chat = await v0Client.chats.create({
          message,
          responseMode: 'experimental_stream',
          ...(attachments && attachments.length > 0 && { attachments }),
        })

        // Return the stream directly
        return new Response(chat as ReadableStream<Uint8Array>, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          },
        })
      } else {
        chat = await v0Client.chats.create({
          message,
          responseMode: 'sync',
          ...(attachments && attachments.length > 0 && { attachments }),
        })
      }
    }

    // Type guard to ensure we have a ChatDetail and not a stream
    if (chat instanceof ReadableStream) {
      throw new Error('Unexpected streaming response')
    }

    const chatDetail = chat as ChatDetail

    return NextResponse.json({
      id: chatDetail.id,
      demo: chatDetail.demo,
      messages: chatDetail.messages?.map((msg) => ({
        ...msg,
        experimental_content: (msg as any).experimental_content,
      })),
    })
  } catch (error) {
    console.error('Error in chat API:', error)

    // Log more detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }

    return NextResponse.json(
      {
        error: 'Failed to process chat',
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 },
    )
  }
}
