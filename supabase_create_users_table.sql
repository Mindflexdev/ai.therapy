-- 1. Create the public.users table (if it doesn't exist)
create table if not exists public.users (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  is_premium boolean default false,
  message_count integer default 0, -- Tracks messages sent (limit: 100 for free users)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Add missing columns if table already exists
alter table public.users add column if not exists message_count integer default 0;
alter table public.users add column if not exists is_premium boolean default false;

-- 3. Enable Row Level Security
alter table public.users enable row level security;

-- 4. Drop existing policies (to avoid conflicts)
drop policy if exists "Users can view own profile" on public.users;
drop policy if exists "Users can update own profile" on public.users;

-- 5. Create Policies
create policy "Users can view own profile" 
on public.users for select 
using (auth.uid() = id);

create policy "Users can update own profile" 
on public.users for update 
using (auth.uid() = id);

-- 6. Create trigger function to auto-create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- 7. Drop and recreate trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
