# Database Migration Instructions

## Issue
The application was generating custom project IDs (e.g., `project_1762158816652_0v3iutxv6`) but the database was expecting UUID format, causing errors when publishing surveys:

```
ERROR: invalid input syntax for type uuid: "project_1762158816652_0v3iutxv6"
```

Additionally, Row Level Security (RLS) policies were preventing the column type changes.

## Solution
We've updated the schema to use TEXT for project IDs instead of UUIDs.

## How to Apply the Migration

### Option 1: Using Supabase CLI (Recommended)

If you have Supabase CLI installed:

```bash
# Navigate to your project directory
cd /Users/hadi/surbee

# Apply the migration
supabase db push
```

### Option 2: Manual SQL Execution

1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Run the migration file: `supabase/migrations/20250103_update_project_id_to_text.sql`

Or copy and paste this SQL directly:

The complete migration SQL is available in:
`supabase/migrations/20250103_update_project_id_to_text.sql`

**Important:** This migration handles:
- ✅ Dropping all RLS policies that depend on the columns
- ✅ Removing foreign key constraints
- ✅ Converting UUID columns to TEXT
- ✅ Restoring foreign key constraints
- ✅ Recreating all RLS policies

### Option 3: Reset Database (Development Only)

If you're in development and can afford to lose data:

```bash
supabase db reset
```

## Verification

After running the migration, verify it worked:

```sql
-- Check the projects table structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'projects' AND column_name = 'id';
-- Should return: id | text

-- Test creating a project with custom ID
INSERT INTO projects (id, user_id, title, status)
VALUES ('project_test_123', 'your-user-uuid', 'Test Project', 'draft');
```

## What Changed

### Schema Files Updated:
- ✅ `src/lib/db/schema.sql` - Projects table ID changed to TEXT
- ✅ `supabase-schema.sql` - All project references updated to TEXT
- ✅ `src/lib/services/projects.ts` - Now generates custom project IDs

### Tables Affected:
- `projects` - ID column changed from UUID to TEXT
- `ai_feedback` - project_id changed from UUID to TEXT
- `checkpoints` - project_id changed from UUID to TEXT
- `survey_responses` - survey_id changed from UUID to TEXT
- `chat_messages` - project_id changed from UUID to TEXT
- `survey_analytics` - survey_id changed from UUID to TEXT
- `survey_questions` - project_id changed from UUID to TEXT
- `rag_chunks` - project_id changed from UUID to TEXT

### RLS Policies Recreated:
All Row Level Security policies are properly recreated after the column type changes to ensure data security is maintained.

## Next Steps

After running the migration, the publish functionality should work correctly with custom project IDs.
