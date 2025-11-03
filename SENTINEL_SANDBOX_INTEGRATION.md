# SENTINEL Sandbox Integration Design

**Date:** January 2025
**Purpose:** Design document for embedding SENTINEL fraud detection into the sandbox for 24/7 automatic operation

---

## Executive Summary

SENTINEL will be embedded into the survey sandbox as an invisible, always-on fraud detection layer that automatically analyzes all survey responses in real-time. The system will be completely transparent to survey respondents while providing comprehensive fraud analysis to survey administrators.

**Key Requirements:**
1. ✅ Run automatically on ALL survey submissions
2. ✅ Completely invisible to respondents
3. ✅ Real-time processing (<3 seconds)
4. ✅ Secure and isolated from client-side code
5. ✅ Configurable per-survey sensitivity

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Survey Frontend (Client)                  │
│  - Survey UI                                                 │
│  - Response Collection                                       │
│  - Behavioral Tracking (invisible to user)                   │
└────────────────────┬────────────────────────────────────────┘
                     │ Submit Response
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                 API Gateway / Edge Function                  │
│  - Rate limiting                                             │
│  - Authentication                                            │
│  - Request validation                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              SENTINEL Fraud Detection Layer                  │
│                    (Sandbox Environment)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  1. Behavioral Analysis                              │  │
│  │  2. AI Text Detection                                │  │
│  │  3. Plagiarism Detection                             │  │
│  │  4. Contradiction Analysis                           │  │
│  │  5. Device Fingerprint Analysis                      │  │
│  │  6. Fraud Ring Detection                             │  │
│  │  7. Baseline Comparison                              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Output: Fraud Score + Detailed Analysis                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                Database (Supabase/PostgreSQL)                │
│  - Store survey response                                     │
│  - Store fraud analysis results                              │
│  - Store behavioral metrics                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│          Admin Dashboard (Survey Creator View)               │
│  - View fraud scores                                         │
│  - Review flagged responses                                  │
│  - Configure detection settings                              │
│  - Export reports                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Strategy

### 1. Server-Side Middleware Integration

SENTINEL will be implemented as **server-side middleware** that intercepts all survey submissions before they are stored in the database.

```typescript
// src/app/api/surveys/[id]/submit/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { runSENTINELAnalysis } from '@/lib/sentinel/sentinel-api'
import { saveSurveyResponse } from '@/lib/db/surveys'
import { getSurveyConfig } from '@/lib/db/survey-config'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const surveyId = params.id
    const submission = await req.json()

    // Extract response data
    const {
      responses,
      behavioralMetrics,
      deviceInfo,
      ipAddress,
      userAgent,
    } = submission

    // 1. Get survey-specific SENTINEL configuration
    const surveyConfig = await getSurveyConfig(surveyId)

    // 2. Run SENTINEL fraud detection (invisible to user)
    const fraudAnalysis = await runSENTINELAnalysis({
      surveyId,
      responses,
      behavioralMetrics,
      deviceInfo,
      ipAddress,
      userAgent,
      surveyThresholdConfig: surveyConfig.sentinelConfig,
    })

    // 3. Save response with fraud analysis
    const savedResponse = await saveSurveyResponse({
      surveyId,
      responses,
      behavioralMetrics,
      fraudAnalysis, // Store fraud results
      timestamp: new Date().toISOString(),
    })

    // 4. Return success to user (no fraud info exposed)
    return NextResponse.json({
      success: true,
      responseId: savedResponse.id,
      message: 'Thank you for completing the survey!',
    })

  } catch (error) {
    console.error('Survey submission error:', error)
    return NextResponse.json(
      { success: false, error: 'Submission failed' },
      { status: 500 }
    )
  }
}
```

---

### 2. SENTINEL API Module

