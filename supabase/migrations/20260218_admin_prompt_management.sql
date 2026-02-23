-- Agent config: single-row table for main prompt + shared memory
CREATE TABLE IF NOT EXISTS agent_config (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    main_prompt TEXT NOT NULL DEFAULT '',
    shared_memory TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed the single row
INSERT INTO agent_config (id, main_prompt, shared_memory)
VALUES (1, '', '')
ON CONFLICT (id) DO NOTHING;

-- Therapeutic skills
CREATE TABLE IF NOT EXISTS therapeutic_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    prompt_text TEXT NOT NULL DEFAULT '',
    enabled BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure characters has name and soul columns (they already exist based on the code, but be safe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'characters' AND column_name = 'soul') THEN
        ALTER TABLE characters ADD COLUMN soul TEXT NOT NULL DEFAULT '';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'characters' AND column_name = 'name') THEN
        ALTER TABLE characters ADD COLUMN name TEXT NOT NULL DEFAULT '';
    END IF;
END $$;

-- RLS for agent_config
ALTER TABLE agent_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agent_config_read" ON agent_config
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "agent_config_write" ON agent_config
    FOR ALL TO authenticated
    USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- RLS for therapeutic_skills
ALTER TABLE therapeutic_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "skills_read" ON therapeutic_skills
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "skills_write" ON therapeutic_skills
    FOR ALL TO authenticated
    USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
