# JobReady

JobReady is an evidence-first career-readiness product for Indian college students targeting internships and fresher technical roles.

> **Core idea:** Upload your resume. Find out what evidence is missing for the role you want. Then build the right end-to-end project to prove it.

JobReady is **not** a course marketplace, resume-score gimmick, certificate platform, generic chatbot, or employment guarantee.

## Current private-beta scope

Supported role analysis:
- Backend / Software Engineer
- Data Analyst
- AI / ML Engineer

Controlled project families:
- **Production Backend System** — Logistics Order & Delivery Management Backend: **available**
- **Business Analytics Decision System** — Retail Growth Decision System: **planned**
- **AI Document Intelligence System** — College Policy Document Assistant: **planned**

Only the backend project currently has a complete validated mission path. Planned families are visible for product architecture and future scope, but are not presented as ready recommendations.

## Product flow

```
Landing
→ Sign in
→ Onboarding
→ Resume upload + parse review
→ Profile-readiness analysis
→ Role matches
→ Evidence gaps
→ Validated project recommendation
→ Project brief
→ Mission 1 free
→ Project Pass gate
→ Guided missions
→ Acceptance / verification guidance
→ Deployment evidence
→ Project defense
→ Dashboard progress
```

## Important score semantics

- **Profile-readiness score** = explainable evidence visible in the structured profile.
- **Role fit** = profile-to-role evidence coverage.
- Neither is a hiring probability.
- “Missing evidence” does not mean “the student does not know the skill.”

## Runtime modes

### Demo mode

Default for local development.

```bash
JOBREADY_MODE=demo
NEXT_PUBLIC_JOBREADY_MODE=demo
```

- Browser-local demo profile/resume structure/progress.
- Mock Project Pass unlock only.
- No real payment.
- No production Supabase dependency.

### Production mode

Requires Supabase and the private-beta database migrations.

```bash
JOBREADY_MODE=production
NEXT_PUBLIC_JOBREADY_MODE=production
```

Production mode uses:
- Supabase Auth magic links
- user-owned profile/readiness/progress records
- private resume Storage
- server-side entitlement checks
- RLS
- service-role access only in server modules for trusted analysis maintenance

Copy `.env.example` and fill only the values required for the environment. Never commit secrets.

## Setup

```bash
npm ci
npm test
npm run lint
npm run typecheck
npm run build
npm run dev
```

The repository also contains:
- `project-starters/logistics-order-api`
- `reference/logistics-order-api`

CI validates both Python surfaces.

## Database migrations

Migration files:
- `0001_jobready_schema.sql`
- `0002_reference_data.sql`
- `0003_secure_mission_progress.sql`
- `0004_mission_content.sql`
- `0005_private_beta_hardening.sql`

**A SQL file existing in Git does not prove it has been applied to the production Supabase project.**

`0005_private_beta_hardening.sql` is required before deploying this branch in production mode. It adds:
- target-role array support
- RLS on reference/project-content tables
- entitlement-aware mission-content reads
- account-deletion request architecture
- safer hint-progress merging
- additional skill reference data

See `docs/DATABASE.md` and `docs/LAUNCH_CHECKLIST.md`.

## Payment status

Mission 1 is free. Current beta price configuration defaults to **₹499** through `NEXT_PUBLIC_PROJECT_PASS_INR`.

- Demo mode uses a mock transaction and browser-local entitlement.
- Mock payments return 404 in production mode.
- Production UI fails closed when real checkout is unavailable.
- Razorpay credentials are intentionally blank in `.env.example`.
- Razorpay order creation + verified webhook/entitlement activation are **not yet enabled**.

A payment transaction and an entitlement are separate server-side concepts.

## Security boundaries

Implemented:
- protected authenticated routes in production
- user-scoped Supabase access
- private resume bucket path
- PDF MIME/extension/signature validation
- safe auth callback redirect
- server-only service-role client
- paid mission entitlement checks
- paid mission RLS policy in migration 0005
- no raw extracted resume text in the structured resume object
- analytics property allowlist
- production mock-payment rejection
- security headers
- authenticated/private-page no-index behavior

### Critical repository visibility warning

The repository is currently **public** and contains:
- an internal reference implementation under `reference/`
- internal project-content / verifier-oriented material in Git history

That is not an acceptable proprietary-content boundary for private beta.

Do **not** solve this by deleting the reference source blindly. The correct immediate action is to make this repository private before beta access, then decide whether to split:
1. a private product/content/reference repository; and
2. a student-safe starter repository containing only intentionally public materials.

See `docs/ARCHITECTURE.md`.

## Verification status

Current beta:
- explicit acceptance criteria
- self-check verification requirements
- rubric architecture
- starter/reference tests
- project defense questions

Not yet claimed:
- arbitrary remote-code execution
- live hidden test execution against student repositories
- automatic deployment verification

The UI explicitly says when a check has not actually run.

## Analytics status

The funnel taxonomy and sanitizer are implemented in `src/lib/analytics.ts`.

No production analytics provider is configured in this repository. The adapter intentionally accepts only a small allowlist of non-sensitive properties and does not accept raw resume text, files, credentials, secrets, or private project code.

## Validation

GitHub Actions runs:
- `npm test`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm audit --audit-level=moderate` as a report
- reference implementation pytest suite
- starter repository pytest contract
- desktop and mobile Playwright screenshot smoke checks

See the current PR/CI state before merging.

## Documentation

- `docs/PRODUCT_SPEC.md`
- `docs/ARCHITECTURE.md`
- `docs/DATABASE.md`
- `docs/DECISIONS.md`
- `docs/BUILD_STATE.md`
- `docs/PROJECT_ENGINE.md`
- `docs/LAUNCH_CHECKLIST.md`
