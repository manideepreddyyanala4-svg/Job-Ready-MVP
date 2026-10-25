"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { isMissionComplete, setMissionComplete } from "@/lib/demo-storage";
import { projectPassPriceLabel } from "@/lib/pricing";

type MissionSummaryView = { id: string; title: string; time: string; free?: boolean };
type MissionDetailView = MissionSummaryView & {
  objective: string;
  why: string;
  concepts: string[];
  tasks: string[];
  deliverables: string[];
  acceptanceCriteria: string[];
  hints: Array<{ label: "Concept" | "Direction" | "Architecture" | "Guided pattern"; body: string }>;
  resources: string[];
  verification: string[];
};

type Props = {
  projectId: string;
  missionId: string;
  missionNumber: number;
  totalMissions: number;
  project: { id: string; title: string };
  summary: MissionSummaryView;
  mission: MissionDetailView | null;
  locked: boolean;
  hasServerEntitlement: boolean;
};

const production = process.env.NEXT_PUBLIC_JOBREADY_MODE === "production";

const defenseQuestions = [
  ["Beginner", "What did you build, who is it for, and what problem does it solve?"],
  ["Beginner", "Walk through one request from the API boundary to the database."],
  ["Intermediate", "Why did you choose this data model and where did you place business rules?"],
  ["Intermediate", "How do you stop one user from reading another user's order?"],
  ["Intermediate", "Which test gives you the most confidence and why?"],
  ["Advanced", "Where would idempotency matter if clients retry requests?"],
  ["Advanced", "What would fail first if traffic increased sharply?"],
  ["Advanced", "What trade-off would you revisit with another week of engineering time?"],
] as const;

