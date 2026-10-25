import "server-only";

export type ProjectRubricCriterion = {
  id: string;
  title: string;
  evidence: string;
  points: number;
};

export type StarterFile = {
  path: string;
  purpose: string;
  starter: string;
};

export type VivaQuestion = {
  question: string;
  whatGoodAnswersCover: string[];
};

export const logisticsBackendContent = {
  slug: "logistics-backend",
  repositoryName: "logistics-order-api-starter",
  problemStatement:
    "Build a service that records customers, orders, shipments, and delivery status transitions without allowing invalid state changes.",
  architecture:
    "A versioned REST API with an application service layer, PostgreSQL persistence, an explicit authorization boundary, focused tests, and a containerized local environment.",
  starterFiles: [
    {
      path: "src/domain/order_status.py",
      purpose: "Define the allowed order and shipment transitions.",
      starter: "class InvalidTransition(ValueError):\n    pass\n\n# Add a transition map and a pure validation function.",
    },
    {
      path: "src/api/app.py",
      purpose: "Create the API application without embedding business rules in routes.",
      starter: "# Create the application and register versioned routes here.\n",
    },
    {
      path: "tests/test_transitions.py",
      purpose: "Make business-rule evidence visible through focused tests.",
      starter: "# Add valid and invalid transition cases.\n",
    },
    {
      path: "README.md",
      purpose: "Document setup, decisions, API examples, and trade-offs.",
      starter: "# Logistics Order API\n\n## Setup\n\nDocument your local setup and first decision.\n",
    },
  ] satisfies StarterFile[],
  rubric: [
    { id: "problem", title: "Problem framing", evidence: "A clear domain brief, actors, constraints, and non-goals.", points: 10 },
    { id: "data", title: "Data model", evidence: "An explained ERD, migrations, keys, and lifecycle fields.", points: 15 },
    { id: "api", title: "API quality", evidence: "Validated versioned endpoints with useful error responses.", points: 15 },
    { id: "auth", title: "Authorization", evidence: "Authenticated ownership checks and a negative authorization test.", points: 15 },
    { id: "rules", title: "Business rules", evidence: "Explicit transition policy with edge-case tests.", points: 15 },
    { id: "testing", title: "Testing", evidence: "Focused unit/integration tests and a short test strategy.", points: 10 },
    { id: "operations", title: "Production concerns", evidence: "Health checks, safe configuration, logs, Docker, and deployment notes.", points: 10 },
    { id: "communication", title: "Documentation and viva", evidence: "Runnable README, decision records, and defensible trade-offs.", points: 10 },
  ] satisfies ProjectRubricCriterion[],
  hiddenTests: [
    "Reject an invalid shipment transition without changing persisted state.",
    "Reject access to an order owned by another authenticated user.",
    "Return a validation error for an incomplete order payload.",
    "Keep a repeated status update idempotent.",
    "Expose a health check without leaking credentials or raw database errors.",
  ],
  vivaQuestions: [
    { question: "Why did you keep transition rules outside the route handler?", whatGoodAnswersCover: ["testability", "single source of truth", "separation of concerns"] },
    { question: "How do you prevent one customer from reading another customer's order?", whatGoodAnswersCover: ["identity", "ownership predicate", "negative test"] },
    { question: "What would you monitor in production?", whatGoodAnswersCover: ["latency", "error rate", "health checks", "safe structured logs"] },
    { question: "Where would you add idempotency and why?", whatGoodAnswersCover: ["retries", "request key", "state transition safety"] },
    { question: "What trade-off did you make in your database design?", whatGoodAnswersCover: ["normalization", "query shape", "future change"] },
    { question: "How would you deploy this service safely?", whatGoodAnswersCover: ["secrets", "migration order", "rollback", "health checks"] },
    { question: "Which test gives you the most confidence?", whatGoodAnswersCover: ["business-critical behavior", "failure path", "maintainability"] },
    { question: "What would you change with another week?", whatGoodAnswersCover: ["prioritization", "evidence", "scope discipline"] },
  ] satisfies VivaQuestion[],
} as const;
