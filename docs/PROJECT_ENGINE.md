# Project engine

Recommendations are deterministic and explainable. The engine combines the student's strongest
role matches, high-priority skill and evidence gaps, existing projects, interests, weekly time,
and difficulty preference with a small verified catalog.

The catalog is constrained to three families:

- Production Backend System
- Business Analytics Decision System
- AI Document Intelligence System

Each recommendation identifies its variant, target role, gaps closed, evidence gained,
prerequisites, duration, difficulty, and score explanation. It does not claim employment
outcomes and does not use an LLM to decide the ranking.

The first verified backend variant is Logistics Order & Delivery Management Backend. Its
student-facing starter is intentionally incomplete; the complete reference implementation is
kept under `reference/logistics-order-api` for evaluation and internal testing only.
