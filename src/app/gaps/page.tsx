"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button, Card, ErrorState, LoadingState, PageHeader, SectionHeader, Tabs } from "@/components/ui";
import { EvidenceStatusItem } from "@/components/domain-ui";
import { gaps, gapsFromResume } from "@/lib/domain";
import { loadStructuredResume } from "@/lib/demo-storage";
import { StructuredResume } from "@/lib/resume";

type Gap = (typeof gaps)[number];
const readinessTabs = [{ href: "/analysis", label: "Overview" }, { href: "/roles", label: "Role matches" }, { href: "/gaps", label: "Evidence gaps" }];

export default function Gaps() {
  const [currentGaps, setCurrentGaps] = useState<readonly Gap[]>(gaps);
  const [loading, setLoading] = useState(process.env.NEXT_PUBLIC_JOBREADY_MODE === "production");
  const [failed, setFailed] = useState(false);

  const load = () => {
    setFailed(false);
    if (process.env.NEXT_PUBLIC_JOBREADY_MODE === "production") {
      setLoading(true);
      void fetch("/api/analysis")
        .then((response) => { if (!response.ok) throw new Error("load"); return response.json(); })
        .then((result: { gaps?: Array<{ classification: Gap["state"]; priority: number; skills?: { name?: string } | null }> }) => {
          if (result.gaps) setCurrentGaps(result.gaps.map((gap) => ({ label: gap.skills?.name ?? "Profile evidence", state: gap.classification, detail: "This classification is derived from your persisted structured resume evidence.", priority: gap.priority >= 5 ? "High" : gap.priority >= 3 ? "Medium" : "Strong" })));
        })
        .catch(() => setFailed(true))
        .finally(() => setLoading(false));
      return;
    }
    const resume = loadStructuredResume<StructuredResume>();
    if (resume) setCurrentGaps(gapsFromResume(resume));
  };

  useEffect(() => { const timer = window.setTimeout(load, 0); return () => window.clearTimeout(timer); }, []);

  return <AppShell><main className="app-page">
    <Tabs items={readinessTabs} activePath="/gaps" className="mobile-section-tabs" />
    <PageHeader eyebrow="Evidence gaps" title="Know what to fix first." description="A missing mention is not proof you lack a skill. These states show what your current profile proves and where stronger evidence would help." />
    {loading ? <LoadingState label="Loading evidence gaps" /> : failed ? <ErrorState body="We couldn't load your evidence gaps. Try again without changing your saved analysis." retry={load} /> : <>
      <div className="three-column">{(["strong", "partial", "missing"] as const).map((state) => <Card key={state} className="card-pad"><SectionHeader title={state === "strong" ? "Strong evidence" : state === "partial" ? "Partial evidence" : "Missing evidence"} />{currentGaps.filter((gap) => gap.state === state).map((gap) => <EvidenceStatusItem key={gap.label} title={gap.label} detail={gap.detail} status={gap.state} meta={<span className="meta">Priority: {gap.priority}</span>} />)}</Card>)}</div>
      <Card className="card-pad" subtle style={{ marginTop: 20 }}><h2 className="card-title">Highest-value cluster</h2><p className="secondary-text">One production backend project can address API design, database modeling, testing, Docker, and deployment evidence together.</p><Button href="/projects">See project recommendations →</Button></Card>
    </>}
  </main></AppShell>;
}
