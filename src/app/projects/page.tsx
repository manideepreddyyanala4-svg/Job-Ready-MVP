"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button, EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/ui";
import { ProjectCard } from "@/components/domain-ui";
import { demoStudent, projects } from "@/lib/domain";
import { loadStructuredResume } from "@/lib/demo-storage";
import { StructuredResume } from "@/lib/resume";
import { ProjectRecommendation, recommendProjects } from "@/lib/recommendations";

export default function Projects() {
  const production = process.env.NEXT_PUBLIC_JOBREADY_MODE === "production";
  const [recommendations, setRecommendations] = useState<ProjectRecommendation[]>([]);
  const [loading, setLoading] = useState(production);
  const [error, setError] = useState("");

  useEffect(() => {
    if (production) {
      void fetch("/api/analysis").then((response) => { if (!response.ok) throw new Error(); return response.json(); }).then((result: { recommendations?: Array<{ score: number; explanation: { text?: string; domain?: string }; project_variants: { slug: string; definition: { title?: string; domain?: string }; project_families: { name: string } } }> }) => {
        if (!result.recommendations) return;
        const mapped = result.recommendations.flatMap((row) => {
          const project = projects.find((item) => item.id === row.project_variants.slug);
          return project ? [{ project, domain: row.project_variants.definition.domain ?? row.explanation.domain ?? "verified domain", targetRole: project.targetRole ?? "Target role", recommendationScore: row.score, matchedSkillGaps: project.skills, matchedEvidenceGaps: project.gaps, prerequisites: project.prerequisites ?? [], explanation: row.explanation.text ?? project.why }] : [];
        });
        setRecommendations(mapped);
      }).catch(() => setError("We couldn't load your project recommendations right now.")).finally(() => setLoading(false));
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
        } catch { /* Keep demo defaults. */ }
      }
      setRecommendations(recommendProjects({ skills: resume?.skills ?? demoStudent.skills, projects: resume?.projects ?? demoStudent.projects, links: resume?.links ?? [], preferredRoles: preferredRoles.length ? preferredRoles : ["backend"], weeklyHours }));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [production]);

  if (loading) return <AppShell><main className="app-page"><LoadingState label="Loading project recommendations…" /></main></AppShell>;
  if (error) return <AppShell><main className="app-page"><ErrorState body={error} retry={() => window.location.reload()} /></main></AppShell>;

  const fallback = projects.map((project) => ({ project, domain: "verified domain", targetRole: "Target role", recommendationScore: 0, matchedSkillGaps: project.skills, matchedEvidenceGaps: project.gaps, prerequisites: [], explanation: project.why }));
  const rows = production ? recommendations : (recommendations.length ? recommendations : fallback);

  return <AppShell><main className="app-page"><PageHeader eyebrow="Projects · Recommended" title="Build proof, not another tutorial." description="Projects are ranked against your current evidence, target roles, gaps, and available time. Start with the project that closes the highest-value gaps." />
    {rows.length === 0 ? <EmptyState title="No recommendations yet" body="Complete your profile and add a resume so JobReady can connect your evidence gaps to the right project." action={<Button href="/resume">Add resume →</Button>} /> : <div className="stack">{rows.map((recommendation, index) => <ProjectCard key={recommendation.project.id} eyebrow={index === 0 ? "Highest-value next step" : "Verified alternative"} title={recommendation.project.title} description={recommendation.project.description} skills={recommendation.project.skills} targetRole={recommendation.targetRole} score={recommendation.recommendationScore} explanation={recommendation.explanation} meta={`${recommendation.domain} · ${recommendation.project.duration} · ${recommendation.project.difficulty}`} gaps={recommendation.matchedEvidenceGaps.slice(0, 3).join(", ")} href={`/projects/${recommendation.project.id}`} />)}</div>}
  </main></AppShell>;
}
