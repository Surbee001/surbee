import { analyzeBehavioralData } from '@/lib/ml/fraud-detection'

function generateRealisticMouseData() {
  return Array.from({ length: 50 }).map((_, i) => ({ x: i * 5, y: i * 3, timestamp: i * 200 }))
}

function generateRealisticKeystrokeData() {
  return Array.from({ length: 30 }).map((_, i) => ({ key: 'a', timestamp: i * 150, dwell_time: 80, flight_time: 120 }))
}

function generateDeviceFingerprint() {
  return { is_mobile: false, screen_width: 1920, screen_height: 1080, color_depth: 24 }
}

describe('Fraud Detection', () => {
  it('detects rapid-fire responses', async () => {
    const suspiciousData = {
      survey_id: 'test-survey',
      response_id: 'test-response',
      response_times: [0.5, 0.3, 0.4, 0.2],
      mouse_movements: [],
      keystrokes: [],
      answer_patterns: ['A', 'A', 'A', 'A'],
      device_fingerprint: {},
      scroll_events: [],
    }
    const result = await analyzeBehavioralData(suspiciousData as any)
    expect(result.is_suspicious).toBe(true)
    expect(result.risk_factors).toEqual(expect.arrayContaining(['Extremely fast response times', 'Repetitive answer patterns']))
  })

  it('allows legitimate responses', async () => {
    const legitimateData = {
      survey_id: 'test-survey',
      response_id: 'test-response',
      response_times: [5.2, 3.8, 7.1, 4.5],
      mouse_movements: generateRealisticMouseData(),
      keystrokes: generateRealisticKeystrokeData(),
      answer_patterns: ['A', 'B', 'C', 'A'],
      device_fingerprint: generateDeviceFingerprint(),
      scroll_events: [],
    }
    const result = await analyzeBehavioralData(legitimateData as any)
    expect(result.is_suspicious).toBe(false)
    expect(result.fraud_probability).toBeLessThan(0.5)
  })
})

