-- Migration: Restrict characters (agents) table write access to admin users only
-- Previously: any authenticated user could INSERT/UPDATE/DELETE
-- After: only users with app_metadata.role = 'admin' can modify rows
--
-- To grant admin role to a user, run via Supabase SQL editor or service role API:
--   UPDATE auth.users SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}' WHERE id = '<user-id>';

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Agents are manageable by authenticated users" ON characters;

-- Keep SELECT open for all authenticated users (therapist data needed by the app)
-- Note: the existing "readable by everyone" SELECT policy may already cover this;
-- this ensures authenticated users can read all rows (including inactive ones if needed).

-- Admin-only INSERT
CREATE POLICY "characters_insert_admin_only"
ON characters FOR INSERT
TO authenticated
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- Admin-only UPDATE
CREATE POLICY "characters_update_admin_only"
ON characters FOR UPDATE
TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- Admin-only DELETE
CREATE POLICY "characters_delete_admin_only"
ON characters FOR DELETE
TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
