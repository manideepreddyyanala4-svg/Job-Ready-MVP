# Decisions

- Use a deterministic rubric for scores; AI may explain or personalize but cannot decide readiness, payment state, or entitlements.
- Seed three role families and three project families to keep recommendations verifiable.
- Provide a demo provider for payments and analytics so local development is not blocked by credentials.
- Keep the evidence-vs-knowledge distinction visible in the gap model and UI.
- Treat Supabase as the source of truth in production mode; localStorage remains demo/cache state only.
- Keep authoritative score writes behind a server-only service-role client, while user reads and user-owned writes remain RLS-protected.
- Require idempotent seed migrations and stable slugs/UUIDs for reference data so repeated deployments do not duplicate rows.
- Enforce paid mission progress in Postgres as well as the API. An authenticated browser can call
  Supabase directly, so a route-only entitlement check is not a complete authorization boundary.
