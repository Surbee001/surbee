# SENTINEL SDK for Developers

**Date:** January 2025
**Purpose:** Developer SDK for integrating SENTINEL fraud detection into third-party applications

---

## Executive Summary

The SENTINEL SDK allows developers to integrate our 7-layer fraud detection system into their own survey platforms, forms, and data collection systems using simple API calls. Developers use their own Surbee API keys, and SENTINEL runs on our infrastructure.

**Key Features:**
- 🚀 RESTful API with JSON responses
- 🔐 Secure API key authentication
- 📦 Client libraries for popular languages
- 📊 Real-time fraud detection (<3s)
- 💰 Pay-per-use pricing ($0.003-0.02 per analysis)
- 📖 Comprehensive documentation and examples

---

## Quick Start

### 1. Get Your API Key

```bash
# Sign up at https://surbee.com/sentinel
# Navigate to Settings > API Keys
# Create new API key

API_KEY=sk_live_abc123...
```

### 2. Make Your First Request

```bash
curl -X POST https://api.surbee.com/v1/sentinel/analyze \
  -H "Authorization: Bearer sk_live_abc123..." \
  -H "Content-Type: application/json" \
  -d '{
    "responses": {
      "q1": "What is your experience with our product?",
      "answer1": "I absolutely love it! Best product ever."
    },
    "behavioralMetrics": {
      "timeSpent": {"q1": 5000},
      "pasteEvents": 0,
      "tabSwitches": 0
    }
  }'
```

### 3. Get Results

```json
{
  "fraudScore": 0.15,
  "riskLevel": "low",
  "isLikelyFraud": false,
  "confidence": 0.85,
  "modelScores": {
    "behavioral": 0.12,
    "aiContent": 0.18,
    "plagiarism": 0.10,
    "contradictions": 0.05
  },
  "reasoning": {
    "summary": "This response appears legitimate...",
    "recommendation": "ACCEPT"
  }
}
```

---

## API Reference

### Base URL

```
Production: https://api.surbee.com/v1
Sandbox: https://api-sandbox.surbee.com/v1
```

### Authentication

All API requests require authentication via Bearer token:

```
Authorization: Bearer YOUR_API_KEY
```

### Endpoints

#### 1. Analyze Survey Response

```http
POST /sentinel/analyze
```

Analyzes a survey response for fraud indicators.

**Request Body:**

```typescript
{
  // Required: Survey responses
  responses: Record<string, any>

  // Optional: Question text for context
  questions?: Record<string, string>

  // Optional: Behavioral tracking data
  behavioralMetrics?: {
    mouseMovements?: Array<{ x: number; y: number; timestamp: number }>
    keyboardEvents?: Array<{ key: string; timestamp: number }>
    pasteEvents?: number
    tabSwitches?: number
    timeSpent?: Record<string, number> // milliseconds per question
    deviceFingerprint?: any
  }

  // Optional: Configuration
  config?: {
    sensitivity?: 'strict' | 'balanced' | 'lenient'
    autoReject?: boolean
    detailedReasons?: boolean // Include detailed AI reasoning
  }
}
```

**Response:**

```typescript
{
  // Overall fraud assessment
  fraudScore: number // 0-1
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  isLikelyFraud: boolean
  confidence: number // 0-1

  // Breakdown by detection method
  modelScores: {
    behavioral: number
    aiContent: number
    plagiarism: number
    contradictions: number
    deviceFingerprint: number
    fraudRing: number
  }

  // Evidence and reasoning
  evidence?: {
    critical: Array<{ source: string; description: string }>
    high: Array<{ source: string; description: string }>
    medium: Array<{ source: string; description: string }>
  }

  reasoning: {
    summary: string
    keyFactors: string[]
    recommendation: 'accept' | 'review' | 'flag' | 'reject'
  }

  // Metadata
  processingTimeMs: number
  timestamp: string
  creditsUsed: number
}
```