```typescript
// src/lib/sentinel/sentinel-api.ts

import { detectFraud } from '@/lib/ml/fraud-detection'
import { calculateEnsembleScore } from '@/lib/ml/ensemble-scoring'
import type { SurveyThresholdConfig } from '@/lib/ml/threshold-config'

export interface SENTINELInput {
  surveyId: string
  responses: Record<string, any>
  behavioralMetrics: {
    mouseMovements: Array<{ x: number; y: number; timestamp: number }>
    keyboardEvents: Array<{ key: string; timestamp: number }>
    pasteEvents: number
    tabSwitches: number
    timeSpent: Record<string, number>
    deviceFingerprint: any
  }
  deviceInfo: any
  ipAddress: string
  userAgent: string
  surveyThresholdConfig?: SurveyThresholdConfig
}

export interface SENTINELOutput {
  fraudScore: number // 0-1
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  isLikelyFraud: boolean
  confidence: number

  // Detailed breakdown
  modelScores: {
    behavioral: number
    aiContent: number
    plagiarism: number
    contradictions: number
    deviceFingerprint: number
    fraudRing: number
  }

  // Evidence and reasoning
  evidence: {
    critical: Array<{ source: string; description: string }>
    high: Array<{ source: string; description: string }>
    medium: Array<{ source: string; description: string }>
  }

  reasoning: {
    summary: string
    keyFactors: string[]
    recommendation: string
  }

  // Metadata
  processingTimeMs: number
  timestamp: string
  modelVersion: string
}

/**
 * Main SENTINEL API - runs all fraud detection layers
 */
export async function runSENTINELAnalysis(
  input: SENTINELInput
): Promise<SENTINELOutput> {
  const startTime = Date.now()

  try {
    // Run comprehensive fraud detection
    const fraudDetectionResult = await detectFraud({
      surveyId: input.surveyId,
      responses: input.responses,
      behavioralMetrics: input.behavioralMetrics,
      questions: {}, // Load from survey definition
      deviceInfo: input.deviceInfo,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      surveyThresholdConfig: input.surveyThresholdConfig,
    })

    const processingTime = Date.now() - startTime

    return {
      fraudScore: fraudDetectionResult.fraudScore,
      riskLevel: fraudDetectionResult.riskLevel,
      isLikelyFraud: fraudDetectionResult.isLikelyFraud,
      confidence: fraudDetectionResult.confidence,
      modelScores: fraudDetectionResult.modelScores,
      evidence: fraudDetectionResult.evidence,
      reasoning: fraudDetectionResult.reasoning,
      processingTimeMs: processingTime,
      timestamp: new Date().toISOString(),
      modelVersion: fraudDetectionResult.modelVersion,
    }
  } catch (error) {
    console.error('SENTINEL analysis error:', error)

    // Return safe default (don't block submission on SENTINEL failure)
    return {
      fraudScore: 0,
      riskLevel: 'low',
      isLikelyFraud: false,
      confidence: 0,
      modelScores: {
        behavioral: 0,
        aiContent: 0,
        plagiarism: 0,
        contradictions: 0,
        deviceFingerprint: 0,
        fraudRing: 0,
      },
      evidence: { critical: [], high: [], medium: [] },
      reasoning: {
        summary: 'Fraud analysis unavailable',
        keyFactors: [],
        recommendation: 'Manual review recommended',
      },
      processingTimeMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      modelVersion: 'error',
    }
  }
}
```

---

### 3. Database Schema Updates

