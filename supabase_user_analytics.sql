-- Create a table to store the latest 2 snapshots of analytics for trend calculation
create table public.user_analytics (
  user_id uuid references auth.users not null primary key,
  last_updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- The most recent analysis
  current_scores jsonb, 
  -- The analysis before the current one (for calculating +12% trends)
  previous_scores jsonb,
  
  -- The weekly insight text
  current_insight text
);

-- RLS
alter table public.user_analytics enable row level security;

create policy "Users can view own analytics" on public.user_analytics
  for select using (auth.uid() = user_id);

create policy "Users can update own analytics" on public.user_analytics
  for insert with check (auth.uid() = user_id);

create policy "Users can modify own analytics" on public.user_analytics
  for update using (auth.uid() = user_id);
