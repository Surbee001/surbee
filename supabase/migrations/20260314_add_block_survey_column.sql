-- Add block_survey JSONB column to projects table
-- This stores the block-based survey editor data (pages, blocks, theme, settings)
-- alongside the existing sandbox_bundle column for backward compatibility.

ALTER TABLE projects ADD COLUMN IF NOT EXISTS block_survey JSONB DEFAULT NULL;

-- Add an index for querying projects by block_survey existence
CREATE INDEX IF NOT EXISTS idx_projects_block_survey_not_null
  ON projects ((block_survey IS NOT NULL))
  WHERE block_survey IS NOT NULL;

COMMENT ON COLUMN projects.block_survey IS 'Block-based survey editor data (pages, blocks, theme, settings). Used by the new block editor. When present, takes precedence over sandbox_bundle for rendering.';