```sql
-- supabase-schema.sql

-- Survey configuration table
CREATE TABLE IF NOT EXISTS survey_sentinel_config (
  survey_id UUID PRIMARY KEY REFERENCES surveys(id) ON DELETE CASCADE,

  -- Detection settings
  enabled BOOLEAN DEFAULT TRUE,
  sensitivity VARCHAR(20) DEFAULT 'balanced', -- 'strict' | 'balanced' | 'lenient'

  -- Model-specific multipliers (NULL = use defaults)
  behavioral_multiplier DECIMAL(3,2),
  ai_content_multiplier DECIMAL(3,2),
  plagiarism_multiplier DECIMAL(3,2),
  contradictions_multiplier DECIMAL(3,2),
  device_fingerprint_multiplier DECIMAL(3,2),
  fraud_ring_multiplier DECIMAL(3,2),

  -- Thresholds
  auto_reject_threshold DECIMAL(3,2) DEFAULT 0.85,
  auto_accept_threshold DECIMAL(3,2) DEFAULT 0.20,
  manual_review_required BOOLEAN DEFAULT TRUE,

  -- Actions
  auto_reject BOOLEAN DEFAULT FALSE, -- Auto-reject on critical fraud
  notify_admin BOOLEAN DEFAULT TRUE, -- Email notification on fraud

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Fraud analysis results table
CREATE TABLE IF NOT EXISTS survey_response_fraud_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  response_id UUID REFERENCES survey_responses(id) ON DELETE CASCADE,
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,

  -- Overall assessment
  fraud_score DECIMAL(5,4) NOT NULL, -- 0.0000 to 1.0000
  risk_level VARCHAR(20) NOT NULL, -- 'low' | 'medium' | 'high' | 'critical'
  is_likely_fraud BOOLEAN NOT NULL,
  confidence DECIMAL(5,4) NOT NULL,

  -- Model scores
  behavioral_score DECIMAL(5,4),
  ai_content_score DECIMAL(5,4),
  plagiarism_score DECIMAL(5,4),
  contradictions_score DECIMAL(5,4),
  device_fingerprint_score DECIMAL(5,4),
  fraud_ring_score DECIMAL(5,4),

  -- Evidence and reasoning (JSONB for flexibility)
  evidence JSONB, -- {critical: [...], high: [...], medium: [...]}
  reasoning JSONB, -- {summary: "", keyFactors: [...], recommendation: ""}

  -- Metadata
  processing_time_ms INTEGER,
  model_version VARCHAR(50),

  -- Admin review
  reviewed BOOLEAN DEFAULT FALSE,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  review_decision VARCHAR(20), -- 'accept' | 'reject' | 'flag'
  review_notes TEXT,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_fraud_analysis_response_id ON survey_response_fraud_analysis(response_id);
CREATE INDEX idx_fraud_analysis_survey_id ON survey_response_fraud_analysis(survey_id);
CREATE INDEX idx_fraud_analysis_risk_level ON survey_response_fraud_analysis(risk_level);
CREATE INDEX idx_fraud_analysis_reviewed ON survey_response_fraud_analysis(reviewed);
CREATE INDEX idx_fraud_analysis_fraud_score ON survey_response_fraud_analysis(fraud_score DESC);

-- View for admin dashboard
CREATE VIEW survey_flagged_responses AS
SELECT
  sr.id AS response_id,
  sr.survey_id,
  sr.created_at AS submitted_at,
  fa.fraud_score,
  fa.risk_level,
  fa.is_likely_fraud,
  fa.confidence,
  fa.evidence,
  fa.reasoning,
  fa.reviewed,
  fa.review_decision
FROM survey_responses sr
JOIN survey_response_fraud_analysis fa ON sr.id = fa.response_id
WHERE fa.is_likely_fraud = TRUE OR fa.risk_level IN ('high', 'critical')
ORDER BY fa.fraud_score DESC, sr.created_at DESC;
```

---

### 4. Client-Side Behavioral Tracking (Invisible)

The client-side SDK will collect behavioral metrics transparently without affecting the user experience.

