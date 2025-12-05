-- Create characters table
CREATE TABLE IF NOT EXISTS public.characters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    image TEXT,
    image_description TEXT,
    greeting TEXT,
    therapy_styles TEXT[], -- Array of strings
    type TEXT DEFAULT 'human',
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

-- Policies

-- 1. Users can view their own characters
CREATE POLICY "Users can view their own characters" 
ON public.characters FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Users can view public characters
CREATE POLICY "Users can view public characters" 
ON public.characters FOR SELECT 
USING (is_public = true);

-- 3. Users can create characters
CREATE POLICY "Users can create characters" 
ON public.characters FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 4. Users can update their own characters
CREATE POLICY "Users can update their own characters" 
ON public.characters FOR UPDATE 
USING (auth.uid() = user_id);

-- 5. Users can delete their own characters
CREATE POLICY "Users can delete their own characters" 
ON public.characters FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_characters_user_id ON public.characters(user_id);
CREATE INDEX IF NOT EXISTS idx_characters_is_public ON public.characters(is_public);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to call the function before update
CREATE TRIGGER update_characters_updated_at
    BEFORE UPDATE ON public.characters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
