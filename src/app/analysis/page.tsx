"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Badge, Button, Card, EmptyState, ErrorState, LoadingState, PageHeader, ProgressBar, ScoreDisplay, Tabs } from "@/components/ui";
import { readinessScore, readinessScoreFromResume } from "@/lib/domain";
import { loadStructuredResume } from "@/lib/demo-storage";
import { StructuredResume } from "@/lib/resume";

const readinessTabs = [{ href: "/analysis", label: "Overview" }, { href: "/roles", label: "Role matches" }, { href: "/gaps", label: "Evidence gaps" }];

export default function Analysis() {
  const path = usePathname();
  const production = process.env.NEXT_PUBLIC_JOBREADY_MODE === "production";
  const [score, setScore] = useState(readinessScore());
  const [source, setSource] = useState<"demo" | "upload">("demo");
  const [loading, setLoading] = useState(production);
  const [error, setError] = useState("");
  const [hasAnalysis, setHasAnalysis] = useState(!production);

  useEffect(() => {
    if (production) {
      void fetch("/api/analysis").then((response) => { if (!response.ok) throw new Error(); return response.json(); }).then((result: { readiness?: { score: number; breakdown: [string, number][] }; resume?: StructuredResume | null }) => {
        if (result.readiness) { setScore({ total: result.readiness.score, categories: result.readiness.breakdown }); setHasAnalysis(true); }
        if (result.resume?.source) setSource(result.resume.source);
      }).catch(() => setError("We couldn't load your readiness analysis. Try again without re-uploading your resume.")).finally(() => setLoading(false));
      return;
    }
    const timer = window.setTimeout(() => { const resume = loadStructuredResume<StructuredResume>(); if (resume) { setScore(readinessScoreFromResume(resume)); setSource(resume.source); } }, 0);
    return () => window.clearTimeout(timer);
  }, [production]);

  if (loading) return <AppShell><main className="app-page"><LoadingState label="Loading readiness analysis…" /></main></AppShell>;
  if (error) return <AppShell><main className="app-page"><ErrorState body={error} retry={() => window.location.reload()} /></main></AppShell>;
  if (!hasAnalysis) return <AppShell><main className="app-page"><PageHeader eyebrow="Readiness" title="Your analysis starts with a resume." description="Add your resume so JobReady can map visible evidence to your target roles." /><EmptyState title="No readiness analysis yet" body="Upload a resume to create your first evidence baseline." action={<Button href="/resume">Add resume →</Button>} /></main></AppShell>;

  return <AppShell><main className="app-page"><PageHeader eyebrow={`Readiness · ${source === "demo" ? "demo resume" : "uploaded resume"}`} title="See what your profile proves today." description="Readiness describes visible evidence across early-career engineering expectations. It does not predict hiring outcomes."><div style={{ marginTop: 20 }}><Tabs items={readinessTabs} activePath={path} /></div></PageHeader>
    <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
      <Card className="card-pad"><ScoreDisplay value={score.total} label="Job readiness score" description="A deterministic baseline from your structured profile evidence." /></Card>
      <Card className="card-pad"><h2 className="card-title">How to read this</h2><p className="secondary-text">A strong score means evidence is visible. A low score can mean either a knowledge gap or simply an evidence gap. JobReady keeps those separate.</p><Badge tone="info">Evidence, not probability</Badge></Card>
    </div>
    <Card className="card-pad" style={{ marginTop: 20 }}><h2 className="card-title">Score breakdown</h2><div style={{ marginTop: 12 }}>{score.categories.map(([label, value]) => <div key={label} style={{ padding: "12px 0" }}><div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 8 }}><span className="label">{label}</span><span className="meta"><b style={{ color: "var(--text)" }}>{value}</b>/100</span></div><ProgressBar value={value} tone={value >= 60 ? "success" : "accent"} /></div>)}</div></Card>
  </main></AppShell>;
}
