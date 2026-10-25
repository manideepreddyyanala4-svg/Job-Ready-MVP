export type RoleId = "backend" | "analyst" | "ml";
export type EvidenceState = "strong" | "partial" | "missing";

export type Role = {
  id: RoleId;
  name: string;
  shortName: string;
  description: string;
  color: string;
  skills: string[];
};

export type Project = {
  id: string;
  family: string;
  title: string;
  description: string;
  why: string;
  skills: string[];
  gaps: string[];
  difficulty: string;
  duration: string;
  outcome: string;
  domain?: string;
  targetRole?: string;
  architecture?: string[];
  prerequisites?: string[];
  missions: Mission[];
};

export type Mission = {
  id: string;
  title: string;
  objective: string;
  time: string;
  free?: boolean;
  concepts: string[];
  deliverable: string;
  why?: string;
  resources?: string[];
  hints?: string[];
};

export const roles: Role[] = [
  {
    id: "backend",
    name: "Backend / Software Engineer",
    shortName: "Backend engineer",
    description: "Build reliable APIs, data systems, and services that power products.",
    color: "orange",
    skills: ["Python", "SQL", "REST APIs", "PostgreSQL", "Testing", "Docker", "Git", "Deployment"],
  },
  {
    id: "analyst",
    name: "Data Analyst",
    shortName: "Data analyst",
    description: "Turn messy business data into clear decisions and measurable outcomes.",
    color: "blue",
    skills: ["Excel", "SQL", "Python", "Pandas", "Statistics", "Visualization", "Business thinking"],
  },
  {
    id: "ml",
    name: "AI / ML Engineer",
    shortName: "AI / ML engineer",
    description: "Train, evaluate, and ship useful machine learning systems responsibly.",
    color: "violet",
    skills: ["Python", "Pandas", "ML fundamentals", "Evaluation", "APIs", "Deployment", "Git"],
  },
];

const missionList: Mission[] = [
  { id: "m1", title: "Understand the problem + setup", objective: "Turn the logistics brief into a clear build plan and get your local workspace ready.", time: "45 min", free: true, concepts: ["problem framing", "repository hygiene", "environment variables"], deliverable: "A one-page project brief and a running starter repository." },
  { id: "m2", title: "Design the system and data model", objective: "Model customers, orders, shipments, and their status lifecycle before writing routes.", time: "90 min", concepts: ["entity relationships", "state machines", "PostgreSQL"], deliverable: "An ERD and migration plan with explained trade-offs." },
  { id: "m3", title: "Authentication", objective: "Add secure identity and ownership checks to the API.", time: "2 hrs", concepts: ["sessions", "password hashing", "authorization"], deliverable: "Authenticated API endpoints and an authorization test." },
  { id: "m4", title: "Core API implementation", objective: "Build the order and shipment flows with clear validation.", time: "3 hrs", concepts: ["REST design", "validation", "service boundaries"], deliverable: "Documented CRUD endpoints with validation errors." },
  { id: "m5", title: "Business rules", objective: "Make status transitions predictable and defendable.", time: "2 hrs", concepts: ["domain rules", "idempotency", "edge cases"], deliverable: "A transition policy and tests for invalid moves." },
  { id: "m6", title: "Testing", objective: "Build confidence with focused unit and integration tests.", time: "2 hrs", concepts: ["test pyramid", "fixtures", "API testing"], deliverable: "A meaningful test suite and coverage notes." },
  { id: "m7", title: "Production concerns", objective: "Prepare the service to be observable and resilient.", time: "90 min", concepts: ["logging", "health checks", "error handling"], deliverable: "A production-readiness checklist." },
  { id: "m8", title: "Docker", objective: "Package the API and database for repeatable local setup.", time: "90 min", concepts: ["containers", "compose", "configuration"], deliverable: "A working Docker Compose setup." },
  { id: "m9", title: "Deployment", objective: "Create a credible deployment plan without hiding trade-offs.", time: "90 min", concepts: ["cloud basics", "secrets", "rollbacks"], deliverable: "An architecture diagram and deployment runbook." },
  { id: "m10", title: "Documentation", objective: "Make your project easy for another engineer to run and review.", time: "60 min", concepts: ["README", "API docs", "decision records"], deliverable: "A polished README with setup and API examples." },
  { id: "m11", title: "Review", objective: "Audit the project against the rubric and close the most important gaps.", time: "60 min", concepts: ["rubrics", "self-review", "scope"], deliverable: "A review log with before/after evidence." },
  { id: "m12", title: "Project viva preparation", objective: "Practice explaining decisions, failures, and next steps in an interview.", time: "60 min", concepts: ["technical storytelling", "trade-offs", "reflection"], deliverable: "Answers to ten project viva questions." },
];

