-- Add ML prediction columns to survey_responses table
-- These store the ML model's fraud assessment alongside the rule-based score

ALTER TABLE survey_responses
ADD COLUMN IF NOT EXISTS ml_fraud_probability FLOAT,
ADD COLUMN IF NOT EXISTS ml_fraud_verdict TEXT,
ADD COLUMN IF NOT EXISTS combined_fraud_score FLOAT;

-- Add index for querying by ML verdict
CREATE INDEX IF NOT EXISTS idx_survey_responses_ml_verdict
ON survey_responses(ml_fraud_verdict);

-- Add index for querying by combined score
CREATE INDEX IF NOT EXISTS idx_survey_responses_combined_score
ON survey_responses(combined_fraud_score);

COMMENT ON COLUMN survey_responses.ml_fraud_probability IS 'ML model fraud probability (0-1)';
COMMENT ON COLUMN survey_responses.ml_fraud_verdict IS 'ML model verdict: low_risk, medium_risk, high_risk, fraud';
COMMENT ON COLUMN survey_responses.combined_fraud_score IS 'Max of rule-based and ML scores';
