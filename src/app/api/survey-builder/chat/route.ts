import { NextRequest, NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import { z } from 'zod'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const ChatBody = z.object({
  message: z.string(),
  images: z.array(z.string()).optional(),
  currentSurvey: z.string().optional(),
  stream: z.boolean().optional().default(false)
})

const SYSTEM_PROMPT = `You are an expert React developer specializing in creating beautiful, interactive survey forms. You have unlimited creative freedom to build exactly what the user requests.

CORE REQUIREMENTS:
1. Always create a COMPLETE, FUNCTIONAL React component for surveys/forms
2. Use modern React with TypeScript and hooks
3. Include ALL imports needed (React, framer-motion, etc.)
4. Make it fully interactive with form state management
5. Include proper form submission handling
6. Use Tailwind CSS for styling (you have access to ALL classes)
7. Can use Framer Motion for any animations requested
8. Can include images, videos, custom layouts, unique designs
9. NO RESTRICTIONS on creativity - if user wants moving emojis, custom shapes, unique animations, etc. - DO IT
10. Must remain a survey/form at its core (collects user input and can submit data)

AVAILABLE LIBRARIES:
- React + TypeScript
- Tailwind CSS (full access)
- Framer Motion (for animations)
- Lucide React (for icons)
- Standard HTML5 (images, videos, etc.)

FLEXIBILITY:
- Any colors, gradients, shadows, borders
- Any animations, transitions, interactions
- Any layout (grid, flexbox, absolute positioning)
- Any form elements (inputs, selectors, sliders, etc.)
- Images, videos, emojis, custom graphics
- Unique shapes, creative designs
- Multi-step, single page, or any format
- Custom validation and error handling

RULES:
1. ALWAYS output ONLY the React component code - no explanations
2. Make it production-ready and fully functional
3. Include proper TypeScript interfaces
4. Handle form state and validation
5. Include onSubmit prop for form submission
6. Be creative and follow user's exact requests
7. If modifying existing code, make the requested changes precisely

Generate exactly what the user asks for with complete creative freedom!`

export async function POST(req: NextRequest) {
  console.log('=== FLEXIBLE SURVEY BUILDER API ===');
  
  try {
    const body = await req.json()
    const parsed = ChatBody.parse(body)
    
    const userMessage = parsed.message
    const currentCode = parsed.currentSurvey
    
    console.log('User request:', userMessage);
    console.log('Has existing code:', !!currentCode);

    // Build messages for OpenAI
    const messages: any[] = [
      {
        role: 'system',
        content: SYSTEM_PROMPT
      }
    ]

    // If there's existing code, include it for modification
    if (currentCode) {
      messages.push({
        role: 'assistant',
        content: `Current survey component:\n\n\`\`\`tsx\n${currentCode}\n\`\`\``
      })
    }

    messages.push({
      role: 'user',
      content: userMessage
    })

    // Generate the React component
    console.log('🚀 Generating custom React component...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages,
      temperature: 0.1,
      max_tokens: 4000,
    })

    const generatedCode = completion.choices[0]?.message?.content || ''
    console.log('✅ Component generated successfully');

    // Extract component info for UI
    const titleMatch = generatedCode.match(/(?:title|heading).*?['"`]([^'"`]+)['"`]/i) || 
                     generatedCode.match(/h1.*?['"`]([^'"`]+)['"`]/i) ||
                     generatedCode.match(/Survey.*?['"`]([^'"`]+)['"`]/i)
    const title = titleMatch ? titleMatch[1] : 'Custom Survey'

    // Generate explanation of what was created
    const explanationCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. Briefly explain what survey component was created based on the user request and generated code. Be enthusiastic and highlight key features.'
        },
        {
          role: 'user',
          content: `User requested: "${userMessage}"\n\nGenerated code preview: ${generatedCode.substring(0, 500)}...\n\nWhat did we create?`
        }
      ],
      temperature: 0.3,
      max_tokens: 200,
    })

    const explanation = explanationCompletion.choices[0]?.message?.content || 
                      'I\'ve created your custom survey component with exactly the features you requested!'

    // Return the generated survey
    return NextResponse.json({
      success: true,
      survey: {
        id: `survey_${Date.now()}`,
        title: title,
        description: `Custom survey: ${userMessage.substring(0, 100)}${userMessage.length > 100 ? '...' : ''}`,
        code: generatedCode,
        pages: [], // Not needed for custom approach
        theme: {} // Not needed for custom approach
      },
      explanation: explanation
    })

  } catch (error: any) {
    console.error('❌ Survey builder error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal error',
      explanation: 'I encountered an issue generating your survey. Please try again with a more specific request.'
    }, { status: 500 })
  }
}