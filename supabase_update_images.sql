-- -----------------------------------------------------------------------------
-- UPDATE IMAGE PATHS TO SUPABASE STORAGE
-- -----------------------------------------------------------------------------

-- Base URL for your Supabase Storage bucket
-- We will replace '/characters/' with this URL
-- And also replace spaces ' ' with '%20' for URL safety

UPDATE public.characters
SET image = REPLACE(
    REPLACE(image, '/characters/', 'https://cxzzakslsiynhjeyhejo.supabase.co/storage/v1/object/public/characters/'),
    ' ', '%20'
);
