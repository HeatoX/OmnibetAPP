-- =============================================
-- OMNIBET AI - DATABASE SETUP (COMPLETE)
-- Copy and Paste this entire file into Supabase SQL Editor
-- =============================================

-- 1. Enable UUID Extension (Required for IDs)
create extension if not exists "uuid-ossp";

-- 2. Create PROFILES table (Linked to Auth Users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  subscription_tier text default 'free', -- 'free', 'gold', 'diamond'
  subscription_status text default 'active',
  predictions_count int default 0,
  last_prediction_date timestamp with time zone,
  stripe_customer_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Create PREDICTION HISTORY table (The "Oracle's Memory")
-- Stores all predictions made by the system to calculate transparency stats
create table if not exists public.prediction_history (
    id uuid default uuid_generate_v4() primary key,
    match_id text not null unique, -- External ID (e.g., ESPN ID)
    sport text not null,
    league text,
    home_team text not null,
    away_team text not null,
    start_date timestamp with time zone not null,
    
    -- Prediction Data
    predicted_winner text, -- 'home', 'away', 'draw'
    confidence int, -- 0-100
    prediction_text text,
    
    -- Odds at time of prediction
    home_odds decimal,
    away_odds decimal,
    draw_odds decimal,
    
    -- Results (Filled after match ends)
    status text default 'pending', -- 'pending', 'won', 'lost', 'void'
    actual_result text,
    final_score text,
    profit_loss decimal default 0,
    resolved_at timestamp with time zone,
    
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.prediction_history enable row level security;

-- 5. Policies (Security Rules)

-- Profiles: Users can read/edit their own profile
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Predictions: Everyone can read history (Transparency), only Service Role can write
create policy "Predictions are viewable by everyone."
  on prediction_history for select
  using ( true );
  
-- (Write access is implicitly denied to public/anon, only Service Role has bypass)

-- 6. Trigger to create Profile on Signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

-- Trigger execution
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- SAMPLE DATA (Optional - Safe to run)
-- =============================================

-- Insert a sample prediction to allow "Yesterday" stats to show up on day 1
insert into public.prediction_history 
(match_id, sport, league, home_team, away_team, start_date, predicted_winner, confidence, prediction_text, status, actual_result, final_score, profit_loss, resolved_at)
values 
('sample-001', 'football', 'La Liga', 'Real Madrid', 'Barcelona', now() - interval '1 day', 'home', 85, 'Victoria Local con alta confianza', 'won', 'home', '3-1', 8.50, now())
on conflict (match_id) do nothing;
