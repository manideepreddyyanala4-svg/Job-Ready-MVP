export type ResumeSource = "upload" | "demo";

export type StructuredResume = {
  source: ResumeSource;
  fileName: string;
  rawText: string;
  education: string[];
  skills: string[];
  programmingLanguages: string[];
  technologies: string[];
  projects: string[];
  experience: string[];
  certifications: string[];
  links: string[];
  github?: string;
  linkedin?: string;
  extractedAt: string;
};

export type ResumeProcessResult =
  | { ok: true; resume: StructuredResume }
  | { ok: false; code: "invalid_type" | "too_large" | "empty" | "unsupported"; message: string };

export const MAX_RESUME_BYTES = 5 * 1024 * 1024;

const knownSkills = [
  "Python", "JavaScript", "TypeScript", "Java", "C++", "SQL", "Pandas",
  "NumPy", "Flask", "Django", "React", "PostgreSQL", "MongoDB", "Git",
  "Docker", "Power BI", "Tableau", "TensorFlow", "PyTorch", "scikit-learn",
];

export const demoResume: StructuredResume = {
  source: "demo",
  fileName: "Arjun Reddy · demo resume",
  rawText: "Arjun Reddy B.Tech Computer Science Python SQL Pandas Flask Git Titanic ML classifier Basic expense tracker",
  education: ["B.Tech Computer Science"],
  skills: ["Python", "SQL", "Pandas", "Flask", "Git"],
  programmingLanguages: ["Python"],
  technologies: ["Pandas", "Flask", "Git"],
  projects: ["Titanic ML classifier", "Basic expense tracker"],
  experience: [],
  certifications: [],
  links: [],
  extractedAt: new Date().toISOString(),
};

function unique(items: string[]) {
  return [...new Set(items.filter(Boolean))];
}

export function extractPdfText(bytes: Uint8Array) {
  const decoded = new TextDecoder("latin1").decode(bytes);
  const chunks = [...decoded.matchAll(/\(([^()]*)\)/g)].map((match) =>
    match[1].replace(/\\([()\\])/g, "$1"),
  );
  return chunks.join(" ").replace(/\s+/g, " ").trim();
}

export function parseStructuredResume(rawText: string, fileName: string): StructuredResume {
  const normalized = rawText.replace(/\s+/g, " ").trim();
  const lower = normalized.toLowerCase();
  const found = knownSkills.filter((skill) => lower.includes(skill.toLowerCase()));
  const programmingLanguages = found.filter((skill) =>
    ["Python", "JavaScript", "TypeScript", "Java", "C++"].includes(skill),
  );
  const technologies = found.filter((skill) => !programmingLanguages.includes(skill));
  const projectMatches = normalized.match(/(?:project|projects|built|developed)[:\s-]+(.{10,120})/i);

  return {
    source: "upload",
    fileName,
    rawText: normalized,
    education: /b\.?tech|b\.?e\.|bca|b\.?sc/i.test(normalized) ? [normalized.match(/(?:b\.?tech|b\.?e\.|bca|b\.?sc)[^,.;]*/i)?.[0] ?? "Education found"] : [],
    skills: unique(found),
    programmingLanguages,
    technologies,
    projects: projectMatches ? [projectMatches[1].trim()] : [],
    experience: /intern|experience|worked/i.test(normalized) ? ["Experience section detected"] : [],
    certifications: /certif/i.test(normalized) ? ["Certification section detected"] : [],
    links: [...normalized.matchAll(/https?:\/\/\S+/g)].map((match) => match[0]),
    github: normalized.match(/https?:\/\/(?:www\.)?github\.com\/\S+/i)?.[0],
    linkedin: normalized.match(/https?:\/\/(?:www\.)?linkedin\.com\/\S+/i)?.[0],
    extractedAt: new Date().toISOString(),
  };
}

export async function processResumeFile(file: File): Promise<ResumeProcessResult> {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return { ok: false, code: "invalid_type", message: "Please choose a PDF resume." };
  }
  if (file.size > MAX_RESUME_BYTES) {
    return { ok: false, code: "too_large", message: "Resume files must be 5 MB or smaller." };
  }
  const text = extractPdfText(new Uint8Array(await file.arrayBuffer()));
  if (!text) {
    return { ok: false, code: "empty", message: "We could not extract readable text from that PDF. Try an exported text-based resume." };
  }
  return { ok: true, resume: parseStructuredResume(text, file.name) };
}

