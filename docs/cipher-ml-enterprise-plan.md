# Cipher ML Enterprise Plan

## Overview

Transform Cipher from a rule-based fraud detection system to an enterprise-grade ML-powered system with measurable, validated accuracy.

**Target Accuracy**: 90%+ F1 Score within 6 months
**Estimated Cost**: $50-300/month infrastructure

---

## Why ML Will Work

| Similar Problem | Industry Accuracy | Why It Works |
|----------------|-------------------|--------------|
| Credit card fraud | 99.5%+ | Behavioral patterns + transaction data |
| Email spam | 99%+ | Text patterns + sender behavior |
| Ad click fraud | 90-95% | Click patterns + device signals |
| Bot detection (reCAPTCHA) | 85-95% | Behavioral biometrics |
| **Survey fraud (Cipher)** | **90%+ achievable** | Same signals as above combined |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CIPHER ENTERPRISE ARCHITECTURE                        │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                              DATA COLLECTION LAYER                            │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Survey Response                                                            │
│        │                                                                     │
│        ▼                                                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    CIPHER TRACKER (Enhanced)                         │   │
│   │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐           │   │
│   │  │  Mouse    │ │ Keyboard  │ │  Timing   │ │  Focus    │           │   │
│   │  │  Tracker  │ │  Tracker  │ │  Tracker  │ │  Tracker  │           │   │
│   │  └─────┬─────┘ └─────┬─────┘ └─────┬─────┘ └─────┬─────┘           │   │
│   │        │             │             │             │                   │   │
│   │        └─────────────┴─────────────┴─────────────┘                   │   │
│   │                           │                                          │   │
│   │                           ▼                                          │   │
│   │                 ┌─────────────────────┐                              │   │
│   │                 │  Raw Event Stream   │                              │   │
│   │                 │  (500-2000 events   │                              │   │
│   │                 │   per response)     │                              │   │
│   │                 └─────────────────────┘                              │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                            FEATURE ENGINEERING LAYER                          │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Raw Events ──▶ Feature Extractor (75 dimensions)                          │
│                  ├── Behavioral (25 features)                               │
│                  ├── Temporal (12 features)                                 │
│                  ├── Device (10 features)                                   │
│                  ├── Network (8 features)                                   │
│                  ├── Content (15 features)                                  │
│                  └── Honeypot (5 features)                                  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                              ML SCORING LAYER                                 │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Ensemble Model (XGBoost + LightGBM + Neural Net)                          │
│        │                                                                     │
│        ▼                                                                     │
│   Fraud Assessment                                                           │
│   ├── score: 0.0 - 1.0                                                      │
│   ├── verdict: LOW_RISK | MEDIUM_RISK | HIGH_RISK | FRAUD                   │
│   ├── confidence: 0.0 - 1.0                                                 │
│   └── top_signals: [{signal, contribution}, ...]                            │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                            FEEDBACK & LEARNING LOOP                           │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Label Sources:                                                             │
│   ├── Customer Feedback (👍/👎 on responses)                                │
│   ├── Honeypot Results (automatic)                                          │
│   ├── Auto-Labeling Rules (high confidence cases)                           │
│   └── Synthetic Fraud (generated for training)                              │
│                                                                              │
│   Continuous Learning:                                                       │
│   ├── Weekly model retraining                                               │
│   ├── Performance monitoring                                                │
│   └── Drift detection                                                       │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Data Foundation (Weeks 1-4)

**Goal**: Collect high-quality behavioral data and build automated labeling infrastructure.

#### Week 1-2: Enhanced Data Collection
- [ ] Upgrade CipherTracker to collect granular events
  - Mouse: position, velocity, acceleration every 50ms
  - Keyboard: key timing, flight time, dwell time
  - Scroll: velocity, direction changes, patterns
  - Focus: blur/focus events with timestamps
- [ ] Create behavioral_events table in Supabase
- [ ] Build event streaming from tracker to backend

#### Week 3-4: Automated Labeling Infrastructure
- [ ] Honeypot question system (auto-labels)
  - Attention checks
  - Consistency checks
  - Invisible trap fields
  - Open-ended quality scoring
- [ ] Customer feedback UI (👍/👎 on responses)
- [ ] Auto-labeling rules for obvious cases
- [ ] Synthetic fraud generator (Playwright scripts)

**Deliverables**:
- Enhanced CipherTracker capturing 50+ raw signals
- Database schema for behavioral events
- Honeypot question types in survey builder
- Automated feedback collection
- Target: 5,000+ labeled responses

---

### Phase 2: Feature Engineering (Weeks 5-7)

**Goal**: Transform raw events into ML-ready features automatically.

#### Week 5-6: Feature Extraction Pipeline
- [ ] Behavioral feature extractors
- [ ] Device/Network feature extractors
- [ ] Content analysis features
- [ ] Feature normalization & validation

#### Week 7: Feature Store
- [ ] Computed features table
- [ ] Real-time feature computation API
- [ ] Feature versioning system
- [ ] Feature importance baseline analysis

