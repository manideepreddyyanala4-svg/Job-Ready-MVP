"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell, PageTitle } from "@/components/AppShell";
import { gaps, gapsFromResume } from "@/lib/domain";
import { loadStructuredResume } from "@/lib/demo-storage";
import { StructuredResume } from "@/lib/resume";

type Gap = (typeof gaps)[number];

export default function Gaps() {
  const [currentGaps, setCurrentGaps] = useState<readonly Gap[]>(gaps);
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_JOBREADY_MODE === "production") {
      void fetch("/api/analysis")
        .then((response) => response.json())
        .then((result: { gaps?: Array<{ classification: Gap["state"]; priority: number; skills?: { name?: string } | null }> }) => {
          if (result.gaps) {
            setCurrentGaps(result.gaps.map((gap) => ({
              label: gap.skills?.name ?? "Profile evidence",
              state: gap.classification,
              detail: "This classification is derived from your persisted structured resume evidence.",
              priority: gap.priority >= 5 ? "High" : gap.priority >= 3 ? "Medium" : "Strong",
            })));
          }
        })
        .catch(() => undefined);
      return;
    }
    const timer = window.setTimeout(() => {
      const resume = loadStructuredResume<StructuredResume>();
      if (resume) setCurrentGaps(gapsFromResume(resume));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  return <AppShell><main className="container" style={{ padding: "54px 0" }}><PageTitle eyebrow="Evidence gaps" title="Know what to fix first." body="A missing mention is not proof you lack a skill. These cards show the current state of evidence in your profile and the next action that creates better proof." /><div className="grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>{(["strong", "partial", "missing"] as const).map((state) => <section key={state}><h2 style={{ fontSize: 19, textTransform: "capitalize" }}>{state === "strong" ? "Strong evidence" : state === "partial" ? "Partial / weak evidence" : "Missing evidence"}</h2>{currentGaps.filter((gap) => gap.state === state).map((gap) => <div className="card" key={gap.label} style={{ padding: 19, marginTop: 12, borderTop: `4px solid ${state === "strong" ? "#4c9b7d" : state === "partial" ? "#e4a34b" : "var(--orange)"}` }}><div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><b>{gap.label}</b><span className="tag">{gap.priority}</span></div><p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.5 }}>{gap.detail}</p></div>)}</section>)}</div><div className="card" style={{ padding: 26, marginTop: 28, background: "#e8f0ec" }}><b>Highest-value cluster</b><p style={{ marginBottom: 0, color: "var(--muted)" }}>One production backend project can address API design, database modeling, testing, Docker, and deployment evidence together.</p><Link className="btn btn-primary" href="/projects" style={{ marginTop: 16 }}>See project recommendations →</Link></div></main></AppShell>;
}
