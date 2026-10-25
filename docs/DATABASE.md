# Database direction

The production schema is implemented in `supabase/migrations/0001_jobready_schema.sql`, with reference data in `0002_reference_data.sql`. It includes profiles, skills, resume files/parses, readiness scores, roles, role requirements, gaps, project families/variants, recommendations, enrollments, missions, progress/hint usage, payment transactions, and entitlements. User-owned rows use `auth.uid()` ownership policies; reference tables can be seeded separately and read by authenticated users.

Migration `0003_secure_mission_progress.sql` removes direct client progress writes and adds
`public.save_mission_progress`, which verifies enrollment ownership, mission membership, and
active family entitlement inside Postgres before writing. Migration `0004_mission_content.sql`
adds the full twelve-mission Logistics objectives, tasks, deliverables, hints, resources, and
estimated times idempotently.

Resume files belong in a private `resumes` Storage bucket with paths generated as `resumes/{auth user id}/{uuid}.pdf`. Raw filenames are metadata only. The service-role key is never exposed to browser code; it is used only by trusted server-side score persistence.

The local MVP continues to use seeded static domain content plus browser-persisted state when production credentials are absent. Production activation requires applying all four migrations, configuring the Supabase bucket/policies, and setting the server-only service-role key.
