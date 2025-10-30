export interface BehavioralDataInput {
  survey_id: string
  response_id: string
  response_times: number[]
  mouse_movements: any[]
  keystrokes: any[]
  answer_patterns: string[]
  device_fingerprint: any
  scroll_events: any[]
}

export async function analyzeBehavioralData(data: BehavioralDataInput) {
  const avgTime = data.response_times.length
    ? data.response_times.reduce((a, b) => a + b, 0) / data.response_times.length
    : 0
  const risk_factors: string[] = []
  if (avgTime < 2.0 && data.response_times.length > 0) {
    risk_factors.push('Extremely fast response times')
  }
  if (data.answer_patterns?.length) {
    let maxStreak = 1
    let streak = 1
    for (let i = 1; i < data.answer_patterns.length; i++) {
      streak = data.answer_patterns[i] === data.answer_patterns[i - 1] ? streak + 1 : 1
      if (streak > maxStreak) maxStreak = streak
    }
    if (maxStreak > data.answer_patterns.length * 0.5) {
      risk_factors.push('Repetitive answer patterns')
    }
  }
  const prob = Math.min(1, Math.max(0, (2 - avgTime) / 2))
  const is_suspicious = prob > 0.5 || risk_factors.length > 0
  return { is_suspicious, fraud_probability: prob, risk_factors }
}

