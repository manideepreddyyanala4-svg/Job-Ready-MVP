# Paid-beta V1 launch checklist

## Required user actions

- Apply migrations `0003_secure_mission_progress.sql` and `0004_mission_content.sql` after
  `0001_jobready_schema.sql` and `0002_reference_data.sql`.
- Verify `resumes` is private and keep `SUPABASE_SERVICE_ROLE_KEY` server-only.
- Configure a real Supabase magic-link redirect for the deployed origin and complete one
  mailbox-based cross-session test.
- Configure Razorpay test credentials, webhook signing secret, and a reachable HTTPS webhook
  URL before enabling paid production checkout.

## Verified locally or against Supabase

- `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build`.
- Deterministic resume, readiness, role, gap, and recommendation engines.
- Supabase Auth, reference data, private Storage, authenticated upload, and two-user isolation.
- Mission 1 free flow and server-rendered paid-content gate.
- Internal reference API tests and intentionally incomplete student starter test.

## Before enabling paid checkout

- Apply the secure progress RPC migration and verify a direct PostgREST paid-progress write is
  rejected without an entitlement.
- Run the full account A logout/login restoration flow with a real mailbox.
- Run `npm audit` review and schedule non-breaking dependency updates.