**Example Request:**

```json
{
  "responses": {
    "q1": "How would you describe your experience?",
    "a1": "As an AI language model, I believe the experience was comprehensive and well-structured.",
    "q2": "What did you like most?",
    "a2": "The user interface was intuitive and easy to navigate."
  },
  "questions": {
    "q1": "How would you describe your experience with our product?",
    "q2": "What feature did you like the most?"
  },
  "behavioralMetrics": {
    "timeSpent": { "q1": 2000, "q2": 1500 },
    "pasteEvents": 2,
    "tabSwitches": 5
  },
  "config": {
    "sensitivity": "balanced",
    "detailedReasons": true
  }
}
```

**Example Response:**

```json
{
  "fraudScore": 0.82,
  "riskLevel": "high",
  "isLikelyFraud": true,
  "confidence": 0.91,
  "modelScores": {
    "behavioral": 0.45,
    "aiContent": 0.95,
    "plagiarism": 0.65,
    "contradictions": 0.10,
    "deviceFingerprint": 0.30,
    "fraudRing": 0.15
  },
  "evidence": {
    "critical": [
      {
        "source": "AI Text Detection",
        "description": "Clear AI-generated content (ChatGPT/Claude)"
      }
    ],
    "high": [
      {
        "source": "Plagiarism Detection",
        "description": "Content matches web sources or previous submissions"
      }
    ],
    "medium": [
      {
        "source": "Behavioral Analysis",
        "description": "Fast completion time with high-quality responses"
      }
    ]
  },
  "reasoning": {
    "summary": "FRAUD DETECTION ASSESSMENT - HIGH RISK\n\nFinal Fraud Probability: 82.0% (Confidence: 91%)\n\n1. WHAT THE RESPONDENT DID: The respondent provided text that contains characteristic AI language patterns, including the phrase 'As an AI language model' which is a direct AI signature. The responses were completed quickly (2-3 seconds per question) despite being relatively detailed.\n\n2. WHY THIS IS SUSPICIOUS: The phrase 'As an AI language model' is exclusively used by AI assistants and never appears in genuine human responses. Additionally, the combination of very fast response times with high-quality, well-structured text is consistent with AI-generated content.\n\n3. SPECIFIC EVIDENCE:\n   - Direct AI signature phrase detected in response to Q1\n   - Perfect grammar with no natural errors\n   - Formal tone inconsistent with casual survey context\n   - 2 paste events detected (suggesting copied text)\n   - 5 tab switches (suggesting external lookup)\n\n4. SEVERITY ASSESSMENT: This case received a HIGH risk score (0.82) because multiple strong fraud indicators were detected across different detection systems. The AI content score of 0.95 is particularly damning.",
    "keyFactors": [
      "CRITICAL: Clear AI-generated content (ChatGPT/Claude)",
      "HIGH: Content matches web sources or previous submissions",
      "MEDIUM: Fast completion time with high-quality responses"
    ],
    "recommendation": "flag"
  },
  "processingTimeMs": 2341,
  "timestamp": "2025-01-03T10:30:00Z",
  "creditsUsed": 1
}
```

#### 2. Batch Analyze

```http
POST /sentinel/batch-analyze
```

Analyze multiple responses in a single request (more efficient).

**Request:**

```json
{
  "analyses": [
    {
      "id": "response-1",
      "responses": { "q1": "Answer 1" },
      "behavioralMetrics": { ... }
    },
    {
      "id": "response-2",
      "responses": { "q1": "Answer 2" },
      "behavioralMetrics": { ... }
    }
  ],
  "config": {
    "sensitivity": "balanced"
  }
}
```

**Response:**

```json
{
  "results": [
    {
      "id": "response-1",
      "fraudScore": 0.15,
      "riskLevel": "low",
      ...
    },
    {
      "id": "response-2",
      "fraudScore": 0.78,
      "riskLevel": "high",
      ...
    }
  ],
  "summary": {
    "total": 2,
    "fraudulent": 1,
    "avgFraudScore": 0.465,
    "processingTimeMs": 4200,
    "creditsUsed": 2
  }
}
```

