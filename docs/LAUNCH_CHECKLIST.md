# JobReady Private Beta Launch Checklist

## Critical blockers

- [ ] Make the current GitHub repository private OR move all proprietary/reference/paid content to a private repository before inviting students.
- [ ] Verify Supabase production project/schema directly.
- [ ] Apply every missing migration through `0005_private_beta_hardening.sql`.
- [ ] Verify production Auth redirect URLs with a real mailbox.
- [ ] Decide whether paid checkout is in beta scope.
- [ ] If paid checkout is in scope, complete Razorpay order/webhook/entitlement implementation and acceptance testing before enabling CTA.

## Supabase

- [ ] Confirm `resumes` bucket is private.
- [ ] Confirm resume object policies are user-scoped.
- [ ] Confirm user A cannot read user B profile/resume/analysis/progress.
- [ ] Confirm anonymous clients cannot read `project_missions`.
- [ ] Confirm authenticated users can read Mission 1.
- [ ] Confirm a paid mission is unreadable without entitlement.
- [ ] Confirm a paid mission becomes readable with active entitlement.
- [ ] Confirm `save_mission_progress` rejects paid progress without entitlement.
- [ ] Confirm hint usage merges instead of replacing prior hints.
- [ ] Confirm service-role key exists only in server environment.

## Auth

- [ ] Production magic-link email sends.
- [ ] Callback restores session.
- [ ] `next` redirects stay same-origin.
- [ ] expired/invalid link returns understandable login error.
- [ ] logout removes session.
- [ ] protected route redirects unauthenticated user.
- [ ] authenticated refresh restores state.

## Resume

- [ ] valid text PDF <= 5 MB works.
- [ ] oversized PDF rejected.
- [ ] wrong MIME rejected.
- [ ] renamed non-PDF rejected by signature.
- [ ] image-only/scanned PDF gets honest unsupported/empty message.
- [ ] current resume metadata loads.
- [ ] removing resume removes private file + derived current analysis.
- [ ] raw extracted resume text is not sent to analytics.

## Readiness

- [ ] no language implies employment probability.
- [ ] every dimension has an explanation.
- [ ] role fit says profile-to-role evidence.
- [ ] missing evidence copy never says the student lacks knowledge.
- [ ] v2 gaps attach to real skill ids where seeded.
- [ ] repeated analysis does not accumulate duplicate current v2 gaps/recommendations.

## Projects

- [ ] only validated projects can be recommended.
- [ ] planned projects are visibly unavailable.
- [ ] no “100+ projects” claim.
- [ ] project brief explains role, evidence, architecture, prerequisites, effort, verification, deployment, defense.
- [ ] Mission 1 is available without paid entitlement.
- [ ] paid mission detail does not reach an unentitled production client.

## Payments

### If payments remain out of beta scope

- [ ] production CTA stays unavailable.
- [ ] no fake checkout.
- [ ] no fake “payment success.”

### If payments are enabled

- [ ] Razorpay key id/secret/webhook secret configured in hosting provider.
- [ ] server creates order.
- [ ] client uses provider checkout only from server-created order.
- [ ] webhook signature verified.
- [ ] payment transaction persisted.
- [ ] entitlement created server-side only after trusted payment state.
- [ ] duplicate webhook is idempotent.
- [ ] failed/pending states tested.
- [ ] refund/revoke operational path defined.

## Dashboard / settings

- [ ] dashboard next action works with no resume.
- [ ] dashboard works with analysis but no project progress.
- [ ] dashboard progress persists.
- [ ] settings shows correct account mode.
- [ ] profile can be edited.
- [ ] resume can be replaced/removed.
- [ ] deletion request can be created.
- [ ] operational process exists to complete deletion requests.

## Accessibility/mobile

- [ ] keyboard through public navigation.
- [ ] keyboard through app navigation.
- [ ] visible focus on buttons/links/forms.
- [ ] labels present on form controls.
- [ ] alert/status semantics checked.
- [ ] desktop screenshots reviewed.
- [ ] mobile landing reviewed.
- [ ] mobile readiness reviewed.
- [ ] mobile project reviewed.
- [ ] mobile mission reviewed.
- [ ] mobile dashboard reviewed.
- [ ] no horizontal overflow at realistic phone widths.

## SEO/indexing

- [ ] production `NEXT_PUBLIC_SITE_URL` set.
- [ ] public metadata verified.
- [ ] canonical/domain behavior verified after domain is known.
- [ ] private pages emit no-index header.
- [ ] robots disallows private paths.
- [ ] favicon/social preview assets added before wider public launch if final brand assets differ.

## Quality gate

Before merge/deploy:
- [ ] `npm test`
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run build`
- [ ] `npm audit`
- [ ] reference pytest
- [ ] starter pytest
- [ ] Playwright screenshot smoke
- [ ] inspect remaining vulnerabilities rather than running `npm audit fix --force`

## Claims audit

- [ ] no fake student count
- [ ] no placement rate
- [ ] no salary claim
- [ ] no fake company logos
- [ ] no fabricated testimonial
- [ ] no fake live activity
- [ ] no unsupported university/recruiter partnership
- [ ] no fake project count
- [ ] no “AI accuracy” statistic
- [ ] no employment guarantee
