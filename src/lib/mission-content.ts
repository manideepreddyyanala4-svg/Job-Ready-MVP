import "server-only";

import type { MissionSummary } from "@/lib/domain";

export type MissionHint = {
  label: "Concept" | "Direction" | "Architecture" | "Guided pattern";
  body: string;
};

export type MissionDetail = MissionSummary & {
  objective: string;
  why: string;
  concepts: string[];
  tasks: string[];
  deliverables: string[];
  acceptanceCriteria: string[];
  hints: MissionHint[];
  resources: string[];
  verification: string[];
};

const makeHints = (concept: string, direction: string, architecture: string, guided: string): MissionHint[] => [
  { label: "Concept", body: concept },
  { label: "Direction", body: direction },
  { label: "Architecture", body: architecture },
  { label: "Guided pattern", body: guided },
];

export const demoLogisticsMissionDetails: Record<string, MissionDetail> = {
  m1: {
    id: "m1",
    title: "Understand the problem + setup",
    time: "45 min",
    free: true,
    objective: "Translate the logistics brief into a build plan and run the starter repository.",
    why: "Clear scope prevents a project from becoming a pile of disconnected endpoints.",
    concepts: ["problem framing", "repository hygiene", "environment variables"],
    tasks: ["Write the actors and core workflows.", "Run the starter test suite.", "Record the local setup steps."],
    deliverables: ["One-page project brief", "Working local setup", "Setup notes"],
    acceptanceCriteria: ["Actors and workflows are explicit.", "The starter runs from a clean checkout.", "Secrets are not committed."],
    hints: makeHints(
      "Start with users, actions, and state changes instead of frameworks.",
      "Write one happy path and two failure paths before coding.",
      "Separate configuration from source code and keep the initial boundaries small.",
      "Turn the brief into a short checklist: actor → action → data changed → failure case.",
    ),
    resources: ["HTTP semantics", "12-factor configuration"],
    verification: ["Starter checks run locally", "Project brief is reviewable", "No committed secrets"],
  },
  m2: {
    id: "m2",
    title: "Design the system and data model",
    time: "90 min",
    objective: "Model customers, orders, shipments, and lifecycle transitions before writing routes.",
    why: "A deliberate data model makes ownership and business rules testable.",
    concepts: ["entity relationships", "state machines", "PostgreSQL"],
    tasks: ["Draw an ERD.", "Define keys and constraints.", "Document allowed status transitions."],
    deliverables: ["ERD", "Migration plan", "Trade-off notes"],
    acceptanceCriteria: ["Each record has a clear owner.", "Important invariants have constraints.", "Status transitions are explicit."],
    hints: makeHints(
      "Ask which entity is the source of truth for each piece of state.",
      "Model the smallest set of tables that preserves ownership and history.",
      "Put lifecycle rules in a domain layer rather than spreading them across route handlers.",
      "For every relationship, write the cardinality, deletion behavior, and one query you expect to run.",
    ),
    resources: ["Relational modeling", "Database constraints"],
    verification: ["ERD can be explained", "Migration plan is deterministic", "Invalid states are identified"],
  },
  m3: {
    id: "m3",
    title: "Authentication and authorization",
    time: "2 hrs",
    objective: "Add secure identity and ownership checks to the API.",
    why: "Authentication tells you who the user is; authorization decides what that user may access.",
    concepts: ["identity", "password hashing", "authorization"],
    tasks: ["Implement registration and sign-in.", "Hash passwords safely.", "Add ownership checks and a cross-user negative test."],
    deliverables: ["Auth endpoints", "Ownership test", "Security notes"],
    acceptanceCriteria: ["Passwords are never stored in plaintext.", "Protected routes validate identity.", "One user cannot read another user's order."],
    hints: makeHints(
      "Treat identity and resource ownership as two separate checks.",
      "Validate identity at the boundary, then pass a user identifier into domain operations.",
      "Centralize authorization predicates so reads and writes use the same ownership rule.",
      "Write the negative test first: user B requests a resource owned by user A and receives a safe denial.",
    ),
    resources: ["OWASP authentication guidance", "Authorization testing"],
    verification: ["Cross-user access is denied", "Credentials are not logged", "Protected endpoints require identity"],
  },
  m4: {
    id: "m4",
    title: "Core API implementation",
    time: "3 hrs",
    objective: "Build validated order and shipment REST endpoints.",
    why: "A predictable API is easier to integrate, test, and explain.",
    concepts: ["REST design", "validation", "service boundaries"],
    tasks: ["Define request and response schemas.", "Implement core create/read/update flows.", "Return consistent client-safe errors."],
    deliverables: ["Documented API endpoints", "Validation examples", "API test evidence"],
    acceptanceCriteria: ["Inputs are validated.", "Status codes are consistent.", "Transport code does not contain core business rules."],
    hints: makeHints(
      "Design each endpoint around a resource and a concrete state change.",
      "Write the request/response contract before the handler.",
      "Keep route → service → persistence responsibilities distinct.",
      "Implement one vertical slice end to end before duplicating the pattern.",
    ),
    resources: ["HTTP status codes", "Schema validation"],
    verification: ["Happy path works", "Malformed input is rejected", "Errors do not expose stack traces"],
  },
  m5: {
    id: "m5",
    title: "Business rules",
    time: "2 hrs",
    objective: "Make status transitions predictable, idempotent, and defendable.",
    why: "Explicit business rules are what make this more than a CRUD demo.",
    concepts: ["domain rules", "idempotency", "edge cases"],
    tasks: ["Encode allowed transitions.", "Reject invalid transitions.", "Decide how repeated requests behave."],
    deliverables: ["Transition policy", "Edge-case tests", "Idempotency note"],
    acceptanceCriteria: ["Invalid transitions do not mutate state.", "Repeated safe requests have defined behavior.", "Rules have focused tests."],
    hints: makeHints(
      "List legal states before writing transition code.",
      "Represent invalid transitions as domain errors, not generic server failures.",
      "Keep the transition map in one source of truth.",
      "Test current state + requested state + expected result as a table.",
    ),
    resources: ["State machines", "Idempotent APIs"],
    verification: ["Invalid transition test passes", "Repeated request behavior is documented", "State remains consistent on failure"],
  },
  m6: {
    id: "m6",
    title: "Testing",
    time: "2 hrs",
    objective: "Build unit and integration tests that prove important behavior.",
    why: "Tests are evidence of engineering judgment, not a vanity coverage number.",
    concepts: ["fixtures", "API testing", "test pyramid"],
    tasks: ["Test domain transitions.", "Test authorization boundaries.", "Test one complete order flow."],
    deliverables: ["Focused test suite", "Fixture strategy", "Coverage notes"],
    acceptanceCriteria: ["Critical failure paths are tested.", "Tests are independent.", "Test names describe behavior."],
    hints: makeHints(
      "Start with the failure that would be most damaging in production.",
      "Keep fixtures small and explicit so the test remains readable.",
      "Use unit tests for rules and integration tests for boundaries.",
      "For each major endpoint, include one success, one validation failure, and one authorization failure.",
    ),
    resources: ["pytest", "Integration testing"],
    verification: ["Core tests pass", "Authorization negative case exists", "Tests can run from a clean checkout"],
  },
  m7: {
    id: "m7",
    title: "Production concerns",
    time: "90 min",
    objective: "Prepare the service to be observable and resilient.",
    why: "Production thinking shows whether another engineer could operate the service.",
    concepts: ["logging", "health checks", "error handling"],
    tasks: ["Add health/readiness checks.", "Standardize client-safe errors.", "Define useful log fields."],
    deliverables: ["Production checklist", "Health endpoint", "Error contract"],
    acceptanceCriteria: ["Health checks do not leak secrets.", "Logs avoid sensitive payloads.", "Known failures have safe responses."],
    hints: makeHints(
      "Observability should answer: is it alive, is it ready, and what failed?",
      "Separate user-facing error messages from internal diagnostics.",
      "Define structured log fields before adding logging calls.",
      "Create one error mapper that converts known domain errors into stable API responses.",
    ),
    resources: ["Structured logging", "Service health"],
    verification: ["Health endpoint responds safely", "Known failures are mapped", "Sensitive values are excluded from logs"],
  },
  m8: {
    id: "m8",
    title: "Docker",
    time: "90 min",
    objective: "Package the API and database for repeatable local setup.",
    why: "Reproducible environments reduce hidden assumptions and reviewer friction.",
    concepts: ["containers", "Compose", "configuration"],
    tasks: ["Write a Dockerfile.", "Configure Compose.", "Document volumes and environment variables."],
    deliverables: ["Dockerfile", "Compose setup", "Run instructions"],
    acceptanceCriteria: ["A clean checkout can start predictably.", "Secrets are injected at runtime.", "Persistent data behavior is documented."],
    hints: makeHints(
      "A container should package the app, not bake in secrets.",
      "Keep build-time and runtime configuration separate.",
      "Use a small service graph: app + database + only necessary dependencies.",
      "Validate by removing local assumptions and starting from documented commands.",
    ),
    resources: ["Docker Compose", "Container networking"],
    verification: ["Container build succeeds", "Compose starts required services", "No secret is baked into the image"],
  },
  m9: {
    id: "m9",
    title: "Deployment",
    time: "90 min",
    objective: "Create a credible deployment plan with secrets, migrations, health checks, and rollback thinking.",
    why: "Deployment evidence shows you can move beyond localhost without pretending the service has real traffic.",
    concepts: ["cloud basics", "secrets", "rollbacks"],
    tasks: ["Choose a target.", "Map runtime configuration.", "Write migration and rollback steps."],
    deliverables: ["Architecture diagram", "Deployment runbook", "Risk list"],
    acceptanceCriteria: ["Secret handling is explicit.", "Migration order is documented.", "A rollback trigger and health check are named."],
    hints: makeHints(
      "Choose a simple platform that supports the service's real needs.",
      "Write down every external dependency and configuration value.",
      "Draw request flow, database, secret boundary, and health path.",
      "Write a deploy checklist that another person could execute without guessing.",
    ),
    resources: ["Deployment strategies", "Secret management"],
    verification: ["Deployment target is justified", "Runbook includes rollback", "Public endpoint or honest deployment evidence is recorded"],
  },
  m10: {
    id: "m10",
    title: "Documentation",
    time: "60 min",
    objective: "Make the project easy for another engineer to run and review.",
    why: "Good documentation turns implementation into inspectable evidence.",
    concepts: ["README", "API docs", "decision records"],
    tasks: ["Write tested setup instructions.", "Add example requests.", "Record major decisions and trade-offs."],
    deliverables: ["Polished README", "API examples", "Decision record"],
    acceptanceCriteria: ["Every setup command is tested.", "At least one failure example is shown.", "Important trade-offs are explained."],
    hints: makeHints(
      "Write for a reviewer who has never seen the repository.",
      "Start with problem, architecture, setup, verification, and trade-offs.",
      "Link decisions to evidence instead of adjectives.",
      "Run the README instructions from a fresh environment and fix every missing step.",
    ),
    resources: ["OpenAPI", "Technical writing"],
    verification: ["README setup works", "Architecture is explained", "Evidence links are easy to find"],
  },
  m11: {
    id: "m11",
    title: "Evidence review",
    time: "60 min",
    objective: "Audit the project against the rubric and close the highest-value gaps.",
    why: "A structured review converts implementation into credible evidence.",
    concepts: ["rubrics", "self-review", "scope"],
    tasks: ["Score each rubric criterion.", "Select the three highest-value improvements.", "Capture before/after evidence."],
    deliverables: ["Review log", "Improvement diff", "Final evidence index"],
    acceptanceCriteria: ["Claims link to artifacts.", "Correctness/security issues are prioritized.", "Known limitations are explicit."],
    hints: makeHints(
      "Review what can be proven, not what you intended to build.",
      "Fix correctness and security before visual polish.",
      "Group evidence by the role requirement it supports.",
      "For each rubric item write: claim → file/test/deployment evidence → limitation.",
    ),
    resources: ["Code review", "Engineering rubrics"],
    verification: ["Evidence index exists", "Critical gaps are addressed", "Limitations are documented"],
  },
  m12: {
    id: "m12",
    title: "Project defense",
    time: "60 min",
    objective: "Practice explaining decisions, failures, trade-offs, and next steps.",
    why: "If you cannot defend the project, the repository alone is weak interview evidence.",
    concepts: ["technical storytelling", "trade-offs", "reflection"],
    tasks: ["Answer beginner, intermediate, and advanced project questions.", "Explain one failure.", "Describe the next iteration."],
    deliverables: ["Project defense notes", "One-minute explanation", "Reflection"],
    acceptanceCriteria: ["Answers refer to your actual implementation.", "Trade-offs include consequences.", "Limitations are admitted clearly."],
    hints: makeHints(
      "Answer from your project evidence, not from a memorized perfect script.",
      "Use context → decision → consequence for technical choices.",
      "Connect architecture answers to a file, test, or observed failure.",
      "Record yourself explaining one decision in under 90 seconds, then remove vague words.",
    ),
    resources: ["Technical interviews", "Decision storytelling"],
    verification: ["One-minute explanation is concise", "Answers cite real project decisions", "Failure and improvement story is specific"],
  },
};

