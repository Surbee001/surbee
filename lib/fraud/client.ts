import fetch from 'next/dist/compiled/node-fetch'

export interface FraudSignalInput {
  ip?: string
  userAgent?: string
  responseTimeMs?: number
  pointerVelocityAvg?: number
  pasteEvents?: number
  duplicateResponsesWindowMin?: number
}

export interface FraudAssessmentResult {
  riskScore: number // 0-100
  reasons: string[]
  action: 'allow' | 'flag' | 'block'
}

export async function assessFraudSignals(
  input: FraudSignalInput,
): Promise<FraudAssessmentResult> {
  const url = process.env.FRAUD_API_URL
  if (!url) return { riskScore: 0, reasons: [], action: 'allow' }

  const res = await fetch(url + '/assess', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.FRAUD_API_KEY || '' },
    body: JSON.stringify(input),
  })

  if (!res.ok) {
    return { riskScore: 0, reasons: ['service_unavailable'], action: 'allow' }
  }

  const data = (await res.json()) as FraudAssessmentResult
  return data
}

