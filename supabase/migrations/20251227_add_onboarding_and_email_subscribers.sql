-- Migration: Add onboarding fields to user_profiles and create email_subscribers table
-- This enables tracking of onboarding data and email subscription for Loops integration

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  age INTEGER,
  interests TEXT[],
  survey_preference TEXT CHECK (survey_preference IN ('research', 'fast')),
  heard_from TEXT,
  accepted_terms_at TIMESTAMP WITH TIME ZONE,
  subscribed_to_emails BOOLEAN DEFAULT FALSE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns if they don't exist (for existing tables)
DO $$
BEGIN
  -- Add interests column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'interests') THEN
    ALTER TABLE user_profiles ADD COLUMN interests TEXT[];
  END IF;

  -- Add accepted_terms_at column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'accepted_terms_at') THEN
    ALTER TABLE user_profiles ADD COLUMN accepted_terms_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add subscribed_to_emails column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'subscribed_to_emails') THEN
    ALTER TABLE user_profiles ADD COLUMN subscribed_to_emails BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add onboarding_completed column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'onboarding_completed') THEN
    ALTER TABLE user_profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Create indexes on user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_onboarding_completed ON user_profiles(onboarding_completed);

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles (users can only see/modify their own profile)
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- EMAIL SUBSCRIBERS TABLE (for Loops integration)
-- ============================================
-- This is separate from waitlist_subscribers to track users who opted in during onboarding
-- Can be synced with Loops for welcome emails and marketing

CREATE TABLE IF NOT EXISTS email_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  name TEXT,
  source TEXT NOT NULL DEFAULT 'onboarding',
  interests TEXT[],
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT email_subscribers_email_unique UNIQUE (email)
);

-- Create indexes on email_subscribers
CREATE INDEX IF NOT EXISTS idx_email_subscribers_email ON email_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_user_id ON email_subscribers(user_id);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_is_active ON email_subscribers(is_active);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_source ON email_subscribers(source);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_created_at ON email_subscribers(created_at DESC);

-- Enable RLS on email_subscribers (admin only for reading, service role for inserts)
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to be inserted via API (service role bypasses RLS)
-- Regular users cannot read/modify this table directly
DROP POLICY IF EXISTS "Service role can manage email subscribers" ON email_subscribers;
CREATE POLICY "Service role can manage email subscribers"
  ON email_subscribers FOR ALL
  USING (true)
  WITH CHECK (true);
