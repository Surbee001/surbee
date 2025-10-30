import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
export const runtime = 'nodejs'

// Encoder params (JSON) can be bundled safely
import cl100k from '@dqbd/tiktoken/encoders/cl100k_base.json' assert { type: 'json' }
import o200k from '@dqbd/tiktoken/encoders/o200k_base.json' assert { type: 'json' }

let TiktokenCtor: any | null = null
let initPromise: Promise<void> | null = null

async function ensureTiktokenLoaded() {
  if (TiktokenCtor) return
  if (!initPromise) {
    initPromise = (async () => {
      try {
        const { init } = await import('@dqbd/tiktoken/lite/init')

        const fs = await import('fs')
        const path = await import('path')
        let wasmPath = path.resolve(process.cwd(), 'node_modules', '@dqbd', 'tiktoken', 'lite', 'tiktoken_bg.wasm')
        try {
          const { createRequire } = await import('module')
          const req = createRequire(import.meta.url)
          wasmPath = req.resolve('@dqbd/tiktoken/lite/tiktoken_bg.wasm')
        } catch {}

        const wasm = await fs.promises.readFile(wasmPath)
        await init((imports) => WebAssembly.instantiate(wasm, imports))
        const { Tiktoken } = await import('@dqbd/tiktoken/lite')
        TiktokenCtor = Tiktoken as any
      } catch {
        TiktokenCtor = null
      }
    })()
  }
  await initPromise
}

function selectEncoder(model?: string) {
  const m = (model || '').toLowerCase()
  const useO200k = m.includes('gpt-5') || m.includes('gpt-4o') || m.includes('200k') || m.includes('o200k')
  const cfg = useO200k ? (o200k as any) : (cl100k as any)
  return new (TiktokenCtor as any)(cfg.bpe_ranks, cfg.special_tokens, cfg.pat_str)
}

export async function POST(req: NextRequest) {
  try {
    const { text, model } = await req.json()
    const input = typeof text === 'string' ? text : String(text || '')

    await ensureTiktokenLoaded()

    if (!TiktokenCtor) {
      const approx = Math.ceil(input.trim().length / 4)
      return NextResponse.json({ ok: true, count: approx, approx: true })
    }

    const enc = selectEncoder(model)
    const tokens = enc.encode(input)
    const count = tokens.length
    enc.free()
    return NextResponse.json({ ok: true, count })
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || 'tokenize failed' }, { status: 500 })
  }
}
