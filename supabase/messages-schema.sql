-- Messages table for chat history persistence
-- Stores all chat messages between users and AI agents

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES auth.sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_user BOOLEAN NOT NULL DEFAULT true,
    model_used TEXT, -- which Together AI model was used
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can only read their own messages
CREATE POLICY "Users can read their own messages"
ON messages FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can only insert their own messages
CREATE POLICY "Users can insert their own messages"
ON messages FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can only update their own messages
CREATE POLICY "Users can update their own messages"
ON messages FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can only delete their own messages
CREATE POLICY "Users can delete their own messages"
ON messages FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_agent_id ON messages(agent_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Composite index for fetching chat history efficiently
CREATE INDEX IF NOT EXISTS idx_messages_user_agent_created 
ON messages(user_id, agent_id, created_at DESC);

-- Function to get recent messages for a user-agent pair
CREATE OR REPLACE FUNCTION get_recent_messages(
    p_user_id UUID,
    p_agent_id UUID,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    content TEXT,
    is_user BOOLEAN,
    model_used TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT m.id, m.content, m.is_user, m.model_used, m.created_at
    FROM messages m
    WHERE m.user_id = p_user_id
      AND m.agent_id = p_agent_id
    ORDER BY m.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
