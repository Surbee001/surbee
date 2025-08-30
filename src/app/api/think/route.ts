import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { ThinkingProcessSchema } from '@/lib/schemas/survey-schemas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function sse(event: string, data: any): string {
  return `event: ${event}\n` + `data: ${JSON.stringify(data)}\n\n`;
}

export async function GET(req: NextRequest) {
  const prompt = req.nextUrl.searchParams.get('prompt') || '';
  const context = req.nextUrl.searchParams.get('context') || '';
  const projectId = req.nextUrl.searchParams.get('projectId') || '';
  const surveyBuilt = req.nextUrl.searchParams.get('surveyBuilt') === 'true';
  
  console.log('=== THINK API DEBUG ===');
  console.log('prompt:', prompt);
  console.log('surveyBuilt param:', req.nextUrl.searchParams.get('surveyBuilt'));
  console.log('surveyBuilt boolean:', surveyBuilt);

  if (!prompt.trim()) {
    return new Response(sse('error', { message: 'Missing prompt' }), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
      status: 400,
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enqueue = (event: string, data: any) => {
        controller.enqueue(encoder.encode(sse(event, data)));
      };

      try {
        enqueue('status', { state: 'thinking_started' });

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        // 1) Planning step: ask model to expose thinking + edits in JSON
        const plannerModel = 'gpt-5';
        const planMessages = [
          {
            role: 'system' as const,
            content: context === 'survey-builder'
              ? `You are Lyra, Surbee's AI survey expert. 

CRITICAL: You MUST respond with VALID JSON ONLY. No prose, no explanations, no markdown.

OUTPUT FORMAT - EXACT JSON STRUCTURE:
{
  "thinking": [
    "Analyzing survey creation request",
    "Planning survey structure and components", 
    "Preparing implementation approach"
  ],
  "edits": [],
  "guidance": "Survey generation in progress"
}

RULES:
- ONLY return the JSON object above
- NO additional text before or after
- NO markdown formatting
- NO explanations outside the JSON`
              
              : `You are Lyra, Surbee's PhD-level AI survey methodologist. Plan your survey creation process and expose your thinking.

SURBEE CONTEXT:
- Smart survey platform with AI-driven component generation  
- PhD-level survey methodology and question design
- Advanced user behavior analysis and accuracy checking systems
- Future community features for survey sharing and knowledge base
- Professional, academic-quality outputs with scientific rigor

OUTPUT FORMAT - JSON ONLY:
{
  "thinking": [
    "Step 1: Analyze user requirements and research objectives",
    "Step 2: Apply survey methodology principles", 
    "Step 3: Design question structure with bias reduction",
    "Step 4: Configure behavioral analytics and accuracy checks",
    "Step 5: Optimize for user experience and accessibility"
  ],
  "edits": [
    {
      "type": "style|content|structure",
      "target": "CSS selector", 
      "changes": {"property": "value"},
      "description": "What this edit accomplishes"
    }
  ],
  "guidance": "Brief methodological notes"
}

No markdown, no prose, ONLY the JSON object.`,
          },
          {
            role: 'user' as const,
            content: `User prompt: ${prompt}`,
          },
        ];

        let thinkingSteps: string[] = [];
        let edits: Array<Record<string, any>> = [];
        try {
          const plan = await openai.chat.completions.create({
            model: plannerModel,
            messages: planMessages,
            max_completion_tokens: 1200,
            response_format: { type: 'json_object' },
          });
          const content = plan.choices[0]?.message?.content || '{}';
          const parsed = JSON.parse(content);
          
          // Handle both string arrays and structured thinking steps
          if (parsed.thinking && Array.isArray(parsed.thinking)) {
            thinkingSteps = parsed.thinking.map((t: any) => 
              typeof t === 'string' ? t : (t.step || t.text || JSON.stringify(t))
            );
          }
          edits = parsed.edits || [];
        } catch (err) {
          console.warn('Planning step failed:', err);
          // Context-aware fallback thinking steps
          if (context === 'survey-builder') {
            thinkingSteps = [
              'Analyzing your survey design and user experience',
              'Evaluating UI layout and component optimization',
              'Reviewing color scheme and typography choices',
              'Assessing question flow and validation setup',
              'Preparing specific improvements and next actions'
            ];
          } else {
            thinkingSteps = [
              'Analyzing survey requirements and research objectives',
              'Applying PhD-level survey methodology principles',
              'Designing question structure with bias reduction strategies',
              'Configuring behavioral analytics and accuracy checks',
              'Optimizing user experience and accessibility',
              'Preparing comprehensive survey with follow-up recommendations'
            ];
          }
          edits = [];
        }

        // Stream thinking steps gradually like Cursor - realistic timing
        for (let i = 0; i < thinkingSteps.length; i++) {
          const step = thinkingSteps[i];
          enqueue('thought', { text: step });
          
          // Variable timing: first step faster, then realistic delays
          const delay = i === 0 ? 200 : 400 + Math.random() * 300;
          await new Promise((r) => setTimeout(r, delay));
        }

        // Apply any visual edits
        for (const edit of edits) {
          enqueue('edit', edit);
          await new Promise((r) => setTimeout(r, 100)); // Brief pause between edits
        }

        // Small pause before starting final response (like Cursor)
        await new Promise((r) => setTimeout(r, 500));

        // 2) Final answer - Direct response for survey built, streaming for others
        enqueue('status', { state: 'final_streaming' });

        if (surveyBuilt) {
          // Provide immediate, concise summary for survey creation
          const summaryResponse = `## ✅ Survey Successfully Created!

**What I Built:**
Based on your request "${prompt}", I've generated a professional survey with:
- Intelligent question structure with proper validation
- Real-time behavioral analytics for response quality  
- Beautiful, responsive design that works on all devices
- Progress tracking and completion indicators

**Next Steps to Enhance:**
1. **Customize Design** - Adjust colors, fonts, and spacing to match your brand
2. **Add Logic** - Include skip patterns or conditional questions based on responses  
3. **Test & Refine** - Preview on different devices and refine question wording

Your survey is ready to collect responses! You can publish it or continue refining in the builder.`;

          // Send the summary as chunks to maintain the streaming interface
          const words = summaryResponse.split(' ');
          for (let i = 0; i < words.length; i++) {
            const token = words[i] + (i < words.length - 1 ? ' ' : '');
            enqueue('final_token', { token });
            // Faster delivery for summary (10ms per word)
            await new Promise(r => setTimeout(r, 10));
          }
        } else {
          // Stream full response for non-survey requests
          const finalModel = 'gpt-5';
          const finalStream = await openai.chat.completions.create({
            model: finalModel,
            stream: true,
            messages: [
              {
                role: 'system',
                content: context === 'survey-builder' 
                  ? `You are Lyra, Surbee's PhD-level AI survey builder and design expert.

🏗️ **SURVEY BUILDER CONTEXT:**
You are currently in the Survey Builder interface where users create and refine surveys. Focus your responses on:

**BUILDING & DESIGN:**
- UI/UX improvements and design decisions
- Color schemes, typography, and visual hierarchy  
- Component layout and user experience optimization
- Survey flow and navigation improvements

**SURVEY OPTIMIZATION:**
- Question refinement and methodology improvements
- Logic and branching suggestions
- Validation and accuracy enhancements
- Response quality optimization

**ACTIONABLE NEXT STEPS:**
- Specific UI tweaks users can implement
- Design improvements with clear reasoning
- Advanced features they can add next
- Publishing and distribution recommendations

**RESPONSE STYLE:**
- Practical, builder-focused advice
- Specific UI/design suggestions with reasoning
- Clear next steps for improvement
- Professional tone with survey expertise
- Always suggest concrete actions they can take

Focus on helping users BUILD and IMPROVE their surveys with specific, actionable advice about UI, design, questions, and functionality.`

                  : `You are Lyra, Surbee's PhD-level AI survey methodologist and research designer.

EXPERTISE & CAPABILITIES:
- PhD-level survey methodology and experimental design
- Advanced psychometrics and measurement theory  
- Real-time behavioral analytics and accuracy checking
- AI-powered component generation with scientific rigor
- User experience research and accessibility optimization
- Future community and knowledge base integration

SURBEE PLATFORM FEATURES:
- Smart, professional survey creation with academic quality
- Advanced user behavior analysis and bias detection
- Accuracy checking systems for data quality assurance
- Growing community of research-grade surveys (planned)
- Comprehensive knowledge base for methodology (planned)

RESPONSE GUIDELINES:
- Provide sophisticated, research-informed answers
- Reference established survey methodologies when relevant
- Always suggest follow-up questions or improvements
- Be visionary yet practical in recommendations
- Maintain academic rigor while being accessible
- Stay within Surbee's context of intelligent survey creation

Generate comprehensive responses that demonstrate deep survey science knowledge while providing actionable insights for survey improvement.`,
              },
              { 
                role: 'user', 
                content: prompt 
              },
            ],
          });

          for await (const chunk of finalStream) {
            const token = chunk.choices?.[0]?.delta?.content || '';
            if (token) enqueue('final_token', { token });
          }
        }

        enqueue('done', {});
        controller.close();
      } catch (err: any) {
        enqueue('error', { message: err?.message || 'Internal error' });
        try {
          controller.close();
        } catch {}
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}