export const projects: Project[] = [
  {
    id: "logistics-backend",
    family: "Production Backend System",
    title: "Logistics Order & Delivery Management Backend",
    description: "A production-minded REST API for customers, orders, shipments, and delivery status.",
    why: "You already have Python, SQL, Git, and basic Flask exposure. This project turns that foundation into visible backend evidence.",
    skills: ["REST API design", "PostgreSQL", "Authentication", "Testing", "Docker", "Deployment"],
    gaps: ["production API evidence", "database design", "testing", "deployment proof"],
    difficulty: "Intermediate",
    duration: "3–4 weeks",
    outcome: "A portfolio-ready service with an architecture story you can defend in interviews.",
    domain: "logistics",
    targetRole: "Backend / Software Engineer",
    architecture: ["REST API", "PostgreSQL data layer", "Authentication boundary", "Dockerized deployment"],
    prerequisites: ["Python or another backend language", "SQL fundamentals", "Git basics"],
    missions: missionList,
  },
  {
    id: "retail-analytics",
    family: "Business Analytics Decision System",
    title: "Retail Growth Decision System",
    description: "Clean sales data, surface customer patterns, and turn insights into clear decisions.",
    why: "Your SQL and Pandas foundation can become a complete business case with stronger communication evidence.",
    skills: ["SQL", "Pandas", "Data cleaning", "Visualization", "Business reasoning"],
    gaps: ["dashboard evidence", "business communication", "repeatable analysis"],
    difficulty: "Intermediate",
    duration: "2–3 weeks",
    outcome: "A case study with reproducible analysis, charts, and recommendations.",
    missions: missionList.slice(0, 6),
  },
  {
    id: "document-intelligence",
    family: "AI Document Intelligence System",
    title: "College Policy Document Assistant",
    description: "A grounded document search assistant that answers questions with traceable sources.",
    why: "Your ML curiosity and Python base get a focused, evaluable AI project instead of a generic chatbot.",
    skills: ["Python", "Retrieval", "Evaluation", "API serving", "Deployment"],
    gaps: ["evaluation evidence", "serving a model", "production thinking"],
    difficulty: "Advanced",
    duration: "4–5 weeks",
    outcome: "An AI system with an evaluation set, source citations, and latency notes.",
    missions: missionList.slice(0, 7),
  },
];

export const demoStudent = {
  name: "Arjun Reddy",
  degree: "B.Tech Computer Science",
  year: "3rd year",
  college: "VNR VJIET",
  skills: ["Python", "SQL", "Pandas", "Flask", "Git"],
  projects: ["Titanic ML classifier", "Basic expense tracker"],
  target: "Backend + AI / ML",
};

export const gaps = [
  { label: "Production API design", state: "partial" as EvidenceState, detail: "You mention Flask, but there is no deployed API with documented decisions yet.", priority: "High" },
  { label: "Docker & deployment", state: "missing" as EvidenceState, detail: "Knowledge is unknown; your current profile does not prove container or deployment experience.", priority: "High" },
  { label: "Automated testing", state: "missing" as EvidenceState, detail: "No test suite or test strategy is visible in your resume or project links.", priority: "High" },
  { label: "SQL & data handling", state: "strong" as EvidenceState, detail: "SQL and Pandas appear in your skills and are supported by project work.", priority: "Strong" },
  { label: "Git workflow", state: "strong" as EvidenceState, detail: "Git is listed as an active tool in your profile.", priority: "Strong" },
  { label: "System design basics", state: "partial" as EvidenceState, detail: "Your projects show implementation, but not yet the reasoning behind boundaries and trade-offs.", priority: "Medium" },
];