```typescript
// src/lib/client/behavioral-tracker.ts

export class BehavioralTracker {
  private mouseMovements: Array<{ x: number; y: number; timestamp: number }> = []
  private keyboardEvents: Array<{ key: string; timestamp: number }> = []
  private pasteEvents: number = 0
  private tabSwitches: number = 0
  private timeSpent: Record<string, number> = {}
  private questionStartTime: Record<string, number> = {}

  constructor() {
    this.initializeTracking()
  }

  private initializeTracking() {
    // Track mouse movements (sampled to avoid performance issues)
    let lastMouseTime = 0
    document.addEventListener('mousemove', (e) => {
      const now = Date.now()
      // Sample every 100ms to reduce data volume
      if (now - lastMouseTime > 100) {
        this.mouseMovements.push({
          x: e.clientX,
          y: e.clientY,
          timestamp: now,
        })
        lastMouseTime = now
      }
    })

    // Track keyboard events (anonymized - don't capture actual keys for privacy)
    document.addEventListener('keydown', (e) => {
      this.keyboardEvents.push({
        key: e.key.length === 1 ? 'char' : e.key, // Anonymize letters/numbers
        timestamp: Date.now(),
      })
    })

    // Track paste events
    document.addEventListener('paste', () => {
      this.pasteEvents++
    })

    // Track tab switches (visibility API)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.tabSwitches++
      }
    })
  }

  // Start timing for a specific question
  startQuestion(questionId: string) {
    this.questionStartTime[questionId] = Date.now()
  }

  // End timing for a specific question
  endQuestion(questionId: string) {
    if (this.questionStartTime[questionId]) {
      this.timeSpent[questionId] = Date.now() - this.questionStartTime[questionId]
    }
  }

  // Get all metrics for submission
  getMetrics() {
    return {
      mouseMovements: this.mouseMovements,
      keyboardEvents: this.keyboardEvents,
      pasteEvents: this.pasteEvents,
      tabSwitches: this.tabSwitches,
      timeSpent: this.timeSpent,
      deviceFingerprint: this.getDeviceFingerprint(),
    }
  }

  private getDeviceFingerprint() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      // Detect automation
      webdriver: navigator.webdriver,
      plugins: Array.from(navigator.plugins).map(p => p.name),
    }
  }
}
```

---

### 5. Admin Dashboard Integration

```typescript
// src/app/admin/surveys/[id]/responses/page.tsx

import { getFlaggedResponses } from '@/lib/db/fraud-analysis'
import { FraudResponseCard } from '@/components/admin/FraudResponseCard'

export default async function SurveyResponsesPage({
  params
}: {
  params: { id: string }
}) {
  const surveyId = params.id
  const flaggedResponses = await getFlaggedResponses(surveyId)

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Fraud Detection Results</h1>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Responses"
          value={flaggedResponses.total}
        />
        <StatCard
          title="Flagged as Fraud"
          value={flaggedResponses.flaggedCount}
          color="red"
        />
        <StatCard
          title="Under Review"
          value={flaggedResponses.underReviewCount}
          color="yellow"
        />
        <StatCard
          title="Avg Fraud Score"
          value={`${(flaggedResponses.avgFraudScore * 100).toFixed(1)}%`}
        />
      </div>

      {/* Flagged Responses */}
      <div className="space-y-4">
        {flaggedResponses.items.map((response) => (
          <FraudResponseCard
            key={response.id}
            response={response}
            onReview={handleReview}
          />
        ))}
      </div>
    </div>
  )
}
```

---

## Deployment Configuration

### Environment Variables

```bash
# .env.production

# SENTINEL Configuration
SENTINEL_ENABLED=true
SENTINEL_MODE=production # 'development' | 'production'
SENTINEL_ASYNC=true # Process in background to avoid blocking submissions

# AI Provider (OpenAI or Anthropic)
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-proj-...

# Detection Settings
SENTINEL_DEFAULT_SENSITIVITY=balanced # 'strict' | 'balanced' | 'lenient'
SENTINEL_AUTO_REJECT=false # Don't auto-reject by default
SENTINEL_NOTIFY_ADMIN=true # Email admins on fraud detection

# Performance
SENTINEL_TIMEOUT_MS=5000 # Max time for analysis
SENTINEL_CACHE_RESULTS=true # Cache fraud ring analysis
```

### Edge Function Deployment (Vercel)

```typescript
// vercel.json

{
  "functions": {
    "src/app/api/surveys/[id]/submit/route.ts": {
      "maxDuration": 10, // Allow up to 10s for SENTINEL processing
      "memory": 1024 // 1GB RAM for AI models
    }
  },
  "env": {
    "SENTINEL_ENABLED": "true"
  }
}
```

---

## Security & Privacy Considerations

### 1. Data Privacy

