import { describe, expect, it } from "vitest";
import { gapsFromResume, projects, readinessScoreFromResume, roleEvidenceFromResume, roleScoreFromResume, roles } from "@/lib/domain";
import { parseStructuredResume } from "@/lib/resume";
import { recommendProjects } from "@/lib/recommendations";

const backend = { skills: ["Python", "SQL", "Flask", "Git"], projects: ["API"], links: [], experience: [] };
const analyst = { skills: ["SQL", "Pandas", "Excel", "Power BI"], projects: ["Sales dashboard"], links: [], experience: [] };
const ml = { skills: ["Python", "Pandas", "Machine Learning", "Evaluation", "FastAPI"], projects: ["Classifier"], links: ["https://github.com/student"], experience: [] };
const beginner = { skills: [], projects: [], links: [], experience: [] };
const strong = { skills: ["Python", "SQL", "Docker", "PostgreSQL", "Git", "Flask", "pytest", "AWS"], projects: ["API", "Dashboard"], links: ["https://github.com/student"], experience: ["Internship"] };

describe("structured resume parsing", () => {
  it("extracts structured evidence without persisting raw extracted text", () => {
    const parsed = parseStructuredResume("B.Tech CSE Python SQL Git Projects: expense tracker https://github.com/arjun", "resume.pdf");
    expect(parsed.skills).toEqual(expect.arrayContaining(["Python", "SQL", "Git"]));
    expect(parsed.projects).toHaveLength(1);
    expect(parsed.github).toContain("github.com");
    expect(parsed.education[0]).toMatch(/B\.Tech/i);
    expect(parsed).not.toHaveProperty("rawText");
    expect(["low", "medium", "high"]).toContain(parsed.parseConfidence);
  });
});

describe("readiness scoring", () => {
  it("changes as inspectable evidence improves", () => {
    expect(readinessScoreFromResume(strong).total).toBeGreaterThan(readinessScoreFromResume(beginner).total);
    expect(readinessScoreFromResume(strong).categories.find(([name]) => name === "Production evidence")?.[1]).toBeGreaterThan(0);
  });
});

describe("role matching", () => {
  it("ranks supported role evidence differently across profile fixtures", () => {
    expect(roleScoreFromResume("backend", backend)).toBeGreaterThan(roleScoreFromResume("analyst", backend));
    expect(roleScoreFromResume("analyst", analyst)).toBeGreaterThan(roleScoreFromResume("backend", analyst));
    expect(roleScoreFromResume("ml", ml)).toBeGreaterThan(roleScoreFromResume("analyst", ml));
    expect(roleEvidenceFromResume("backend", backend).strong).toContain("Python");
    expect(roles).toHaveLength(3);
  });
});

describe("evidence classification", () => {
  it("uses role-specific gaps and separates missing from partial evidence", () => {
    const weakBackend = gapsFromResume(beginner, "backend");
    const strongBackend = gapsFromResume(strong, "backend");
    const dataGaps = gapsFromResume(analyst, "analyst");
    expect(weakBackend.find((gap) => gap.label === "Docker & deployment")?.state).toBe("missing");
    expect(strongBackend.find((gap) => gap.label === "Docker & deployment")?.state).toBe("partial");
    expect(strongBackend.find((gap) => gap.label === "Automated testing")?.state).toBe("strong");
    expect(dataGaps.find((gap) => gap.label === "Dashboard / visualization")?.state).toBe("strong");
  });
});

describe("controlled project catalog", () => {
  it("does not expose protected mission detail through public project metadata", () => {
    const logistics = projects.find((project) => project.id === "logistics-backend")!;
    expect(logistics.status).toBe("available");
    expect(logistics.missions).toHaveLength(12);
    expect(logistics.missions[1]).not.toHaveProperty("objective");
    expect(projects.filter((project) => project.status === "planned")).toHaveLength(2);
  });

  it("recommends only validated available projects", () => {
    const backendResults = recommendProjects({ ...backend, preferredRoles: ["backend"], weeklyHours: "8–12 hours per week" });
    expect(backendResults).toHaveLength(1);
    expect(backendResults[0].project.id).toBe("logistics-backend");
    expect(backendResults[0].project.status).toBe("available");

    const mlResults = recommendProjects({ ...ml, preferredRoles: ["ml"], weeklyHours: "8–12 hours per week" });
    expect(mlResults).toHaveLength(0);
  });
});
