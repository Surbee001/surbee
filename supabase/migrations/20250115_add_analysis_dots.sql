-- Create analysis_dots table for persistent draggable analysis points
CREATE TABLE IF NOT EXISTS public.analysis_dots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  position_x NUMERIC(5,2) NOT NULL CHECK (position_x >= 0 AND position_x <= 100), -- Percentage from left
  position_y NUMERIC(5,2) NOT NULL CHECK (position_y >= 0 AND position_y <= 100), -- Percentage from top
  label TEXT,
  component_id TEXT, -- Optional identifier for the component being analyzed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analysis_dots_project_id ON public.analysis_dots(project_id);
CREATE INDEX IF NOT EXISTS idx_analysis_dots_user_id ON public.analysis_dots(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_dots_project_user ON public.analysis_dots(project_id, user_id);

-- Enable Row Level Security
ALTER TABLE public.analysis_dots ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view dots for projects they own
CREATE POLICY "Users can view their project analysis dots"
  ON public.analysis_dots
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = analysis_dots.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Users can insert dots for their projects
CREATE POLICY "Users can create analysis dots for their projects"
  ON public.analysis_dots
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = analysis_dots.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Users can update their own dots
CREATE POLICY "Users can update their analysis dots"
  ON public.analysis_dots
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = analysis_dots.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Users can delete their own dots
CREATE POLICY "Users can delete their analysis dots"
  ON public.analysis_dots
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = analysis_dots.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.analysis_dots
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add comment
COMMENT ON TABLE public.analysis_dots IS 'Stores persistent draggable analysis dot positions for project insights';
