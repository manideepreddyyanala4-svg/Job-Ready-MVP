# JobReady Product & Engineering Decisions

## 1. Evidence-first positioning

Decision:
> Do not build random projects. Build the evidence your target role is missing.

Reason:
The product is differentiated by diagnosis → evidence gap → controlled project execution, not by content volume.

## 2. Research-informed UX direction

Reference categories reviewed:
- Forage — task/work-simulation framing
- roadmap.sh — visible hierarchy and progression
- Frontend Mentor — project/challenge evidence framing
- Simplify / Teal — concise career-profile workflows and clear limitations
- Linear — scanability, hierarchy, status clarity
- Vercel — actionable project/deployment states
- Exercism / boot.dev — progressive practice structures

Principles adopted:
- obvious next action
- short progressive onboarding
- status labels that tell the truth
- hierarchy before decoration
- project work framed as inspectable evidence
- progressive hints
- explicit failure/empty/loading states
- restrained visual system

Patterns rejected:
- fake testimonials/social proof
- placement claims
- “100+ projects” inventory claims
- course marketplace grids
- fake live activity
- manipulative scarcity
- excessive gradients/glassmorphism
- gamification that hides whether evidence is actually strong
- generic AI-chatbot framing

## 3. One coherent visual system

Direction:
- warm neutral background
- deep navy technical anchor
- orange action/accent color
- restrained green/warning states
- editorial display type only for major headings
- system sans for dense product information
- 9/14/20/28px radius hierarchy
- subtle borders/shadows
- accessible focus states
- desktop sidebar + mobile navigation

Reason:
JobReady should feel technical and credible without looking like a coaching institute or enterprise HR portal.

## 4. Honest catalog availability

Decision:
Only logistics backend is currently “available.”

Data and AI/ML families remain “planned.”

Reason:
The repository did not contain validated, role-specific mission sequences for those families. Reusing logistics missions was misleading.

## 5. Public mission metadata vs protected mission content

Decision:
Client-safe catalog objects contain mission summaries only.

Paid detail is delivered after entitlement checks.

Reason:
UI gating is not an access-control boundary.

## 6. Database defense in depth

Decision:
Migration 0005 enables RLS/grants on reference/project-content tables and adds an entitlement-aware mission policy.

Reason:
A protected Next.js page does not prevent direct Data API access if database grants are permissive.

## 7. No raw text in structured resume storage

Decision:
The new structured resume type omits `rawText`.

Reason:
The current scoring system does not require retaining full extracted text after structure is produced. Data minimization reduces privacy exposure.

## 8. Parser confidence is visible

Decision:
Show low/medium/high parse confidence plus warnings.

Reason:
The current PDF extractor is deterministic and limited. Hiding that limitation would create false certainty.

## 9. Production payment fails closed

Decision:
Mock checkout is demo-only. Production shows an unavailable checkout state until Razorpay is implemented/configured/verified.

Reason:
Never create the impression that a real transaction or entitlement occurred.

## 10. Verification claims match infrastructure

Decision:
Current UI labels acceptance/verification guidance as transparent self-checks unless an actual verifier ran.

Reason:
No arbitrary remote execution should be introduced casually, and no “passed” state should be fabricated.

## 11. Repository content boundary

Decision:
Do not delete the reference implementation merely to make a security report look clean.

Required action:
Make current repository private before private beta, then split student-safe starter content later.

Reason:
Deleting active files does not erase public Git history and may destroy useful internal material.

## 12. Dashboard prioritizes work, not charts

Order:
1. next action
2. readiness
3. role
4. gaps
5. project progress

Reason:
The dashboard exists to allocate student attention.
