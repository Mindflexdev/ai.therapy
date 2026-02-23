-- Migration: Align messages table schema to frontend (chat.tsx) usage
--
-- The frontend inserts with: session_id (text), message (jsonb), message_type (text),
-- content (text), character_name (text), user_id (uuid).
-- The original schema had session_id as UUID REFERENCES auth.sessions(id) and lacked
-- message, message_type, and character_name columns.

-- 1. Change session_id from UUID (FK to auth.sessions) to TEXT
--    The frontend generates random string session IDs stored in localStorage.
ALTER TABLE messages
    ALTER COLUMN session_id TYPE TEXT USING session_id::TEXT,
    ALTER COLUMN session_id DROP NOT NULL;

-- Drop the foreign key constraint on session_id (if it exists)
DO $$
BEGIN
    -- Find and drop FK constraints referencing auth.sessions on session_id
    PERFORM 1 FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
        WHERE tc.table_name = 'messages'
          AND tc.constraint_type = 'FOREIGN KEY'
          AND ccu.column_name = 'session_id';
    IF FOUND THEN
        EXECUTE (
            SELECT 'ALTER TABLE messages DROP CONSTRAINT ' || tc.constraint_name
            FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_name = 'messages'
              AND tc.constraint_type = 'FOREIGN KEY'
              AND kcu.column_name = 'session_id'
            LIMIT 1
        );
    END IF;
END $$;

-- 2. Add missing columns used by the frontend
ALTER TABLE messages ADD COLUMN IF NOT EXISTS message JSONB;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type TEXT; -- 'user' or 'ai'
ALTER TABLE messages ADD COLUMN IF NOT EXISTS character_name TEXT;

-- 3. Make content nullable (schema had NOT NULL, but let's keep it; frontend always provides it)
--    Make agent_id, is_user, model_used optional (frontend doesn't use them but no need to drop)

-- 4. Recreate the index on session_id (type changed)
DROP INDEX IF EXISTS idx_messages_session_id;
CREATE INDEX idx_messages_session_id ON messages(session_id);

-- 5. Add index for character_name queries (frontend filters by it)
CREATE INDEX IF NOT EXISTS idx_messages_character_name ON messages(character_name);

-- 6. Composite index for the frontend's primary query pattern
CREATE INDEX IF NOT EXISTS idx_messages_session_character_created
    ON messages(session_id, character_name, created_at);
