export type RoleId = "backend" | "analyst" | "ml";
export type EvidenceState = "strong" | "partial" | "missing";
export type ProjectStatus = "available" | "planned";

export type Role = {
  id: RoleId;
  name: string;
  shortName: string;
  description: string;
  color: string;
  skills: string[];
};

export type MissionSummary = {
  id: string;
  title: string;
  time: string;
  free?: boolean;
};

export type Project = {
  id: string;
  track: "Software / Backend" | "Data" | "AI / ML";
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
  targetRoleId?: RoleId;
  architecture?: string[];
  prerequisites?: string[];
  deploymentRequired?: boolean;
  verificationLabel?: string;
  status: ProjectStatus;
  missions: MissionSummary[];
};

export type ResumeEvidence = {
  skills: string[];
  projects: string[];
  links: string[];
  experience?: string[];
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

const logisticsMissions: MissionSummary[] = [
  { id: "m1", title: "Understand the problem + setup", time: "45 min", free: true },
  { id: "m2", title: "Design the system and data model", time: "90 min" },
  { id: "m3", title: "Authentication and authorization", time: "2 hrs" },
  { id: "m4", title: "Core API implementation", time: "3 hrs" },
  { id: "m5", title: "Business rules", time: "2 hrs" },
  { id: "m6", title: "Testing", time: "2 hrs" },
  { id: "m7", title: "Production concerns", time: "90 min" },
  { id: "m8", title: "Docker", time: "90 min" },
  { id: "m9", title: "Deployment", time: "90 min" },
  { id: "m10", title: "Documentation", time: "60 min" },
  { id: "m11", title: "Evidence review", time: "60 min" },
  { id: "m12", title: "Project defense", time: "60 min" },
];

export const projects: Project[] = [
  {
    id: "logistics-backend",
    track: "Software / Backend",
    family: "Production Backend System",
    title: "Logistics Order & Delivery Management Backend",
    description: "A production-minded REST API for customers, orders, shipments, and delivery status.",
    why: "This project turns basic Python, SQL, Git, and API knowledge into visible backend evidence: data modeling, authorization, testing, containerization, deployment thinking, and project defense.",
    skills: ["REST API design", "PostgreSQL", "Authentication", "Testing", "Docker", "Deployment"],
    gaps: ["production API evidence", "database design", "testing", "deployment proof"],
    difficulty: "Intermediate",
    duration: "3–4 weeks",
    outcome: "A portfolio-ready service with an architecture story and evidence you can defend in interviews.",
    domain: "logistics",
    targetRole: "Backend / Software Engineer",
    targetRoleId: "backend",
    architecture: ["Versioned REST API", "PostgreSQL data layer", "Authentication + ownership boundary", "Tests", "Dockerized local environment", "Deployment runbook"],
    prerequisites: ["Python or another backend language", "SQL fundamentals", "Git basics"],
    deploymentRequired: true,
    verificationLabel: "Rubric + artifact checks; hidden verifier architecture prepared",
    status: "available",
    missions: logisticsMissions,
  },
  {
    id: "retail-analytics",
    track: "Data",
    family: "Business Analytics Decision System",
    title: "Retail Growth Decision System",
    description: "A controlled analytics project family for turning sales data into clear business decisions.",
    why: "This family is designed to prove data cleaning, SQL, analysis, visualization, and decision communication. The full mission sequence is not yet validated for private beta.",
    skills: ["SQL", "Pandas", "Data cleaning", "Visualization", "Business reasoning"],
    gaps: ["dashboard evidence", "business communication", "repeatable analysis"],
    difficulty: "Intermediate",
    duration: "2–3 weeks",
    outcome: "A reproducible analysis case study with clear recommendations.",
    domain: "retail",
    targetRole: "Data Analyst",
    targetRoleId: "analyst",
    architecture: ["Data ingestion", "Cleaning + transformation", "Analysis layer", "Decision-oriented reporting"],
    prerequisites: ["Basic SQL", "Spreadsheet or Pandas basics"],
    deploymentRequired: false,
    verificationLabel: "Mission and verification design in progress",
    status: "planned",
    missions: [],
  },
  {
    id: "document-intelligence",
    track: "AI / ML",
    family: "AI Document Intelligence System",
    title: "College Policy Document Assistant",
    description: "A controlled AI project family for grounded retrieval, evaluation, serving, and deployment evidence.",
    why: "This family is meant to prove evaluation and production thinking rather than chatbot novelty. The full mission sequence is not yet validated for private beta.",
    skills: ["Python", "Retrieval", "Evaluation", "API serving", "Deployment"],
    gaps: ["evaluation evidence", "serving a model", "production thinking"],
    difficulty: "Advanced",
    duration: "4–5 weeks",
    outcome: "A grounded system with an evaluation set, source citations, and latency notes.",
    domain: "admissions",
    targetRole: "AI / ML Engineer",
    targetRoleId: "ml",
    architecture: ["Document ingestion", "Retrieval", "Grounded answer layer", "Evaluation harness", "API serving"],
    prerequisites: ["Python fundamentals", "Basic ML concepts"],
    deploymentRequired: true,
    verificationLabel: "Mission and verification design in progress",
    status: "planned",
    missions: [],
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

const skillAliases: Record<string, string[]> = {
  "REST APIs": ["rest api", "api", "flask", "fastapi", "django"],
  PostgreSQL: ["postgresql", "sql"],
  Testing: ["testing", "pytest", "unit testing", "integration testing"],
  Deployment: ["deployment", "render", "railway", "vercel", "aws", "azure", "gcp"],
  "ML fundamentals": ["machine learning", "ml", "scikit-learn", "tensorflow", "pytorch"],
  Evaluation: ["evaluation", "precision", "recall", "f1", "roc", "auc"],
  APIs: ["api", "flask", "fastapi", "django"],
  Visualization: ["visualization", "power bi", "tableau", "matplotlib"],
  Statistics: ["statistics", "statistical"],
  "Business thinking": ["business", "decision", "analysis"],
};

function normalizeSkills(skills: string[]) {
  return skills.map((skill) => skill.toLowerCase());
}

function hasEvidence(skills: string[], target: string) {
  const normalized = normalizeSkills(skills);
  const aliases = [target, ...(skillAliases[target] ?? [])].map((value) => value.toLowerCase());
  return aliases.some((alias) => normalized.some((skill) => skill === alias || skill.includes(alias) || alias.includes(skill)));
}

export function readinessScore() {
  return {
    total: 58,
    categories: [
      ["Technical foundations", 72],
      ["Role-relevant skills", 61],
      ["Project quality", 54],
      ["Production evidence", 31],
      ["Resume clarity", 66],
      ["Proof of work", 48],
    ] as [string, number][],
  };
}

export function readinessScoreFromResume(resume: ResumeEvidence) {
  const technical = Math.min(100, 30 + resume.skills.length * 8);
  const relevant = Math.min(100, 25 + ["Python", "SQL", "Git", "Pandas"].filter((skill) => hasEvidence(resume.skills, skill)).length * 15);
  const projectQuality = Math.min(100, resume.projects.length * 28);
  const production = Math.min(
    100,
    (hasEvidence(resume.skills, "Docker") ? 25 : 0) +
      (hasEvidence(resume.skills, "PostgreSQL") ? 20 : 0) +
      (hasEvidence(resume.skills, "Testing") ? 20 : 0) +
      (hasEvidence(resume.skills, "Deployment") ? 20 : 0) +
      (resume.links.length ? 15 : 0),
  );
  const proof = Math.min(100, resume.projects.length * 20 + resume.links.length * 20 + (resume.experience?.length ?? 0) * 20);
  const categories: [string, number][] = [
    ["Technical foundations", technical],
    ["Role-relevant skills", relevant],
    ["Project quality", projectQuality],
    ["Production evidence", production],
    ["Resume clarity", resume.skills.length || resume.projects.length ? 60 : 20],
    ["Proof of work", proof],
  ];
  const total = Math.round(categories.reduce((sum, [, value]) => sum + value, 0) / categories.length);
  return { total, categories };
}

export function readinessLevel(score: number) {
  if (score >= 75) return "Strong evidence";
  if (score >= 55) return "Developing evidence";
  return "Early evidence";
}

export function roleScore(role: RoleId) {
  return role === "backend" ? 64 : role === "ml" ? 59 : 46;
}

export function roleScoreFromResume(role: RoleId, resume: ResumeEvidence) {
  const target = roles.find((item) => item.id === role)?.skills ?? [];
  if (!target.length) return 0;
  const covered = target.filter((skill) => hasEvidence(resume.skills, skill)).length;
  const evidenceBonus = Math.min(20, resume.projects.length * 8 + resume.links.length * 6);
  return Math.min(100, Math.round((covered / target.length) * 80 + evidenceBonus));
}

export function roleEvidenceFromResume(role: RoleId, resume: ResumeEvidence) {
  const target = roles.find((item) => item.id === role)?.skills ?? [];
  const strong = target.filter((skill) => hasEvidence(resume.skills, skill));
  const missing = target.filter((skill) => !hasEvidence(resume.skills, skill));
  return { strong, missing };
}

export const gaps = gapsFromResume(
  { skills: demoStudent.skills, projects: demoStudent.projects, links: [] },
  "backend",
);

export function gapsFromResume(resume: ResumeEvidence, roleId: RoleId = "backend") {
  const has = (skill: string) => hasEvidence(resume.skills, skill);
  if (roleId === "analyst") {
    return [
      { label: "SQL & data handling", state: has("SQL") || has("Pandas") ? "strong" : "missing", detail: "SQL or Pandas evidence is visible when it appears in your structured resume.", priority: "High" },
      { label: "Dashboard / visualization", state: has("Visualization") ? "strong" : "missing", detail: "No decision-oriented dashboard or visualization tool is clearly evidenced yet.", priority: "High" },
      { label: "Statistics", state: has("Statistics") ? "strong" : "missing", detail: "Statistical reasoning is scored only when it is visible in the resume evidence.", priority: "Medium" },
      { label: "Business communication", state: resume.projects.length ? "partial" : "missing", detail: "Projects exist, but the profile does not yet show how findings became a decision.", priority: "High" },
      { label: "Reproducible analysis", state: has("Git") && resume.projects.length ? "partial" : "missing", detail: "A repeatable analysis workflow is not clearly proven by the current profile.", priority: "Medium" },
    ] as const;
  }
  if (roleId === "ml") {
    return [
      { label: "ML foundations", state: has("ML fundamentals") ? "strong" : "missing", detail: "Framework or machine-learning evidence is visible only when detected in the resume.", priority: "High" },
      { label: "Evaluation", state: has("Evaluation") ? "strong" : "missing", detail: "Model evaluation evidence is not clearly visible yet.", priority: "High" },
      { label: "API serving", state: has("APIs") ? "partial" : "missing", detail: "A framework mention helps, but deployed serving evidence is stronger.", priority: "High" },
      { label: "Deployment", state: has("Deployment") || has("Docker") ? "partial" : "missing", detail: "The profile does not yet prove a repeatable model deployment path.", priority: "High" },
      { label: "Git / proof of work", state: has("Git") || resume.links.length ? "strong" : "missing", detail: "Repository or version-control evidence helps reviewers inspect your work.", priority: "Medium" },
    ] as const;
  }
  return [
    { label: "Production API design", state: has("REST APIs") ? "partial" : "missing", detail: "A framework or API skill is visible, but a deployed, documented service is stronger evidence.", priority: "High" },
    { label: "Docker & deployment", state: has("Docker") || has("Deployment") ? "partial" : "missing", detail: "Container or deployment evidence is not clearly visible in the current structured resume.", priority: "High" },
    { label: "Automated testing", state: has("Testing") ? "strong" : "missing", detail: "A test suite or testing skill must be visible before JobReady treats it as evidence.", priority: "High" },
    { label: "SQL & data handling", state: has("SQL") || has("Pandas") ? "strong" : "missing", detail: "SQL or data-handling evidence is visible in the structured profile.", priority: "Strong" },
    { label: "Git workflow", state: has("Git") ? "strong" : "missing", detail: "Git is visible as a tool in the structured profile.", priority: "Strong" },
    { label: "System design basics", state: resume.projects.length ? "partial" : "missing", detail: "Projects are visible, but system boundaries and trade-offs are not yet clearly evidenced.", priority: "Medium" },
  ] as const;
}