**Deliverables**:
- 75-feature extraction pipeline
- Feature store in Supabase
- Real-time feature computation (<100ms)

---

### Phase 3: Model Development (Weeks 8-11)

**Goal**: Train, validate, and optimize ML models.

#### Week 8-9: Initial Model Training
- [ ] Data preparation pipeline
- [ ] XGBoost baseline model
- [ ] LightGBM comparison
- [ ] Initial metrics evaluation

#### Week 10: Model Optimization
- [ ] Hyperparameter tuning
- [ ] Feature selection (SHAP analysis)
- [ ] Ensemble model development
- [ ] Threshold calibration

#### Week 11: Model Validation
- [ ] Hold-out test evaluation
- [ ] Fairness analysis
- [ ] Adversarial testing
- [ ] Performance benchmarking

**Deliverables**:
- Trained ensemble model
- Validation metrics: Precision, Recall, F1, AUC
- Model documentation

---

### Phase 4: Production Deployment (Weeks 12-14)

**Goal**: Deploy model for real-time scoring.

- [ ] Modal deployment for inference API
- [ ] Real-time scoring on submission
- [ ] Dashboard fraud indicators
- [ ] Monitoring & observability

---

### Phase 5: Continuous Improvement (Ongoing)

- [ ] Automated retraining pipeline
- [ ] Customer feedback integration
- [ ] Model versioning & rollback
- [ ] Performance reporting

---

## Data Sources for Training

### Automatic Collection (No Manual Work)

1. **Survey Responses on Surbee**
   - Every response automatically logged with behavioral data
   - Features computed in real-time
   - Stored for future training

2. **Honeypot Auto-Labels**
   - Attention check failures → fraud label
   - Consistency check failures → fraud label
   - Trap field fills → fraud label
   - Quality open-ended → legitimate label

3. **Auto-Labeling Rules**
   - Same fingerprint 50+ times → fraud
   - Completion time <10s for 20 questions → fraud
   - Zero mouse movement → fraud
   - Datacenter IP + bot signals → fraud

4. **Synthetic Fraud Generation**
   - Playwright scripts simulate different fraud types
   - Runs automatically on schedule
   - Generates labeled training data

5. **Customer Feedback (Passive)**
   - Simple 👍/👎 on response review
   - Collected as users naturally review responses

---

## Database Schema

```sql
-- Raw behavioral events
CREATE TABLE cipher_behavioral_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID REFERENCES survey_responses(id),
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  timestamp_ms BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Computed features
CREATE TABLE cipher_features (
  response_id UUID PRIMARY KEY REFERENCES survey_responses(id),
  feature_vector FLOAT[] NOT NULL,
  feature_version INTEGER DEFAULT 1,
  -- Individual features for querying
  mouse_distance_total FLOAT,
  completion_time_ms BIGINT,
  -- ... (75 total features)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Training labels
CREATE TABLE cipher_labels (
  response_id UUID PRIMARY KEY REFERENCES survey_responses(id),
  is_fraud BOOLEAN NOT NULL,
  confidence FLOAT NOT NULL,
  label_source TEXT NOT NULL,
  labeled_at TIMESTAMPTZ DEFAULT NOW()
);

-- Model predictions
CREATE TABLE cipher_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID REFERENCES survey_responses(id),
  fraud_probability FLOAT NOT NULL,
  fraud_verdict TEXT NOT NULL,
  top_signals JSONB NOT NULL,
  model_version TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Model registry
CREATE TABLE cipher_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL UNIQUE,
  precision_score FLOAT,
  recall_score FLOAT,
  f1_score FLOAT,
  auc_roc FLOAT,
  status TEXT DEFAULT 'training',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Cost Estimates

### Monthly Infrastructure

| Scale | Supabase | Modal | External APIs | Total |
|-------|----------|-------|---------------|-------|
| 10k responses | $25 | $20-50 | $0 | $45-75 |
| 100k responses | $75 | $50-150 | $100 | $225-325 |
| 1M+ responses | $300 | $200-500 | $400 | $900-1,200 |

---

## Expected Accuracy Timeline

| Metric | After Phase 3 | After 6 Months | After 1 Year |
|--------|---------------|----------------|--------------|
| Training Data | 5-10k labeled | 50k+ labeled | 200k+ labeled |
| Precision | 85-88% | 90-93% | 93-96% |
| Recall | 75-80% | 82-87% | 87-92% |
| F1 Score | 80-84% | 86-90% | 90-94% |
| AUC-ROC | 0.88-0.91 | 0.92-0.95 | 0.95-0.97 |

---

## Success Criteria

- [ ] Automated data collection with no manual intervention
- [ ] 10,000+ labeled responses within 3 months
- [ ] 85%+ F1 score on hold-out test set
- [ ] <200ms inference latency
- [ ] Weekly automated retraining
- [ ] Dashboard showing fraud metrics
- [ ] Customer-facing accuracy claims backed by validation data
