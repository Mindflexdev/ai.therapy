-- SQL Migration for User Preferences and Onboarding
-- Run this in your Supabase SQL Editor

-- Add columns to users table for language, onboarding, and goals
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en',
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS user_goals TEXT[] DEFAULT '{}';

-- Add comment to explain the columns
COMMENT ON COLUMN users.preferred_language IS 'User preferred language: en or de';
COMMENT ON COLUMN users.onboarding_completed IS 'Whether user has completed onboarding flow';
COMMENT ON COLUMN users.user_goals IS 'Array of user selected goals (e.g., sleep, stress, happiness)';

-- Example goals values:
-- {'sleep', 'stress', 'happiness', 'anxiety', 'performance', 'self-esteem', 'gratitude'}

-- Optional: Create an index for faster language queries
CREATE INDEX IF NOT EXISTS idx_users_preferred_language ON users(preferred_language);

-- Optional: Add a check constraint to ensure valid languages
ALTER TABLE users 
ADD CONSTRAINT check_preferred_language 
CHECK (preferred_language IN ('en', 'de'));
