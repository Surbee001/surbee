-- Migration: Cipher ML Phase 1 - Automated Data Collection & Labeling
-- Creates tables for feature extraction, auto-labeling, and ML predictions

-- ============================================
-- TABLE: cipher_features
-- Store computed feature vectors for ML training
-- ============================================
CREATE TABLE IF NOT EXISTS cipher_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID NOT NULL REFERENCES survey_responses(id) ON DELETE CASCADE,
  survey_id TEXT NOT NULL,

  -- Feature vector (75 dimensions, normalized 0-1)
  feature_vector FLOAT[] NOT NULL,
  feature_version INTEGER DEFAULT 1,

  -- ==========================================
  -- BEHAVIORAL FEATURES (25)
  -- ==========================================
  mouse_distance_total FLOAT,
  mouse_velocity_mean FLOAT,
  mouse_velocity_std FLOAT,
  mouse_velocity_max FLOAT,
  mouse_acceleration_mean FLOAT,
  mouse_curvature_entropy FLOAT,
  mouse_straight_line_ratio FLOAT,
  mouse_pause_count INTEGER,
  keystroke_count INTEGER,
  keystroke_timing_mean FLOAT,
  keystroke_timing_std FLOAT,
  keystroke_dwell_mean FLOAT,
  keystroke_flight_mean FLOAT,
  backspace_ratio FLOAT,
  paste_event_count INTEGER,
  paste_char_ratio FLOAT,
  scroll_count INTEGER,
  scroll_velocity_mean FLOAT,
  scroll_direction_changes INTEGER,
  focus_loss_count INTEGER,
  focus_loss_duration_total FLOAT,
  hover_count INTEGER,
  hover_duration_mean FLOAT,
  click_count INTEGER,
  hover_before_click_ratio FLOAT,

  -- ==========================================
  -- TEMPORAL FEATURES (12)
  -- ==========================================
  completion_time_seconds FLOAT,
  time_per_question_mean FLOAT,
  time_per_question_std FLOAT,
  time_per_question_min FLOAT,
  time_per_question_max FLOAT,
  reading_vs_answering_ratio FLOAT,
  first_interaction_delay_ms FLOAT,
  idle_time_total FLOAT,
  active_time_ratio FLOAT,
  response_acceleration FLOAT,
  time_of_day_hour INTEGER,
  day_of_week INTEGER,

  -- ==========================================
  -- DEVICE FEATURES (10)
  -- ==========================================
  has_webdriver BOOLEAN,
  has_automation_flags BOOLEAN,
  plugin_count INTEGER,
  screen_resolution_common BOOLEAN,
  timezone_offset_minutes INTEGER,
  timezone_matches_ip BOOLEAN,
  fingerprint_seen_count INTEGER,
  device_memory_gb FLOAT,
  hardware_concurrency INTEGER,
  touch_support BOOLEAN,

  -- ==========================================
  -- NETWORK FEATURES (8)
  -- ==========================================
  is_vpn BOOLEAN,
  is_datacenter BOOLEAN,
  is_tor BOOLEAN,
  is_proxy BOOLEAN,
  ip_reputation_score FLOAT,
  ip_country_code TEXT,
  geo_timezone_match BOOLEAN,
  ip_seen_count INTEGER,

  -- ==========================================
  -- CONTENT FEATURES (15)
  -- ==========================================
  question_count INTEGER,
  open_ended_count INTEGER,
  open_ended_length_mean FLOAT,
  open_ended_length_std FLOAT,
  open_ended_word_count_mean FLOAT,
  open_ended_unique_word_ratio FLOAT,
  straight_line_ratio FLOAT,
  answer_entropy FLOAT,
  first_option_ratio FLOAT,
  last_option_ratio FLOAT,
  middle_option_ratio FLOAT,
  response_uniqueness_score FLOAT,
  duplicate_answer_ratio FLOAT,
  na_ratio FLOAT,
  skip_ratio FLOAT,

  -- ==========================================
  -- HONEYPOT FEATURES (5)
  -- ==========================================
  attention_check_passed BOOLEAN,
  attention_check_count INTEGER,
  consistency_check_score FLOAT,
  trap_field_filled BOOLEAN,
  honeypot_score FLOAT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT cipher_features_response_unique UNIQUE(response_id)
);

