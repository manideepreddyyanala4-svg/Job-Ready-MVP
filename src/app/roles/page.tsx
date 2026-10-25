"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell, PageTitle } from "@/components/AppShell";
import { roles, roleScore, roleScoreFromResume } from "@/lib/domain";
import { loadStructuredResume } from "@/lib/demo-storage";
import { StructuredResume } from "@/lib/resume";

export default function Roles() {
  const [scores, setScores] = useState<Record<string, number>>({});
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_JOBREADY_MODE === "production") {
      void fetch("/api/analysis")
        .then((response) => response.json())
        .then((result: { roles?: Array<{ score: number; roles: { slug: string } }> }) => {
          if (result.roles) setScores(Object.fromEntries(result.roles.map((row) => [row.roles.slug, row.score])));
        })
        .catch(() => undefined);
      return;
    }
    const timer = window.setTimeout(() => {
      const resume = loadStructuredResume<StructuredResume>();
      if (resume) setScores(Object.fromEntries(roles.map((role) => [role.id, roleScoreFromResume(role.id, resume)])));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  return <AppShell><main className="container" style={{ padding: "54px 0" }}><PageTitle eyebrow="Role matches" title="Where your current evidence fits best." body="Role Match Score shows how much of a role's current evidence pattern your profile covers. It is not a hiring probability." /><div className="grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>{roles.map((role) => <div className="card" key={role.id} style={{ padding: 24 }}><div className="tag">{role.shortName}</div><h2 style={{ fontSize: 23, margin: "18px 0 8px" }}>{role.name}</h2><p style={{ color: "var(--muted)", lineHeight: 1.5, fontSize: 14, minHeight: 64 }}>{role.description}</p><div style={{ fontSize: 48, fontWeight: 800, color: "var(--navy)", margin: "12px 0" }}>{scores[role.id] ?? roleScore(role.id)}<small style={{ fontSize: 15, color: "var(--muted)" }}>/100</small></div><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{role.skills.slice(0, 5).map((skill) => <span key={skill} className="tag">{skill}</span>)}</div><Link href="/gaps" className="btn btn-ghost" style={{ marginTop: 22, width: "100%" }}>See strengths & gaps →</Link></div>)}</div></main></AppShell>;
}
