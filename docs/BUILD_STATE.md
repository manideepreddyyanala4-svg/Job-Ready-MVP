# JobReady Build State

This document classifies what the current branch actually provides.

## Public website

**PRODUCTION REAL (frontend)**

- complete landing mechanism
- no fake social proof
- honest role/project scope
- beta pricing explanation
- privacy/terms
- metadata/robots
- responsive design system

Production hosting/domain is external.

## Authentication

**PRODUCTION ARCHITECTURE / BLOCKED EXTERNALLY**

Code:
- Supabase magic-link sign-in
- callback exchange
- safe internal redirect handling
- protected route middleware
- session-based server reads
- logout

Requires external verification:
- Supabase project credentials
- production redirect URLs
- real mailbox sign-in test

## Onboarding

**PRODUCTION REAL once Supabase migration state is ready**

- 3 steps
- only recommendation-relevant data
- multi-role UI
- legacy fallback if target_roles column is not available

Migration 0005 adds persisted target-role array.

## Resume

**REAL LOCAL MVP + PRODUCTION STORAGE ARCHITECTURE**

Implemented:
- PDF / 5 MB limit
- MIME + extension + PDF signature validation
- text extraction
- parse confidence/warnings
- review-before-report UI
- private user-scoped storage path
- current resume metadata
- remove resume flow
- raw extracted text omitted from structured parse

Limit:
- deterministic parser is basic
- scanned/image resumes unsupported
- parsing is not claimed to be perfect

## Readiness / roles / gaps

**PRODUCTION REAL deterministic engine**

- explainable readiness score
- score dimensions
- role fit
- role-specific evidence gaps
- evidence-vs-knowledge copy
- persisted v2 production analysis

Limit:
- current rubric is early-beta and must be calibrated with real review data
- score is not hiring probability

## Project recommendations

**PRODUCTION REAL for validated catalog entries**

Current:
- backend project may be recommended
- planned Data / AI project families are not emitted as fake recommendations

## Project catalog

**PRODUCTION ARCHITECTURE**

Hierarchy supports:
- track
- family
- controlled variant

Available now:
- logistics backend

Planned:
- retail analytics
- document intelligence

## Project / mission UX

**REAL LOCAL MVP + PRODUCTION ARCHITECTURE**

Logistics:
- 12 missions
- mission brief/tasks/deliverables
- acceptance criteria
- progressive hints
- verification guidance
- progress
- deployment mission
- project defense

Production paid content depends on migration 0005 and entitlement state.

## Verification

**PRODUCTION ARCHITECTURE / INCOMPLETE AUTOMATION**

Real:
- rubric
- transparent acceptance criteria
- reference/starter tests
- evidence expectations
- defense questions

Not real yet:
- remote hidden execution against student repositories
- automatic deployment checks
- artifact ingestion/verifier service

UI does not fake these states.

## Paid content security

**PRODUCTION ARCHITECTURE; EXTERNAL MIGRATION VERIFICATION REQUIRED**

Code:
- summary/detail split
- server entitlement gate
- trusted project registry
- secure progress RPC
- migration 0005 entitlement-aware mission RLS
- mock payment disabled in production

Critical blocker:
- repository is public and contains proprietary reference/internal material

## Dashboard

**PRODUCTION REAL once persisted data exists**

Shows:
- next action
- readiness snapshot
- role direction
- top gaps
- project progress

## Settings

**PRODUCTION ARCHITECTURE**

- account state
- career profile link
- resume management
- privacy/terms
- account deletion request

Deletion request processing worker/admin operation is not implemented.

## Payments

Demo:
**REAL LOCAL MVP**

Production:
**INCOMPLETE / BLOCKED EXTERNALLY**

- Razorpay credential placeholders exist
- signature verifier exists
- real order creation/webhook entitlement activation is not enabled
- production UI fails closed

## Analytics

**PRODUCTION ARCHITECTURE**

- funnel taxonomy
- property sanitizer
- provider neutral
- no external provider configured

## Mobile/accessibility

**PRODUCTION REAL frontend**

Implemented:
- responsive app navigation
- no intentional horizontal tables
- visible focus states
- semantic buttons/links/labels
- mobile layouts
- reduced-motion support
- accessible error/status roles

Requires final screenshot/browser review from CI on every significant design change.

## Repository hygiene

**IMPROVED**

Removed from tracked head:
- Python bytecode caches
- local reference SQLite database

Ignored:
- caches
- local databases
- build outputs
- secrets/environment files except safe example

Reference source remains intentionally present until repository visibility is corrected.

## Database migration status

Files 0001–0005 exist in code.

**Production application status: UNVERIFIED FROM THIS REPOSITORY.**

Do not change this wording without checking the external Supabase project.
