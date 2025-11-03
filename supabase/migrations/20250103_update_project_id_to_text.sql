-- Migration: Update project ID from UUID to TEXT
-- This allows custom project IDs like "project_1762158816652_0v3iutxv6"

-- Step 1: Drop all RLS policies that depend on the columns we're changing (only if tables exist)
DO $$ BEGIN
  -- Drop policies on projects table
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'projects') THEN
    DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
    DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
    DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
    DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;
  END IF;

  -- Drop policies on survey_responses table
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'survey_responses') THEN
    DROP POLICY IF EXISTS "Anyone can view published survey responses" ON survey_responses;
    DROP POLICY IF EXISTS "Anyone can insert survey responses" ON survey_responses;
  END IF;

  -- Drop policies on survey_analytics table
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'survey_analytics') THEN
    DROP POLICY IF EXISTS "Users can view analytics for their surveys" ON survey_analytics;
    DROP POLICY IF EXISTS "System can manage survey analytics" ON survey_analytics;
  END IF;

  -- Drop policies on chat_messages table
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'chat_messages') THEN
    DROP POLICY IF EXISTS "Users can view their own messages" ON chat_messages;
    DROP POLICY IF EXISTS "Users can insert their own messages" ON chat_messages;
  END IF;

  -- Drop policies on survey_questions table
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'survey_questions') THEN
    DROP POLICY IF EXISTS "Users can view survey questions for their projects" ON survey_questions;
    DROP POLICY IF EXISTS "Users can insert survey questions for their projects" ON survey_questions;
    DROP POLICY IF EXISTS "Users can update survey questions for their projects" ON survey_questions;
    DROP POLICY IF EXISTS "Users can delete survey questions for their projects" ON survey_questions;
  END IF;

  -- Drop policies on ai_feedback table
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ai_feedback') THEN
    DROP POLICY IF EXISTS "ai_feedback_owner" ON ai_feedback;
  END IF;

  -- Drop policies on checkpoints table
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'checkpoints') THEN
    DROP POLICY IF EXISTS "checkpoints_owner" ON checkpoints;
  END IF;

  -- Drop policies on rag_chunks table
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'rag_chunks') THEN
    DROP POLICY IF EXISTS "rag_chunks_owner" ON rag_chunks;
  END IF;
END $$;

-- Step 2: Drop foreign key constraints that reference projects.id
ALTER TABLE IF EXISTS ai_feedback DROP CONSTRAINT IF EXISTS ai_feedback_project_id_fkey;
ALTER TABLE IF EXISTS checkpoints DROP CONSTRAINT IF EXISTS checkpoints_project_id_fkey;
ALTER TABLE IF EXISTS survey_responses DROP CONSTRAINT IF EXISTS survey_responses_survey_id_fkey;
ALTER TABLE IF EXISTS chat_messages DROP CONSTRAINT IF EXISTS chat_messages_project_id_fkey;
ALTER TABLE IF EXISTS survey_analytics DROP CONSTRAINT IF EXISTS survey_analytics_survey_id_fkey;
ALTER TABLE IF EXISTS survey_questions DROP CONSTRAINT IF EXISTS survey_questions_project_id_fkey;
ALTER TABLE IF EXISTS rag_chunks DROP CONSTRAINT IF EXISTS rag_chunks_project_id_fkey;

-- Step 3: Alter the projects table to change id from UUID to TEXT
ALTER TABLE projects ALTER COLUMN id DROP DEFAULT;
ALTER TABLE projects ALTER COLUMN id TYPE TEXT USING id::TEXT;

-- Step 4: Update related tables to use TEXT for project_id references
ALTER TABLE IF EXISTS ai_feedback ALTER COLUMN project_id TYPE TEXT USING project_id::TEXT;
ALTER TABLE IF EXISTS checkpoints ALTER COLUMN project_id TYPE TEXT USING project_id::TEXT;
ALTER TABLE IF EXISTS survey_responses ALTER COLUMN survey_id TYPE TEXT USING survey_id::TEXT;
ALTER TABLE IF EXISTS chat_messages ALTER COLUMN project_id TYPE TEXT USING project_id::TEXT;
ALTER TABLE IF EXISTS survey_analytics ALTER COLUMN survey_id TYPE TEXT USING survey_id::TEXT;
ALTER TABLE IF EXISTS survey_questions ALTER COLUMN project_id TYPE TEXT USING project_id::TEXT;
ALTER TABLE IF EXISTS rag_chunks ALTER COLUMN project_id TYPE TEXT USING project_id::TEXT;

