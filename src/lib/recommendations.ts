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
  const candidates = projects.filter((project) => {
    if (project.status !== "available") return false;
    const roleId = familyTarget[project.family];
    return preferred.length === 0 || preferred.includes(roleId);
  });

  return candidates.map((project) => {
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
    const familyDomains = domains[project.family] ?? [project.domain ?? "general"];
    const interestMatch = input.interests?.find((interest) => familyDomains.includes(interest));
    const domain = interestMatch ?? familyDomains[0];
    const prerequisites = project.prerequisites ?? [];

    return {
      project,
      domain,
      targetRole: role?.name ?? "Exploring",
      recommendationScore,
      matchedSkillGaps,
      matchedEvidenceGaps,
      prerequisites,
      explanation:
        project.title +
        " is recommended because it targets " +
        (role?.shortName ?? "your target role") +
        " and closes " +
        matchedEvidenceGaps.slice(0, 2).join(" and ") +
        ". It uses your current foundation while adding evidence you can show and defend.",
    };
  }).sort((a, b) => b.recommendationScore - a.recommendationScore);
}
