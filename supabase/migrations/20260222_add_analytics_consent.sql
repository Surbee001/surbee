-- Migration: Add analytics consent columns to user_profiles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'analytics_consent') THEN
    ALTER TABLE user_profiles ADD COLUMN analytics_consent BOOLEAN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'analytics_consent_asked_at') THEN
    ALTER TABLE user_profiles ADD COLUMN analytics_consent_asked_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;
