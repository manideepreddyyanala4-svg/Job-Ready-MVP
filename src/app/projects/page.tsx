"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/ui";
import { ProjectCard } from "@/components/domain-ui";
import { demoStudent, projects } from "@/lib/domain";
import { loadStructuredResume } from "@/lib/demo-storage";
import { StructuredResume } from "@/lib/resume";
import { ProjectRecommendation, recommendProjects } from "@/lib/recommendations";

export default function Projects() {
  const [recommendations, setRecommendations] = useState<ProjectRecommendation[]>([]);
  const [loading, setLoading] = useState(process.env.NEXT_PUBLIC_JOBREADY_MODE === "production");
  const [failed, setFailed] = useState(false);

  const load = () => {
    setFailed(false);
    if (process.env.NEXT_PUBLIC_JOBREADY_MODE === "production") {
      setLoading(true);
      void fetch("/api/analysis")
        .then((response) => { if (!response.ok) throw new Error("load"); return response.json(); })
        .then((result: { recommendations?: Array<{ score: number; explanation: { text?: string; domain?: string }; project_variants: { slug: string; definition: { title?: string; domain?: string }; project_families: { name: string } } }> }) => {
          if (!result.recommendations) return;
          const mapped = result.recommendations.flatMap((row) => {
            const project = projects.find((item) => item.id === row.project_variants.slug);
            return project ? [{ project, domain: row.project_variants.definition.domain ?? row.explanation.domain ?? "verified domain", targetRole: project.targetRole ?? "Target role", recommendationScore: row.score, matchedSkillGaps: project.skills, matchedEvidenceGaps: project.gaps, prerequisites: project.prerequisites ?? [], explanation: row.explanation.text ?? project.why }] : [];
          });
          setRecommendations(mapped);
        })
        .catch(() => setFailed(true))
        .finally(() => setLoading(false));
      return;
    }

    const resume = loadStructuredResume<StructuredResume>();
    const profile = window.localStorage.getItem("jobready-student-profile");
    let preferredRoles: ("backend" | "analyst" | "ml")[] = ["backend", "ml"];
    let weeklyHours = "8–12 hours per week";
    if (profile) {
      try {
        const parsed = JSON.parse(profile) as { roles?: string[]; weeklyHours?: string };
        preferredRoles = (parsed.roles ?? []).flatMap((role) => role.includes("Backend") ? ["backend"] : role.includes("Data") ? ["analyst"] : role.includes("AI") ? ["ml"] : []);
        weeklyHours = parsed.weeklyHours ?? weeklyHours;
      } catch { /* keep demo defaults */ }
    }
    setRecommendations(recommendProjects({ skills: resume?.skills ?? demoStudent.skills, projects: resume?.projects ?? demoStudent.projects, links: resume?.links ?? [], preferredRoles: preferredRoles.length ? preferredRoles : ["backend"], weeklyHours }));
  };

  useEffect(() => { const timer = window.setTimeout(load, 0); return () => window.clearTimeout(timer); }, []);

  return <AppShell><main className="app-page">
    <PageHeader eyebrow="Projects" title="Build proof, not another tutorial." description="Recommendations connect your current evidence, target roles, gaps, and available time to a small verified project catalog." />
    {loading ? <LoadingState label="Loading project recommendations" /> : failed ? <ErrorState body="We couldn't load your project recommendations. Your profile has not been changed." retry={load} /> : recommendations.length === 0 ? <EmptyState title="No recommendations yet" body="Complete your readiness analysis first so JobReady can connect evidence gaps to a project." /> : <div className="stack">{recommendations.map((recommendation, index) => <ProjectCard key={recommendation.project.id} eyebrow={index === 0 ? "Highest-value next step" : "Verified alternative"} title={recommendation.project.title} description={recommendation.project.description} skills={recommendation.project.skills} targetRole={recommendation.targetRole} score={recommendation.recommendationScore} explanation={recommendation.explanation} meta={`Domain: ${recommendation.domain} · ${recommendation.project.duration} · ${recommendation.project.difficulty}`} gaps={recommendation.matchedEvidenceGaps.slice(0, 3).join(", ")} href={`/projects/${recommendation.project.id}`} />)}</div>}
  </main></AppShell>;
}
