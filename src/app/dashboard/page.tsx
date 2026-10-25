"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { demoStudent, projects, readinessScore } from "@/lib/domain";
import { completedMissionCount } from "@/lib/demo-storage";

type StudentProfile = {
  name: string;
  degree: string;
  studyYear: string;
};

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
  const [profile, setProfile] = useState<StudentProfile>({
    name: demoStudent.name,
    degree: demoStudent.degree,
    studyYear: demoStudent.year,
  });

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
          setProfile((current) => ({
            ...current,
            name: profileResult.profile?.full_name ?? current.name,
            degree: profileResult.profile?.degree ?? current.degree,
            studyYear: profileResult.profile?.year ?? current.studyYear,
          }));
        }
        if (analysisResult.readiness?.score !== undefined) setProductionScore(analysisResult.readiness.score);
        setAnalysis(analysisResult);
        setCompleted(progressResult.progress?.filter((item) => item.completed_at).length ?? 0);
      }).catch(() => undefined);
      return;
    }
    const timer = window.setTimeout(
      () => {
        setCompleted(completedMissionCount(project.id, project.missions.map((mission) => mission.id)));
        const saved = window.localStorage.getItem("jobready-student-profile");
        if (saved) {
          try {
            const parsed = JSON.parse(saved) as Partial<StudentProfile>;
            setProfile((current) => ({ ...current, ...parsed }));
          } catch {
            // Keep the seeded demo profile when local state is malformed.
          }
        }
      },
      0,
    );
    return () => window.clearTimeout(timer);
  }, [project.id, project.missions]);

  const total = project.missions.length;
  const progress = Math.round((completed / total) * 100);
  const nextMission = project.missions[completed] ?? project.missions[total - 1];

  const topRole = analysis.roles?.[0]?.roles?.name;
  const topGaps = (analysis.gaps ?? []).slice(0, 3).map((gap) => gap.skill_name ?? gap.skill?.name).filter(Boolean);
  const selectedProject = analysis.recommendations?.[0]?.project_variants?.title;
  return <AppShell><main className="container" style={{ padding: "54px 0" }}><PageHeader name={profile.name} /><div className="grid" style={{ gridTemplateColumns: "1.1fr .9fr" }}><div className="card" style={{ padding: 26 }}><div className="eyebrow">Job readiness score</div><div style={{ display: "flex", alignItems: "end", gap: 10, margin: "14px 0" }}><strong style={{ fontSize: 64, letterSpacing: "-.06em" }}>{productionScore ?? score.total}</strong><span style={{ color: "var(--muted)", marginBottom: 12 }}>/ 100</span></div><p style={{ color: "var(--muted)", lineHeight: 1.5 }}>A baseline for the evidence visible in your profile — not a probability of getting hired.</p><Link href="/analysis" className="btn btn-dark" style={{ marginTop: 12 }}>View full analysis →</Link></div><div className="card" style={{ padding: 26, background: "#173c50", color: "#fff" }}><div className="eyebrow" style={{ color: "#f5ad78" }}>Recommended next</div><h2 style={{ fontSize: 25, margin: "12px 0" }}>{completed === 0 ? "Start your first mission." : `Continue: ${nextMission.title}`}</h2><p style={{ color: "#c4d2d2", lineHeight: 1.5 }}>Close high-priority evidence gaps with the logistics project.</p><Link href={`/projects/${project.id}/missions/${nextMission.id}`} className="btn btn-primary" style={{ marginTop: 10 }}>{completed === 0 ? "Start Mission 1 →" : "Continue mission →"}</Link></div></div><div className="grid" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 18 }}><div className="card" style={{ padding: 24 }}><h3 style={{ marginTop: 0 }}>Your profile</h3><p><b>{profile.name}</b><br /><span style={{ color: "var(--muted)" }}>{profile.degree} · {profile.studyYear}</span></p><p style={{ color: "var(--muted)" }}>Top role: <b style={{ color: "var(--ink)" }}>{topRole ?? "Backend / Software Engineer"}</b></p><p style={{ color: "var(--muted)" }}>Top gaps: <b style={{ color: "var(--ink)" }}>{topGaps.join(", ") || "production API evidence"}</b></p></div><div className="card" style={{ padding: 24 }}><h3 style={{ marginTop: 0 }}>Project progress</h3><p style={{ color: "var(--muted)" }}>{selectedProject ?? project.title}</p><div style={{ height: 9, background: "#e5ece8", borderRadius: 9 }}><div style={{ width: `${progress}%`, height: "100%", background: "var(--orange)", borderRadius: 9 }} /></div><small style={{ display: "block", marginTop: 10, color: "var(--muted)" }}>{completed} of {total} missions · {progress}% complete</small></div></div></main></AppShell>;
}

function PageHeader({ name }: { name: string }) {
  return <div style={{ marginBottom: 32 }}><div className="eyebrow">Student dashboard</div><h1 className="serif" style={{ fontSize: 56, margin: "9px 0" }}>Good morning, {name.split(" ")[0]}.</h1><p style={{ color: "var(--muted)" }}>Here&apos;s the clearest next step toward your target roles.</p></div>;
}
