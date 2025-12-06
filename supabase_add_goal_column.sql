-- Add goal column to characters table
-- This allows users to specify their therapy goals when creating a character

-- Add the goal column to the characters table
ALTER TABLE characters
ADD COLUMN IF NOT EXISTS goal TEXT;

-- Add a comment to document the column
COMMENT ON COLUMN characters.goal IS 'User''s therapy goal or what they want to work on with this character';

-- Optional: Create an index if you plan to search/filter by goals
-- CREATE INDEX IF NOT EXISTS idx_characters_goal ON characters USING gin(to_tsvector('english', goal));

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'characters'
AND column_name = 'goal';
