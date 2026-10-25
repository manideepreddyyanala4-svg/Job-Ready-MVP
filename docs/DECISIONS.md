# Decisions

- Use a deterministic rubric for scores; AI may explain or personalize but cannot decide readiness, payment state, or entitlements.
- Seed three role families and three project families to keep recommendations verifiable.
- Provide a demo provider for payments and analytics so local development is not blocked by credentials.
- Keep the evidence-vs-knowledge distinction visible in the gap model and UI.
- Treat Supabase as the source of truth in production mode; localStorage remains demo/cache state only.
- Keep authoritative score writes behind a server-only service-role client, while user reads and user-owned writes remain RLS-protected.
- Require idempotent seed migrations and stable slugs/UUIDs for reference data so repeated deployments do not duplicate rows.
- Enforce paid mission progress in Postgres as well as the API. An authenticated browser can call Supabase directly, so a route-only entitlement check is not a complete authorization boundary.
- Use a restrained neutral design system with one orange brand accent and semantic success/warning/error/info colors. Shared tokens and primitives live in `globals.css` and `src/components/ui.tsx`; domain cards live in `src/components/domain-ui.tsx`.
- Use a desktop sidebar for authenticated navigation with Dashboard, Readiness, and Projects as the primary product areas. Readiness exposes Overview, Role matches, and Evidence gaps. Settings remains a secondary account destination.
- Use a deliberate four-item mobile bottom navigation (Home, Readiness, Projects, Account) instead of shrinking or hiding the desktop sidebar.
- Production UI must show explicit loading, empty, and recoverable error states instead of silently presenting seeded demo content when authenticated data is unavailable.
