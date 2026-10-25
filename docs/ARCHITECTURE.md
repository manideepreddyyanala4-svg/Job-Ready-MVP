# Architecture

The app is a Next.js App Router TypeScript application. Domain data and deterministic scoring live in `src/lib/domain.ts`; provider interfaces and safe mocks live in `src/lib/providers.ts`. Resume validation/extraction/parsing lives in `src/lib/resume.ts` and is exposed through `/api/resume/process`.

`JOBREADY_MODE=demo` keeps the accepted local MVP. `JOBREADY_MODE=production` activates Supabase Auth session checks in middleware and server routes, persists validated profiles/resume metadata/structured parses through the authenticated Supabase client, and checks entitlements server-side. Authoritative score writes use a separate server-only service-role client in `src/lib/supabase/server.ts`; it is never imported by browser code. The browser-safe and cookie-bound server clients live under `src/lib/supabase/`.

UI pages are intentionally thin and consume domain records. Project families are seeded, not generated as arbitrary LLM output. The first project has twelve missions, with Mission 1 free and later missions protected by a server-checked entitlement in production. LocalStorage is never a production authorization source.

Paid mission routes check entitlements in the server component before serializing full mission
content. Progress writes use a database security-definer function so direct Supabase calls cannot
bypass the API's paid-mission check.