#### 3. Get Analysis Status

```http
GET /sentinel/analysis/{analysisId}
```

Retrieve a previously completed analysis by ID.

#### 4. Validate API Key

```http
GET /sentinel/validate
```

Check if your API key is valid and view usage stats.

**Response:**

```json
{
  "valid": true,
  "keyType": "live", // or "test"
  "organization": "Acme Corp",
  "creditsRemaining": 9847,
  "rateLimit": {
    "requestsPerMinute": 60,
    "requestsPerDay": 10000
  },
  "usage": {
    "today": 153,
    "thisMonth": 4521,
    "allTime": 28394
  }
}
```

---

## Client Libraries

### JavaScript/TypeScript

```bash
npm install @surbee/sentinel-sdk
```

```typescript
import { SentinelClient } from '@surbee/sentinel-sdk'

const sentinel = new SentinelClient({
  apiKey: process.env.SENTINEL_API_KEY,
  environment: 'production', // or 'sandbox'
})

// Analyze a response
const result = await sentinel.analyze({
  responses: {
    q1: 'What is your experience?',
    a1: 'I love the product!',
  },
  behavioralMetrics: {
    timeSpent: { q1: 5000 },
    pasteEvents: 0,
  },
})

console.log(`Fraud Score: ${result.fraudScore}`)
console.log(`Risk Level: ${result.riskLevel}`)
console.log(`Recommendation: ${result.reasoning.recommendation}`)
```

### Python

```bash
pip install surbee-sentinel
```

```python
from surbee_sentinel import SentinelClient

sentinel = SentinelClient(api_key=os.getenv('SENTINEL_API_KEY'))

# Analyze a response
result = sentinel.analyze(
    responses={
        'q1': 'What is your experience?',
        'a1': 'I love the product!'
    },
    behavioral_metrics={
        'time_spent': {'q1': 5000},
        'paste_events': 0
    }
)

print(f"Fraud Score: {result['fraudScore']}")
print(f"Risk Level: {result['riskLevel']}")
```

### Ruby

```bash
gem install surbee-sentinel
```

```ruby
require 'surbee/sentinel'

sentinel = Surbee::Sentinel::Client.new(
  api_key: ENV['SENTINEL_API_KEY']
)

result = sentinel.analyze(
  responses: {
    q1: 'What is your experience?',
    a1: 'I love the product!'
  },
  behavioral_metrics: {
    time_spent: { q1: 5000 },
    paste_events: 0
  }
)

puts "Fraud Score: #{result.fraud_score}"
puts "Risk Level: #{result.risk_level}"
```

### PHP

```bash
composer require surbee/sentinel-sdk
```

```php
<?php

use Surbee\Sentinel\Client;

$sentinel = new Client([
    'api_key' => getenv('SENTINEL_API_KEY')
]);

$result = $sentinel->analyze([
    'responses' => [
        'q1' => 'What is your experience?',
        'a1' => 'I love the product!'
    ],
    'behavioralMetrics' => [
        'timeSpent' => ['q1' => 5000],
        'pasteEvents' => 0
    ]
]);

echo "Fraud Score: " . $result['fraudScore'] . "\n";
echo "Risk Level: " . $result['riskLevel'] . "\n";
```

---

## Integration Examples

### Example 1: Typeform Integration

