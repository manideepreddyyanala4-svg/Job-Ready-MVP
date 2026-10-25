"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Alert, Badge, Breadcrumb, Button, Card, PageHeader, SectionHeader } from "@/components/ui";
import { isMissionComplete, setMissionComplete } from "@/lib/demo-storage";

export type MissionViewProject = { id: string; title: string };
export type MissionViewMission = { id: string; title: string; objective: string; time: string; free?: boolean; concepts: string[]; deliverable: string; why?: string; resources?: string[]; hints?: string[] };
type MissionPageProps = { projectId: string; missionId: string; missionNumber: number; project: MissionViewProject; mission: MissionViewMission; hasServerEntitlement: boolean };

export function MissionPage({ projectId, missionId, missionNumber, project, mission, hasServerEntitlement }: MissionPageProps) {
  const [done, setDone] = useState(false);
  const [paid, setPaid] = useState(hasServerEntitlement);
  const [busy, setBusy] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      if (process.env.NEXT_PUBLIC_JOBREADY_MODE !== "production") setPaid(Boolean(window.localStorage.getItem("jobready-entitlement")));
      if (process.env.NEXT_PUBLIC_JOBREADY_MODE === "production") {
        await fetch("/api/projects/enroll", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId }) });
        const progressResponse = await fetch(`/api/projects/progress?projectId=${encodeURIComponent(projectId)}`);
        if (progressResponse.ok) {
          const progress = await progressResponse.json() as { progress?: Array<{ mission_id: string; completed_at: string | null }> };
          setDone(Boolean(progress.progress?.some((item) => item.mission_id === missionId && item.completed_at)));
        }
      } else setDone(isMissionComplete(projectId, missionId));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [missionId, projectId]);

  const unlock = async () => {
    setBusy(true); setPaymentError("");
    try {
      const response = await fetch("/api/payments/mock/complete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId }) });
      const result = await response.json() as { ok: boolean; entitlement?: { entitlementId: string }; message?: string };
      if (!response.ok || !result.ok || !result.entitlement) throw new Error(result.message ?? "Payment failed");
      setPaid(true); localStorage.setItem("jobready-entitlement", JSON.stringify(result.entitlement));
    } catch { setPaymentError("The demo checkout could not be completed. Try again."); }
    finally { setBusy(false); }
  };

  const saveProgress = async (complete: boolean) => {
    setSaveError(""); setDone(complete);
    if (process.env.NEXT_PUBLIC_JOBREADY_MODE === "production") {
      const response = await fetch("/api/projects/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId, missionId, complete }) });
      if (!response.ok) { setDone(!complete); setSaveError("We couldn't save this mission state. Try again."); }
    } else setMissionComplete(projectId, missionId, complete);
  };

  return <AppShell><main className="app-page app-page-narrow"><Breadcrumb items={[{ label: "Projects", href: "/projects" }, { label: project.title, href: `/projects/${project.id}` }, { label: `Mission ${missionNumber}` }]} /><PageHeader eyebrow={`Mission ${missionNumber} · ${mission.free ? "Free" : "Project Pass"}`} title={mission.title} description={mission.objective} />
    {!mission.free && !paid ? <Card className="card-pad" strong><div className="eyebrow" style={{ color: "#f4ad91" }}>Continue the project</div><h2 className="section-title" style={{ color: "#fff", marginTop: 10 }}>Unlock the full project workspace.</h2><p style={{ color: "#cbd6d9" }}>Mission 1 is free. Continue with all 12 missions, hints, resources, and progress tracking for the one-time beta Project Pass.</p><Button onClick={unlock} disabled={busy}>{busy ? "Opening demo checkout…" : "Unlock for ₹499 →"}</Button>{paymentError && <div style={{ marginTop: 14 }}><Alert tone="error">{paymentError}</Alert></div>}<p className="meta" style={{ color: "#aebdc2", marginBottom: 0 }}>Demo payment only. Production Razorpay remains disabled.</p></Card> : <>
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}><Card className="card-pad"><SectionHeader title="What you'll practice" /><div className="cluster">{mission.concepts.map((concept) => <Badge key={concept}>{concept}</Badge>)}</div><h3 className="card-title" style={{ marginTop: 24 }}>Deliverable</h3><p className="secondary-text">{mission.deliverable}</p></Card><Card className="card-pad"><SectionHeader title="Your task" /><p className="secondary-text">Write down your approach before you open a tutorial. Explain the decision in your own words, then attach the evidence you created.</p><label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontWeight: 700 }}><input type="checkbox" checked={done} onChange={(event) => void saveProgress(event.target.checked)} style={{ marginTop: 5 }} /><span>I completed this mission</span></label>{done && <div style={{ marginTop: 14 }}><Alert tone="success">Mission progress saved.</Alert></div>}{saveError && <div style={{ marginTop: 14 }}><Alert tone="error">{saveError}</Alert></div>}</Card></div>
      <Card className="card-pad" style={{ marginTop: 18 }}><SectionHeader title="Progressive hints" description="Open only as much help as you need." />{["Start with the user problem, not the framework.", "Name the inputs, outputs, and one edge case.", "Sketch the flow before you choose an implementation.", "Turn the sketch into a small checklist you can verify."].map((hint, index) => <details key={hint} style={{ borderTop: "1px solid var(--border)", padding: "14px 0" }}><summary style={{ cursor: "pointer", fontWeight: 700 }} onClick={() => localStorage.setItem(`jobready-hint:${projectId}:${missionId}:${index + 1}`, "used")}>Hint {index + 1}</summary><p className="secondary-text" style={{ fontSize: 14 }}>{hint}</p></details>)}</Card>
    </>}
  </main></AppShell>;
}
