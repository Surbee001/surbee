import { NextRequest, NextResponse } from 'next/server'
import { createSurveyWorker } from '../../../../../../lib/queue/index'
// Use existing pipeline
import { runSurveyGenerationPipeline } from '../../../../../../lib/surbee/pipeline'

let started = false

function ensureWorker() {
  if (started) return
  createSurveyWorker(async (data) => {
    const result = await runSurveyGenerationPipeline(data)
    return result
  })
  started = true
}

export async function GET(_req: NextRequest) {
  ensureWorker()
  return NextResponse.json({ success: true, worker: 'running' })
}