```typescript
// Webhook handler for Typeform submissions
import { SentinelClient } from '@surbee/sentinel-sdk'

const sentinel = new SentinelClient({
  apiKey: process.env.SENTINEL_API_KEY,
})

export async function handleTypeformWebhook(req, res) {
  const submission = req.body

  // Convert Typeform format to SENTINEL format
  const responses = {}
  submission.form_response.answers.forEach((answer) => {
    responses[answer.field.id] = answer.text || answer.choice?.label
  })

  // Analyze with SENTINEL
  const analysis = await sentinel.analyze({
    responses,
    config: { sensitivity: 'balanced' },
  })

  // Take action based on result
  if (analysis.isLikelyFraud) {
    await flagSubmission(submission.form_response.token, analysis)
    await notifyAdmin(submission, analysis)
  }

  res.status(200).json({ received: true })
}
```

### Example 2: Google Forms Integration

```python
from surbee_sentinel import SentinelClient
from google.oauth2 import service_account
from googleapiclient.discovery import build

sentinel = SentinelClient(api_key=os.getenv('SENTINEL_API_KEY'))

# Connect to Google Forms API
service = build('forms', 'v1', credentials=credentials)

# Get form responses
result = service.forms().responses().list(formId=form_id).execute()

for response in result.get('responses', []):
    # Convert to SENTINEL format
    answers = {}
    for question_id, answer in response['answers'].items():
        answers[question_id] = answer.get('textAnswers', {}).get('answers', [{}])[0].get('value')

    # Analyze with SENTINEL
    analysis = sentinel.analyze(responses=answers)

    # Flag suspicious responses
    if analysis['isLikelyFraud']:
        mark_response_as_fraud(response['responseId'], analysis)
```

### Example 3: SurveyMonkey Integration

```javascript
const SentinelClient = require('@surbee/sentinel-sdk')
const axios = require('axios')

const sentinel = new SentinelClient({
  apiKey: process.env.SENTINEL_API_KEY,
})

async function analyzeSurveyMonkeyResponses(surveyId) {
  // Fetch responses from SurveyMonkey
  const responses = await axios.get(
    `https://api.surveymonkey.com/v3/surveys/${surveyId}/responses/bulk`,
    {
      headers: {
        Authorization: `Bearer ${process.env.SURVEYMONKEY_TOKEN}`,
      },
    }
  )

  // Analyze each response
  for (const response of responses.data.data) {
    const answers = {}
    response.pages.forEach((page) => {
      page.questions.forEach((question) => {
        answers[question.id] = question.answers[0]?.text
      })
    })

    const analysis = await sentinel.analyze({ responses: answers })

    if (analysis.fraudScore > 0.6) {
      console.log(`Flagged response ${response.id}: ${analysis.reasoning.summary}`)
    }
  }
}
```

### Example 4: React Form with Real-time Behavioral Tracking

```tsx
import { useState, useEffect } from 'react'
import { SentinelClient } from '@surbee/sentinel-sdk'

function SurveyForm() {
  const [responses, setResponses] = useState({})
  const [behavioralMetrics, setBehavioralMetrics] = useState({
    timeSpent: {},
    pasteEvents: 0,
    tabSwitches: 0,
  })

  // Track paste events
  useEffect(() => {
    const handlePaste = () => {
      setBehavioralMetrics((prev) => ({
        ...prev,
        pasteEvents: prev.pasteEvents + 1,
      }))
    }

    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [])

  // Track time spent per question
  const trackTimeSpent = (questionId: string, startTime: number) => {
    const elapsed = Date.now() - startTime
    setBehavioralMetrics((prev) => ({
      ...prev,
      timeSpent: { ...prev.timeSpent, [questionId]: elapsed },
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Send to your backend, which calls SENTINEL
    const result = await fetch('/api/submit-survey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        responses,
        behavioralMetrics,
      }),
    })

    const data = await result.json()

    if (data.fraudAnalysis?.isLikelyFraud) {
      // Handle fraud detection (internal only, don't show to user)
      console.log('Fraud detected, flagging for review')
    }

    // Show success to user
    alert('Survey submitted successfully!')
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Survey questions */}
      <textarea
        onChange={(e) => setResponses({ ...responses, q1: e.target.value })}
        onFocus={(e) => {
          e.target.dataset.startTime = Date.now().toString()
        }}
        onBlur={(e) => {
          const startTime = parseInt(e.target.dataset.startTime || '0')
          trackTimeSpent('q1', startTime)
        }}
      />

      <button type="submit">Submit Survey</button>
    </form>
  )
}
```

---

## Rate Limits

| Plan | Requests/Minute | Requests/Day | Requests/Month |
|------|----------------|--------------|----------------|
| **Free** | 10 | 100 | 1,000 |
| **Starter** | 60 | 1,000 | 10,000 |
| **Professional** | 300 | 10,000 | 100,000 |
| **Enterprise** | 1,000 | Unlimited | Unlimited |

**Rate Limit Headers:**

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640995200
```

