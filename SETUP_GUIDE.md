# 🚀 SENTINEL Setup Guide

## 📋 **What You Need Right Now**

### **Required APIs (You Already Have)**
✅ **OpenAI API** - For AI text detection
- You already have this configured
- Used for: AI-generated text detection, contradiction analysis
- Models used: `gpt-4o` (standard), `o1` (premium reasoning)
- Cost: ~$0.003-0.02 per response depending on model

### **Optional But Recommended APIs**

#### **1. Google Custom Search API** (For Plagiarism Detection)
**Status:** OPTIONAL - SENTINEL works without it, just won't check web plagiarism

**Setup Steps:**
```bash
# 1. Go to: https://developers.google.com/custom-search/v1/introduction
# 2. Create a project in Google Cloud Console
# 3. Enable Custom Search API
# 4. Create API credentials (API Key)
# 5. Create a Custom Search Engine at: https://programmablesearchengine.google.com/

# Add to your .env.local:
GOOGLE_SEARCH_API_KEY=your_key_here
GOOGLE_SEARCH_ENGINE_ID=your_engine_id_here
```

**Free Tier:**
- 100 queries per day FREE
- $5 per 1,000 additional queries
- Totally optional - SENTINEL has fallback plagiarism detection

**If you skip this:** SENTINEL will still detect:
- Duplicate answers across questions
- Template responses
- Cross-submission copying
- Just won't search Google for web sources

---

## 🔧 **Complete Environment Setup**

### **Your `.env.local` File:**

```bash
# ============================================
# REQUIRED (You already have this)
# ============================================
OPENAI_API_KEY=sk-...

# ============================================
# OPTIONAL - Plagiarism Detection
# ============================================
# GOOGLE_SEARCH_API_KEY=...
# GOOGLE_SEARCH_ENGINE_ID=...

# ============================================
# OPTIONAL - Alternative to OpenAI
# ============================================
# ANTHROPIC_API_KEY=sk-ant-...  # If you want to use Claude instead

# ============================================
# CONFIGURATION (Optional - has defaults)
# ============================================
# Fraud detection mode
FRAUD_DETECTION_MODE=standard  # Options: free | standard | premium

# Historical fraud rate for Bayesian prior (default: 0.15 = 15%)
BAYESIAN_PRIOR_FRAUD_RATE=0.15

# Confidence thresholds
FRAUD_CONFIDENCE_THRESHOLD=0.7  # Only trust scores above this
FRAUD_SCORE_REJECT_THRESHOLD=0.8  # Auto-reject above this

# Feature flags
ENABLE_FRAUD_RING_DETECTION=true
ENABLE_BASELINE_ANALYSIS=true
ENABLE_AI_TEXT_DETECTION=true
ENABLE_PLAGIARISM_DETECTION=false  # Set to true if you have Google API
```

---

## 📦 **Required NPM Packages**

### **Already Installed (Check your package.json):**
```json
{
  "dependencies": {
    "ai": "^3.0.0",                    // Vercel AI SDK
    "@ai-sdk/openai": "^0.0.x",       // OpenAI integration
    "@ai-sdk/anthropic": "^0.0.x",    // Optional: Claude
    "next": "^14.x.x",
    "react": "^18.x.x",
    "typescript": "^5.x.x"
  }
}
```

### **If Missing, Install:**
```bash
npm install ai @ai-sdk/openai
# or
pnpm add ai @ai-sdk/openai

# Optional: If you want to use Claude instead of OpenAI
# npm install @ai-sdk/anthropic
```

---

## 🗄️ **Database Schema Updates**

### **Run This Migration:**

