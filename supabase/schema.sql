-- Project Mass — Supabase Schema
-- Run this in your Supabase SQL editor

-- Enable RLS globally
-- All tables use user_id = auth.uid() for row-level security

-- ========================
-- USERS PROFILE
-- ========================
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ========================
-- PROGRAMS
-- ========================
create table if not exists public.programs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  type text not null check (type in ('mass', 'cut', 'strength', 'maintenance', 'recomposition')),
  start_date date not null,
  end_date date,
  start_weight numeric(5,2),
  target_weight numeric(5,2),
  calories_target integer,
  weekly_frequency integer not null default 4,
  goal text,
  is_active boolean not null default false,
  created_at timestamptz default now() not null
);

alter table public.programs enable row level security;

create policy "Users can CRUD own programs"
  on public.programs for all using (auth.uid() = user_id);

-- Ensure only one active program per user
create unique index programs_one_active_per_user
  on public.programs (user_id) where is_active = true;

-- ========================
-- WORKOUTS
-- ========================
create table if not exists public.workouts (
  id uuid default gen_random_uuid() primary key,
  program_id uuid references public.programs(id) on delete cascade not null,
  title text not null,
  workout_type text not null check (workout_type in ('push', 'pull', 'legs', 'upper', 'lower', 'full', 'cardio')),
  created_at timestamptz default now() not null
);

alter table public.workouts enable row level security;

create policy "Users can CRUD own workouts"
  on public.workouts for all using (
    auth.uid() = (select user_id from public.programs where id = workouts.program_id)
  );

-- ========================
-- EXERCISES
-- ========================
create table if not exists public.exercises (
  id uuid default gen_random_uuid() primary key,
  workout_id uuid references public.workouts(id) on delete cascade not null,
  name text not null,
  muscle_group text not null,
  sets integer not null default 3,
  reps integer not null default 10,
  weight numeric(6,2) not null default 0,
  rest_time integer not null default 90,
  order_index integer not null default 0,
  notes text
);

alter table public.exercises enable row level security;

create policy "Users can CRUD own exercises"
  on public.exercises for all using (
    auth.uid() = (
      select p.user_id from public.programs p
      inner join public.workouts w on w.program_id = p.id
      where w.id = exercises.workout_id
    )
  );

-- ========================
-- WORKOUT LOGS
-- ========================
create table if not exists public.workout_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  workout_id uuid references public.workouts(id) on delete set null,
  exercise_name text not null,
  performed_weight numeric(6,2) not null,
  performed_reps integer not null,
  set_number integer not null default 1,
  completed boolean not null default false,
  created_at timestamptz default now() not null
);

alter table public.workout_logs enable row level security;

create policy "Users can CRUD own workout logs"
  on public.workout_logs for all using (auth.uid() = user_id);

-- Index for PR queries
create index workout_logs_exercise_user_idx
  on public.workout_logs (user_id, exercise_name, performed_weight desc);

-- ========================
-- BODYWEIGHT LOGS
-- ========================
create table if not exists public.bodyweight_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  weight numeric(5,2) not null,
  created_at timestamptz default now() not null
);

alter table public.bodyweight_logs enable row level security;

create policy "Users can CRUD own bodyweight logs"
  on public.bodyweight_logs for all using (auth.uid() = user_id);

create index bodyweight_logs_user_date_idx
  on public.bodyweight_logs (user_id, created_at desc);

-- ========================
-- PROGRESS PHOTOS
-- ========================
create table if not exists public.progress_photos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  image_url text not null,
  note text,
  created_at timestamptz default now() not null
);

alter table public.progress_photos enable row level security;

create policy "Users can CRUD own progress photos"
  on public.progress_photos for all using (auth.uid() = user_id);

-- ========================
-- AI CONVERSATIONS
-- ========================
create table if not exists public.ai_conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  message text not null,
  created_at timestamptz default now() not null
);

alter table public.ai_conversations enable row level security;

create policy "Users can CRUD own AI conversations"
  on public.ai_conversations for all using (auth.uid() = user_id);

-- ========================
-- STORAGE BUCKET
-- ========================
insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

create policy "Users can upload own photos"
  on storage.objects for insert with check (
    bucket_id = 'progress-photos' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view own photos"
  on storage.objects for select using (
    bucket_id = 'progress-photos' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own photos"
  on storage.objects for delete using (
    bucket_id = 'progress-photos' and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ========================
-- HELPFUL VIEWS
-- ========================

-- Personal records view
create or replace view public.personal_records as
select
  user_id,
  exercise_name,
  max(performed_weight) as max_weight,
  (select performed_reps from public.workout_logs wl2
   where wl2.user_id = wl.user_id
     and wl2.exercise_name = wl.exercise_name
     and wl2.performed_weight = max(wl.performed_weight)
   order by wl2.created_at desc limit 1) as reps_at_max,
  max(created_at) as achieved_at
from public.workout_logs wl
where completed = true
group by user_id, exercise_name;

-- Weekly volume view
create or replace view public.weekly_volume as
select
  user_id,
  date_trunc('week', created_at) as week_start,
  count(distinct created_at::date) as sessions,
  sum(performed_weight * performed_reps) as total_volume
from public.workout_logs
where completed = true
group by user_id, date_trunc('week', created_at);
