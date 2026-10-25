"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button, Card, EmptyState, ErrorState, LoadingState, PageHeader, ScoreDisplay } from "@/components/ui";
import { ProjectProgressCard } from "@/components/domain-ui";
import { demoStudent, projects, readinessScore } from "@/lib/domain";
import { completedMissionCount } from "@/lib/demo-storage";

type StudentProfile = { name: string; degree: string; studyYear: string };
type DashboardAnalysis = {
  readiness?: { score?: number };
  roles?: Array<{ score: number; roles?: { name?: string } }>;
  gaps?: Array<{ priority?: string; skill_name?: string; skill?: { name?: string } }>;
  recommendations?: Array<{ project_variants?: { title?: string }; score?: number }>;
};

export default function Dashboard() {
  const score = readinessScore();
  const project = projects[0];
  const production = process.env.NEXT_PUBLIC_JOBREADY_MODE === "production";
  const [productionScore, setProductionScore] = useState<number | null>(null);
  const [completed, setCompleted] = useState(0);
  const [analysis, setAnalysis] = useState<DashboardAnalysis>({});
  const [loading, setLoading] = useState(production);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<StudentProfile>({ name: demoStudent.name, degree: demoStudent.degree, studyYear: demoStudent.year });

  useEffect(() => {
    if (production) {
      const json = async (url: string) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error("request_failed");
        return response.json();
      };
      void Promise.all([json("/api/profile"), json("/api/analysis"), json("/api/projects/progress?projectId=logistics-backend")])
        .then(([profileResult, analysisResult, progressResult]: [
          { profile?: { full_name?: string; degree?: string; year?: string } | null },
          DashboardAnalysis,
          { progress?: Array<{ completed_at: string | null }> },
        ]) => {
          if (profileResult.profile) setProfile((current) => ({ ...current, name: profileResult.profile?.full_name ?? current.name, degree: profileResult.profile?.degree ?? current.degree, studyYear: profileResult.profile?.year ?? current.studyYear }));
          if (analysisResult.readiness?.score !== undefined) setProductionScore(analysisResult.readiness.score);
          setAnalysis(analysisResult);
          setCompleted(progressResult.progress?.filter((item) => item.completed_at).length ?? 0);
        })
        .catch(() => setError("We couldn't load your dashboard right now. Your saved progress has not been changed."))
        .finally(() => setLoading(false));
      return;
    }

    const timer = window.setTimeout(() => {
      setCompleted(completedMissionCount(project.id, project.missions.map((mission) => mission.id)));
      const saved = window.localStorage.getItem("jobready-student-profile");
      if (saved) {
        try { setProfile((current) => ({ ...current, ...(JSON.parse(saved) as Partial<StudentProfile>) })); } catch { /* Keep seeded demo profile. */ }
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [production, project.id, project.missions]);

  if (loading) return <AppShell><main className="app-page"><LoadingState label="Loading your dashboard…" /></main></AppShell>;
  if (error) return <AppShell><main className="app-page"><ErrorState body={error} retry={() => window.location.reload()} /></main></AppShell>;
  if (production && productionScore === null) return <AppShell><main className="app-page"><PageHeader eyebrow="Student dashboard" title={`Good to see you, ${profile.name.split(" ")[0]}.`} description="Your dashboard becomes actionable after JobReady has an evidence baseline." /><EmptyState title="No readiness analysis yet" body="Add your resume to unlock role matches, evidence gaps, and a project recommendation." action={<Button href="/resume">Add resume →</Button>} /></main></AppShell>;

  const total = project.missions.length;
  const nextMission = project.missions[completed] ?? project.missions[total - 1];
  const topRole = analysis.roles?.[0]?.roles?.name;
  const topGaps = (analysis.gaps ?? []).slice(0, 3).map((gap) => gap.skill_name ?? gap.skill?.name).filter(Boolean);
  const selectedProject = analysis.recommendations?.[0]?.project_variants?.title;

  return <AppShell><main className="app-page"><PageHeader eyebrow="Student dashboard" title={`Good to see you, ${profile.name.split(" ")[0]}.`} description="Your clearest next action, current evidence, and project progress in one place." />
    <div className="grid" style={{ gridTemplateColumns: "1.05fr .95fr" }}>
      <Card className="card-pad"><ScoreDisplay value={productionScore ?? score.total} label="Job readiness score" description="A baseline for evidence visible in your profile — not a probability of getting hired." /><Button href="/analysis" variant="secondary" style={{ marginTop: 18 }}>View full analysis →</Button></Card>
      <Card className="card-pad" strong><div className="eyebrow" style={{ color: "#f4ad91" }}>Recommended next</div><h2 className="section-title" style={{ color: "#fff", marginTop: 10 }}>{completed === 0 ? "Start your first mission." : `Continue: ${nextMission.title}`}</h2><p style={{ color: "#cbd6d9" }}>Close high-priority evidence gaps with the logistics project.</p><Button href={`/projects/${project.id}/missions/${nextMission.id}`}>{completed === 0 ? "Start Mission 1 →" : "Continue mission →"}</Button></Card>
    </div>
    <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 20 }}>
      <Card className="card-pad"><h3 className="card-title">Your profile</h3><p><b>{profile.name}</b><br /><span className="secondary-text">{profile.degree} · {profile.studyYear}</span></p><p className="secondary-text">Top role: <b style={{ color: "var(--text)" }}>{topRole ?? "Backend / Software Engineer"}</b></p><p className="secondary-text" style={{ marginBottom: 0 }}>Top gaps: <b style={{ color: "var(--text)" }}>{topGaps.join(", ") || "production API evidence"}</b></p></Card>
      <ProjectProgressCard title={selectedProject ?? project.title} completed={completed} total={total} />
    </div>
  </main></AppShell>;
}