export function readinessScore() {
  return { total: 58, categories: [
    ["Technical foundations", 72],
    ["Role-relevant skills", 61],
    ["Project quality", 54],
    ["Production evidence", 31],
    ["Resume clarity", 66],
    ["Proof of work", 48],
  ] as [string, number][] };
}

export function readinessScoreFromResume(resume: { skills: string[]; projects: string[]; experience: string[]; links: string[] }) {
  const skills = new Set(resume.skills.map((skill) => skill.toLowerCase()));
  const has = (skill: string) => skills.has(skill.toLowerCase());
  const technical = Math.min(100, 35 + resume.skills.length * 8);
  const relevant = Math.min(100, 25 + ["python", "sql", "git", "pandas"].filter(has).length * 15);
  const projects = Math.min(100, resume.projects.length * 28);
  const production = Math.min(100, (has("docker") ? 30 : 0) + (has("postgresql") ? 25 : 0) + (resume.links.length ? 25 : 0));
  const proof = Math.min(100, resume.projects.length * 20 + resume.links.length * 20 + resume.experience.length * 20);
  const categories: [string, number][] = [
    ["Technical foundations", technical],
    ["Role-relevant skills", relevant],
    ["Project quality", projects],
    ["Production evidence", production],
    ["Resume clarity", resume.skills.length ? 60 : 20],
    ["Proof of work", proof],
  ];
  const total = Math.round(categories.reduce((sum, [, value]) => sum + value, 0) / categories.length);
  return { total, categories };
}

export function roleScore(role: RoleId) {
  return role === "backend" ? 64 : role === "ml" ? 59 : 46;
}

export function roleScoreFromResume(role: RoleId, resume: { skills: string[]; projects: string[]; links: string[] }) {
  const available = new Set(resume.skills.map((skill) => skill.toLowerCase()));
  const target = roles.find((item) => item.id === role)?.skills ?? [];
  const covered = target.filter((skill) => available.has(skill.toLowerCase())).length;
  const evidenceBonus = Math.min(20, resume.projects.length * 8 + resume.links.length * 6);
  return Math.min(100, Math.round((covered / target.length) * 80 + evidenceBonus));
}

export function gapsFromResume(resume: { skills: string[]; projects: string[]; links: string[] }) {
  const available = new Set(resume.skills.map((skill) => skill.toLowerCase()));
  const has = (skill: string) => available.has(skill.toLowerCase());
  return [
    { label: "Production API design", state: has("Flask") || has("Django") ? "partial" : "missing", detail: "An API framework is visible, but a deployed, documented service is not yet proven.", priority: "High" },
    { label: "Docker & deployment", state: has("Docker") || resume.links.length > 0 ? "partial" : "missing", detail: "Container and deployment evidence is not visible in the structured resume yet.", priority: "High" },
    { label: "Automated testing", state: "missing", detail: "No test suite or test strategy is visible in the current resume evidence.", priority: "High" },
    { label: "SQL & data handling", state: has("SQL") || has("Pandas") ? "strong" : "missing", detail: "SQL/Pandas evidence is visible in the structured profile.", priority: "Strong" },
    { label: "Git workflow", state: has("Git") ? "strong" : "missing", detail: "Git is visible as a tool in the structured profile.", priority: "Strong" },
    { label: "System design basics", state: resume.projects.length ? "partial" : "missing", detail: "Projects are visible, but system boundaries and trade-offs are not yet evidenced.", priority: "Medium" },
  ] as const;
}
