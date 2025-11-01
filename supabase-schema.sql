-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- AI feedback table
create table if not exists public.ai_feedback (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  user_id uuid,
  message_id text not null,
  kind text not null check (kind in ('copy','thumbs_up','thumbs_down','retry')),
  created_at timestamp with time zone default now()
);

-- Checkpoints table
create table if not exists public.checkpoints (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  user_id uuid,
  snapshot jsonb not null,
  created_at timestamp with time zone default now()
);

-- Projects table (enhanced version)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  survey_schema JSONB,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_url TEXT UNIQUE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes on projects
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_published_url ON projects(published_url);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- Survey responses table
CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  respondent_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  responses JSONB NOT NULL,
  mouse_data JSONB,
  keystroke_data JSONB,
  timing_data JSONB,
  device_data JSONB,
  fraud_score FLOAT DEFAULT 0,
  is_flagged BOOLEAN DEFAULT FALSE,
  flag_reasons TEXT[],
  ip_address TEXT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes on survey_responses
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_user_id ON survey_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_session_id ON survey_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_ip_address ON survey_responses(ip_address);
CREATE INDEX IF NOT EXISTS idx_survey_responses_created_at ON survey_responses(created_at DESC);

-- Survey analytics table (for aggregated data)
CREATE TABLE IF NOT EXISTS survey_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id UUID NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  total_responses INT DEFAULT 0,
  total_completions INT DEFAULT 0,
  completion_rate FLOAT DEFAULT 0,
  average_fraud_score FLOAT DEFAULT 0,
  flagged_count INT DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on survey_analytics
CREATE INDEX IF NOT EXISTS idx_survey_analytics_survey_id ON survey_analytics(survey_id);

-- Chat messages table (enhanced version)
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes on chat_messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_project_id ON chat_messages(project_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- Survey questions table
CREATE TABLE IF NOT EXISTS survey_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  project_id UUID NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'text_input', 'rating', 'yes_no')),
  order_index INTEGER NOT NULL DEFAULT 0,
  options TEXT[],
  required BOOLEAN NOT NULL DEFAULT false,

  CONSTRAINT survey_questions_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Create indexes for survey_questions
CREATE INDEX IF NOT EXISTS idx_survey_questions_project_id ON survey_questions(project_id);
CREATE INDEX IF NOT EXISTS idx_survey_questions_order_index ON survey_questions(order_index);

-- RAG: Knowledge chunks per project
create table if not exists public.rag_chunks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  source text, -- e.g., 'html', 'doc', 'note'
  path text,   -- optional logical path or section
  content text not null,
  embedding jsonb not null, -- store vector as JSON until pgvector is configured
  metadata jsonb default '{}',
  created_at timestamp with time zone default now()
);

create index if not exists idx_rag_chunks_project on public.rag_chunks(project_id);
create index if not exists idx_rag_chunks_created on public.rag_chunks(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_questions ENABLE ROW LEVEL SECURITY;
alter table public.ai_feedback enable row level security;
alter table public.checkpoints enable row level security;
alter table public.rag_chunks enable row level security;

-- RLS Policies for projects (users can only see their own projects OR published surveys)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'projects' AND policyname = 'Users can view their own projects'
  ) THEN
    CREATE POLICY "Users can view their own projects"
      ON projects FOR SELECT
      USING (auth.uid() = user_id OR published_url IS NOT NULL);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'projects' AND policyname = 'Users can insert their own projects'
  ) THEN
    CREATE POLICY "Users can insert their own projects"
      ON projects FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'projects' AND policyname = 'Users can update their own projects'
  ) THEN
    CREATE POLICY "Users can update their own projects"
      ON projects FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'projects' AND policyname = 'Users can delete their own projects'
  ) THEN
    CREATE POLICY "Users can delete their own projects"
      ON projects FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- RLS Policies for survey_responses
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'survey_responses' AND policyname = 'Anyone can view published survey responses'
  ) THEN
    CREATE POLICY "Anyone can view published survey responses"
      ON survey_responses FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM projects
          WHERE projects.id = survey_responses.survey_id
          AND (projects.user_id = auth.uid() OR projects.published_url IS NOT NULL)
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'survey_responses' AND policyname = 'Anyone can insert survey responses'
  ) THEN
    CREATE POLICY "Anyone can insert survey responses"
      ON survey_responses FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- RLS Policies for survey_analytics
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'survey_analytics' AND policyname = 'Users can view analytics for their surveys'
  ) THEN
    CREATE POLICY "Users can view analytics for their surveys"
      ON survey_analytics FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM projects
          WHERE projects.id = survey_analytics.survey_id
          AND projects.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'survey_analytics' AND policyname = 'System can manage survey analytics'
  ) THEN
    CREATE POLICY "System can manage survey analytics"
      ON survey_analytics FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- RLS Policies for chat_messages
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'chat_messages' AND policyname = 'Users can view their own messages'
  ) THEN
    CREATE POLICY "Users can view their own messages"
      ON chat_messages FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'chat_messages' AND policyname = 'Users can insert their own messages'
  ) THEN
    CREATE POLICY "Users can insert their own messages"
      ON chat_messages FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- RLS Policies for survey_questions
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'survey_questions' AND policyname = 'Users can view survey questions for their projects'
  ) THEN
    CREATE POLICY "Users can view survey questions for their projects"
      ON survey_questions FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM projects
          WHERE projects.id = survey_questions.project_id
          AND projects.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'survey_questions' AND policyname = 'Users can insert survey questions for their projects'
  ) THEN
    CREATE POLICY "Users can insert survey questions for their projects"
      ON survey_questions FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM projects
          WHERE projects.id = survey_questions.project_id
          AND projects.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'survey_questions' AND policyname = 'Users can update survey questions for their projects'
  ) THEN
    CREATE POLICY "Users can update survey questions for their projects"
      ON survey_questions FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM projects
          WHERE projects.id = survey_questions.project_id
          AND projects.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'survey_questions' AND policyname = 'Users can delete survey questions for their projects'
  ) THEN
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
END $$;

-- RLS policies for ai_feedback
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'ai_feedback' and policyname = 'ai_feedback_owner'
  ) then
    create policy ai_feedback_owner on public.ai_feedback for all
      using (coalesce(user_id, auth.uid()::text) = auth.uid()::text)
      with check (coalesce(user_id, auth.uid()::text) = auth.uid()::text);
  end if;
end $$;

-- RLS policies for checkpoints
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'checkpoints' and policyname = 'checkpoints_owner'
  ) then
    create policy checkpoints_owner on public.checkpoints for all
      using (coalesce(user_id, auth.uid()::text) = auth.uid()::text)
      with check (coalesce(user_id, auth.uid()::text) = auth.uid()::text);
  end if;
end $$;

-- RLS policies for rag_chunks
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'rag_chunks' and policyname = 'rag_chunks_owner'
  ) then
    create policy rag_chunks_owner on public.rag_chunks for all
      using (coalesce(user_id, auth.uid()) = auth.uid())
      with check (coalesce(user_id, auth.uid()) = auth.uid());
  end if;
end $$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for survey_analytics updated_at
DROP TRIGGER IF EXISTS update_survey_analytics_updated_at ON survey_analytics;
CREATE TRIGGER update_survey_analytics_updated_at
  BEFORE UPDATE ON survey_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
