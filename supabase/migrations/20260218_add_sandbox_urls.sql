-- Add Modal sandbox URL columns to projects table
-- These store the tunnel URLs for the live sandbox associated with each project

ALTER TABLE projects ADD COLUMN IF NOT EXISTS sandbox_object_id TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS sandbox_relay_url TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS sandbox_preview_url TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS sandbox_last_heartbeat TIMESTAMPTZ;
