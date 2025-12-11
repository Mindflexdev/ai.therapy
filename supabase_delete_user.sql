DO $$
DECLARE uid uuid := 'dcc40d11-0d8d-4753-8204-0f5b2f08c18e'; -- Replace with actual ID
BEGIN
  -- 1. Dependent data cleanup
  -- Note: If your tables have "ON DELETE CASCADE" foreign keys pointing to auth.users, 
  -- steps 1 might happen automatically, but doing it manually ensures thoroughness.
  
  -- Chat Sessions
  DELETE FROM public.chat_sessions WHERE user_id = uid;

  -- Memory (Chat messages)
  DELETE FROM public.memory WHERE session_id LIKE uid || '%';

  -- User Analytics (Fix for VK constraint error)
  DELETE FROM public.user_analytics WHERE user_id = uid;

  -- User Profile (in public.users)
  DELETE FROM public.users WHERE id = uid;

  -- 2. Delete auth user (Supabase Auth)
  -- Instead of calling a function, we delete directly from the table.
  DELETE FROM auth.users WHERE id = uid;
  
  RAISE NOTICE 'User cleanup completed.';
END $$;
