alter table public.profiles
  add column if not exists target_roles text[] not null default '{}'::text[];

update public.profiles
set target_roles = array[target_role]
where cardinality(target_roles) = 0 and target_role is not null;

insert into public.skills (slug, name) values
  ('system-design', 'System design'),
  ('excel', 'Excel')
on conflict (slug) do update set name = excluded.name;

insert into public.role_skill_requirements (role_id, skill_id, importance)
select '00000000-0000-0000-0000-000000000001', id, 3
from public.skills where slug = 'system-design'
on conflict (role_id, skill_id) do update set importance = excluded.importance;

insert into public.role_skill_requirements (role_id, skill_id, importance)
select '00000000-0000-0000-0000-000000000002', id, 3
from public.skills where slug = 'excel'
on conflict (role_id, skill_id) do update set importance = excluded.importance;

alter table public.skills enable row level security;
alter table public.roles enable row level security;
alter table public.role_skill_requirements enable row level security;
alter table public.project_families enable row level security;
alter table public.project_variants enable row level security;
alter table public.project_missions enable row level security;

revoke all on table public.skills from anon, authenticated;
revoke all on table public.roles from anon, authenticated;
revoke all on table public.role_skill_requirements from anon, authenticated;
revoke all on table public.project_families from anon, authenticated;
revoke all on table public.project_variants from anon, authenticated;
revoke all on table public.project_missions from anon, authenticated;

grant select on table public.skills to authenticated;
grant select on table public.roles to authenticated;
grant select on table public.role_skill_requirements to authenticated;
grant select on table public.project_families to authenticated;
grant select on table public.project_variants to authenticated;
grant select on table public.project_missions to authenticated;

drop policy if exists "authenticated read skills" on public.skills;
create policy "authenticated read skills" on public.skills
for select to authenticated using (true);

drop policy if exists "authenticated read roles" on public.roles;
create policy "authenticated read roles" on public.roles
for select to authenticated using (true);

drop policy if exists "authenticated read role requirements" on public.role_skill_requirements;
create policy "authenticated read role requirements" on public.role_skill_requirements
for select to authenticated using (true);

drop policy if exists "authenticated read project families" on public.project_families;
create policy "authenticated read project families" on public.project_families
for select to authenticated using (true);

drop policy if exists "authenticated read project variants" on public.project_variants;
create policy "authenticated read project variants" on public.project_variants
for select to authenticated using (true);

drop policy if exists "mission content follows entitlement" on public.project_missions;
create policy "mission content follows entitlement" on public.project_missions
for select to authenticated
using (
  coalesce((definition->>'free')::boolean, false)
  or exists (
    select 1
    from public.project_variants v
    join public.user_entitlements e on e.project_family_id = v.family_id
    where v.id = project_missions.variant_id
      and e.user_id = auth.uid()
      and e.status = 'active'
  )
);

create table if not exists public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','completed','cancelled')),
  requested_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.account_deletion_requests enable row level security;

drop policy if exists "users read own deletion request" on public.account_deletion_requests;
create policy "users read own deletion request" on public.account_deletion_requests
for select to authenticated using (user_id = auth.uid());

drop policy if exists "users create own deletion request" on public.account_deletion_requests;
create policy "users create own deletion request" on public.account_deletion_requests
for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "users refresh own deletion request" on public.account_deletion_requests;
create policy "users refresh own deletion request" on public.account_deletion_requests
for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function public.save_mission_progress(
  p_enrollment_id uuid,
  p_mission_id uuid,
  p_completed boolean,
  p_hint_usage jsonb default '{}'::jsonb
)
returns public.mission_progress
language plpgsql
security definer
set search_path = public
as $$
declare
  enrollment_row public.project_enrollments;
  mission_row public.project_missions;
  variant_row public.project_variants;
  family_id uuid;
  result_row public.mission_progress;
