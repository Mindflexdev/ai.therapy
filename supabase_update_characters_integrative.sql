-- -----------------------------------------------------------------------------
-- UPDATE CHARACTERS: SET INTEGRATIVE & REMOVE TYPE
-- -----------------------------------------------------------------------------

-- 1. Set therapy_styles to empty array for ALL characters
-- In the app, an empty array [] is interpreted as "Integrative Therapy (AI decides)"
UPDATE public.characters 
SET therapy_styles = ARRAY[]::text[];

-- 2. Drop the 'type' column as requested
ALTER TABLE public.characters DROP COLUMN IF EXISTS type;
