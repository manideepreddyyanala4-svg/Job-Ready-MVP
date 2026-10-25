import { describe, expect, it } from "vitest";
import { gapsFromResume, readinessScoreFromResume, roleScoreFromResume, roles } from "@/lib/domain";
import { parseStructuredResume } from "@/lib/resume";
import { recommendProjects } from "@/lib/recommendations";

const backend = { skills: ["Python", "SQL", "Flask", "Git"], projects: ["API"], links: [], experience: [] };
const analyst = { skills: ["SQL", "Pandas", "Excel", "Power BI"], projects: ["Sales dashboard"], links: [], experience: [] };
const ml = { skills: ["Python", "Pandas", "ML fundamentals", "Evaluation", "APIs"], projects: ["Classifier"], links: ["https://github.com/student"], experience: [] };
const beginner = { skills: [], projects: [], links: [], experience: [] };
const strong = { skills: ["Python", "SQL", "Docker", "PostgreSQL", "Git", "Flask"], projects: ["API", "Dashboard"], links: ["https://github.com/student"], experience: ["Internship"] };

describe("structured resume parsing", () => {
  it("extracts skills, projects, education, and links deterministically", () => {
    const parsed = parseStructuredResume("B.Tech CSE Python SQL Git Projects: expense tracker https://github.com/arjun", "resume.pdf");
    expect(parsed.skills).toEqual(expect.arrayContaining(["Python", "SQL", "Git"]));
    expect(parsed.projects).toHaveLength(1);
    expect(parsed.github).toContain("github.com");
    expect(parsed.education[0]).toMatch(/B\.Tech/i);
  });
});

describe("readiness scoring", () => {
  it("changes as evidence improves", () => {
    expect(readinessScoreFromResume(strong).total).toBeGreaterThan(readinessScoreFromResume(beginner).total);
    expect(readinessScoreFromResume(strong).categories.find(([name]) => name === "Production evidence")?.[1]).toBeGreaterThan(0);
  });
});

describe("role matching", () => {
  it("ranks role evidence differently across profile fixtures", () => {
    expect(roleScoreFromResume("backend", backend)).toBeGreaterThan(roleScoreFromResume("analyst", backend));
    expect(roleScoreFromResume("analyst", analyst)).toBeGreaterThan(roleScoreFromResume("backend", analyst));
    expect(roleScoreFromResume("ml", ml)).toBeGreaterThan(roleScoreFromResume("analyst", ml));
    expect(roles).toHaveLength(3);
  });
});

describe("evidence classification and gaps", () => {
  it("moves production evidence from missing to partial/strong", () => {
    const weak = gapsFromResume(beginner);
    const strongGaps = gapsFromResume(strong);
    expect(weak.find((gap) => gap.label === "Docker & deployment")?.state).toBe("missing");
    expect(strongGaps.find((gap) => gap.label === "Docker & deployment")?.state).toBe("partial");
    expect(strongGaps.find((gap) => gap.label === "SQL & data handling")?.state).toBe("strong");
  });
});

describe("project recommendations", () => {
  it("prioritizes the preferred role and explains matched gaps", () => {
    const result = recommendProjects({ ...backend, preferredRoles: ["backend"], weeklyHours: "8–12 hours per week" });
    expect(result[0].project.family).toBe("Production Backend System");
    expect(result[0].recommendationScore).toBeGreaterThan(result[1].recommendationScore);
    expect(result[0].matchedEvidenceGaps.length).toBeGreaterThan(0);
    expect(result[0].explanation).toContain("recommended");
  });
});
