drop policy if exists "users own progress" on public.mission_progress;

create policy "users read own progress" on public.mission_progress
for select using (user_id = auth.uid());

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

  select * into variant_row from public.project_variants where id = enrollment_row.variant_id;
  family_id := variant_row.family_id;
  if coalesce((mission_row.definition->>'free')::boolean, false) = false
    and not exists (
      select 1 from public.user_entitlements
      where user_id = auth.uid() and project_family_id = family_id and status = 'active'
    )
  then raise exception 'An active Project Pass is required'; end if;

  insert into public.mission_progress(user_id, enrollment_id, mission_id, completed_at, hint_usage)
  values (auth.uid(), p_enrollment_id, p_mission_id,
    case when p_completed then now() else null end, coalesce(p_hint_usage, '{}'::jsonb))
  on conflict (user_id, mission_id) do update set
    enrollment_id = excluded.enrollment_id,
    completed_at = excluded.completed_at,
    hint_usage = excluded.hint_usage
  returning * into result_row;
  return result_row;
end;
$$;

revoke all on function public.save_mission_progress(uuid, uuid, boolean, jsonb) from public;
grant execute on function public.save_mission_progress(uuid, uuid, boolean, jsonb) to authenticated;
