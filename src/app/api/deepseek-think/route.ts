import { NextRequest } from 'next/server';
import { DeepSeekClient } from '@/lib/deepsite/deepseek-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function sse(event: string, data: any): string {
  return `event: ${event}\n` + `data: ${JSON.stringify(data)}\n\n`;
}

export async function GET(req: NextRequest) {
  const prompt = req.nextUrl.searchParams.get('prompt') || '';
  const context = req.nextUrl.searchParams.get('context') || '';
  const projectId = req.nextUrl.searchParams.get('projectId') || '';
  
  console.log('=== DEEPSEEK THINK API DEBUG ===');
  console.log('prompt:', prompt);
  console.log('context:', context);

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

  // Check for DeepSeek API key
  const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
  if (!deepseekApiKey || deepseekApiKey === 'your_deepseek_api_key_here') {
    console.error('DeepSeek API key not configured');
    return new Response(sse('error', { message: 'DeepSeek API key not configured. Please check your environment variables.' }), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
      status: 500,
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

        const deepseek = new DeepSeekClient(deepseekApiKey);

        // 1) Planning step: ask model to expose thinking in JSON
        const planMessages = [
          {
            role: 'system' as const,
            content: `You are Lyra, Surbee's AI assistant. Plan your response and expose your thinking.

CRITICAL: You MUST respond with VALID JSON ONLY. No prose, no explanations, no markdown.

OUTPUT FORMAT - EXACT JSON STRUCTURE:
{
  "thinking": [
    "Analyzing user's question and context",
    "Considering the best approach to respond", 
    "Planning comprehensive and helpful answer"
  ],
  "guidance": "Brief summary of what I'll provide"
}

RULES:
- ONLY return the JSON object above
- NO additional text before or after
- NO markdown formatting
- NO explanations outside the JSON
- Keep thinking steps concise but meaningful`,
          },
          {
            role: 'user' as const,
            content: `User prompt: ${prompt}`,
          },
        ];

        let thinkingSteps: string[] = [];
        try {
          const planResponse = await deepseek.chatCompletion({
            model: 'deepseek-chat',
            messages: planMessages,
            max_tokens: 1200,
            temperature: 0.7,
          });
          
          const content = planResponse.choices[0]?.message?.content || '{}';
          const parsed = JSON.parse(content);
          
          // Handle thinking steps
          if (parsed.thinking && Array.isArray(parsed.thinking)) {
            thinkingSteps = parsed.thinking.map((t: any) => 
              typeof t === 'string' ? t : (t.step || t.text || JSON.stringify(t))
            );
          }
        } catch (err) {
          console.warn('Planning step failed:', err);
          // Fallback thinking steps with more context
          thinkingSteps = [
            'Analyzing your question about Surbee and gathering relevant context',
            'Considering the best way to explain Surbee\'s capabilities and features',
            'Structuring a comprehensive response about our survey platform',
            'Ensuring I provide accurate information about Surbee\'s AI-powered tools'
          ];
        }

        // Stream thinking steps gradually with realistic timing
        for (let i = 0; i < thinkingSteps.length; i++) {
          const step = thinkingSteps[i];
          enqueue('thought', { text: step });
          
          // Variable timing: first step faster, then realistic delays
          const delay = i === 0 ? 300 : 500 + Math.random() * 400;
          await new Promise((r) => setTimeout(r, delay));
        }

        // Small pause before starting final response
        await new Promise((r) => setTimeout(r, 600));

        // 2) Final answer - Stream response from DeepSeek
        enqueue('status', { state: 'final_streaming' });

        const finalMessages = [
          {
            role: 'system' as const,
            content: `You are Lyra, Surbee's AI assistant and survey expert.

SURBEE CONTEXT:
- Smart survey platform with AI-driven component generation  
- PhD-level survey methodology and question design
- Advanced user behavior analysis and accuracy checking systems
- Professional, academic-quality outputs with scientific rigor

RESPONSE GUIDELINES:
- Provide sophisticated, well-informed answers
- Be helpful, accurate, and comprehensive
- Use clear explanations and practical examples when appropriate
- Maintain a professional yet approachable tone
- Focus on actionable insights and recommendations

Generate thoughtful responses that demonstrate expertise while being accessible and practical.`,
          },
          { 
            role: 'user' as const, 
            content: prompt 
          },
        ];

        // Use streaming to get real-time response with error handling
        try {
          const finalStream = deepseek.chatCompletionStream({
            model: 'deepseek-chat',
            messages: finalMessages,
            max_tokens: 2048,
            temperature: 0.7,
          });

          for await (const chunk of finalStream) {
            const token = chunk.choices?.[0]?.delta?.content || '';
            if (token) enqueue('final_token', { token });
          }
        } catch (streamError) {
          console.error('DeepSeek streaming error:', streamError);
          // Fallback response if streaming fails
          const fallbackResponse = `I apologize, but I'm experiencing some technical difficulties with my AI processing. However, I can still help you with information about Surbee!

**Surbee** is an advanced AI-powered survey platform that offers:

• **Smart Survey Creation** - AI-driven component generation with professional layouts
• **PhD-level Methodology** - Built with academic-quality survey science principles  
• **Real-time Analytics** - Advanced user behavior analysis and response validation
• **Accuracy Systems** - Built-in bias detection and data quality assurance
• **Professional Results** - Generate publication-ready surveys with scientific rigor

Whether you're conducting market research, academic studies, or customer feedback collection, Surbee combines cutting-edge AI with proven survey methodology to help you gather high-quality insights.

What specific aspect of Surbee would you like to know more about?`;

          // Send fallback response word by word to maintain streaming feel
          const words = fallbackResponse.split(' ');
          for (let i = 0; i < words.length; i++) {
            const token = words[i] + (i < words.length - 1 ? ' ' : '');
            enqueue('final_token', { token });
            await new Promise(r => setTimeout(r, 50)); // Slower for fallback
          }
        }

        enqueue('done', {});
        controller.close();
      } catch (err: any) {
        console.error('DeepSeek Think API Error:', err);
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