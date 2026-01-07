-- Add marketplace fields to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_marketplace_visible BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS remix_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS remixed_from_id UUID REFERENCES projects(id) ON DELETE SET NULL;

-- Create index for marketplace queries
CREATE INDEX IF NOT EXISTS idx_projects_marketplace ON projects(status, is_marketplace_visible) WHERE status = 'published' AND is_marketplace_visible = TRUE;

-- Create index for template queries
CREATE INDEX IF NOT EXISTS idx_projects_templates ON projects(is_template) WHERE is_template = TRUE;

-- Add comment for documentation
COMMENT ON COLUMN projects.is_template IS 'If true, this project is a template that can be remixed by other users';
COMMENT ON COLUMN projects.is_marketplace_visible IS 'If true, this project is visible in the marketplace';
COMMENT ON COLUMN projects.remix_count IS 'Number of times this project has been remixed';
COMMENT ON COLUMN projects.remixed_from_id IS 'The original project this was remixed from, if applicable';