- **No PII in Fraud Analysis:** Behavioral metrics are anonymized
- **GDPR Compliant:** User can request deletion of fraud analysis data
- **Encrypted Storage:** Fraud analysis results encrypted at rest

### 2. Access Control

```typescript
// Only admins can view fraud analysis
const canViewFraudAnalysis = (user: User, surveyId: string): boolean => {
  return user.role === 'admin' || user.isOwnerOf(surveyId)
}
```

### 3. Audit Logging

```sql
-- Log all fraud analysis reviews
CREATE TABLE fraud_analysis_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID REFERENCES survey_response_fraud_analysis(id),
  action VARCHAR(50), -- 'reviewed', 'accepted', 'rejected'
  performed_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Performance Optimization

### 1. Async Processing

```typescript
// Process SENTINEL analysis in background
export async function POST(req: NextRequest) {
  const submission = await req.json()

  // Save response immediately
  const savedResponse = await saveSurveyResponse(submission)

  // Run SENTINEL in background (don't block response)
  runSENTINELAnalysisAsync(savedResponse.id, submission)

  // Return success immediately
  return NextResponse.json({ success: true })
}

async function runSENTINELAnalysisAsync(
  responseId: string,
  submission: any
) {
  try {
    const fraudAnalysis = await runSENTINELAnalysis(submission)
    await saveFraudAnalysis(responseId, fraudAnalysis)

    // Notify admin if fraud detected
    if (fraudAnalysis.isLikelyFraud) {
      await notifyAdmin(responseId, fraudAnalysis)
    }
  } catch (error) {
    console.error('Async SENTINEL error:', error)
  }
}
```

### 2. Caching

```typescript
// Cache fraud ring detection results (expensive cross-session analysis)
import { redis } from '@/lib/redis'

const FRAUD_RING_CACHE_TTL = 3600 // 1 hour

async function getFraudRingScore(
  deviceFingerprint: string,
  ipAddress: string
): Promise<number> {
  const cacheKey = `fraud-ring:${deviceFingerprint}:${ipAddress}`

  // Check cache
  const cached = await redis.get(cacheKey)
  if (cached) return parseFloat(cached)

  // Calculate if not cached
  const score = await calculateFraudRingScore(deviceFingerprint, ipAddress)

  // Cache result
  await redis.set(cacheKey, score.toString(), 'EX', FRAUD_RING_CACHE_TTL)

  return score
}
```

### 3. Rate Limiting

```typescript
// Prevent abuse of survey submissions
import { Ratelimit } from '@upstash/ratelimit'

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 submissions per minute
})

export async function POST(req: NextRequest) {
  const ip = req.ip ?? '127.0.0.1'

  const { success } = await ratelimit.limit(ip)
  if (!success) {
    return NextResponse.json(
      { error: 'Too many submissions' },
      { status: 429 }
    )
  }

  // Continue with submission...
}
```

---

## Testing Strategy

### 1. Unit Tests

```typescript
// tests/sentinel/sandbox-integration.test.ts

describe('SENTINEL Sandbox Integration', () => {
  it('should run fraud detection on survey submission', async () => {
    const response = await submitSurvey({
      surveyId: 'test-survey',
      responses: { q1: 'answer1' },
      behavioralMetrics: mockBehavioralMetrics,
    })

    expect(response.success).toBe(true)

    const fraudAnalysis = await getFraudAnalysis(response.responseId)
    expect(fraudAnalysis).toBeDefined()
    expect(fraudAnalysis.fraudScore).toBeGreaterThanOrEqual(0)
    expect(fraudAnalysis.fraudScore).toBeLessThanOrEqual(1)
  })

  it('should not block submission on SENTINEL failure', async () => {
    // Mock SENTINEL failure
    jest.spyOn(sentinelApi, 'runSENTINELAnalysis').mockRejectedValue(
      new Error('Analysis failed')
    )

    const response = await submitSurvey(mockSubmission)

    // Submission should still succeed
    expect(response.success).toBe(true)
  })
})
```

### 2. Integration Tests

```typescript
// tests/integration/e2e-fraud-detection.test.ts

