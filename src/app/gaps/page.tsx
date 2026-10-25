"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Button, Card, EmptyState, ErrorState, LoadingState, PageHeader, SectionHeader, Tabs } from "@/components/ui";
import { EvidenceStatusItem } from "@/components/domain-ui";
import { gaps, gapsFromResume } from "@/lib/domain";
import { loadStructuredResume } from "@/lib/demo-storage";
import { StructuredResume } from "@/lib/resume";

type Gap = (typeof gaps)[number];
const readinessTabs = [{ href: "/analysis", label: "Overview" }, { href: "/roles", label: "Role matches" }, { href: "/gaps", label: "Evidence gaps" }];

export default function Gaps() {
  const path = usePathname();
  const production = process.env.NEXT_PUBLIC_JOBREADY_MODE === "production";
  const [currentGaps, setCurrentGaps] = useState<readonly Gap[]>(gaps);
  const [loading, setLoading] = useState(production);
  const [error, setError] = useState("");
  const [hasGaps, setHasGaps] = useState(!production);

  useEffect(() => {
    if (production) {
      void fetch("/api/analysis").then((response) => { if (!response.ok) throw new Error(); return response.json(); }).then((result: { gaps?: Array<{ classification: Gap["state"]; priority: number; skills?: { name?: string } | null }> }) => {
        if (result.gaps?.length) {
          setHasGaps(true);
          setCurrentGaps(result.gaps.map((gap) => ({
            label: gap.skills?.name ?? "Profile evidence",
            state: gap.classification,
            detail: "This classification is derived from your persisted structured resume evidence.",
            priority: gap.priority >= 5 ? "High" : gap.priority >= 3 ? "Medium" : "Strong",
          })));
        }
      }).catch(() => setError("We couldn't load your evidence gaps right now.")).finally(() => setLoading(false));
      return;
    }
    const timer = window.setTimeout(() => { const resume = loadStructuredResume<StructuredResume>(); if (resume) setCurrentGaps(gapsFromResume(resume)); }, 0);
    return () => window.clearTimeout(timer);
  }, [production]);

  if (loading) return <AppShell><main className="app-page"><LoadingState label="Loading evidence gaps…" /></main></AppShell>;
  if (error) return <AppShell><main className="app-page"><ErrorState body={error} retry={() => window.location.reload()} /></main></AppShell>;
  if (!hasGaps) return <AppShell><main className="app-page"><PageHeader eyebrow="Readiness · Evidence gaps" title="Evidence gaps appear after analysis." description="JobReady needs a resume baseline before it can separate strong, partial, and missing evidence." /><EmptyState title="No evidence-gap analysis yet" body="Add your resume to create the first gap map." action={<Button href="/resume">Add resume →</Button>} /></main></AppShell>;

  return <AppShell><main className="app-page"><PageHeader eyebrow="Readiness · Evidence gaps" title="Know what to fix first." description="A missing mention is not proof you lack a skill. These states describe the evidence visible in your profile and the next proof you can create."><div style={{ marginTop: 20 }}><Tabs items={readinessTabs} activePath={path} /></div></PageHeader>
    <div className="grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>{(["strong", "partial", "missing"] as const).map((state) => <Card className="card-pad" key={state}><SectionHeader title={state === "strong" ? "Strong evidence" : state === "partial" ? "Partial evidence" : "Missing evidence"} /><div>{currentGaps.filter((gap) => gap.state === state).map((gap) => <EvidenceStatusItem key={gap.label} title={gap.label} detail={gap.detail} status={gap.state} meta={<span className="meta">Priority: {gap.priority}</span>} />)}</div></Card>)}</div>
    <Card className="card-pad" subtle style={{ marginTop: 20 }}><h2 className="card-title">Highest-value cluster</h2><p className="secondary-text">One production backend project can address API design, database modeling, testing, Docker, and deployment evidence together.</p><Button href="/projects">See project recommendations →</Button></Card>
  </main></AppShell>;
}
