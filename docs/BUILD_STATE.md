# Build state

## Current milestone
Phase 23 — Paid-beta V1 Supabase verification

## Completed
- Phase 0 repository audit
- Phase 1 foundation and documentation
- Phase 2 landing page and responsive visual system
- Phase 3 domain model, role/project seeds, scoring helpers
- Phases 5–12 demo funnel, analysis, gaps, projects, missions
- Phase 13 mock payment entitlement flow
- Phase 15 privacy and terms pages
- Phase 16 analytics/payment provider abstractions
- Phase 19 local release audit and settings/privacy controls
- Demo mission progress persistence and dashboard continuation state
- Resume input validation and demo resume readiness state
- Persistent student profile and structured resume-backed readiness analysis
- Resume-backed role matching and gap classification
- Focused core-engine fixtures and automated tests
- Deterministic controlled project recommendation engine
- Data-driven project detail architecture/prerequisites summary
- Structured mock payment transaction → entitlement API
- Four-level local hint usage tracking
- Supabase browser/server clients, production-mode middleware, authenticated profile API, private resume upload persistence, and server-side entitlement lookup architecture
- Initial normalized Supabase migration with user ownership RLS policies
- Razorpay webhook signature verification skeleton and typed funnel analytics events
- Idempotent reference-data seed migration for roles, skills, project families, variants, and twelve backend missions
- Authenticated production profile restoration and validation
- Server-side deterministic analysis persistence for readiness, role matches, gaps, and recommendations
- Server-only service-role writer for authoritative score persistence
- Authenticated project enrollment and mission progress APIs
- Production-mode mission progress restoration path
- Production-mode analysis/profile/roles/gaps/recommendation/dashboard read paths now use authenticated Supabase APIs instead of localStorage
- Logistics starter repository, structured rubric, hidden-test contract, and viva question bank
- Paid mission progress API now verifies an active family entitlement for every non-free mission
- Auth callback redirects are restricted to internal paths
- Authoritative analysis now loads the persisted user-owned resume parse server-side; client payloads cannot choose score input
- Server-rendered mission route now checks production entitlement before sending paid mission content to the browser
- Secure mission-progress RPC migration added; paid writes are now enforced at the database boundary, not only in the API
- Expanded Logistics mission content with tasks, deliverables, progressive hints, resources, and estimated time
- Internal Logistics reference API added under `reference/logistics-order-api`; student starter remains intentionally incomplete

## Known limitations
- Supabase environment is configured and the live unauthenticated boundary returns HTTP 401.
- Supabase Auth was exercised with two temporary confirmed test users; both signed in successfully and were cleaned up.
- PDF processing is REAL for local text-based PDFs through the `/api/resume/process` server route, with deterministic extraction/parsing; scanned/image PDFs remain INCOMPLETE until OCR is added.
- Browser/localStorage persistence is REAL LOCAL MVP only; it is never an authority for production access.
- Full browser magic-link cross-session testing still requires an interactive mailbox or a manually supplied test link.
- OCR for scanned/image PDFs remains INCOMPLETE.
- Razorpay order creation and webhook deployment remain BLOCKED EXTERNALLY until credentials and dashboard configuration are supplied.

## State classification
- REAL LOCAL MVP: browser/localStorage persistence, local validated PDF processing, structured resume parsing, deterministic readiness/role/gap scoring, controlled recommendations, route UI, and mock checkout transaction-to-entitlement flow.
- PRODUCTION REAL: Supabase Auth, schema/reference data, private `resumes` bucket, authenticated upload, user-owned profile/resume parse/progress boundaries, and two-user RLS/Storage isolation were verified against the configured project. Database-enforced paid mission progress is supplied by migration 0003 and must be applied before deployment.
- PRODUCTION ARCHITECTURE: deterministic analysis persistence, project enrollment, dashboard restoration, server-rendered paid-content gate, and Razorpay adapter.
- MOCK: demo payment provider, analytics provider, and AI provider.
- DEMO: seeded Arjun Reddy profile, demo resume, role/project content.
- INCOMPLETE: applying migrations 0003 and 0004, full interactive mailbox-based cross-session browser test, OCR, and production Razorpay order/webhook wiring.

## Validation
- `npm install` completed.
- `npm run lint` passes.
- `npm run typecheck` passes.
- Browser smoke test passed through landing, demo login, all onboarding steps, demo resume analysis, Mission 2 paywall, mock checkout, and entitlement restoration after refresh.
- All current MVP routes return HTTP 200, including settings, privacy, and terms.
- Mission completion persists in browser storage and is reflected on the dashboard after navigation.
- Resume flow rejects non-PDF and over-5 MB files, supports a clear demo-resume action, and records analysis readiness locally.
- Resume uploads are sent to and processed by the server API; structured resume data is persisted locally and analysis derives from that structure.
- Browser smoke test confirmed the demo resume creates structured local state and routes to analysis with a derived score.
- Role and gap pages now recalculate from the persisted structured resume evidence.
- Direct API smoke test passed for a text-based PDF fixture; invalid empty requests return a clear 400 response.
- `npm test` passes: 5 focused core-engine tests across parsing, scoring, role matching, evidence classification, and recommendations.
- `npm run build` passes successfully after dependency repair.
- Complete route smoke test returns HTTP 200 for all V0 pages.
- Browser smoke test passed through recommendation, project detail, Mission 1 completion, Mission 2 paywall, mock unlock, and dashboard progress reflection.
- `npm audit --omit=optional` reports 8 vulnerabilities (1 moderate, 5 high, 2 critical), primarily in dev tooling; automatic force upgrades were not applied.
- Local browser regression passed landing/login/onboarding/demo resume/analysis after the production wiring changes.
- `npm test` passes: 8 tests across core engines and production-boundary validation.
- `npm run lint`, `npm run typecheck`, and `npm run build` pass.
- `npm audit` reports 8 vulnerabilities (1 moderate, 5 high, 2 critical); fixes require breaking upgrades and `npm audit fix --force` was not run.
- Live production endpoint check: unauthenticated entitlement request returned HTTP 401.
- Live Supabase check: roles (3), skills (15), role requirements (21), project families (3), variants (4), and Logistics missions (12) are present; `resumes` exists and is private.
- Live two-user check: authenticated upload succeeded, foreign Storage download was denied, foreign profile/resume/progress reads returned no rows, and cleanup succeeded.
- Security review completed; paid-progress authorization is now enforced through a database RPC migration, callback URL normalization is origin-checked, and client-selected score input remains rejected.

## Next action
Apply migrations `0003_secure_mission_progress.sql` and `0004_mission_content.sql` in the configured Supabase SQL editor, then run the interactive mailbox-based cross-session test. Razorpay remains intentionally deferred until its credentials and webhook URL are available.
