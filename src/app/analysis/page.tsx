"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Badge, Button, Card, ErrorState, LoadingState, PageHeader, ProgressBar, ScoreDisplay, Tabs } from "@/components/ui";
import { readinessScore, readinessScoreFromResume } from "@/lib/domain";
import { loadStructuredResume } from "@/lib/demo-storage";
import { StructuredResume } from "@/lib/resume";

const readinessTabs = [{ href: "/analysis", label: "Overview" }, { href: "/roles", label: "Role matches" }, { href: "/gaps", label: "Evidence gaps" }];

export default function Analysis() {
  const [score, setScore] = useState(readinessScore());
  const [source, setSource] = useState<"demo" | "upload">("demo");
  const [loading, setLoading] = useState(process.env.NEXT_PUBLIC_JOBREADY_MODE === "production");
  const [failed, setFailed] = useState(false);

  const load = () => {
    setFailed(false);
    if (process.env.NEXT_PUBLIC_JOBREADY_MODE === "production") {
      setLoading(true);
      void fetch("/api/analysis")
        .then((response) => { if (!response.ok) throw new Error("load"); return response.json(); })
        .then((result: { readiness?: { score: number; breakdown: [string, number][] }; resume?: StructuredResume | null }) => {
          if (result.readiness) setScore({ total: result.readiness.score, categories: result.readiness.breakdown });
          if (result.resume?.source) setSource(result.resume.source);
        })
        .catch(() => setFailed(true))
        .finally(() => setLoading(false));
      return;
    }
    const resume = loadStructuredResume<StructuredResume>();
    if (resume) { setScore(readinessScoreFromResume(resume)); setSource(resume.source); }
  };

  useEffect(() => { const timer = window.setTimeout(load, 0); return () => window.clearTimeout(timer); }, []);

  return <AppShell><main className="app-page">
    <Tabs items={readinessTabs} activePath="/analysis" className="mobile-section-tabs" />
    <PageHeader eyebrow={`Readiness · ${source === "demo" ? "demo resume" : "uploaded resume"}`} title="Understand what your profile proves today." description="This report scores visible evidence. It does not predict hiring outcomes, and a low score can mean missing proof rather than missing knowledge." actions={<Button href="/resume" variant="ghost">Update resume</Button>} />
    {loading ? <LoadingState label="Loading readiness analysis" /> : failed ? <ErrorState body="We couldn't load your readiness analysis. Your saved profile has not been changed." retry={load} /> : <>
      <div className="two-column">
        <Card className="card-pad"><ScoreDisplay value={score.total} label="Job readiness score" description="Use this as a baseline for visible evidence, not as a hiring probability." /></Card>
        <Card className="card-pad"><h2 className="card-title">How to read this</h2><p className="secondary-text">A strong score means evidence is visible. A low score can mean a knowledge gap or simply an evidence gap. JobReady keeps those separate.</p><Badge tone="info">Evidence, not probability</Badge></Card>
      </div>
      <Card className="card-pad" style={{ marginTop: 20 }}>
        <h2 className="card-title">Score breakdown</h2>
        <div style={{ marginTop: 18 }}>{score.categories.map(([label, value]) => <div key={label} style={{ marginTop: 18 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 7 }}><span className="label">{label}</span><span className="meta">{value}/100</span></div><ProgressBar value={value} tone={value >= 65 ? "success" : "accent"} /></div>)}</div>
      </Card>
    </>}
  </main></AppShell>;
}
