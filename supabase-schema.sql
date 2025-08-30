-- AI feedback table
create table if not exists public.ai_feedback (
  id uuid primary key default gen_random_uuid(),
  project_id text references public.projects(id) on delete cascade,
  user_id text,
  message_id text not null,
  kind text not null check (kind in ('copy','thumbs_up','thumbs_down','retry')),
  created_at timestamp with time zone default now()
);

-- Checkpoints table
create table if not exists public.checkpoints (
  id uuid primary key default gen_random_uuid(),
  project_id text references public.projects(id) on delete cascade,
  user_id text,
  snapshot jsonb not null,
  created_at timestamp with time zone default now()
);

-- RLS
alter table public.ai_feedback enable row level security;
alter table public.checkpoints enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'ai_feedback' and policyname = 'ai_feedback_owner'
  ) then
    create policy ai_feedback_owner on public.ai_feedback for all
      using (coalesce(user_id, auth.uid()::text) = auth.uid()::text)
      with check (coalesce(user_id, auth.uid()::text) = auth.uid()::text);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'checkpoints' and policyname = 'checkpoints_owner'
  ) then
    create policy checkpoints_owner on public.checkpoints for all
      using (coalesce(user_id, auth.uid()::text) = auth.uid()::text)
      with check (coalesce(user_id, auth.uid()::text) = auth.uid()::text);
  end if;
end $$;
-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  user_id UUID NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  
  CONSTRAINT projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  project_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_user BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}',
  
  CONSTRAINT chat_messages_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT chat_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create survey_questions table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_project_id ON chat_messages(project_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_survey_questions_project_id ON survey_questions(project_id);
CREATE INDEX IF NOT EXISTS idx_survey_questions_order_index ON survey_questions(order_index);

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_questions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view chat messages for their projects" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = chat_messages.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert chat messages for their projects" ON chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = chat_messages.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view survey questions for their projects" ON survey_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = survey_questions.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert survey questions for their projects" ON survey_questions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = survey_questions.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update survey questions for their projects" ON survey_questions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = survey_questions.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete survey questions for their projects" ON survey_questions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = survey_questions.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column(); 

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

alter table public.rag_chunks enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'rag_chunks' and policyname = 'rag_chunks_owner'
  ) then
    create policy rag_chunks_owner on public.rag_chunks for all
      using (coalesce(user_id, auth.uid()) = auth.uid())
      with check (coalesce(user_id, auth.uid()) = auth.uid());
  end if;
end $$;

create index if not exists idx_rag_chunks_project on public.rag_chunks(project_id);
create index if not exists idx_rag_chunks_created on public.rag_chunks(created_at);
