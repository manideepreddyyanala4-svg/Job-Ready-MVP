"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell, PageTitle } from "@/components/AppShell";
import { readinessLevel, readinessScoreFromResume } from "@/lib/domain";
import { loadStructuredResume } from "@/lib/demo-storage";
import { demoResume, StructuredResume } from "@/lib/resume";

type Score = { total: number; categories: [string, number][] };

const dimensionCopy: Record<string, string> = {
  "Technical foundations": "Breadth of core technical evidence detected in your profile.",
  "Role-relevant skills": "How much of the supported early-career role skill pattern is visible.",
  "Project quality": "Whether there is enough project evidence to inspect, not whether a title sounds impressive.",
  "Production evidence": "Testing, data layer, deployment, containers, and other evidence beyond localhost.",
  "Resume clarity": "Whether the parser can find structured skills or project evidence clearly.",
  "Proof of work": "Projects, links, and experience that give a reviewer something concrete to inspect.",
};

const production = process.env.NEXT_PUBLIC_JOBREADY_MODE === "production";

export default function Analysis() {
  const [score, setScore] = useState<Score | null>(null);
  const [resume, setResume] = useState<StructuredResume | null>(null);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (production) {
      void fetch("/api/analysis")
        .then(async (response) => {
          const result = await response.json() as { readiness?: { score: number; breakdown: [string, number][] }; resume?: StructuredResume | null; message?: string };
          if (!response.ok) throw new Error(result.message ?? "Analysis could not be loaded.");
          if (result.readiness) setScore({ total: result.readiness.score, categories: result.readiness.breakdown });
          setResume(result.resume ?? null);
        })
        .catch(() => setError("We could not load the latest readiness analysis."))
        .finally(() => setLoaded(true));
      return;
    }
    const local = loadStructuredResume<StructuredResume>() ?? demoResume;
    queueMicrotask(() => {
      setResume(local);
      setScore(readinessScoreFromResume(local));
      setLoaded(true);
    });
  }, []);

  if (!loaded) return <AppShell><div className="card" aria-busy="true">Loading your latest readiness analysis…</div></AppShell>;

  if (!score) {
    return (
      <AppShell>
        <PageTitle eyebrow="Readiness overview" title="Create your evidence baseline first." body="A readiness report needs a processed resume before JobReady can explain strengths and gaps." />
        {error && <div className="alert alert-error" role="alert">{error}</div>}
        <div className="empty-state"><div className="empty-icon">↑</div><h2>Upload a resume to build the report.</h2><p className="section-copy" style={{ margin: "0 auto 20px" }}>JobReady will show an explainable profile-readiness score—not a hiring probability.</p><Link href="/resume" className="btn btn-primary">Add resume →</Link></div>
      </AppShell>
    );
  }

  const lowest = [...score.categories].sort((a, b) => a[1] - b[1])[0];

  return (
    <AppShell>
      <PageTitle
        eyebrow={"Readiness overview · " + (resume?.source === "demo" ? "demo evidence" : "uploaded resume")}
        title="See what your profile proves—and what it still needs to prove."
        body="This deterministic score describes evidence visible in your structured profile. It is not your probability of getting hired."
        actions={<Link href="/resume" className="btn btn-secondary">Replace resume</Link>}
      />

      {error && <div className="alert alert-error" role="alert" style={{ marginBottom: 18 }}>{error}</div>}

      <div className="two-col">
        <section className="card">
          <div className="split mobile-stack">
            <div className="score-ring" style={{ "--score": score.total } as React.CSSProperties}><strong>{score.total}<small>/100</small></strong></div>
            <div style={{ flex: 1 }}>
              <span className="badge badge-warm">{readinessLevel(score.total)}</span>
              <h2 style={{ margin: "12px 0 8px" }}>Profile-readiness score</h2>
              <p className="section-copy" style={{ margin: 0 }}>The number is a compact summary. The useful part is the breakdown and the next evidence action.</p>
            </div>
          </div>
        </section>

        <aside className="card card-soft">
          <div className="eyebrow">Highest-value next move</div>
          <h2 style={{ margin: "10px 0 8px" }}>Improve {lowest?.[0]?.toLowerCase() ?? "your weakest evidence area"}.</h2>
          <p className="small muted">Your lowest current dimension is {lowest?.[0]} at {lowest?.[1]}/100. Use the gaps screen to see which evidence can be closed together.</p>
          <Link href="/gaps" className="btn btn-dark" style={{ marginTop: 10 }}>See evidence gaps →</Link>
        </aside>
      </div>

      <section className="card" style={{ marginTop: 18 }}>
        <div className="eyebrow">Score breakdown</div>
        <h2 style={{ margin: "10px 0 6px" }}>Why the score looks like this</h2>
        <p className="small muted">Scores are intentionally broad. A few resume signals should not create fake precision.</p>
        <div className="stack" style={{ marginTop: 22 }}>
          {score.categories.map(([label, value]) => (
            <div key={label}>
              <div className="split"><div><strong>{label}</strong><span className="small muted" style={{ display: "block", marginTop: 3 }}>{dimensionCopy[label] ?? "Evidence detected in this profile dimension."}</span></div><strong>{value}/100</strong></div>
              <div className="progress-track" style={{ marginTop: 9 }}><div className={"progress-fill " + (value < 50 ? "progress-fill-accent" : "")} style={{ width: value + "%" }} /></div>
            </div>
          ))}
        </div>
      </section>

      <div className="alert alert-info" style={{ marginTop: 18 }}>
        <strong>Important:</strong>&nbsp; A low dimension can mean a real knowledge gap, weak proof, or incomplete parsing. JobReady uses the gaps screen to keep “not evidenced” separate from “you do not know this.”
      </div>
    </AppShell>
  );
}