---

## Pricing

### Pay-Per-Use Model

| Detection Level | Price per Analysis |
|----------------|-------------------|
| **Basic** (Behavioral only) | $0.003 |
| **Standard** (All 7 layers, no AI) | $0.008 |
| **Advanced** (All 7 layers + AI) | $0.020 |

### Monthly Plans

| Plan | Price/Month | Included Credits | Overage Rate |
|------|-------------|-----------------|--------------|
| **Free** | $0 | 100 analyses | N/A |
| **Starter** | $49 | 5,000 analyses | $0.015/analysis |
| **Professional** | $199 | 25,000 analyses | $0.010/analysis |
| **Enterprise** | Custom | Custom | Custom |

---

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "invalid_request",
    "message": "The 'responses' field is required",
    "details": {
      "field": "responses",
      "reason": "missing_required_field"
    }
  },
  "requestId": "req_abc123"
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|------------|-------------|
| `invalid_api_key` | 401 | API key is missing or invalid |
| `insufficient_credits` | 402 | Not enough credits remaining |
| `rate_limit_exceeded` | 429 | Too many requests |
| `invalid_request` | 400 | Request body is malformed |
| `server_error` | 500 | Internal server error |
| `timeout` | 504 | Analysis took too long (>10s) |

### Retry Logic

```typescript
async function analyzeWithRetry(data, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await sentinel.analyze(data)
    } catch (error) {
      if (error.code === 'rate_limit_exceeded') {
        // Exponential backoff
        await sleep(Math.pow(2, i) * 1000)
        continue
      }
      throw error
    }
  }
  throw new Error('Max retries exceeded')
}
```

---

## Webhooks

Subscribe to fraud detection events via webhooks.

### Setup Webhook

```bash
POST /sentinel/webhooks
```

```json
{
  "url": "https://your-app.com/webhooks/sentinel",
  "events": ["analysis.completed", "fraud.detected"],
  "secret": "whsec_abc123..." // For signature verification
}
```

### Webhook Payload

```json
{
  "event": "fraud.detected",
  "timestamp": "2025-01-03T10:30:00Z",
  "data": {
    "analysisId": "analysis_abc123",
    "fraudScore": 0.87,
    "riskLevel": "high",
    "responses": { ... },
    "reasoning": { ... }
  }
}
```

### Verify Webhook Signature

```typescript
import crypto from 'crypto'

function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret)
  const digest = hmac.update(JSON.stringify(payload)).digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  )
}
```

---

## Testing

### Sandbox Environment

Use test API keys to test without consuming credits:

```
Test API Key: sk_test_abc123...
Sandbox URL: https://api-sandbox.surbee.com/v1
```

### Test Cases

