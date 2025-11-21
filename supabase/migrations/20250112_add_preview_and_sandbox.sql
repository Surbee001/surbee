-- Add preview_image and sandbox_bundle columns to projects table

-- Add preview_image column (stores data URL or uploaded image URL)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS preview_image TEXT;

-- Add sandbox_bundle column (stores JSON of sandbox files and configuration)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS sandbox_bundle JSONB;

-- Create index on preview_image for faster lookups
CREATE INDEX IF NOT EXISTS idx_projects_preview_image ON projects(preview_image) WHERE preview_image IS NOT NULL;

-- Add comment to explain the columns
COMMENT ON COLUMN projects.preview_image IS 'Screenshot/preview image of the survey (data URL or cloud storage URL)';
COMMENT ON COLUMN projects.sandbox_bundle IS 'Sandbox files and configuration for displaying the survey';