export function MissionPage({
  projectId,
  missionId,
  missionNumber,
  totalMissions,
  project,
  summary,
  mission,
  locked,
  hasServerEntitlement,
}: Props) {
  const [done, setDone] = useState(false);
  const [paid, setPaid] = useState(hasServerEntitlement);
  const [busy, setBusy] = useState(false);
  const [progressLoaded, setProgressLoaded] = useState(!production);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [usedHints, setUsedHints] = useState<Set<number>>(new Set());

  const visible = summary.free || paid;
  const nextMissionId = missionNumber < totalMissions ? "m" + (missionNumber + 1) : null;

  useEffect(() => {
    const run = async () => {
      if (!production) {
        setPaid(Boolean(window.localStorage.getItem("jobready-entitlement")));
        setDone(isMissionComplete(projectId, missionId));
        const hints = new Set<number>();
        for (let i = 1; i <= 4; i += 1) {
          if (window.localStorage.getItem("jobready-hint:" + projectId + ":" + missionId + ":" + i)) hints.add(i);
        }
        setUsedHints(hints);
        return;
      }

      try {
        await fetch("/api/projects/enroll", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId }),
        });
        const response = await fetch("/api/projects/progress?projectId=" + encodeURIComponent(projectId));
        const result = await response.json() as { progress?: Array<{ mission_id: string; completed_at: string | null; hint_usage?: Record<string, boolean> }> };
        const row = result.progress?.find((item) => item.mission_id === missionId);
        setDone(Boolean(row?.completed_at));
        setUsedHints(new Set(Object.keys(row?.hint_usage ?? {}).filter((key) => row?.hint_usage?.[key]).map(Number)));
      } catch {
        setError("Progress could not be restored. The mission content is still safe.");
      } finally {
        setProgressLoaded(true);
      }
    };
    void run();
  }, [missionId, projectId]);

  const unlockDemo = async () => {
    if (production) return;
    setBusy(true);
    setError("");
    const response = await fetch("/api/payments/mock/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId }),
    });
    const result = await response.json() as { ok?: boolean; entitlement?: { entitlementId: string }; message?: string };
    setBusy(false);
    if (!response.ok || !result.entitlement) {
      setError(result.message ?? "Demo checkout could not be completed.");
      return;
    }
    window.localStorage.setItem("jobready-entitlement", JSON.stringify(result.entitlement));
    setPaid(true);
    setMessage("Demo Project Pass unlocked in this browser.");
  };

  const saveProgress = async (complete: boolean) => {
    const previous = done;
    setDone(complete);
    setError("");
    setMessage("");
    if (!production) {
      setMissionComplete(projectId, missionId, complete);
      setMessage(complete ? "Mission marked complete in this browser." : "Mission reopened.");
      return;
    }
    setBusy(true);
    const response = await fetch("/api/projects/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, missionId, complete }),
    });
    setBusy(false);
    if (!response.ok) {
      setDone(previous);
      setError("Progress could not be saved. Try again.");
      return;
    }
    setMessage(complete ? "Mission progress saved." : "Mission reopened.");
  };

  const useHint = async (hintNumber: number) => {
    if (usedHints.has(hintNumber)) return;
    const next = new Set(usedHints);
    next.add(hintNumber);
    setUsedHints(next);

    if (!production) {
      window.localStorage.setItem("jobready-hint:" + projectId + ":" + missionId + ":" + hintNumber, "used");
      return;
    }
    if (!progressLoaded) return;
    const response = await fetch("/api/projects/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, missionId, complete: done, hintNumber }),
    });
    if (!response.ok) setError("Hint opened, but hint usage could not be saved.");
  };

  const groupedDefense = useMemo(() => {
    const groups = new Map<string, string[]>();
    for (const [level, question] of defenseQuestions) groups.set(level, [...(groups.get(level) ?? []), question]);
    return [...groups.entries()];
  }, []);

  return (
    <AppShell>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <Link href={"/projects/" + project.id} className="btn-link">← Back to project brief</Link>
        <div style={{ marginTop: 30 }}>
          <div className="cluster"><span className="eyebrow">Mission {missionNumber} of {totalMissions}</span><span className={"badge " + (summary.free ? "badge-success" : "badge-muted")}>{summary.free ? "Free mission" : "Project Pass"}</span><span className="badge badge-muted">{summary.time}</span></div>
          <h1 className="page-title">{summary.title}</h1>
          {mission?.objective && <p className="page-lede">{mission.objective}</p>}
        </div>

        {!visible || locked ? (
          <section className="card card-dark" style={{ marginTop: 28 }}>
            <div className="eyebrow" style={{ color: "#ffb495" }}>Mission 1 is free</div>
            <h2 style={{ fontSize: 30, margin: "10px 0" }}>Unlock the structured project workspace.</h2>
            <p className="muted">The Project Pass includes the remaining missions, progressive hints, acceptance criteria, progress tracking, deployment guidance, verification guidance, and project-defense preparation.</p>
            <div className="split mobile-stack" style={{ marginTop: 20 }}>
              <strong style={{ fontSize: 28 }}>{projectPassPriceLabel}</strong>
              {production ? (
                <button className="btn btn-primary" disabled>Checkout not enabled yet</button>
              ) : (
                <button className="btn btn-primary" onClick={unlockDemo} disabled={busy}>{busy ? "Opening demo checkout…" : "Unlock demo Project Pass →"}</button>
              )}
            </div>
            <p className="small" style={{ color: "#bfd0d4", marginBottom: 0 }}>
              {production ? "Real checkout is intentionally unavailable until Razorpay credentials, webhook verification, and entitlement acceptance tests are complete." : "Demo checkout creates local browser state only. It is not a real payment."}
            </p>
          </section>
        ) : !mission ? (
          <div className="alert alert-error" role="alert" style={{ marginTop: 24 }}>Mission content could not be loaded. Your entitlement has not been changed.</div>
        ) : (
          <>
            <div className="two-col" style={{ marginTop: 28 }}>
              <section className="card">
                <div className="eyebrow">Objective</div>
                <h2 style={{ margin: "10px 0 8px" }}>Why this mission matters</h2>
                <p className="section-copy">{mission.why}</p>
                <h3 style={{ marginTop: 22 }}>Concepts</h3>
                <div className="cluster">{mission.concepts.map((concept) => <span className="tag" key={concept}>{concept}</span>)}</div>
              </section>
              <section className="card card-soft">
                <div className="eyebrow">Evidence output</div>
                <h2 style={{ margin: "10px 0 8px" }}>What you must produce</h2>
                <div className="evidence-list">{mission.deliverables.map((item) => <div className="evidence-item" key={item}><span className="evidence-icon">+</span><span>{item}</span></div>)}</div>
              </section>
            </div>

            <section className="card" style={{ marginTop: 18 }}>
              <div className="eyebrow">Tasks</div>
              <h2 style={{ margin: "10px 0 8px" }}>Work in this order</h2>
              <div className="evidence-list">{mission.tasks.map((task, index) => <div className="evidence-item" key={task}><span className="evidence-icon">{index + 1}</span><span>{task}</span></div>)}</div>
            </section>

            <section className="card" style={{ marginTop: 18 }}>
              <div className="eyebrow">Acceptance criteria</div>
              <h2 style={{ margin: "10px 0 8px" }}>Before you call the mission complete</h2>
              <div className="evidence-list">{mission.acceptanceCriteria.map((item) => <div className="evidence-item" key={item}><span className="evidence-icon">✓</span><span>{item}</span></div>)}</div>
            </section>

            <section className="card" style={{ marginTop: 18 }}>
              <div className="split mobile-stack"><div><div className="eyebrow">Progressive hints</div><h2 style={{ margin: "8px 0 0" }}>Use the smallest hint that gets you moving.</h2></div><span className="badge badge-muted">{usedHints.size} of {mission.hints.length} used</span></div>
              <div style={{ marginTop: 16 }}>
                {mission.hints.map((hint, index) => (
                  <details key={hint.label} style={{ borderTop: "1px solid var(--line)", padding: "14px 0" }} onToggle={(event) => {
                    if ((event.currentTarget as HTMLDetailsElement).open) void useHint(index + 1);
                  }}>
                    <summary style={{ cursor: "pointer", fontWeight: 750 }}>{index + 1}. {hint.label} {usedHints.has(index + 1) ? <span className="badge badge-muted" style={{ marginLeft: 8 }}>used</span> : null}</summary>
                    <p className="section-copy" style={{ fontSize: 14 }}>{hint.body}</p>
                  </details>
                ))}
              </div>
            </section>

            <section className="card" style={{ marginTop: 18 }}>
              <div className="eyebrow">Verification</div>
              <h2 style={{ margin: "10px 0 8px" }}>What should be true when you finish</h2>
              <p className="small muted">These are transparent self-checks in the current beta. JobReady does not claim an automated hidden check passed unless execution infrastructure actually ran it.</p>
              <div className="evidence-list">{mission.verification.map((item) => <div className="evidence-item" key={item}><span className="evidence-icon">✓</span><span>{item}</span></div>)}</div>
            </section>

            {missionNumber === totalMissions && (
              <section className="card card-warm" style={{ marginTop: 18 }}>
                <div className="eyebrow">Project defense</div>
                <h2 style={{ margin: "10px 0 8px" }}>Defend your actual decisions, not a memorized script.</h2>
                <p className="small muted">Answer each question from your repository, tests, deployment notes, and failures.</p>
                <div className="three-col" style={{ marginTop: 18 }}>
                  {groupedDefense.map(([level, questions]) => <div key={level}><span className="badge badge-warm">{level}</span><div className="stack" style={{ marginTop: 12 }}>{questions.map((question) => <div className="metric-card" key={question}><strong className="small">{question}</strong></div>)}</div></div>)}
                </div>
              </section>
            )}

            <section className="card card-dark" style={{ marginTop: 18 }}>
              <div className="split mobile-stack">
                <div><div className="eyebrow" style={{ color: "#ffb495" }}>Mission status</div><h2 style={{ margin: "9px 0 5px" }}>{done ? "Completed" : "Ready when the evidence is real."}</h2><p className="small muted" style={{ margin: 0 }}>Mark complete only after the acceptance criteria are true.</p></div>
                <button className="btn btn-primary" onClick={() => void saveProgress(!done)} disabled={busy || !progressLoaded}>{busy ? "Saving…" : done ? "Reopen mission" : "Mark mission complete"}</button>
              </div>
              {message && <div className="alert alert-success" role="status" style={{ marginTop: 14 }}>{message}</div>}
              {error && <div className="alert alert-error" role="alert" style={{ marginTop: 14 }}>{error}</div>}
            </section>

            <div className="split mobile-stack" style={{ marginTop: 22 }}>
              <Link className="btn btn-secondary" href={"/projects/" + projectId}>Project overview</Link>
              {nextMissionId ? <Link className="btn btn-dark" href={"/projects/" + projectId + "/missions/" + nextMissionId}>Next mission →</Link> : <Link className="btn btn-dark" href="/dashboard">Back to dashboard →</Link>}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