begin
  select * into enrollment_row
  from public.project_enrollments
  where id = p_enrollment_id and user_id = auth.uid();
  if not found then raise exception 'Enrollment is not owned by the current user'; end if;

  select * into mission_row
  from public.project_missions
  where id = p_mission_id and variant_id = enrollment_row.variant_id;
  if not found then raise exception 'Mission does not belong to the enrollment'; end if;

  select * into variant_row
  from public.project_variants
  where id = enrollment_row.variant_id;
  family_id := variant_row.family_id;

  if coalesce((mission_row.definition->>'free')::boolean, false) = false
    and not exists (
      select 1 from public.user_entitlements
      where user_id = auth.uid()
        and project_family_id = family_id
        and status = 'active'
    )
  then
    raise exception 'An active Project Pass is required';
  end if;

  insert into public.mission_progress(user_id, enrollment_id, mission_id, completed_at, hint_usage)
  values (
    auth.uid(),
    p_enrollment_id,
    p_mission_id,
    case when p_completed then now() else null end,
    coalesce(p_hint_usage, '{}'::jsonb)
  )
  on conflict (user_id, mission_id) do update set
    enrollment_id = excluded.enrollment_id,
    completed_at = excluded.completed_at,
    hint_usage = public.mission_progress.hint_usage || excluded.hint_usage
  returning * into result_row;

  return result_row;
end;
$$;

revoke all on function public.save_mission_progress(uuid, uuid, boolean, jsonb) from public;
grant execute on function public.save_mission_progress(uuid, uuid, boolean, jsonb) to authenticated;

with protected(number, acceptance, verification) as (
  values
    (1, '["Actors and workflows are explicit.","The starter runs from a clean checkout.","Secrets are not committed."]'::jsonb, '["Starter checks run locally","Project brief is reviewable","No committed secrets"]'::jsonb),
    (2, '["Each record has a clear owner.","Important invariants have constraints.","Status transitions are explicit."]'::jsonb, '["ERD can be explained","Migration plan is deterministic","Invalid states are identified"]'::jsonb),
    (3, '["Passwords are never stored in plaintext.","Protected routes validate identity.","One user cannot read another user''s order."]'::jsonb, '["Cross-user access is denied","Credentials are not logged","Protected endpoints require identity"]'::jsonb),
    (4, '["Inputs are validated.","Status codes are consistent.","Transport code does not contain core business rules."]'::jsonb, '["Happy path works","Malformed input is rejected","Errors do not expose stack traces"]'::jsonb),
    (5, '["Invalid transitions do not mutate state.","Repeated safe requests have defined behavior.","Rules have focused tests."]'::jsonb, '["Invalid transition test passes","Repeated request behavior is documented","State remains consistent on failure"]'::jsonb),
    (6, '["Critical failure paths are tested.","Tests are independent.","Test names describe behavior."]'::jsonb, '["Core tests pass","Authorization negative case exists","Tests run from a clean checkout"]'::jsonb),
    (7, '["Health checks do not leak secrets.","Logs avoid sensitive payloads.","Known failures have safe responses."]'::jsonb, '["Health endpoint responds safely","Known failures are mapped","Sensitive values are excluded from logs"]'::jsonb),
    (8, '["A clean checkout can start predictably.","Secrets are injected at runtime.","Persistent data behavior is documented."]'::jsonb, '["Container build succeeds","Compose starts required services","No secret is baked into the image"]'::jsonb),
    (9, '["Secret handling is explicit.","Migration order is documented.","A rollback trigger and health check are named."]'::jsonb, '["Deployment target is justified","Runbook includes rollback","Deployment evidence is recorded"]'::jsonb),
    (10, '["Every setup command is tested.","At least one failure example is shown.","Important trade-offs are explained."]'::jsonb, '["README setup works","Architecture is explained","Evidence links are easy to find"]'::jsonb),
    (11, '["Claims link to artifacts.","Correctness and security are prioritized.","Known limitations are explicit."]'::jsonb, '["Evidence index exists","Critical gaps are addressed","Limitations are documented"]'::jsonb),
    (12, '["Answers refer to the actual implementation.","Trade-offs include consequences.","Limitations are admitted clearly."]'::jsonb, '["One-minute explanation is concise","Answers cite real project decisions","Failure and improvement story is specific"]'::jsonb)
)
update public.project_missions m
set definition = m.definition || jsonb_build_object(
  'acceptanceCriteria', p.acceptance,
  'verification', p.verification
)
from protected p
where m.variant_id = '00000000-0000-0000-0002-000000000001'
  and m.mission_number = p.number;
