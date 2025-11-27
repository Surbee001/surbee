-- Add preview_image_url column to projects table for survey screenshots
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS preview_image_url TEXT;

-- Add index for faster queries when filtering by preview existence
CREATE INDEX IF NOT EXISTS idx_projects_preview_url
ON public.projects(preview_image_url)
WHERE preview_image_url IS NOT NULL;

-- Add last_preview_generated_at to track when screenshot was last taken
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS last_preview_generated_at TIMESTAMPTZ;

-- Add index for sorting by latest preview
CREATE INDEX IF NOT EXISTS idx_projects_last_preview
ON public.projects(last_preview_generated_at DESC NULLS LAST);

COMMENT ON COLUMN public.projects.preview_image_url IS 'URL or base64 data URI of the survey preview screenshot';
COMMENT ON COLUMN public.projects.last_preview_generated_at IS 'Timestamp when the preview screenshot was last generated';