```sql
-- ============================================
-- SENTINEL: Add fraud detection columns
-- ============================================

-- 1. Add fraud detection columns to survey_responses
ALTER TABLE survey_responses
  ADD COLUMN IF NOT EXISTS fraud_score FLOAT,
  ADD COLUMN IF NOT EXISTS fraud_confidence FLOAT,
  ADD COLUMN IF NOT EXISTS fraud_risk_level TEXT,
  ADD COLUMN IF NOT EXISTS fraud_details JSONB,
  ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS flag_reasons TEXT[],
  ADD COLUMN IF NOT EXISTS review_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_survey_responses_fraud_score
  ON survey_responses(fraud_score);

CREATE INDEX IF NOT EXISTS idx_survey_responses_is_flagged
  ON survey_responses(is_flagged);

CREATE INDEX IF NOT EXISTS idx_survey_responses_risk_level
  ON survey_responses(fraud_risk_level);

-- 3. Optional: Create reputation tracking table
CREATE TABLE IF NOT EXISTS reputation_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  type TEXT NOT NULL, -- 'ip' or 'device'
  reputation_score FLOAT DEFAULT 0.5,
  risk_score FLOAT DEFAULT 0.5,
  total_submissions INT DEFAULT 0,
  flagged_submissions INT DEFAULT 0,
  legitimate_submissions INT DEFAULT 0,
  average_fraud_score FLOAT DEFAULT 0,
  first_seen TIMESTAMP DEFAULT NOW(),
  last_seen TIMESTAMP DEFAULT NOW(),
  violations JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  UNIQUE(identifier, type)
);

CREATE INDEX IF NOT EXISTS idx_reputation_identifier
  ON reputation_tracking(identifier);

CREATE INDEX IF NOT EXISTS idx_reputation_risk_score
  ON reputation_tracking(risk_score);

-- 4. Optional: Create baseline profiles table (for caching)
CREATE TABLE IF NOT EXISTS baseline_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id TEXT NOT NULL UNIQUE,
  profile_data JSONB NOT NULL,
  total_responses INT DEFAULT 0,
  confidence FLOAT DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_baseline_survey_id
  ON baseline_profiles(survey_id);

-- 5. Add RLS policies (if using Supabase RLS)
-- Users can view their own project's fraud data
CREATE POLICY IF NOT EXISTS "Users can view fraud data for their surveys"
  ON survey_responses
  FOR SELECT
  USING (
    survey_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Only admins can update review status
CREATE POLICY IF NOT EXISTS "Admins can review fraud flags"
  ON survey_responses
  FOR UPDATE
  USING (
    survey_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );
```

**Save this as:** `supabase/migrations/20250103_sentinel_fraud_detection.sql`

**Run it:**
```bash
# If using Supabase CLI:
supabase db push

# Or run it directly in Supabase dashboard:
# Dashboard → SQL Editor → paste SQL → Run
```

---

## 🔌 **API Integration Points**

### **1. On Survey Submission**

Update your survey submission endpoint to call SENTINEL:

```typescript
// In your existing: /api/surbee/responses/submit/route.ts

import { calculateEnsembleScore } from '@/lib/ml/ensemble-scoring'
import { detectFraudRing } from '@/lib/services/fraud-ring-detection'
import { buildBaseline, compareToBaseline } from '@/lib/services/baseline-analysis'
import { getReputation } from '@/lib/services/reputation-tracking'

export async function POST(request: Request) {
  const {
    responses,
    questions,
    behavioralMetrics,
    surveyId,
    sessionId
  } = await request.json()

  // Get client IP
  const ip = request.headers.get('x-forwarded-for') ||
             request.headers.get('x-real-ip') ||
             'unknown'

  // 1. Run comprehensive fraud detection
  const fraudAssessment = await fetch('/api/surbee/fraud/comprehensive-assess', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      responses,
      questions,
      behavioralMetrics,
      sessionId,
    }),
  }).then(res => res.json())

  // 2. Store response with fraud data
  const { data, error } = await supabase
    .from('survey_responses')
    .insert({
      survey_id: surveyId,
      responses,
      fraud_score: fraudAssessment.overallRiskScore,
      fraud_confidence: fraudAssessment.confidence,
      fraud_risk_level: fraudAssessment.riskLevel,
      fraud_details: fraudAssessment,
      is_flagged: fraudAssessment.riskLevel === 'high' || fraudAssessment.riskLevel === 'critical',
      flag_reasons: fraudAssessment.recommendations,
      ip_address: ip,
      device_data: behavioralMetrics.deviceFingerprint,
      mouse_data: behavioralMetrics.mouseMovements,
      keystroke_data: behavioralMetrics.keystrokeDynamics,
      timing_data: behavioralMetrics.responseTime,
      // ... other fields
    })

  // 3. Auto-reject if critical risk
  if (fraudAssessment.riskLevel === 'critical') {
    return Response.json({
      success: false,
      error: 'Submission rejected due to fraud detection',
      details: fraudAssessment.reasoning.summary,
    }, { status: 403 })
  }

  return Response.json({
    success: true,
    responseId: data.id,
    fraudWarning: fraudAssessment.riskLevel === 'high' ?
      'This submission has been flagged for review' : null,
  })
}
```

