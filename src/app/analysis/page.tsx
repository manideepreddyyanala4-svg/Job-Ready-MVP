"use client";

import { useEffect, useState } from "react";
import { AppShell, PageTitle } from "@/components/AppShell";
import { readinessScore, readinessScoreFromResume } from "@/lib/domain";
import { loadStructuredResume } from "@/lib/demo-storage";
import { StructuredResume } from "@/lib/resume";

export default function Analysis() {
  const [score, setScore] = useState(readinessScore());
  const [source, setSource] = useState<"demo" | "upload">("demo");

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_JOBREADY_MODE === "production") {
      void fetch("/api/analysis")
        .then((response) => response.json())
        .then((result: { readiness?: { score: number; breakdown: [string, number][] }; resume?: StructuredResume | null }) => {
          if (result.readiness) setScore({ total: result.readiness.score, categories: result.readiness.breakdown });
          if (result.resume?.source) setSource(result.resume.source);
        })
        .catch(() => undefined);
      return;
    }
    const timer = window.setTimeout(() => {
      const resume = loadStructuredResume<StructuredResume>();
      if (resume) {
        setScore(readinessScoreFromResume(resume));
        setSource(resume.source);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  return <AppShell><main className="container" style={{ padding: "54px 0" }}><PageTitle eyebrow={`Analysis · ${source === "demo" ? "demo resume" : "uploaded resume"}`} title="Your profile has a solid start. Now make it believable." body="This report scores visible evidence across the things an early-career engineer is expected to explain. It does not predict hiring outcomes." /><div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}><div className="card" style={{ padding: 28, display: "flex", alignItems: "center", gap: 24 }}><div style={{ width: 130, height: 130, borderRadius: "50%", display: "grid", placeItems: "center", background: "#eaf4f1", border: "13px solid #f2ad72", fontSize: 42, fontWeight: 800 }}>{score.total}</div><div><b style={{ fontSize: 18 }}>Job Readiness Score</b><p style={{ color: "var(--muted)", lineHeight: 1.5, fontSize: 14 }}>A deterministic baseline for evidence visible in the structured profile.</p></div></div><div className="card" style={{ padding: 28 }}><h3 style={{ marginTop: 0 }}>How to read this</h3><p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6 }}>A strong score means evidence is visible. A low score can mean either a knowledge gap or simply an evidence gap. We keep those separate.</p><span className="tag">Evidence, not probability</span></div></div><div className="card" style={{ padding: 28, marginTop: 18 }}><h3 style={{ marginTop: 0 }}>Score breakdown</h3>{score.categories.map(([label, value]) => <div key={label} style={{ margin: "22px 0" }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700 }}><span>{label}</span><span>{value}/100</span></div><div style={{ height: 10, background: "#e5ece8", borderRadius: 10, marginTop: 8 }}><div style={{ width: `${value}%`, height: "100%", background: value < 50 ? "var(--orange)" : "var(--navy)", borderRadius: 10 }} /></div></div>)}</div></main></AppShell>;
}
