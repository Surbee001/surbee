import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, context, conversationHistory } = await request.json();

    if (!message || !context) {
      return NextResponse.json(
        { error: 'Message and context are required' },
        { status: 400 }
      );
    }

    // Build context-aware system prompt based on active tab
    let systemPrompt = `You are Surbee AI, an intelligent assistant that helps users understand their survey data and analytics. You have access to the current tab context and can provide insights about survey performance, responses, and analytics.

Current Context:
- Active Tab: ${context.activeTab}
- Project ID: ${context.projectId}
- Timestamp: ${context.timestamp}

You should provide helpful, accurate responses about survey data, analytics, and insights. Use markdown formatting for better readability.`;

    // Add tab-specific context
    switch (context.activeTab) {
      case 'insights':
        systemPrompt += `

You're currently viewing the Insights tab. Users can ask about:
- Survey performance metrics
- Response rates and completion rates
- Analytics and trends
- Data visualization insights
- Response quality and patterns
- Sentiment analysis
- Completion funnels
- Response correlations

Provide specific, actionable insights based on survey analytics.`;
        break;
      case 'share':
        systemPrompt += `

You're currently viewing the Share tab. Users can ask about:
- Sharing options and best practices
- Embedding surveys
- Privacy settings
- Distribution strategies
- Link management
- QR codes and social sharing
- Export options

Help users understand how to effectively share and distribute their surveys.`;
        break;
      default:
        systemPrompt += `

You're currently viewing survey management features. Users can ask about:
- Survey configuration
- General survey best practices
- Data management
- Project settings

Provide helpful guidance about survey management and optimization.`;
    }

    // Build conversation context
    let conversationContext = '';
    if (conversationHistory && conversationHistory.length > 0) {
      conversationContext = '\n\nRecent conversation:\n';
      conversationHistory.forEach((msg: any) => {
        conversationContext += `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
    }

    const fullPrompt = `${systemPrompt}${conversationContext}

User Question: ${message}

Please provide a helpful, accurate response using markdown formatting. Be specific and actionable.`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: fullPrompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || 'Sorry, I couldn\'t process your request.';

    return NextResponse.json({
      response,
      timestamp: new Date().toISOString(),
      context: {
        activeTab: context.activeTab,
        projectId: context.projectId
      }
    });

  } catch (error) {
    console.error('Error in surbee-chat API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