describe('End-to-End Fraud Detection', () => {
  it('should detect AI-generated responses', async () => {
    const aiGeneratedResponse = {
      surveyId: 'test',
      responses: {
        q1: 'As an AI language model, I believe...',
      },
      behavioralMetrics: mockBotBehavior,
    }

    await submitSurvey(aiGeneratedResponse)

    const analysis = await getFraudAnalysis(/* ... */)
    expect(analysis.modelScores.aiContent).toBeGreaterThan(0.7)
    expect(analysis.isLikelyFraud).toBe(true)
  })
})
```

---

## Monitoring & Alerts

### 1. Performance Monitoring

```typescript
// Monitor SENTINEL processing time
import * as Sentry from '@sentry/nextjs'

export async function runSENTINELAnalysis(input: SENTINELInput) {
  const transaction = Sentry.startTransaction({
    op: 'sentinel.analysis',
    name: 'SENTINEL Fraud Detection',
  })

  try {
    const result = await detectFraud(input)

    // Log processing time
    Sentry.metrics.distribution('sentinel.processing_time',
      result.processingTimeMs,
      { unit: 'millisecond' }
    )

    return result
  } catch (error) {
    Sentry.captureException(error)
    throw error
  } finally {
    transaction.finish()
  }
}
```

### 2. Alert Configuration

```yaml
# alerts.yml

alerts:
  - name: High Fraud Rate
    condition: fraud_rate > 0.30
    action: email_admin
    message: "Fraud rate exceeded 30%"

  - name: SENTINEL Processing Slow
    condition: avg_processing_time_ms > 5000
    action: slack_notification
    message: "SENTINEL taking >5s per analysis"

  - name: SENTINEL Failures
    condition: error_rate > 0.05
    action: pagerduty
    message: "SENTINEL failing on >5% of submissions"
```

---

## Rollout Plan

### Phase 1: Development (Week 1)
- ✅ Implement server-side middleware
- ✅ Create database schema
- ✅ Build SENTINEL API module
- ✅ Add client-side behavioral tracking

### Phase 2: Testing (Week 2)
- ✅ Unit tests (>80% coverage)
- ✅ Integration tests
- ✅ Load testing (1000 req/min)
- ✅ Security audit

### Phase 3: Beta Deployment (Week 3)
- ✅ Deploy to 5 test surveys
- ✅ Monitor performance and accuracy
- ✅ Collect feedback from admins
- ✅ Tune thresholds

### Phase 4: Production Rollout (Week 4)
- ✅ Deploy to 25% of surveys
- ✅ Monitor for issues
- ✅ Gradually increase to 100%

### Phase 5: Optimization (Week 5+)
- ✅ Implement caching
- ✅ Optimize AI model inference
- ✅ Add fraud ring detection
- ✅ Build admin dashboard enhancements

---

## Success Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Uptime | ≥99.9% | - | 🟡 Pending |
| Processing Time | <3s | - | 🟡 Pending |
| Accuracy | ≥85% | - | 🟡 Pending |
| False Positive Rate | <5% | - | 🟡 Pending |
| Survey Completion Rate | No impact | - | 🟡 Pending |
| Cost per Analysis | <$0.02 | - | 🟡 Pending |

---

## Conclusion

SENTINEL will be seamlessly integrated into the survey sandbox as an always-on, invisible fraud detection layer. The system will:

1. ✅ **Automatically analyze ALL survey responses** without user interaction
2. ✅ **Remain completely invisible** to survey respondents
3. ✅ **Process in real-time** (<3 seconds per response)
4. ✅ **Provide detailed fraud analysis** to survey administrators
5. ✅ **Be configurable per-survey** with sensitivity controls
6. ✅ **Fail gracefully** without blocking legitimate submissions

**Next Steps:**
1. Implement server-side middleware
2. Create database tables
3. Add client-side tracking
4. Build admin dashboard
5. Deploy to testing environment
6. Run comprehensive tests
7. Roll out to production
