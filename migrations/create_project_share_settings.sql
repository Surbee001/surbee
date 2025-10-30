-- Create project_share_settings table
CREATE TABLE IF NOT EXISTS project_share_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  custom_slug TEXT UNIQUE,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_project_share_settings_project_id ON project_share_settings(project_id);
CREATE INDEX IF NOT EXISTS idx_project_share_settings_user_id ON project_share_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_project_share_settings_custom_slug ON project_share_settings(custom_slug);

-- Add RLS policies
ALTER TABLE project_share_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own project settings
CREATE POLICY "Users can read their own project settings"
  ON project_share_settings
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Policy: Users can insert their own project settings
CREATE POLICY "Users can insert their own project settings"
  ON project_share_settings
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Policy: Users can update their own project settings
CREATE POLICY "Users can update their own project settings"
  ON project_share_settings
  FOR UPDATE
  USING (auth.uid()::text = user_id);

-- Policy: Users can delete their own project settings
CREATE POLICY "Users can delete their own project settings"
  ON project_share_settings
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_project_share_settings_updated_at
  BEFORE UPDATE ON project_share_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