-- ============================================
-- TABLE: cipher_labels
-- Training labels (ground truth for ML)
-- ============================================
CREATE TABLE IF NOT EXISTS cipher_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID NOT NULL REFERENCES survey_responses(id) ON DELETE CASCADE,

  -- Label
  is_fraud BOOLEAN NOT NULL,
  confidence FLOAT NOT NULL DEFAULT 1.0,  -- How sure are we (0-1)

  -- Source of label
  label_source TEXT NOT NULL,  -- 'honeypot', 'auto_rule', 'customer_feedback', 'manual_review'
  label_reason TEXT,           -- Human-readable explanation

  -- For feedback from customers
  labeled_by UUID,

  -- Training tracking
  used_in_training BOOLEAN DEFAULT FALSE,
  training_run_id UUID,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT cipher_labels_response_unique UNIQUE(response_id)
);

-- ============================================
-- TABLE: cipher_ml_predictions
-- Model predictions (separate from rule-based scores)
-- ============================================
CREATE TABLE IF NOT EXISTS cipher_ml_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID NOT NULL REFERENCES survey_responses(id) ON DELETE CASCADE,

  -- Prediction
  fraud_probability FLOAT NOT NULL,
  fraud_verdict TEXT NOT NULL,  -- 'low_risk', 'medium_risk', 'high_risk', 'fraud'
  confidence FLOAT NOT NULL,

  -- Explainability (top contributing features)
  top_signals JSONB NOT NULL DEFAULT '[]',  -- [{feature: 'mouse_velocity_std', contribution: 0.23}, ...]

  -- Model info
  model_version TEXT NOT NULL,
  model_id UUID,
  feature_version INTEGER,

  -- Performance tracking
  inference_time_ms INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT cipher_predictions_response_unique UNIQUE(response_id)
);

-- ============================================
-- TABLE: cipher_models
-- Model registry for tracking trained models
-- ============================================
CREATE TABLE IF NOT EXISTS cipher_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL UNIQUE,

  -- Performance metrics on test set
  precision_score FLOAT,
  recall_score FLOAT,
  f1_score FLOAT,
  auc_roc FLOAT,

  -- Training info
  training_samples INTEGER,
  fraud_samples INTEGER,
  legitimate_samples INTEGER,
  feature_version INTEGER,

  -- Model artifact location
  model_artifact_url TEXT,  -- S3/GCS URL or Modal volume path

  -- Status
  status TEXT DEFAULT 'training',  -- 'training', 'validating', 'active', 'retired'
  is_active BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  promoted_at TIMESTAMPTZ,
  retired_at TIMESTAMPTZ
);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_cipher_features_response ON cipher_features(response_id);
CREATE INDEX IF NOT EXISTS idx_cipher_features_survey ON cipher_features(survey_id);
CREATE INDEX IF NOT EXISTS idx_cipher_features_created ON cipher_features(created_at);

CREATE INDEX IF NOT EXISTS idx_cipher_labels_source ON cipher_labels(label_source);
CREATE INDEX IF NOT EXISTS idx_cipher_labels_unused ON cipher_labels(used_in_training) WHERE used_in_training = FALSE;
CREATE INDEX IF NOT EXISTS idx_cipher_labels_fraud ON cipher_labels(is_fraud);
CREATE INDEX IF NOT EXISTS idx_cipher_labels_created ON cipher_labels(created_at);

