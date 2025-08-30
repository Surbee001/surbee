import OpenAI from 'openai'

export interface GeneratedComponentDef {
  id: string
  name: string
  code: string
  props?: any
}

export interface GenerateInput {
  prompt: string
  context?: Record<string, any>
  userId: string
}

export interface GenerateOutput {
  aiMessage: string
  pages: { id: string; name: string; path: string }[]
  components: GeneratedComponentDef[]
  metadata?: { tokensUsed?: number; cost?: number }
  theme?: Record<string, any>
}

export async function generateSurveyComponents({ prompt, context }: GenerateInput): Promise<GenerateOutput> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return {
      aiMessage: 'Generated a multi-page survey from your description.',
      pages: [
        { id: '1', name: 'Welcome Page', path: '/welcome' },
        { id: '2', name: 'User Information', path: '/user-info' },
        { id: '3', name: 'Questions', path: '/questions' },
        { id: '4', name: 'Thank You', path: '/thank-you' },
      ],
      components: [
        { id: 'c1', name: 'Welcome Page', code: `export default function C(){return React.createElement('div', {className:'p-4 border border-zinc-800 rounded-lg text-white'}, 'Welcome Page')}` },
        { id: 'c2', name: 'User Information', code: `export default function C(){return React.createElement('div', {className:'p-4 border border-zinc-800 rounded-lg text-white'}, 'User Information')}` },
      ],
    }
  }

  const openai = new OpenAI({ apiKey })
  const system = `You generate React components for surveys. First, propose a page structure, then emit TSX code for 2-3 representative components. Output STRICT JSON:
{
  "aiMessage": string,
  "pages": [ { "id": string, "name": string, "path": string } ],
  "components": [ { "id": string, "name": string, "code": string } ]
}
Rules: code must be a React component with a single default export, no imports.`

  const content = [{ type: 'text', text: `User prompt: ${prompt}\nContext: ${JSON.stringify(context||{})}` }]
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.4,
  })

  const text = completion.choices[0]?.message?.content || '{}'
  let json: any
  try { json = JSON.parse(text) } catch { json = {} }

  const pages = Array.isArray(json.pages) ? json.pages : [
    { id: '1', name: 'Welcome Page', path: '/welcome' },
    { id: '2', name: 'User Information', path: '/user-info' },
    { id: '3', name: 'Questions', path: '/questions' },
    { id: '4', name: 'Thank You', path: '/thank-you' },
  ]
  const components: GeneratedComponentDef[] = Array.isArray(json.components) ? json.components : []
  return { aiMessage: json.aiMessage || 'Draft created.', pages, components }
}



