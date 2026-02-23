-- =============================================================================
-- Migration: Create profiles table for ai.therapy
-- Date: 2026-02-18
-- Description: Public profiles table extending auth.users with app-specific
--              data. Supports Apple Auth, Google Auth, and Email Magic Link.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Profiles table
-- -----------------------------------------------------------------------------
create table public.profiles (
  id              uuid        primary key references auth.users (id) on delete cascade,
  email           text,
  display_name    text,
  avatar_url      text,
  auth_provider   text        not null check (auth_provider in ('apple', 'google', 'email')),
  subscription_tier text      not null default 'free',
  sessions_count  integer     not null default 0,
  last_active_at  timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.profiles is 'User profiles extending auth.users with app-specific data.';

-- Index for email lookups
create index idx_profiles_email on public.profiles (email) where email is not null;

-- -----------------------------------------------------------------------------
-- 2. Auto-update updated_at on row change
-- -----------------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_profiles_updated
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- 3. Auto-create profile on new auth.users signup
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  _provider   text;
  _name       text;
  _avatar     text;
  _email      text;
  _meta       jsonb;
begin
  _meta  := new.raw_user_meta_data;
  _email := new.email;

  -- Determine auth provider from the provider column
  if new.raw_app_meta_data->>'provider' = 'apple' then
    _provider := 'apple';
    -- Apple may provide first_name / last_name on first sign-in only
    _name := nullif(
      trim(concat_ws(' ',
        _meta->>'first_name',
        _meta->>'last_name'
      )),
      ''
    );
    _avatar := null;

  elsif new.raw_app_meta_data->>'provider' = 'google' then
    _provider := 'google';
    _name   := coalesce(_meta->>'full_name', _meta->>'name');
    _avatar := _meta->>'avatar_url';

  else
    -- Email magic link or any other provider
    _provider := 'email';
    _name   := _meta->>'full_name';
    _avatar := null;
  end if;

  insert into public.profiles (id, email, display_name, avatar_url, auth_provider)
  values (new.id, _email, _name, _avatar, _provider);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 4. Row Level Security
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;

-- Users can read their own profile
create policy "Users can read own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

-- Users can update only display_name and avatar_url on their own profile
create policy "Users can update own profile"
  on public.profiles
  for update
  using  (auth.uid() = id)
  with check (auth.uid() = id);

-- Restrict updatable columns via a grant (belt-and-suspenders with RLS)
-- Service role bypasses RLS, so this only affects authenticated users
grant update (display_name, avatar_url) on public.profiles to authenticated;

-- Service role bypasses RLS by default — no policy needed

-- Admin read-all: uses a custom claim `is_admin` in JWT
create policy "Admins can read all profiles"
  on public.profiles
  for select
  using (
    (auth.jwt()->'app_metadata'->>'role') = 'admin'
  );
