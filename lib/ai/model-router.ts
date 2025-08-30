import OpenAI from 'openai'

export type ModelTask = 'reason' | 'design' | 'code' | 'json' | 'embed'

export interface ModelChoice {
  provider: 'openai'
  model: string
  task: ModelTask
}

export function chooseModel(task: ModelTask): ModelChoice {
  // Environment overrides allow flexible routing per deployment
  const map: Record<ModelTask, string | undefined> = {
    reason: process.env.OPENAI_REASONING_MODEL,
    design: process.env.OPENAI_DESIGN_MODEL,
    code: process.env.OPENAI_CODE_MODEL,
    json: process.env.OPENAI_JSON_MODEL,
    embed: process.env.OPENAI_EMBEDDINGS_MODEL,
  }

  let model = map[task]

  if (!model) {
    // Sensible defaults; keep to widely available models
    if (task === 'embed') model = 'text-embedding-3-large'
    else if (task === 'code') model = 'gpt-4o-mini'
    else if (task === 'json') model = 'gpt-4o-mini'
    else if (task === 'design') model = 'gpt-4o'
    else model = 'gpt-4o'
  }

  return { provider: 'openai', model, task }
}

export function getOpenAI(): OpenAI {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

export async function chatJson(params: {
  model: string
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[]
  temperature?: number
  max_tokens?: number
}): Promise<any> {
  const openai = getOpenAI()
  const completion = await openai.chat.completions.create({
    model: params.model,
    messages: params.messages,
    temperature: params.temperature ?? 0.4,
    max_tokens: params.max_tokens ?? 1000,
    response_format: { type: 'json_object' } as any,
  })
  const content = completion.choices[0]?.message?.content || '{}'
  try {
    return JSON.parse(content)
  } catch {
    return { error: 'invalid_json', raw: content }
  }
}

