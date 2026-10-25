# JobReady Architecture

## Application

- Next.js App Router
- React
- TypeScript
- Supabase production adapter
- deterministic readiness / role / gap / recommendation engine
- controlled project catalog
- provider-neutral analytics boundary

## Runtime split

### Demo

Demo mode intentionally works without external credentials.

State:
- profile/resume structure/progress: browser-local
- Project Pass: mock local unlock
- no real payment
- no production database requirement

This mode is for development and product review, not proof of production integrations.

### Production

Production mode requires:
- Supabase URL + anon key
- server service-role key for trusted analysis maintenance
- required migrations applied
- private resume bucket
- Auth redirect configuration

Protected pages are checked in middleware. API routes independently enforce user ownership.

## Trust boundaries

### Browser

May:
- render user-owned state
- request analysis/progress
- submit profile/resume
- request deletion
- display mission content returned by server

Must not:
- create a production entitlement
- use localStorage as production access control
- read service-role credentials
- read another user’s rows
- receive hidden verifier implementations

### Next.js server

Responsible for:
- authenticated request boundaries
- resume processing
- trusted analysis writes
- entitlement checks
- mission-content delivery
- safe payment adapter boundary
- account-deletion request creation

### Supabase

Responsible for:
- identity
- row ownership
- private resume storage
- persisted analysis
- persisted recommendations
- project enrollment/progress
- payment/entitlement data model

## Paid mission boundary

Public/client project metadata contains only mission summaries:
- id
- title
- time
- free flag

Detailed mission content is loaded on the server.

In production:
1. user must be authenticated
2. project family is resolved from a trusted registry
3. Mission 1 can be read as free
4. paid missions require active `user_entitlements`
5. migration 0005 also applies entitlement-aware RLS to `project_missions`
6. client receives detailed paid content only after the server boundary succeeds

The database/RLS boundary is required even if a Next.js route already checks entitlement.

## Resume boundary

Storage path:

```
resumes/{user_id}/{resume_uuid}.pdf
```

Bucket:
- private
- authenticated user-scoped policies

Processing:
1. validate MIME/extension/size
2. validate PDF signature
3. extract deterministic text
4. structure supported evidence
5. persist structured object without raw extracted text
6. create deterministic analysis

Analytics must never receive the file or raw contents.

## Analysis authority

The v2 analysis path:
- loads a persisted resume parse owned by the authenticated user
- generates readiness
- scores all supported roles
- uses target role preferences for the primary gap analysis
- attaches gap rows to seeded skill ids when possible
- emits recommendations only for validated available projects
- removes stale v2 gaps/recommendations before writing the latest snapshot

AI explanations are not authoritative and are not required for the current flow.

## Project engine

```
Track
→ Family
→ Controlled variant
→ Mission summaries
→ Protected mission detail
→ Acceptance / verification
→ Defense
```

See `PROJECT_ENGINE.md`.

## Account deletion

Current private-beta architecture records a user-owned `account_deletion_requests` row.

This is not an automatic destructive worker.

A production operational process must:
- review/process pending requests
- remove user-owned content according to retention requirements
- mark request complete
- handle Auth user deletion in a trusted administrative path

## Analytics

`src/lib/analytics.ts` provides:
- event taxonomy
- strict property allowlist
- provider-neutral no-op production architecture

No external analytics credential is required for the product to function.

## Repository architecture — critical

Current repository visibility is public.

It contains:
- production web source
- starter material
- internal reference implementation
- verifier-oriented/internal content in repository history

This is not an acceptable access boundary for private-beta proprietary material.

### Immediate safe option

Make the current repository private before beta.

### Preferred later split

Private:
- JobReady application
- paid content
- reference solutions
- hidden verification logic
- operational scripts

Student-safe/public or generated:
- starter repositories
- public schemas/contracts
- intentionally exposed sample files

Do not rely on a web route to hide a reference solution that is already visible in a public Git repository.

## Security headers/indexing

Current app sets:
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy
- X-Frame-Options
- X-Robots-Tag on authenticated/private routes
- robots disallow rules for private product paths

A CSP is not currently locked because the production hosting/payment/provider surface is not final. Add and test it before a wider public launch.
