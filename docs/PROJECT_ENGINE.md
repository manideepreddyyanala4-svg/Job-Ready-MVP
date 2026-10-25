# JobReady Project Engine

## Purpose

A project exists to close high-value evidence gaps for a target role.

It is not selected because:
- it is trendy
- it is common on YouTube
- it contains many technologies
- it makes the catalog look large

## Hierarchy

```
Track
  → Project family
      → Controlled variant
          → Mission summaries
          → Protected mission detail
          → Evidence / verification
          → Project defense
```

This hierarchy is designed to scale to future software, data, AI, ECE, semiconductor, RTL, verification, FPGA, embedded, and SoC tracks without changing the core product model.

## Current registry

### Software / Backend

Family:
- Production Backend System

Available variant:
- Logistics Order & Delivery Management Backend

### Data

Family:
- Business Analytics Decision System

Planned variant:
- Retail Growth Decision System

### AI / ML

Family:
- AI Document Intelligence System

Planned variant:
- College Policy Document Assistant

## Recommendation rules

A recommendation must consider:
- supported target role
- current skills/evidence
- current projects
- proof links
- evidence gaps
- available time
- validated project availability

A planned/unvalidated project must not be emitted merely because it matches the role.

## Public project metadata

Safe metadata includes:
- title
- track/family
- domain
- difficulty
- duration
- target role
- skills/evidence produced
- architecture overview
- deployment requirement
- mission title/time/free flag

Paid mission detail is not part of the client catalog object.

## Mission contract

Detailed mission content:
- objective
- why it matters
- concepts
- ordered tasks
- deliverables
- acceptance criteria
- progressive hints
- resources
- verification expectations

Progressive hints:
1. Concept
2. Direction
3. Architecture
4. Guided pattern

Do not place a full internal reference solution in a student hint.

## Verification model

Potential layers:
1. deterministic unit/integration tests
2. hidden tests
3. artifact checks
4. deployment checks
5. manual/viva checks

Current private beta implements the UI/data architecture and honest self-check/rubric layer.

A future verifier must:
- isolate untrusted code
- enforce resource/time/network constraints
- avoid leaking hidden tests
- record verifier version
- return pass/fail + safe feedback
- never expose secrets

Do not execute arbitrary student code inside the main web process.

## Evidence after completion

A completed project should eventually let the student point to:
- repository
- deployment URL or deployment runbook
- test evidence
- architecture
- technologies demonstrated
- rubric/verification state
- project explanation
- defense readiness
- known limitations

The main value is inspectable evidence, not a certificate.

## Reference implementation

The repository currently contains a full internal logistics reference under `reference/`.

That reference is useful for:
- verifier design
- rubric testing
- regression tests
- content authoring

It must not be student-accessible in a proprietary private beta.

Because the repository is currently public, repository visibility is a critical blocker. Do not assume application route protection hides Git content.