CREATE INDEX IF NOT EXISTS idx_cipher_predictions_response ON cipher_ml_predictions(response_id);
CREATE INDEX IF NOT EXISTS idx_cipher_predictions_verdict ON cipher_ml_predictions(fraud_verdict);
CREATE INDEX IF NOT EXISTS idx_cipher_predictions_model ON cipher_ml_predictions(model_version);

CREATE INDEX IF NOT EXISTS idx_cipher_models_active ON cipher_models(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_cipher_models_status ON cipher_models(status);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_cipher_labels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cipher_labels_updated_at
  BEFORE UPDATE ON cipher_labels
  FOR EACH ROW
  EXECUTE FUNCTION update_cipher_labels_updated_at();

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS on all cipher tables
ALTER TABLE cipher_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE cipher_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE cipher_ml_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cipher_models ENABLE ROW LEVEL SECURITY;

-- cipher_features: Users can view features for their surveys' responses
CREATE POLICY "Users can view cipher features for their surveys"
  ON cipher_features FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM survey_responses sr
      JOIN projects p ON sr.survey_id = p.id
      WHERE sr.id = cipher_features.response_id
      AND p.user_id = auth.uid()
    )
  );

-- System can insert/update cipher features (via service role)
CREATE POLICY "System can manage cipher features"
  ON cipher_features FOR ALL
  USING (true)
  WITH CHECK (true);

-- cipher_labels: Users can view/create labels for their surveys
CREATE POLICY "Users can view cipher labels for their surveys"
  ON cipher_labels FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM survey_responses sr
      JOIN projects p ON sr.survey_id = p.id
      WHERE sr.id = cipher_labels.response_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create cipher labels for their surveys"
  ON cipher_labels FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM survey_responses sr
      JOIN projects p ON sr.survey_id = p.id
      WHERE sr.id = cipher_labels.response_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update cipher labels for their surveys"
  ON cipher_labels FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM survey_responses sr
      JOIN projects p ON sr.survey_id = p.id
      WHERE sr.id = cipher_labels.response_id
      AND p.user_id = auth.uid()
    )
  );

-- System can manage all labels (via service role)
CREATE POLICY "System can manage cipher labels"
  ON cipher_labels FOR ALL
  USING (true)
  WITH CHECK (true);

-- cipher_ml_predictions: Users can view predictions for their surveys
CREATE POLICY "Users can view cipher predictions for their surveys"
  ON cipher_ml_predictions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM survey_responses sr
      JOIN projects p ON sr.survey_id = p.id
      WHERE sr.id = cipher_ml_predictions.response_id
      AND p.user_id = auth.uid()
    )
  );

-- System can manage predictions
CREATE POLICY "System can manage cipher predictions"
  ON cipher_ml_predictions FOR ALL
  USING (true)
  WITH CHECK (true);

-- cipher_models: All authenticated users can view models
CREATE POLICY "Authenticated users can view cipher models"
  ON cipher_models FOR SELECT
  USING (auth.role() = 'authenticated');

-- System can manage models
CREATE POLICY "System can manage cipher models"
  ON cipher_models FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE cipher_features IS 'Stores computed 75-dimension feature vectors for ML training from survey responses';
COMMENT ON TABLE cipher_labels IS 'Ground truth labels for ML training - fraud vs legitimate responses';
COMMENT ON TABLE cipher_ml_predictions IS 'ML model predictions for fraud detection, separate from rule-based scoring';
COMMENT ON TABLE cipher_models IS 'Registry of trained ML models with performance metrics and status';

COMMENT ON COLUMN cipher_features.feature_vector IS 'Normalized 0-1 feature vector (75 dimensions)';
COMMENT ON COLUMN cipher_labels.label_source IS 'Source: honeypot, auto_rule, customer_feedback, manual_review';
COMMENT ON COLUMN cipher_labels.confidence IS 'Label confidence 0-1, used for weighted training';
COMMENT ON COLUMN cipher_ml_predictions.top_signals IS 'JSON array of top contributing features for explainability';
