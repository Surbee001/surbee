-- Add fraud ring detection columns to survey_responses
ALTER TABLE survey_responses
ADD COLUMN IF NOT EXISTS fraud_ring_id TEXT,
ADD COLUMN IF NOT EXISTS fraud_ring_score FLOAT,
ADD COLUMN IF NOT EXISTS fraud_ring_signals TEXT[];

-- Index for querying by fraud ring
CREATE INDEX IF NOT EXISTS idx_survey_responses_fraud_ring
ON survey_responses(fraud_ring_id)
WHERE fraud_ring_id IS NOT NULL;

-- Comment on columns
COMMENT ON COLUMN survey_responses.fraud_ring_id IS 'Unique identifier for linked fraudulent responses';
COMMENT ON COLUMN survey_responses.fraud_ring_score IS 'Fraud ring score (0-1) based on cross-response analysis';
COMMENT ON COLUMN survey_responses.fraud_ring_signals IS 'Types of fraud ring signals detected';
