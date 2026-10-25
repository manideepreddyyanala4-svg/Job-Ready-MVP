create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  college text,
  degree text,
  year text,
  target_role text,
  weekly_hours integer check (weekly_hours is null or weekly_hours between 1 and 80),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.skills (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null
);
create table public.student_skills (
  profile_id uuid references public.profiles(id) on delete cascade,
  skill_id uuid references public.skills(id) on delete cascade,
  evidence_level text not null check (evidence_level in ('strong','partial','missing')),
  source text not null default 'resume',
  primary key (profile_id, skill_id)
);
create table public.resume_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text unique not null,
  original_filename text not null,
  mime_type text not null check (mime_type = 'application/pdf'),
  byte_size integer not null check (byte_size > 0 and byte_size <= 5242880),
  created_at timestamptz not null default now()
);
create table public.resume_parses (
  id uuid primary key default gen_random_uuid(),
  resume_file_id uuid not null references public.resume_files(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  parser_version text not null,
  structured_resume jsonb not null,
  created_at timestamptz not null default now()
);
create table public.readiness_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resume_parse_id uuid references public.resume_parses(id) on delete set null,
  scoring_version text not null,
  score integer not null check (score between 0 and 100),
  breakdown jsonb not null,
  created_at timestamptz not null default now()
);
create table public.roles (id uuid primary key default gen_random_uuid(), slug text unique not null, name text not null, description text);
create table public.role_skill_requirements (
  role_id uuid references public.roles(id) on delete cascade,
  skill_id uuid references public.skills(id) on delete cascade,
  importance integer not null check (importance between 1 and 5),
  primary key (role_id, skill_id)
);
create table public.student_role_matches (
  user_id uuid references auth.users(id) on delete cascade,
  role_id uuid references public.roles(id) on delete cascade,
  scoring_version text not null,
  score integer not null check (score between 0 and 100),
  evidence jsonb not null,
  primary key (user_id, role_id, scoring_version)
);
create table public.student_skill_gaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id uuid references public.roles(id) on delete set null,
  skill_id uuid references public.skills(id) on delete cascade,
  classification text not null check (classification in ('missing','partial','strong')),
  priority integer not null check (priority between 1 and 5),
  scoring_version text not null
);
create table public.project_families (id uuid primary key default gen_random_uuid(), slug text unique not null, name text not null);
create table public.project_variants (id uuid primary key default gen_random_uuid(), family_id uuid references public.project_families(id) on delete cascade, slug text unique not null, definition jsonb not null);
create table public.project_recommendations (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade, variant_id uuid references public.project_variants(id) on delete cascade, scoring_version text not null, score integer not null, explanation jsonb not null);
create table public.project_enrollments (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade, variant_id uuid references public.project_variants(id) on delete restrict, created_at timestamptz not null default now(), unique(user_id, variant_id));
create table public.project_missions (id uuid primary key default gen_random_uuid(), variant_id uuid references public.project_variants(id) on delete cascade, mission_number integer not null, definition jsonb not null, unique(variant_id, mission_number));
create table public.mission_progress (user_id uuid references auth.users(id) on delete cascade, enrollment_id uuid references public.project_enrollments(id) on delete cascade, mission_id uuid references public.project_missions(id) on delete cascade, completed_at timestamptz, hint_usage jsonb not null default '{}'::jsonb, primary key(user_id, mission_id));
create table public.payments (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade, provider text not null, provider_transaction_id text unique not null, amount_inr integer not null, status text not null check (status in ('created','paid','failed')), created_at timestamptz not null default now());
create table public.user_entitlements (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade, project_family_id uuid references public.project_families(id) on delete restrict, payment_id uuid references public.payments(id) on delete restrict, status text not null check (status in ('active','revoked')), created_at timestamptz not null default now(), unique(user_id, project_family_id));

create index resume_files_user_idx on public.resume_files(user_id);
create index resume_parses_user_idx on public.resume_parses(user_id);
create index readiness_scores_user_idx on public.readiness_scores(user_id, created_at desc);
create index recommendations_user_idx on public.project_recommendations(user_id, score desc);
create index payments_user_idx on public.payments(user_id);

alter table public.profiles enable row level security;
alter table public.student_skills enable row level security;
alter table public.resume_files enable row level security;
alter table public.resume_parses enable row level security;
alter table public.readiness_scores enable row level security;
alter table public.student_role_matches enable row level security;
alter table public.student_skill_gaps enable row level security;
alter table public.project_recommendations enable row level security;
alter table public.project_enrollments enable row level security;
alter table public.mission_progress enable row level security;
alter table public.payments enable row level security;
alter table public.user_entitlements enable row level security;

create policy "users own profiles" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy "users own student skills" on public.student_skills for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "users own resume files" on public.resume_files for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users own resume parses" on public.resume_parses for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users own readiness" on public.readiness_scores for select using (user_id = auth.uid());
create policy "users own role matches" on public.student_role_matches for select using (user_id = auth.uid());
create policy "users own gaps" on public.student_skill_gaps for select using (user_id = auth.uid());
create policy "users own recommendations" on public.project_recommendations for select using (user_id = auth.uid());
create policy "users own enrollments" on public.project_enrollments for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users own progress" on public.mission_progress for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users own payments" on public.payments for select using (user_id = auth.uid());
create policy "users own entitlements" on public.user_entitlements for select using (user_id = auth.uid());

insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do update set public = false;

create policy "users upload own resumes" on storage.objects
for insert to authenticated
with check (bucket_id = 'resumes' and (storage.foldername(name))[1] = 'resumes' and (storage.foldername(name))[2] = (select auth.uid()::text));
create policy "users read own resumes" on storage.objects
for select to authenticated
using (bucket_id = 'resumes' and (storage.foldername(name))[1] = 'resumes' and (storage.foldername(name))[2] = (select auth.uid()::text));
create policy "users replace own resumes" on storage.objects
for update to authenticated
using (bucket_id = 'resumes' and (storage.foldername(name))[1] = 'resumes' and (storage.foldername(name))[2] = (select auth.uid()::text))
with check (bucket_id = 'resumes' and (storage.foldername(name))[1] = 'resumes' and (storage.foldername(name))[2] = (select auth.uid()::text));
create policy "users delete own resumes" on storage.objects
for delete to authenticated
using (bucket_id = 'resumes' and (storage.foldername(name))[1] = 'resumes' and (storage.foldername(name))[2] = (select auth.uid()::text));
