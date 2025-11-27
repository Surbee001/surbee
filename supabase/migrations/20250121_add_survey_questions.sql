-- Create survey_questions table
CREATE TABLE IF NOT EXISTS public.survey_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,

  -- Question details
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'text_input', 'rating', 'yes_no')),
  order_index INTEGER NOT NULL,
  options TEXT[], -- Array of options for multiple_choice questions
  required BOOLEAN DEFAULT false,

  -- Indexes
  CONSTRAINT survey_questions_project_order UNIQUE (project_id, order_index)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_survey_questions_project_id ON public.survey_questions(project_id);
CREATE INDEX IF NOT EXISTS idx_survey_questions_order ON public.survey_questions(project_id, order_index);

-- Enable Row Level Security
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view survey questions for their projects"
  ON public.survey_questions FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert survey questions for their projects"
  ON public.survey_questions FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update survey questions for their projects"
  ON public.survey_questions FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete survey questions for their projects"
  ON public.survey_questions FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
    )
  );

-- Add trigger for updated_at if needed in the future
-- (Not in current schema but good to have ready)
CREATE OR REPLACE FUNCTION update_survey_questions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: Trigger not created yet as updated_at column doesn't exist in current schema
-- Uncomment if you add updated_at column later:
-- CREATE TRIGGER survey_questions_updated_at
--   BEFORE UPDATE ON public.survey_questions
--   FOR EACH ROW
--   EXECUTE FUNCTION update_survey_questions_updated_at();
