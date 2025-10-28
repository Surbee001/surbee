import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'v0-sdk'

const v0Client = createClient({
  apiKey: process.env.V0_API_KEY,
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  try {
    const { chatId } = await params

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 },
      )
    }

    // Fetch chat details using v0 SDK
    const chatDetails = await v0Client.chats.getById({ chatId })

    return NextResponse.json(chatDetails)
  } catch (error) {
    console.error('Error fetching chat details:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch chat details',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
