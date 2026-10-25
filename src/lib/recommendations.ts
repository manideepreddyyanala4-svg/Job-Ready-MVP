import { Project, projects, RoleId, roles } from "@/lib/domain";

export type RecommendationInput = {
  skills: string[];
  projects: string[];
  links: string[];
  preferredRoles?: RoleId[];
  weeklyHours?: string;
  interests?: string[];
};

export type ProjectRecommendation = {
  project: Project;
  domain: string;
  targetRole: string;
  recommendationScore: number;
  matchedSkillGaps: string[];
  matchedEvidenceGaps: string[];
  prerequisites: string[];
  explanation: string;
};

const domains: Record<string, string[]> = {
  "Production Backend System": ["logistics", "e-commerce", "inventory", "appointments", "booking"],
  "Business Analytics Decision System": ["retail", "e-commerce", "logistics", "sales", "HR"],
  "AI Document Intelligence System": ["admissions", "company knowledge", "technical manuals", "policy documents", "customer support"],
};

const familyTarget: Record<string, RoleId> = {
  "Production Backend System": "backend",
  "Business Analytics Decision System": "analyst",
  "AI Document Intelligence System": "ml",
};

export function recommendProjects(input: RecommendationInput): ProjectRecommendation[] {
  const available = new Set(input.skills.map((skill) => skill.toLowerCase()));
  const preferred = input.preferredRoles ?? [];
  return projects.map((project) => {
    const roleId = familyTarget[project.family];
    const role = roles.find((item) => item.id === roleId);
    const skillMatches = project.skills.filter((skill) => available.has(skill.toLowerCase()));
    const matchedSkillGaps = project.skills.filter((skill) => !available.has(skill.toLowerCase()));
    const matchedEvidenceGaps = project.gaps.slice(0, Math.max(1, Math.min(project.gaps.length, 2 + project.gaps.length - input.projects.length)));
    const roleBonus = preferred.includes(roleId) ? 25 : 0;
    const foundationBonus = skillMatches.length * 5;
    const projectGapBonus = matchedEvidenceGaps.length * 8;
    const timeBonus = input.weeklyHours?.includes("12") || input.weeklyHours?.includes("8") ? 5 : 0;
    const recommendationScore = Math.min(100, 30 + roleBonus + foundationBonus + projectGapBonus + timeBonus);
    const domain = domains[project.family][input.interests?.find((interest) => domains[project.family].includes(interest)) ? domains[project.family].indexOf(input.interests.find((interest) => domains[project.family].includes(interest)) as string) : 0];
    const prerequisites = project.family === "Production Backend System"
      ? ["Basic Python or another backend language", "SQL fundamentals", "Git"]
      : project.family === "Business Analytics Decision System"
        ? ["Spreadsheets", "Basic SQL or data handling", "Comfort explaining findings"]
        : ["Python fundamentals", "Basic ML concepts", "Ability to evaluate examples"];
    return {
      project,
      domain,
      targetRole: role?.name ?? "Exploring",
      recommendationScore,
      matchedSkillGaps,
      matchedEvidenceGaps,
      prerequisites,
      explanation: `${project.title} is recommended because it targets ${role?.shortName ?? "your target role"} and closes ${matchedEvidenceGaps.slice(0, 2).join(" and ")}. Your current evidence supports ${skillMatches.slice(0, 3).join(", ") || "a guided foundation"}, while the project adds defensible portfolio proof.`,
    };
  }).sort((a, b) => b.recommendationScore - a.recommendationScore);
}
