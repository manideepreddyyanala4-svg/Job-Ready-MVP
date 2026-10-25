"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell, PageTitle } from "@/components/AppShell";
import { gapsFromResume, type EvidenceState, type RoleId } from "@/lib/domain";
import { loadStructuredResume } from "@/lib/demo-storage";
import { demoResume, StructuredResume } from "@/lib/resume";

type GapView = { label: string; state: EvidenceState; detail: string; priority: string };
const production = process.env.NEXT_PUBLIC_JOBREADY_MODE === "production";

const roleNameToId: Record<string, RoleId> = {
  "Backend / Software Engineer": "backend",
  "Data Analyst": "analyst",
  "AI / ML Engineer": "ml",
};

export default function GapsPage() {
  const [gaps, setGaps] = useState<GapView[]>([]);
  const [roleName, setRoleName] = useState("Backend / Software Engineer");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (production) {
      void Promise.all([
        fetch("/api/analysis").then((response) => response.json()),
        fetch("/api/profile").then((response) => response.json()),
      ]).then(([analysis, profile]: [
        { gaps?: Array<{ classification: EvidenceState; priority: number; skills?: { name?: string } | null }> },
        { profile?: { target_role?: string } | null },
      ]) => {
        const target = profile.profile?.target_role ?? "Backend / Software Engineer";
        setRoleName(target);
        setGaps((analysis.gaps ?? []).map((gap) => ({
          label: gap.skills?.name ?? "Profile evidence",
          state: gap.classification,
          detail: gap.classification === "strong"
            ? "This evidence is visible in the structured profile."
            : gap.classification === "partial"
              ? "Some related evidence is visible, but it is not yet strong or inspectable enough."
              : "This is not currently evidenced. That does not prove you do not know it.",
          priority: gap.priority >= 5 ? "High" : gap.priority >= 3 ? "Medium" : "Strong",
        })));
      }).finally(() => setLoaded(true));
      return;
    }

    const local = loadStructuredResume<StructuredResume>() ?? demoResume;
    const saved = window.localStorage.getItem("jobready-student-profile");
    let target = "Backend / Software Engineer";
    if (saved) {
      try { target = (JSON.parse(saved) as { roles?: string[] }).roles?.find((role) => roleNameToId[role]) ?? target; } catch { /* ignore */ }
    }
    setRoleName(target);
    setGaps(gapsFromResume(local, roleNameToId[target] ?? "backend") as GapView[]);
    setLoaded(true);
  }, []);

  const highValue = gaps.filter((gap) => gap.state !== "strong" && gap.priority === "High").slice(0, 3);

  return (
    <AppShell>
      <PageTitle
        eyebrow={"Evidence gaps · " + roleName}
        title="Know what to prove next."
        body="These are evidence states, not judgments about your ability. “Missing” means JobReady cannot currently see credible proof in the structured profile."
      />

      <div className="alert alert-info" style={{ marginBottom: 20 }}><strong>Not evidenced ≠ do not know.</strong>&nbsp; If you already know a skill, the fastest improvement may be to produce inspectable project evidence rather than take another course.</div>

      {!loaded ? <div className="card" aria-busy="true">Loading your evidence gaps…</div> : gaps.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">—</div><h2>No gap analysis is available yet.</h2><Link href="/resume" className="btn btn-primary">Add or replace resume →</Link></div>
      ) : (
        <div className="three-col">
          {(["strong", "partial", "missing"] as const).map((state) => (
            <section key={state}>
              <div className="cluster"><span className={"state-dot state-" + state} /><h2 style={{ fontSize: 18, margin: 0 }}>{state === "strong" ? "Strong evidence" : state === "partial" ? "Partial / weak evidence" : "Missing evidence"}</h2></div>
              <div className="stack" style={{ marginTop: 13 }}>
                {gaps.filter((gap) => gap.state === state).length ? gaps.filter((gap) => gap.state === state).map((gap) => (
                  <article className="card card-tight" key={gap.label}>
                    <div className="split"><strong>{gap.label}</strong><span className={"badge " + (gap.priority === "High" ? "badge-warm" : "badge-muted")}>{gap.priority}</span></div>
                    <p className="small muted" style={{ marginBottom: 0 }}>{gap.detail}</p>
                  </article>
                )) : <div className="empty-state" style={{ padding: 20 }}><span className="small muted">No items in this state.</span></div>}
              </div>
            </section>
          ))}
        </div>
      )}

      {highValue.length > 0 && (
        <section className="card card-dark" style={{ marginTop: 24 }}>
          <div className="eyebrow" style={{ color: "#ffb495" }}>Highest-value cluster</div>
          <h2 style={{ margin: "10px 0 8px" }}>{highValue.map((gap) => gap.label).join(" · ")}</h2>
          <p className="muted">The best next project is one that closes several high-priority evidence gaps together, not one that merely adds another technology name.</p>
          <Link href="/projects" className="btn btn-primary" style={{ marginTop: 8 }}>See project fit →</Link>
        </section>
      )}
    </AppShell>
  );
}
