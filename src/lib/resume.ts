export type ResumeSource = "upload" | "demo";
export type ParseConfidence = "low" | "medium" | "high";

export type StructuredResume = {
  source: ResumeSource;
  fileName: string;
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
  parseConfidence: ParseConfidence;
  warnings: string[];
  extractedAt: string;
};

export type ResumeProcessResult =
  | { ok: true; resume: StructuredResume }
  | { ok: false; code: "invalid_type" | "too_large" | "empty" | "unsupported"; message: string };

export const MAX_RESUME_BYTES = 5 * 1024 * 1024;

const knownSkills = [
  "Python", "JavaScript", "TypeScript", "Java", "C++", "SQL", "Excel", "Pandas",
  "NumPy", "Flask", "FastAPI", "Django", "React", "PostgreSQL", "MongoDB", "Git",
  "Docker", "Power BI", "Tableau", "TensorFlow", "PyTorch", "scikit-learn",
  "pytest", "REST API", "Machine Learning", "Statistics", "Matplotlib", "AWS", "Azure", "GCP",
];

export const demoResume: StructuredResume = {
  source: "demo",
  fileName: "Arjun Reddy · demo resume",
  education: ["B.Tech Computer Science"],
  skills: ["Python", "SQL", "Pandas", "Flask", "Git"],
  programmingLanguages: ["Python"],
  technologies: ["Pandas", "Flask", "Git"],
  projects: ["Titanic ML classifier", "Basic expense tracker"],
  experience: [],
  certifications: [],
  links: [],
  parseConfidence: "high",
  warnings: [],
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

function inferConfidence(textLength: number, skills: number, projects: number, education: number): ParseConfidence {
  const signals = Number(skills >= 4) + Number(projects > 0) + Number(education > 0);
  if (textLength >= 350 && signals >= 2) return "high";
  if (textLength >= 120 && signals >= 1) return "medium";
  return "low";
}

export function parseStructuredResume(rawText: string, fileName: string): StructuredResume {
  const normalized = rawText.replace(/\s+/g, " ").trim();
  const lower = normalized.toLowerCase();
  const found = knownSkills.filter((skill) => lower.includes(skill.toLowerCase()));
  const programmingLanguages = found.filter((skill) =>
    ["Python", "JavaScript", "TypeScript", "Java", "C++"].includes(skill),
  );
  const technologies = found.filter((skill) => !programmingLanguages.includes(skill));
  const projectMatches = normalized.match(/(?:project|projects|built|developed)[:\s-]+(.{10,180})/i);
  const education = /b\.?tech|b\.?e\.|bca|b\.?sc/i.test(normalized)
    ? [normalized.match(/(?:b\.?tech|b\.?e\.|bca|b\.?sc)[^,.;]*/i)?.[0] ?? "Education found"]
    : [];
  const projects = projectMatches ? [projectMatches[1].trim()] : [];
  const confidence = inferConfidence(normalized.length, found.length, projects.length, education.length);
  const warnings: string[] = [];
  if (confidence === "low") warnings.push("We extracted limited structure. Review the detected items before relying on the report.");
  if (!projects.length) warnings.push("No project section was confidently detected.");
  if (!education.length) warnings.push("No supported degree line was confidently detected.");

  return {
    source: "upload",
    fileName,
    education,
    skills: unique(found),
    programmingLanguages,
    technologies,
    projects,
    experience: /intern|experience|worked/i.test(normalized) ? ["Experience section detected"] : [],
    certifications: /certif/i.test(normalized) ? ["Certification section detected"] : [],
    links: [...normalized.matchAll(/https?:\/\/\S+/g)].map((match) => match[0]),
    github: normalized.match(/https?:\/\/(?:www\.)?github\.com\/\S+/i)?.[0],
    linkedin: normalized.match(/https?:\/\/(?:www\.)?linkedin\.com\/\S+/i)?.[0],
    parseConfidence: confidence,
    warnings,
    extractedAt: new Date().toISOString(),
  };
}

export async function processResumeFile(file: File): Promise<ResumeProcessResult> {
  if (file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf")) {
    return { ok: false, code: "invalid_type", message: "Please choose a PDF resume." };
  }
  if (file.size > MAX_RESUME_BYTES) {
    return { ok: false, code: "too_large", message: "Resume files must be 5 MB or smaller." };
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const signature = new TextDecoder("ascii").decode(bytes.slice(0, 5));
  if (signature !== "%PDF-") {
    return { ok: false, code: "invalid_type", message: "That file does not appear to be a valid PDF." };
  }
  const text = extractPdfText(bytes);
  if (!text) {
    return { ok: false, code: "empty", message: "We could not extract readable text from that PDF. Try an exported text-based resume; scanned PDFs are not supported yet." };
  }
  return { ok: true, resume: parseStructuredResume(text, file.name) };
}
