"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Badge, Button, Card, PageHeader, ScoreDisplay } from "@/components/ui";
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
  const [productionScore, setProductionScore] = useState<number | null>(null);
  const project = projects[0];
  const [completed, setCompleted] = useState(0);
  const [analysis, setAnalysis] = useState<DashboardAnalysis>({});
  const [profile, setProfile] = useState<StudentProfile>({ name: demoStudent.name, degree: demoStudent.degree, studyYear: demoStudent.year });

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_JOBREADY_MODE === "production") {
      void Promise.all([
        fetch("/api/profile").then((response) => response.json()),
        fetch("/api/analysis").then((response) => response.json()),
        fetch("/api/projects/progress?projectId=logistics-backend").then((response) => response.json()),
      ]).then(([profileResult, analysisResult, progressResult]: [
        { profile?: { full_name?: string; degree?: string; year?: string } | null },
        DashboardAnalysis,
        { progress?: Array<{ completed_at: string | null }> },
      ]) => {
        if (profileResult.profile) {
          setProfile((current) => ({ ...current, name: profileResult.profile?.full_name ?? current.name, degree: profileResult.profile?.degree ?? current.degree, studyYear: profileResult.profile?.year ?? current.studyYear }));
        }
        if (analysisResult.readiness?.score !== undefined) setProductionScore(analysisResult.readiness.score);
        setAnalysis(analysisResult);
        setCompleted(progressResult.progress?.filter((item) => item.completed_at).length ?? 0);
      }).catch(() => undefined);
      return;
    }

    const timer = window.setTimeout(() => {
      setCompleted(completedMissionCount(project.id, project.missions.map((mission) => mission.id)));
      const saved = window.localStorage.getItem("jobready-student-profile");
      if (saved) {
        try { setProfile((current) => ({ ...current, ...JSON.parse(saved) as Partial<StudentProfile> })); } catch { /* keep demo profile */ }
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [project.id, project.missions]);

  const total = project.missions.length;
  const nextMission = project.missions[completed] ?? project.missions[total - 1];
  const topRole = analysis.roles?.[0]?.roles?.name ?? "Backend / Software Engineer";
  const topGaps = (analysis.gaps ?? []).slice(0, 3).map((gap) => gap.skill_name ?? gap.skill?.name).filter(Boolean);
  const selectedProject = analysis.recommendations?.[0]?.project_variants?.title ?? project.title;

  return <AppShell><main className="app-page">
    <PageHeader eyebrow="Student dashboard" title={`Good morning, ${profile.name.split(" ")[0]}.`} description="Your workspace keeps the next useful action visible — without turning progress into noise." />

    <div className="two-column">
      <Card className="card-pad">
        <ScoreDisplay value={productionScore ?? score.total} label="Job readiness score" description="A baseline for evidence visible in your profile — not a probability of getting hired." />
        <Button href="/analysis" variant="secondary" style={{ marginTop: 18 }}>View readiness →</Button>
      </Card>

      <Card className="card-pad" strong>
        <Badge tone="accent">Recommended next</Badge>
        <h2 className="section-title" style={{ marginTop: 14, color: "#fff" }}>{completed === 0 ? "Start your first mission." : `Continue: ${nextMission.title}`}</h2>
        <p style={{ color: "#c7d1d5", marginBottom: 18 }}>Close high-priority evidence gaps through one focused, production-minded project.</p>
        <Button href={`/projects/${project.id}/missions/${nextMission.id}`}>{completed === 0 ? "Start Mission 1 →" : "Continue mission →"}</Button>
      </Card>
    </div>

    <div className="two-column" style={{ marginTop: 20 }}>
      <Card className="card-pad">
        <h2 className="card-title">Your profile</h2>
        <p className="secondary-text"><b style={{ color: "var(--text)" }}>{profile.name}</b><br />{profile.degree} · {profile.studyYear}</p>
        <div className="metric-row"><span className="meta">Top role</span><strong>{topRole}</strong></div>
        <div className="metric-row"><span className="meta">Top gaps</span><strong style={{ textAlign: "right" }}>{topGaps.join(", ") || "production API evidence"}</strong></div>
      </Card>
      <ProjectProgressCard title={selectedProject} completed={completed} total={total} />
    </div>
  </main></AppShell>;
}
