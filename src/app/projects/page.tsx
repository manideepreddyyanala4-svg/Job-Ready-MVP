"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell, PageTitle } from "@/components/AppShell";
import { demoStudent, projects } from "@/lib/domain";
import { loadStructuredResume } from "@/lib/demo-storage";
import { StructuredResume } from "@/lib/resume";
import { ProjectRecommendation, recommendProjects } from "@/lib/recommendations";

export default function Projects() {
  const [recommendations, setRecommendations] = useState<ProjectRecommendation[]>([]);
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_JOBREADY_MODE === "production") {
      void fetch("/api/analysis")
        .then((response) => response.json())
        .then((result: { recommendations?: Array<{ score: number; explanation: { text?: string; domain?: string }; project_variants: { slug: string; definition: { title?: string; domain?: string }; project_families: { name: string } } }> }) => {
          if (!result.recommendations) return;
          const mapped = result.recommendations.flatMap((row) => {
            const project = projects.find((item) => item.id === row.project_variants.slug);
            return project ? [{
              project,
              domain: row.project_variants.definition.domain ?? row.explanation.domain ?? "verified domain",
              targetRole: project.targetRole ?? "Target role",
              recommendationScore: row.score,
              matchedSkillGaps: project.skills,
              matchedEvidenceGaps: project.gaps,
              prerequisites: project.prerequisites ?? [],
              explanation: row.explanation.text ?? project.why,
            }] : [];
          });
          setRecommendations(mapped);
        })
        .catch(() => undefined);
      return;
    }
    const timer = window.setTimeout(() => {
      const resume = loadStructuredResume<StructuredResume>();
      const profile = window.localStorage.getItem("jobready-student-profile");
      let preferredRoles: ("backend" | "analyst" | "ml")[] = ["backend", "ml"];
      let weeklyHours = "8–12 hours per week";
      if (profile) {
        try {
          const parsed = JSON.parse(profile) as { roles?: string[]; weeklyHours?: string };
          preferredRoles = (parsed.roles ?? []).flatMap((role) => role.includes("Backend") ? ["backend"] : role.includes("Data") ? ["analyst"] : role.includes("AI") ? ["ml"] : []);
          weeklyHours = parsed.weeklyHours ?? weeklyHours;
        } catch {
          // Keep demo recommendation defaults for malformed local state.
        }
      }
      setRecommendations(recommendProjects({
        skills: resume?.skills ?? demoStudent.skills,
        projects: resume?.projects ?? demoStudent.projects,
        links: resume?.links ?? [],
        preferredRoles: preferredRoles.length ? preferredRoles : ["backend"],
        weeklyHours,
      }));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  return <AppShell><main className="container" style={{ padding: "54px 0" }}><PageTitle eyebrow="Recommended for you" title="Build proof, not another tutorial." body="These project families are verified starting points. We rank them against your current evidence, target roles, gaps, and available time." /><div className="grid">{(recommendations.length ? recommendations : projects.map((project) => ({ project, domain: "verified domain", targetRole: "Target role", recommendationScore: 0, matchedSkillGaps: project.skills, matchedEvidenceGaps: project.gaps, prerequisites: [], explanation: project.why }))).map((recommendation, index) => { const project = recommendation.project; return <div className="card" key={project.id} style={{ padding: 26, display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 28, alignItems: "center" }}><div><span className="tag">{index === 0 ? "Highest-value next step" : "Verified alternative"}</span><h2 style={{ fontSize: 28, margin: "14px 0 8px" }}>{project.title}</h2><p style={{ color: "var(--muted)", lineHeight: 1.55 }}>{project.description}</p><div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 15 }}>{project.skills.map((skill) => <span key={skill} className="tag">{skill}</span>)}</div></div><div style={{ background: "#f4f7f4", borderRadius: 14, padding: 21 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><b>{recommendation.targetRole}</b><strong>{recommendation.recommendationScore}/100</strong></div><p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.5 }}>{recommendation.explanation}</p><p style={{ color: "var(--muted)", fontSize: 13 }}>Domain: {recommendation.domain} · {project.duration} · {project.difficulty}</p><p style={{ color: "var(--muted)", fontSize: 13 }}>Closes: {recommendation.matchedEvidenceGaps.slice(0, 3).join(", ")}</p><Link href={`/projects/${project.id}`} className="btn btn-dark" style={{ marginTop: 12 }}>Explore project →</Link></div></div>; })}</div></main></AppShell>;
}