-- Step 5: Re-add foreign key constraints
ALTER TABLE IF EXISTS ai_feedback ADD CONSTRAINT ai_feedback_project_id_fkey
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS checkpoints ADD CONSTRAINT checkpoints_project_id_fkey
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS survey_responses ADD CONSTRAINT survey_responses_survey_id_fkey
  FOREIGN KEY (survey_id) REFERENCES projects(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS chat_messages ADD CONSTRAINT chat_messages_project_id_fkey
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS survey_analytics ADD CONSTRAINT survey_analytics_survey_id_fkey
  FOREIGN KEY (survey_id) REFERENCES projects(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS survey_questions ADD CONSTRAINT survey_questions_project_id_fkey
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS rag_chunks ADD CONSTRAINT rag_chunks_project_id_fkey
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- Step 6: Recreate RLS policies (only for tables that exist)
DO $$ BEGIN
  -- Projects policies
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'projects') THEN
    CREATE POLICY "Users can view their own projects"
      ON projects FOR SELECT
      USING (user_id = auth.uid());

    CREATE POLICY "Users can insert their own projects"
      ON projects FOR INSERT
      WITH CHECK (user_id = auth.uid());

    CREATE POLICY "Users can update their own projects"
      ON projects FOR UPDATE
      USING (user_id = auth.uid());

    CREATE POLICY "Users can delete their own projects"
      ON projects FOR DELETE
      USING (user_id = auth.uid());
  END IF;

  -- Survey responses policies
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'survey_responses') THEN
    CREATE POLICY "Anyone can view published survey responses"
      ON survey_responses FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM projects
          WHERE projects.id = survey_responses.survey_id
          AND (projects.user_id = auth.uid() OR projects.published_url IS NOT NULL)
        )
      );

    CREATE POLICY "Anyone can insert survey responses"
      ON survey_responses FOR INSERT
      WITH CHECK (true);
  END IF;

  -- Survey analytics policies
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'survey_analytics') THEN
    CREATE POLICY "Users can view analytics for their surveys"
      ON survey_analytics FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM projects
          WHERE projects.id = survey_analytics.survey_id
          AND projects.user_id = auth.uid()
        )
      );

    CREATE POLICY "System can manage survey analytics"
      ON survey_analytics FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;

  -- Chat messages policies
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'chat_messages') THEN
    CREATE POLICY "Users can view their own messages"
      ON chat_messages FOR SELECT
      USING (user_id = auth.uid());

    CREATE POLICY "Users can insert their own messages"
      ON chat_messages FOR INSERT
      WITH CHECK (user_id = auth.uid());
  END IF;

  -- Survey questions policies
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'survey_questions') THEN
    CREATE POLICY "Users can view survey questions for their projects"
      ON survey_questions FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM projects
          WHERE projects.id = survey_questions.project_id
          AND projects.user_id = auth.uid()
        )
      );

    CREATE POLICY "Users can insert survey questions for their projects"
      ON survey_questions FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM projects
          WHERE projects.id = survey_questions.project_id
          AND projects.user_id = auth.uid()
        )
      );

    CREATE POLICY "Users can update survey questions for their projects"
      ON survey_questions FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM projects
          WHERE projects.id = survey_questions.project_id
          AND projects.user_id = auth.uid()
        )
      );

    CREATE POLICY "Users can delete survey questions for their projects"
      ON survey_questions FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM projects
          WHERE projects.id = survey_questions.project_id
          AND projects.user_id = auth.uid()
        )
      );
  END IF;

  -- AI feedback policies
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ai_feedback') THEN
    CREATE POLICY "ai_feedback_owner" ON ai_feedback FOR ALL
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;

  -- Checkpoints policies
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'checkpoints') THEN
    CREATE POLICY "checkpoints_owner" ON checkpoints FOR ALL
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;

  -- RAG chunks policies
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'rag_chunks') THEN
    CREATE POLICY "rag_chunks_owner" ON rag_chunks FOR ALL
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- Note: After running this migration, ensure your application code
-- generates TEXT project IDs (e.g., "project_" + timestamp + random string)
-- instead of relying on UUID generation
