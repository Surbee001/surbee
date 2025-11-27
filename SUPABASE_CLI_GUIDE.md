# Supabase CLI Guide

## ✅ Supabase CLI is Installed!

**Version:** 2.58.5
**Location:** `./supabase-cli` in project root

---

## Quick Commands

### Using npm scripts (recommended):

```bash
# Create a new migration
npm run db:migration:new <migration_name>

# Push migrations to Supabase
npm run db:push

# Reset database (CAUTION: deletes all data)
npm run db:reset

# Access Supabase CLI directly
npm run supabase -- <command>
```

### Using CLI directly:

```bash
# Create new migration
./supabase-cli migration new <migration_name>

# Push all pending migrations to remote database
./supabase-cli db push

# Check CLI version
./supabase-cli --version

# Get help
./supabase-cli --help
```

---

## Common Workflows

### 1. Create a New Migration

**When I need to create a migration for you:**

```bash
# Example: Add a new table
npm run db:migration:new add_user_preferences

# This creates: supabase/migrations/<timestamp>_add_user_preferences.sql
```

Then I'll write the SQL in that file:
```sql
-- supabase/migrations/20250121_add_user_preferences.sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  theme TEXT DEFAULT 'dark',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Apply Migrations to Database

**After creating migration files:**

```bash
# Push all pending migrations to your Supabase project
npm run db:push
```

This will:
- ✅ Connect to your remote Supabase project
- ✅ Check which migrations haven't been applied yet
- ✅ Run them in order
- ✅ Record them in `supabase_migrations` table

### 3. Manual Migration (Current Method)

**If you prefer the manual approach:**

1. I create the SQL file in `supabase/migrations/`
2. You go to Supabase Dashboard → SQL Editor
3. Copy the SQL from the migration file
4. Run it manually

---

## Setup Requirements

### First Time Setup

Before using `db:push`, you need to link your project:

```bash
# Initialize Supabase in this project (one-time)
./supabase-cli init

# Link to your remote project
./supabase-cli link --project-ref <your-project-ref>
```

**To find your project ref:**
1. Go to your Supabase dashboard
2. Look at the URL: `https://supabase.com/dashboard/project/<project-ref>`
3. Or find it in Project Settings → General

**You'll need your database password** (the one you set when creating the project)

---

## Available Commands

### Database Management
```bash
./supabase-cli db push           # Push migrations to remote
./supabase-cli db pull           # Pull schema from remote
./supabase-cli db reset          # Reset local database
./supabase-cli db diff           # Show schema differences
```

### Migration Management
```bash
./supabase-cli migration new <name>    # Create new migration file
./supabase-cli migration list          # List all migrations
./supabase-cli migration repair        # Repair migration history
```

### Project Management
```bash
./supabase-cli init              # Initialize Supabase project
./supabase-cli link              # Link to remote project
./supabase-cli status            # Check project status
```

### Local Development (Optional)
```bash
./supabase-cli start             # Start local Supabase (Docker required)
./supabase-cli stop              # Stop local Supabase
./supabase-cli db reset --local  # Reset local database
```

---

## Current Migrations

**Existing migrations in your project:**

1. ✅ `20250103_update_project_id_to_text.sql` - Convert project IDs to text
2. ✅ `20250112_add_preview_and_sandbox.sql` - Add preview/sandbox support
3. ✅ `20250115_add_analysis_dots.sql` - Add analysis dots system
4. ✅ `20250121_add_chat_sessions.sql` - Add chat session management

**Status:** These migrations should already be applied manually via dashboard.

---

## Migration File Naming Convention

**Format:** `YYYYMMDD_descriptive_name.sql`

**Examples:**
- `20250121_add_chat_sessions.sql`
- `20250122_add_user_preferences.sql`
- `20250123_alter_projects_table.sql`

**Best Practices:**
- ✅ Use descriptive names
- ✅ One logical change per migration
- ✅ Include both UP and DOWN migrations (if needed)
- ✅ Test migrations on staging first
- ✅ Never edit applied migrations (create new ones instead)

---

## Example: Complete Migration Workflow

### Scenario: Add email notifications preference

**Step 1: Create migration**
```bash
npm run db:migration:new add_email_notifications
```

**Step 2: I write the SQL**
```sql
-- supabase/migrations/20250122_add_email_notifications.sql
ALTER TABLE user_preferences
ADD COLUMN email_notifications BOOLEAN DEFAULT true;

-- Add index for faster queries
CREATE INDEX idx_user_prefs_notifications
ON user_preferences(user_id, email_notifications);
```

**Step 3: Apply to database**
```bash
# Option A: Using CLI (if linked)
npm run db:push

# Option B: Manual via dashboard
# Copy SQL and run in Supabase Dashboard → SQL Editor
```

**Step 4: Verify**
```sql
-- Check table structure
SELECT * FROM user_preferences LIMIT 1;

-- Check migrations table
SELECT * FROM supabase_migrations
ORDER BY executed_at DESC
LIMIT 5;
```

---

## Benefits of Using Supabase CLI

### ✅ **Version Control**
- All schema changes tracked in git
- Easy to see database evolution over time
- Can roll back if needed

### ✅ **Team Collaboration**
- Everyone sees the same migrations
- No manual schema documentation needed
- Reduces "works on my machine" issues

### ✅ **Automated Deployment**
- Can run `db:push` in CI/CD pipeline
- Consistent schema across environments
- No manual steps during deployment

### ✅ **Safety**
- Migrations run in transaction (by default)
- Can't apply same migration twice
- Clear audit trail in `supabase_migrations` table

---

## Troubleshooting

### "Database password required"
**Solution:** You need to link your project first:
```bash
./supabase-cli link --project-ref <your-project-ref>
```

### "Migration already applied"
**Solution:** The migration was already run. Check the database:
```sql
SELECT * FROM supabase_migrations WHERE name = '<migration_name>';
```

### "Permission denied"
**Solution:** Make CLI executable:
```bash
chmod +x ./supabase-cli
```

### "Docker required for local development"
**Solution:** Local Supabase requires Docker. For remote only, you don't need it.
```bash
# Skip local dev, use remote only
./supabase-cli link --project-ref <ref>
./supabase-cli db push
```

---

## What I Can Do Now

With the Supabase CLI installed, I can:

1. ✅ **Create migration files** - Generate properly named SQL files
2. ✅ **Write SQL schemas** - Tables, indexes, functions, triggers
3. ✅ **Modify existing tables** - ALTER TABLE, ADD COLUMN, etc.
4. ✅ **Create RLS policies** - Row Level Security rules
5. ✅ **Add database functions** - PL/pgSQL stored procedures
6. ✅ **Setup triggers** - Automatic actions on data changes
7. ✅ **Version control all changes** - Every schema change tracked

**Just let me know what database changes you need!**

---

## Next Steps

### To start using CLI features:

1. **Link your project** (one-time setup):
   ```bash
   ./supabase-cli link --project-ref <your-project-ref>
   ```

2. **Tell me what database changes you need**, and I'll:
   - Create the migration file
   - Write the SQL
   - You run `npm run db:push` to apply it

3. **Or continue manual approach**:
   - I create migration files
   - You copy SQL to dashboard
   - Both methods work great!

---

**CLI Location:** `/Users/hadi/surbee/supabase-cli`
**Migrations Folder:** `/Users/hadi/surbee/supabase/migrations/`
**Documentation:** https://supabase.com/docs/guides/cli