```typescript
// Test case: Obvious AI-generated text
const aiTest = await sentinel.analyze({
  responses: {
    q1: 'As an AI language model, I believe this is a great product.',
  },
})
// Expected: fraudScore > 0.8, riskLevel: 'high'

// Test case: Low-effort response
const lowEffortTest = await sentinel.analyze({
  responses: {
    q1: 'a',
    q2: 'b',
    q3: 'c',
  },
  behavioralMetrics: {
    timeSpent: { q1: 100, q2: 100, q3: 100 },
  },
})
// Expected: fraudScore > 0.6, riskLevel: 'high'

// Test case: Legitimate response
const legitimateTest = await sentinel.analyze({
  responses: {
    q1: 'I really enjoyed the intuitive interface and fast performance.',
  },
  behavioralMetrics: {
    timeSpent: { q1: 8000 },
    pasteEvents: 0,
  },
})
// Expected: fraudScore < 0.3, riskLevel: 'low'
```

---

## Best Practices

### 1. Collect Behavioral Metrics

Always include behavioral tracking for best accuracy:

```typescript
// ✅ Good - includes behavioral data
const result = await sentinel.analyze({
  responses: answers,
  behavioralMetrics: {
    timeSpent: { q1: 5000, q2: 3000 },
    pasteEvents: 0,
    tabSwitches: 1,
  },
})

// ❌ Bad - missing behavioral data (lower accuracy)
const result = await sentinel.analyze({
  responses: answers,
})
```

### 2. Don't Block User Experience

Run SENTINEL analysis asynchronously after accepting the submission:

```typescript
// ✅ Good - async analysis
app.post('/submit-survey', async (req, res) => {
  // Save response immediately
  const savedResponse = await saveResponse(req.body)

  // Return success to user
  res.json({ success: true, id: savedResponse.id })

  // Analyze in background
  analyzeFraudAsync(savedResponse.id, req.body)
})

// ❌ Bad - blocking the user
app.post('/submit-survey', async (req, res) => {
  const analysis = await sentinel.analyze(req.body) // User waits 3s
  await saveResponse(req.body, analysis)
  res.json({ success: true })
})
```

### 3. Cache Results for Fraud Ring Detection

Store device fingerprints and IPs to enable cross-session fraud ring detection:

```typescript
await sentinel.analyze({
  responses: answers,
  deviceInfo: {
    fingerprint: getDeviceFingerprint(),
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  },
})
```

### 4. Use Batch API for Multiple Responses

More efficient and cost-effective:

```typescript
// ✅ Good - batch analysis
const results = await sentinel.batchAnalyze({
  analyses: responses.map((r) => ({
    id: r.id,
    responses: r.answers,
  })),
})

// ❌ Bad - sequential requests
for (const response of responses) {
  await sentinel.analyze({ responses: response.answers })
}
```

---

## Support

### Documentation

- **API Reference:** https://docs.surbee.com/sentinel/api
- **Integration Guides:** https://docs.surbee.com/sentinel/guides
- **Status Page:** https://status.surbee.com

### Contact

- **Email:** support@surbee.com
- **Discord:** https://discord.gg/surbee
- **GitHub:** https://github.com/surbee/sentinel-sdk

### SLA (Enterprise Plans)

- **Uptime:** 99.95% guaranteed
- **Response Time:** <3s (p99)
- **Support Response:** <1 hour

---

## Changelog

### v1.0.0 (January 2025)
- Initial SDK release
- 7-layer fraud detection
- JavaScript, Python, Ruby, PHP libraries
- Batch analysis support
- Webhook support

### Roadmap

**Q1 2025:**
- [ ] Go and Java client libraries
- [ ] GraphQL API
- [ ] Custom model training
- [ ] Advanced analytics dashboard

**Q2 2025:**
- [ ] Real-time WebSocket streaming
- [ ] On-premise deployment option
- [ ] White-label solution

---

## License

The SENTINEL SDK client libraries are open-source (MIT License).
The SENTINEL API service requires a valid API key and subscription.

---

## Getting Started

1. **Sign up:** https://surbee.com/sentinel/signup
2. **Get API key:** Dashboard > Settings > API Keys
3. **Install SDK:** `npm install @surbee/sentinel-sdk`
4. **Start detecting fraud:** See Quick Start guide above

**Questions?** Reach out to support@surbee.com
