"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell, PageTitle } from "@/components/AppShell";
import { completedMissionCount, loadStructuredResume } from "@/lib/demo-storage";
import { demoResume, StructuredResume } from "@/lib/resume";
import { projects, readinessLevel, readinessScoreFromResume } from "@/lib/domain";

type DashboardState = {
  name: string;
  score: number | null;
  topRole: string | null;
  topGaps: string[];
  projectTitle: string | null;
  completed: number;
  hasResume: boolean;
};

const production = process.env.NEXT_PUBLIC_JOBREADY_MODE === "production";
const activeProject = projects.find((project) => project.id === "logistics-backend")!;

export default function Dashboard() {
  const [state, setState] = useState<DashboardState>({
    name: "",
    score: null,
    topRole: null,
    topGaps: [],
    projectTitle: null,
    completed: 0,
    hasResume: false,
  });
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (production) {
      void Promise.all([
        fetch("/api/profile").then((response) => response.json()),
        fetch("/api/analysis").then((response) => response.json()),
        fetch("/api/projects/progress?projectId=logistics-backend").then((response) => response.json()),
      ]).then(([profileResult, analysisResult, progressResult]: [
        { profile?: { full_name?: string } | null },
        {
          readiness?: { score?: number };
          roles?: Array<{ score: number; roles?: { name?: string } }>;
          gaps?: Array<{ priority?: number; skills?: { name?: string } | null }>;
          recommendations?: Array<{ project_variants?: { definition?: { title?: string } } }>;
          resume?: StructuredResume | null;
        },
        { progress?: Array<{ completed_at: string | null }> },
      ]) => {
        setState({
          name: profileResult.profile?.full_name ?? "",
          score: analysisResult.readiness?.score ?? null,
          topRole: analysisResult.roles?.[0]?.roles?.name ?? null,
          topGaps: (analysisResult.gaps ?? []).filter((gap) => (gap.priority ?? 0) >= 3).slice(0, 3).map((gap) => gap.skills?.name ?? "Profile evidence"),
          projectTitle: analysisResult.recommendations?.[0]?.project_variants?.definition?.title ?? null,
          completed: progressResult.progress?.filter((item) => item.completed_at).length ?? 0,
          hasResume: Boolean(analysisResult.resume),
        });
      }).catch(() => setError("Some dashboard data could not be loaded."))
        .finally(() => setLoaded(true));
      return;
    }

    const resume = loadStructuredResume<StructuredResume>();
    const local = resume ?? demoResume;
    const saved = window.localStorage.getItem("jobready-student-profile");
    let name = "";
    try { name = saved ? (JSON.parse(saved) as { name?: string }).name ?? "" : ""; } catch { /* ignore */ }
    setState({
      name,
      score: readinessScoreFromResume(local).total,
      topRole: "Backend / Software Engineer",
      topGaps: ["Docker & deployment", "Automated testing", "System design"],
      projectTitle: activeProject.title,
      completed: completedMissionCount(activeProject.id, activeProject.missions.map((mission) => mission.id)),
      hasResume: Boolean(resume),
    });
    setLoaded(true);
  }, []);

  if (!loaded) return <AppShell><div className="card" aria-busy="true">Building your next-action view…</div></AppShell>;

  const progress = Math.round((state.completed / activeProject.missions.length) * 100);
  const nextMission = activeProject.missions[Math.min(state.completed, activeProject.missions.length - 1)];
  const hasAnalysis = state.score !== null;

  return (
    <AppShell>
      <PageTitle
        eyebrow="Dashboard"
        title={state.name ? "Your next best move, " + state.name.split(" ")[0] + "." : "Your next best move."}
        body="The dashboard is ordered around the action that creates the most useful evidence next—not around vanity charts."
      />

      {error && <div className="alert alert-warning" style={{ marginBottom: 18 }}>{error}</div>}

      <section className="card card-dark">
        <div className="two-col" style={{ alignItems: "center" }}>
          <div>
            <div className="eyebrow" style={{ color: "#ffb495" }}>Next action</div>
            <h2 style={{ fontSize: 32, margin: "10px 0 8px" }}>
              {!state.hasResume ? "Upload your resume and create the evidence baseline." : state.completed === 0 ? "Start the first validated project mission." : "Continue: " + nextMission.title}
            </h2>
            <p className="muted">
              {!state.hasResume
                ? "JobReady needs your structured profile before it can explain role fit and evidence gaps."
                : state.completed === 0
                  ? "Mission 1 turns the logistics problem into a scoped plan before you write implementation code."
                  : "Continue building the same evidence path instead of starting another unrelated project."}
            </p>
          </div>
          <div style={{ justifySelf: "end" }}>
            {!state.hasResume ? <Link href="/resume" className="btn btn-primary">Add resume →</Link> : <Link href={"/projects/" + activeProject.id + "/missions/" + nextMission.id} className="btn btn-primary">{state.completed === 0 ? "Start Mission 1 →" : "Continue mission →"}</Link>}
          </div>
        </div>
      </section>

      <div className="two-col" style={{ marginTop: 18 }}>
        <section className="card">
          <div className="split mobile-stack">
            <div>
              <div className="eyebrow">Readiness snapshot</div>
              {hasAnalysis ? <><div style={{ fontSize: 54, fontWeight: 850, letterSpacing: "-.06em", marginTop: 8 }}>{state.score}<small className="muted" style={{ fontSize: 14 }}>/100</small></div><span className="badge badge-warm">{readinessLevel(state.score!)}</span></> : <h2>No report yet</h2>}
            </div>
            <Link href={hasAnalysis ? "/analysis" : "/resume"} className="btn btn-secondary">{hasAnalysis ? "Open analysis →" : "Create report →"}</Link>
          </div>
          <p className="small muted" style={{ marginTop: 16 }}>Profile readiness is evidence-based. It does not estimate your chance of employment.</p>
        </section>

        <section className="card">
          <div className="eyebrow">Role direction</div>
          <h2 style={{ margin: "10px 0 8px" }}>{state.topRole ?? "No role fit yet"}</h2>
          <p className="small muted">{state.topRole ? "Highest current evidence fit among the supported role directions." : "Process a resume to compare Backend, Data Analyst, and AI / ML evidence."}</p>
          <Link href="/roles" className="btn btn-secondary">Compare roles →</Link>
        </section>
      </div>

      <div className="two-col" style={{ marginTop: 18 }}>
        <section className="card">
          <div className="eyebrow">Top evidence gaps</div>
          <h2 style={{ margin: "10px 0 12px" }}>What your profile needs to prove better</h2>
          {state.topGaps.length ? <div className="evidence-list">{state.topGaps.map((gap) => <div className="evidence-item" key={gap}><span className="state-dot state-missing" style={{ marginTop: 7 }} /><span>{gap}</span></div>)}</div> : <p className="small muted">No current gap analysis is available.</p>}
          <Link href="/gaps" className="btn btn-secondary" style={{ marginTop: 16 }}>Open gaps →</Link>
        </section>

        <section className="card">
          <div className="split"><div className="eyebrow">Project progress</div><strong>{progress}%</strong></div>
          <h2 style={{ margin: "10px 0 8px" }}>{state.projectTitle ?? activeProject.title}</h2>
          <div className="progress-track"><div className="progress-fill progress-fill-accent" style={{ width: progress + "%" }} /></div>
          <p className="small muted">{state.completed} of {activeProject.missions.length} missions complete.</p>
          <Link href={"/projects/" + activeProject.id} className="btn btn-secondary">Project overview →</Link>
        </section>
      </div>
    </AppShell>
  );
}
