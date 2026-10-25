# JobReady Product Specification

## Product promise

JobReady helps an early-career student answer:

1. What does my current profile actually prove?
2. Which supported roles fit that evidence best?
3. Which important evidence is missing or weak?
4. What is the smallest high-value project that can close several gaps together?
5. Can I build, test, deploy, and defend that work?

The product does not promise employment.

## Initial audience

Primary:
- B.Tech / B.E.
- BCA
- B.Sc CS / IT
- mainly 2nd–4th year students in India

Current role directions:
- Backend / Software Engineer
- Data Analyst
- AI / ML Engineer

Future tracks may include:
- ECE / Semiconductor
- RTL / VLSI
- Verification
- FPGA
- Embedded
- RISC-V / SoC
- RTL-to-GDS

The data and catalog model must preserve the hierarchy:

```
Track
→ Project family
→ Controlled variant
```

## Core product model

### Readiness

The readiness number is an explainable profile-readiness score.

It is not:
- hiring probability
- placement probability
- salary probability
- AI confidence that someone will get a job

Current dimensions:
- Technical foundations
- Role-relevant skills
- Project quality
- Production evidence
- Resume clarity
- Proof of work

### Role fit

Role fit is evidence coverage against a supported role pattern.

Each role screen explains:
- current fit level
- strong / visible evidence
- evidence not visible
- what would improve the profile

### Evidence gaps

Evidence states:
- Strong evidence
- Partial / weak evidence
- Missing evidence

“Missing evidence” must never be rewritten as “you do not know this.”

## Controlled project catalog

Current catalog:
1. Software / Backend → Production Backend System → Logistics backend — **available**
2. Data → Business Analytics Decision System → Retail growth system — **planned**
3. AI / ML → AI Document Intelligence System → College policy assistant — **planned**

Only validated available projects may be emitted by the recommendation engine.

Planned projects remain visible as honest product architecture previews. They do not have fake missions and do not count toward marketing inventory.

## Available project experience

The logistics backend path has 12 mission summaries:
1. Understand problem + setup
2. System/data design
3. Authentication + authorization
4. Core API
5. Business rules
6. Testing
7. Production concerns
8. Docker
9. Deployment
10. Documentation
11. Evidence review
12. Project defense

Mission UX includes:
- objective
- why it matters
- concepts
- tasks
- deliverables
- acceptance criteria
- progressive hints
- verification requirements
- saved completion state

Project defense includes beginner, intermediate, and advanced questions.

## Progressive hints

Levels:
1. Concept
2. Direction
3. Architecture
4. Guided pattern

A hint should reduce ambiguity without giving the student a completed reference solution.

## Verification

Current beta is honest about verification.

Implemented:
- transparent acceptance criteria
- artifact/behavior expectations
- test/reference architecture
- rubric structure
- project-defense checks

Not yet represented as live:
- hidden remote-code execution
- automatic GitHub repository verification
- automatic deployment health verification

The UI must never say “passed” unless a verifier actually ran.

## Payments

Current beta concept:
- Mission 1 free
- Project Pass defaults to ₹499 via configuration

Production requirement:
- transaction != entitlement
- server verification controls entitlement
- query strings/localStorage/client state cannot unlock paid production content
- mock checkout is disabled in production

Real Razorpay checkout is blocked until configuration and acceptance testing are complete.

## Resume

Current parser:
- PDF only
- max 5 MB
- validates MIME + extension + PDF signature
- deterministic extraction
- text-based PDFs only
- emits parse confidence + warnings
- does not persist raw extracted text in the structured resume model

A low-confidence parse may still be useful, but the UI must warn the user.

## Dashboard

Primary question: **What should I do next?**

Priority:
1. Next action
2. Readiness snapshot
3. Role direction
4. Top evidence gaps
5. Current project progress

No vanity metrics.

## Non-goals

Do not evolve JobReady into:
- course marketplace
- tutorial directory
- chatbot wrapper
- certificate seller
- paid internship marketplace
- random GitHub project list
- fake-placement product
