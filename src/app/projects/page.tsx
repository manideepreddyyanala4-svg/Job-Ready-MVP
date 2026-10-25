"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell, PageTitle } from "@/components/AppShell";
import { demoStudent, projects, type Project, type RoleId } from "@/lib/domain";
import { loadStructuredResume } from "@/lib/demo-storage";
import { demoResume, StructuredResume } from "@/lib/resume";
import { ProjectRecommendation, recommendProjects } from "@/lib/recommendations";

const production = process.env.NEXT_PUBLIC_JOBREADY_MODE === "production";

export default function ProjectsPage() {
  const [recommendations, setRecommendations] = useState<ProjectRecommendation[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [track, setTrack] = useState("All tracks");
  const [difficulty, setDifficulty] = useState("All difficulties");

  useEffect(() => {
    if (production) {
      void fetch("/api/analysis")
        .then((response) => response.json())
        .then((result: { recommendations?: Array<{ score: number; explanation: { text?: string; domain?: string }; project_variants: { slug: string; definition: { title?: string; domain?: string }; project_families: { name: string } } }> }) => {
          const mapped = (result.recommendations ?? []).flatMap((row) => {
            const project = projects.find((item) => item.id === row.project_variants.slug && item.status === "available");
            return project ? [{
              project,
              domain: row.project_variants.definition.domain ?? row.explanation.domain ?? project.domain ?? "verified domain",
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
        .finally(() => setLoaded(true));
      return;
    }

    const local = loadStructuredResume<StructuredResume>() ?? demoResume;
    const profile = window.localStorage.getItem("jobready-student-profile");
    let preferredRoles: RoleId[] = ["backend", "ml"];
    let weeklyHours = "8–12 hours per week";
    if (profile) {
      try {
        const parsed = JSON.parse(profile) as { roles?: string[]; weeklyHours?: string };
        preferredRoles = (parsed.roles ?? []).flatMap((role): RoleId[] => role.includes("Backend") ? ["backend"] : role.includes("Data") ? ["analyst"] : role.includes("AI") ? ["ml"] : []);
        weeklyHours = parsed.weeklyHours ?? weeklyHours;
      } catch { /* use demo defaults */ }
    }
    setRecommendations(recommendProjects({
      skills: local.skills ?? demoStudent.skills,
      projects: local.projects ?? demoStudent.projects,
      links: local.links ?? [],
      preferredRoles,
      weeklyHours,
    }));
    setLoaded(true);
  }, []);

  const catalog = useMemo(() => projects.filter((project) =>
    (track === "All tracks" || project.track === track) &&
    (difficulty === "All difficulties" || project.difficulty === difficulty),
  ), [track, difficulty]);

  return (
    <AppShell>
      <PageTitle
        eyebrow="Projects"
        title="Choose projects by the evidence they create."
        body="Recommendations use your target roles and current evidence. The catalog only marks a project as available when its controlled mission path has been designed for this beta."
      />

      <section>
        <div className="split mobile-stack"><div><div className="eyebrow">Recommended for you</div><h2 style={{ margin: "8px 0 0" }}>Why this project for me?</h2></div><span className="badge badge-muted">Deterministic recommendation</span></div>
        {!loaded ? <div className="card" style={{ marginTop: 16 }} aria-busy="true">Finding validated project fit…</div> : recommendations.length === 0 ? (
          <div className="empty-state" style={{ marginTop: 16 }}>
            <div className="empty-icon">↗</div>
            <h3>No validated project path currently matches your selected direction.</h3>
            <p className="section-copy" style={{ margin: "0 auto" }}>JobReady will not recommend an unfinished project just to fill the screen. You can still review planned project families below.</p>
          </div>
        ) : recommendations.map((recommendation, index) => (
          <article className="card" key={recommendation.project.id} style={{ marginTop: 16 }}>
            <div className="two-col" style={{ alignItems: "center" }}>
              <div>
                <div className="cluster"><span className="badge badge-success">{index === 0 ? "Best validated next step" : "Validated alternative"}</span><span className="badge badge-muted">{recommendation.project.track}</span></div>
                <h2 style={{ fontSize: 28, margin: "14px 0 8px" }}>{recommendation.project.title}</h2>
                <p className="section-copy">{recommendation.explanation}</p>
                <div className="cluster">{recommendation.project.skills.slice(0, 6).map((skill) => <span className="tag" key={skill}>{skill}</span>)}</div>
              </div>
              <div className="card card-soft" style={{ boxShadow: "none" }}>
                <div className="split"><strong>{recommendation.targetRole}</strong><span className="badge badge-muted">Fit {recommendation.recommendationScore}/100</span></div>
                <p className="small muted">Closes: {recommendation.matchedEvidenceGaps.slice(0, 4).join(", ")}</p>
                <p className="small muted">{recommendation.project.duration} · {recommendation.project.difficulty} · {recommendation.project.deploymentRequired ? "Deployment required" : "No deployment requirement"}</p>
                <Link href={"/projects/" + recommendation.project.id} className="btn btn-dark">Open project brief →</Link>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section style={{ marginTop: 44 }}>
        <div className="split mobile-stack">
          <div><div className="eyebrow">Controlled catalog</div><h2 style={{ margin: "8px 0 0" }}>Track → project family → controlled variant</h2></div>
          <div className="cluster">
            <label className="field"><span className="sr-only">Filter by track</span><select className="select" value={track} onChange={(e) => setTrack(e.target.value)}><option>All tracks</option>{[...new Set(projects.map((p) => p.track))].map((value) => <option key={value}>{value}</option>)}</select></label>
            <label className="field"><span className="sr-only">Filter by difficulty</span><select className="select" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}><option>All difficulties</option>{[...new Set(projects.map((p) => p.difficulty))].map((value) => <option key={value}>{value}</option>)}</select></label>
          </div>
        </div>

        <div className="three-col" style={{ marginTop: 18 }}>
          {catalog.map((project: Project) => (
            <article className="card" key={project.id}>
              <div className="split"><span className="badge badge-muted">{project.track}</span><span className={"badge " + (project.status === "available" ? "badge-success" : "badge-warning")}>{project.status === "available" ? "Available" : "Planned"}</span></div>
              <h3 style={{ fontSize: 20, margin: "15px 0 7px" }}>{project.title}</h3>
              <p className="small muted">{project.description}</p>
              <div className="cluster" style={{ marginTop: 14 }}>{project.skills.slice(0, 4).map((skill) => <span className="tag" key={skill}>{skill}</span>)}</div>
              <p className="small muted">{project.duration} · {project.difficulty}</p>
              <Link href={"/projects/" + project.id} className="btn btn-secondary" style={{ width: "100%", marginTop: 8 }}>{project.status === "available" ? "View project →" : "View planned family →"}</Link>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
