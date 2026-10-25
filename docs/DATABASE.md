# JobReady Database

## Important status language

Migration file exists != migration applied.

This repository cannot prove the state of the external Supabase project merely from checked-in SQL.

Use:
- **CODE EXISTS** for a migration present in Git
- **APPLIED TO PRODUCTION** only after verifying the Supabase migration/schema state directly

## Migrations

### 0001_jobready_schema.sql

Defines:
- profiles
- skills/student skills
- resume files/parses
- readiness
- roles/requirements/matches
- skill gaps
- project families/variants/missions
- recommendations
- enrollments/progress
- payments
- entitlements
- private resumes bucket and policies

### 0002_reference_data.sql

Seeds:
- initial skills
- 3 supported roles
- role skill requirements
- project families
- initial variants
- 12 logistics mission summary rows

### 0003_secure_mission_progress.sql

Replaces direct progress writes with `save_mission_progress(...)`.

The function validates:
- current user owns enrollment
- mission belongs to enrollment variant
- paid mission has active family entitlement

### 0004_mission_content.sql

Adds detailed logistics mission definitions.

### 0005_private_beta_hardening.sql

Required for this branch.

Adds/fixes:
- `profiles.target_roles text[]`
- system-design + Excel reference skills
- RLS on skills/roles/requirements/project families/variants/missions
- explicit grants/revokes for authenticated reference reads
- entitlement-aware mission-detail policy
- account deletion request table + policies
- hint-usage merge behavior in progress RPC
- acceptance + verification fields for logistics missions

## RLS model

User-owned tables use `auth.uid()` ownership.

Reference/project metadata:
- no anonymous database read
- authenticated users can read safe reference rows
- project mission rows are free-or-entitled

Paid mission policy concept:

```
free mission
OR
active user entitlement for mission variant family
```

Application server checks remain in place even with RLS.

## Resume storage

Bucket: `resumes`

Public: false

Path:
```
resumes/{auth.uid()}/{resume_id}.pdf
```

Policies restrict insert/select/update/delete to the user-scoped folder.

## Analysis versions

Current code writes **v2**:
- readiness v2
- role matches v2
- skill gaps v2
- recommendations v2

Read API selects the latest readiness scoring version and filters the related current records accordingly.

Older v1 rows may remain as history.

## Payments vs entitlements

`payments`:
- external transaction record
- created / paid / failed

`user_entitlements`:
- active/revoked access record
- tied to user + project family + payment

Never infer entitlement from:
- a client redirect
- localStorage
- query string
- UI success state

## Account deletion requests

`account_deletion_requests` records:
- user_id
- status
- requested_at
- completed_at

The table records intent/status. It does not itself delete user data.

## Production application checklist

Before production mode:
1. inspect current Supabase schema/migration history
2. apply missing migrations in order
3. confirm bucket is private
4. verify all exposed tables have intended RLS/grants
5. test user A cannot read user B data
6. test anonymous user cannot read project mission content
7. test free mission is readable by authenticated user
8. test paid mission is unreadable without entitlement
9. test paid mission becomes readable with entitlement
10. test progress RPC rejects paid writes without entitlement

Until those checks are run against the external project, migration status is **BLOCKED EXTERNALLY / UNVERIFIED**, not “live.”
