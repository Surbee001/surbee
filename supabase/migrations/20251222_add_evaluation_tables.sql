-- Migration: Add evaluation tables for AI-powered survey evaluation feature
-- Created: 2024-12-22

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- evaluation_runs table - stores each evaluation session
CREATE TABLE IF NOT EXISTS evaluation_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id TEXT NOT NULL,
  user_id UUID NOT NULL,

  -- Configuration
  mode TEXT NOT NULL CHECK (mode IN ('human_like', 'edge_case', 'stress_test', 'custom', 'all')),
  model_used TEXT NOT NULL,
  custom_criteria TEXT,
  include_response_data BOOLEAN DEFAULT FALSE,

  -- Results
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  agent_responses JSONB DEFAULT '[]'::jsonb,
  issues_found JSONB DEFAULT '[]'::jsonb,
  reasoning TEXT,
  error_message TEXT,

  -- Metadata
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- evaluation_suggestions table - stores individual suggestions from evaluations
CREATE TABLE IF NOT EXISTS evaluation_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evaluation_run_id UUID NOT NULL REFERENCES evaluation_runs(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL,

  -- Suggestion details
  category TEXT NOT NULL CHECK (category IN ('ux', 'clarity', 'logic', 'accessibility', 'bias', 'technical', 'validation')),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reasoning TEXT,
  question_id TEXT,

  -- The code fix
  suggested_changes JSONB,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'dismissed', 'failed')),
  applied_at TIMESTAMP WITH TIME ZONE,
  applied_by UUID,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_evaluation_runs_project_id ON evaluation_runs(project_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_runs_user_id ON evaluation_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_runs_status ON evaluation_runs(status);
CREATE INDEX IF NOT EXISTS idx_evaluation_runs_created_at ON evaluation_runs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_evaluation_suggestions_evaluation_run_id ON evaluation_suggestions(evaluation_run_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_suggestions_project_id ON evaluation_suggestions(project_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_suggestions_status ON evaluation_suggestions(status);

-- RLS Policies
ALTER TABLE evaluation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_suggestions ENABLE ROW LEVEL SECURITY;

-- Users can view their own evaluation runs
CREATE POLICY "Users can view own evaluation runs"
  ON evaluation_runs FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own evaluation runs
CREATE POLICY "Users can insert own evaluation runs"
  ON evaluation_runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own evaluation runs
CREATE POLICY "Users can update own evaluation runs"
  ON evaluation_runs FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own evaluation runs
CREATE POLICY "Users can delete own evaluation runs"
  ON evaluation_runs FOR DELETE
  USING (auth.uid() = user_id);

-- Users can view suggestions for their evaluation runs
CREATE POLICY "Users can view own evaluation suggestions"
  ON evaluation_suggestions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM evaluation_runs
      WHERE evaluation_runs.id = evaluation_suggestions.evaluation_run_id
      AND evaluation_runs.user_id = auth.uid()
    )
  );

-- Users can update suggestions for their evaluation runs
CREATE POLICY "Users can update own evaluation suggestions"
  ON evaluation_suggestions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM evaluation_runs
      WHERE evaluation_runs.id = evaluation_suggestions.evaluation_run_id
      AND evaluation_runs.user_id = auth.uid()
    )
  );

-- Service role can do everything (for API routes)
CREATE POLICY "Service role full access to evaluation_runs"
  ON evaluation_runs FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access to evaluation_suggestions"
  ON evaluation_suggestions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
