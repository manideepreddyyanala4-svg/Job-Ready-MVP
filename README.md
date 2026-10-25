# JobReady

JobReady is a demo-first MVP for Indian college students who want to understand what their target roles require and build credible project evidence.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use the demo account on the login screen, complete onboarding, and choose the demo resume. The local flow includes the report, role matches, evidence gaps, project recommendations, a free first mission, and a mock ₹499 entitlement for paid missions.

Useful checks:

```bash
npm run lint
npm run typecheck
npm run build
```

## What is mocked

The local MVP uses seeded domain data, browser-local demo state, and a `MockPaymentProvider`. Supabase Auth/Storage/Postgres, PDF extraction, Razorpay verification/webhooks, AI explanations, analytics, and Sentry are adapter-ready but not activated without credentials.

See [`docs/BUILD_STATE.md`](./docs/BUILD_STATE.md) for the current handoff state and [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for the production wiring plan.

## Production beta activation

Copy `.env.example` to `.env.local`, set `JOBREADY_MODE=production` and `NEXT_PUBLIC_JOBREADY_MODE=production`, then provide `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and the server-only `SUPABASE_SERVICE_ROLE_KEY` for trusted analysis writes. Apply [`supabase/migrations/0001_jobready_schema.sql`](./supabase/migrations/0001_jobready_schema.sql), [`supabase/migrations/0002_reference_data.sql`](./supabase/migrations/0002_reference_data.sql), [`supabase/migrations/0003_secure_mission_progress.sql`](./supabase/migrations/0003_secure_mission_progress.sql), and [`supabase/migrations/0004_mission_content.sql`](./supabase/migrations/0004_mission_content.sql), create a private Storage bucket named `resumes`, and add the Storage ownership policies from the Supabase dashboard or CLI. `SUPABASE_SERVICE_ROLE_KEY` must never be exposed to the browser.

Razorpay activation additionally requires `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`; it is intentionally deferred until Supabase persistence and RLS acceptance pass. The mock checkout is disabled in production mode.