export function missionDetailFromDefinition(summary: MissionSummary, definition: Record<string, unknown>): MissionDetail {
  const rawHints = Array.isArray(definition.hints) ? definition.hints.filter((item): item is string => typeof item === "string") : [];
  const hintBodies = [...rawHints, "Break the task into a smaller verifiable slice.", "Compare your implementation against the acceptance criteria."].slice(0, 4);
  const labels: MissionHint["label"][] = ["Concept", "Direction", "Architecture", "Guided pattern"];
  return {
    ...summary,
    objective: typeof definition.objective === "string" ? definition.objective : "Complete this mission and produce reviewable evidence.",
    why: typeof definition.why === "string" ? definition.why : "This mission adds evidence that can be reviewed and discussed.",
    concepts: Array.isArray(definition.concepts) ? definition.concepts.filter((item): item is string => typeof item === "string") : [],
    tasks: Array.isArray(definition.tasks) ? definition.tasks.filter((item): item is string => typeof item === "string") : [],
    deliverables: Array.isArray(definition.deliverables) ? definition.deliverables.filter((item): item is string => typeof item === "string") : [],
    acceptanceCriteria: Array.isArray(definition.acceptanceCriteria) ? definition.acceptanceCriteria.filter((item): item is string => typeof item === "string") : [],
    hints: hintBodies.map((body, index) => ({ label: labels[index], body })),
    resources: Array.isArray(definition.resources) ? definition.resources.filter((item): item is string => typeof item === "string") : [],
    verification: Array.isArray(definition.verification) ? definition.verification.filter((item): item is string => typeof item === "string") : [],
  };
}