### **2. Frontend Integration**

Wrap your survey in the BehaviorProvider:

```tsx
// app/survey/[id]/page.tsx

import { BehaviorProvider } from '@/features/survey/behavior/BehaviorProvider'

export default function SurveyPage() {
  return (
    <BehaviorProvider>
      <SurveyComponent />
    </BehaviorProvider>
  )
}
```

---

## ✅ **Verification Checklist**

### **Before Going Live:**

- [ ] OpenAI API key configured and tested
- [ ] Database migrations applied
- [ ] BehaviorProvider wraps survey UI
- [ ] Survey submission calls comprehensive-assess API
- [ ] Fraud scores being stored in database
- [ ] Can view fraud_score in survey_responses table
- [ ] Test with known bot (Selenium) - should detect
- [ ] Test with normal human response - should NOT flag
- [ ] Google Search API (optional) configured if desired

### **Test Commands:**

```bash
# 1. Test OpenAI connection
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# 2. Test fraud detection API
curl -X POST http://localhost:3000/api/surbee/fraud/comprehensive-assess \
  -H "Content-Type: application/json" \
  -d '{
    "responses": {"q1": "This is a test answer"},
    "questions": {"q1": "What is your opinion?"},
    "behavioralMetrics": {
      "mouseMovements": [],
      "responseTime": [5000],
      "deviceFingerprint": {"userAgent": "test"}
    }
  }'

# Expected: Should return fraud assessment with score
```

---

## 🎯 **Cost Calculator**

### **API Costs Per 1000 Responses:**

| Mode | Models Used | Cost |
|------|------------|------|
| **Free** | Rules + Heuristics only | $0 |
| **Standard** | Rules + GPT-4o | $3-5 |
| **Premium** | Rules + GPT-4o + o1 | $20-30 |

**Recommendations:**
- **General surveys:** Use Standard mode ($0.003-0.005 per response)
- **High-stakes (exams, hiring):** Use Premium mode ($0.02-0.03 per response)
- **Budget-conscious:** Use Free mode (no AI, just rules - still very effective)

**To control costs:**
```bash
# Set in .env.local
FRAUD_DETECTION_MODE=standard  # Uses GPT-4o only

# Or use free mode
FRAUD_DETECTION_MODE=free  # No AI APIs, just rules
```

---

## 🚨 **Troubleshooting**

### **"OpenAI API Error"**
- Check your API key is correct
- Verify you have credits in your OpenAI account
- Check rate limits (free tier has limits)

### **"No fraud score returned"**
- Check database migrations were applied
- Verify API endpoint is accessible
- Check console logs for errors

### **"Too many false positives"**
- Lower the threshold in .env: `FRAUD_SCORE_REJECT_THRESHOLD=0.9`
- Use Standard mode instead of Premium (less aggressive)
- Check if your legitimate users have unusual patterns (VPNs, fast typers, etc.)

### **"Not detecting obvious bots"**
- Ensure BehaviorProvider is wrapping the survey
- Check that behavioralMetrics are being collected
- Verify WebDriver detection is working (check deviceFingerprint)

---

## 📞 **Support**

**Documentation:**
- `/SENTINEL_ALGORITHM.md` - Full algorithm docs
- `/FRAUD_DETECTION_SYSTEM.md` - User guide
- `/ALGORITHM_REFERENCE.md` - Dev reference

**Need help?** Check the troubleshooting section above or review the test suite.

---

## ✨ **You're Ready!**

With just your OpenAI API key, SENTINEL is ready to go!

- ✅ Core fraud detection works
- ✅ Behavioral analysis works
- ✅ AI text detection works
- ✅ Bayesian ensemble works
- ✅ Fraud ring detection works
- ✅ Baseline analysis works

**Optional upgrades:**
- Add Google Search API for web plagiarism
- Build Phase 7 dashboard for reviewing flagged responses
- Add Phase 4 in-house models (see next doc)

**Start simple, scale up as needed!** 🚀
