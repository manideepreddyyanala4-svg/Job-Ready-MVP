"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { isMissionComplete, setMissionComplete } from "@/lib/demo-storage";

export type MissionViewProject = {
  id: string;
  title: string;
};

export type MissionViewMission = {
  id: string;
  title: string;
  objective: string;
  time: string;
  free?: boolean;
  concepts: string[];
  deliverable: string;
  why?: string;
  resources?: string[];
  hints?: string[];
};

type MissionPageProps = {
  projectId: string;
  missionId: string;
  missionNumber: number;
  project: MissionViewProject;
  mission: MissionViewMission;
  hasServerEntitlement: boolean;
};

export function MissionPage({
  projectId,
  missionId,
  missionNumber,
  project,
  mission,
  hasServerEntitlement,
}: MissionPageProps) {
  const [done, setDone] = useState(false);
  const [paid, setPaid] = useState(hasServerEntitlement);
  const [busy, setBusy] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(
      async () => {
        if (process.env.NEXT_PUBLIC_JOBREADY_MODE !== "production") {
          setPaid(Boolean(window.localStorage.getItem("jobready-entitlement")));
        }
        if (process.env.NEXT_PUBLIC_JOBREADY_MODE === "production") {
          await fetch("/api/projects/enroll", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectId }),
          });
          const progressResponse = await fetch(`/api/projects/progress?projectId=${encodeURIComponent(projectId)}`);
          const progress = await progressResponse.json() as { progress?: Array<{ mission_id: string; completed_at: string | null }> };
          setDone(Boolean(progress.progress?.some((item) => item.mission_id === missionId && item.completed_at)));
        } else {
          setDone(isMissionComplete(projectId, missionId));
        }
      },
      0,
    );
    return () => window.clearTimeout(timer);
  }, [missionId, projectId]);

  const unlock = async () => {
    setBusy(true);
    setPaymentError("");

    try {
      const response = await fetch("/api/payments/mock/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const result = await response.json() as { ok: boolean; entitlement?: { entitlementId: string }; message?: string };
      if (!response.ok || !result.ok || !result.entitlement) throw new Error(result.message ?? "Payment failed");
      setPaid(true);
      localStorage.setItem("jobready-entitlement", JSON.stringify(result.entitlement));
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "The payment could not be completed.");
    } finally {
      setBusy(false);
    }
  };

  const saveProgress = async (complete: boolean) => {
    setDone(complete);
    if (process.env.NEXT_PUBLIC_JOBREADY_MODE === "production") {
      await fetch("/api/projects/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, missionId, complete }),
      });
    } else {
      setMissionComplete(projectId, missionId, complete);
    }
  };

  return (
    <AppShell>
      <main
        className="container"
        style={{ padding: "54px 0", maxWidth: 860 }}
      >
        <Link
          href={`/projects/${project.id}`}
          style={{
            color: "var(--muted)",
            fontSize: 13,
          }}
        >
          ← Back to project
        </Link>

        <div
          className="eyebrow"
          style={{ marginTop: 35 }}
        >
          Mission {missionNumber} ·{" "}
          {mission.free ? "Free" : "Paid Project Pass"}
        </div>

        <h1
          className="serif"
          style={{
            fontSize: 56,
            margin: "10px 0",
          }}
        >
          {mission.title}
        </h1>

        <p
          style={{
            fontSize: 18,
            color: "var(--muted)",
            lineHeight: 1.6,
          }}
        >
          {mission.objective}
        </p>

        {!mission.free && !paid ? (
          <div
            className="card"
            style={{
              padding: 30,
              marginTop: 28,
              background: "#173c50",
              color: "#fff",
            }}
          >
            <div
              className="eyebrow"
              style={{ color: "#f5ad78" }}
            >
              Keep going
            </div>

            <h2 style={{ fontSize: 28 }}>
              Unlock the full project workspace.
            </h2>

            <p
              style={{
                color: "#c4d2d2",
                lineHeight: 1.55,
              }}
            >
              Mission 1 is free. Continue with all 12 missions,
              hints, resources, and progress tracking for a
              one-time beta Project Pass.
            </p>

            <button
              className="btn btn-primary"
              onClick={unlock}
              disabled={busy}
            >
              {busy
                ? "Opening secure demo checkout…"
                : "Unlock for ₹499 →"}
            </button>
            {paymentError && <p role="alert" style={{ fontSize: 13, color: "#ffd0c5" }}>{paymentError}</p>}

            <p
              style={{
                fontSize: 12,
                color: "#c4d2d2",
              }}
            >
              Demo payment only. Production Razorpay verification
              and webhooks are adapter-ready.
            </p>
          </div>
        ) : (
          <>
            <div
              className="grid"
              style={{
                gridTemplateColumns: "1fr 1fr",
                marginTop: 30,
              }}
            >
              <div
                className="card"
                style={{ padding: 26 }}
              >
                <h3 style={{ marginTop: 0 }}>
                  What you&apos;ll practice
                </h3>

                <div
                  style={{
                    display: "flex",
                    gap: 7,
                    flexWrap: "wrap",
                  }}
                >
                  {mission.concepts.map((concept) => (
                    <span
                      className="tag"
                      key={concept}
                    >
                      {concept}
                    </span>
                  ))}
                </div>

                <h3>Deliverable</h3>

                <p
                  style={{
                    color: "var(--muted)",
                    lineHeight: 1.5,
                  }}
                >
                  {mission.deliverable}
                </p>
              </div>

              <div
                className="card"
                style={{ padding: 26 }}
              >
                <h3 style={{ marginTop: 0 }}>
                  Your task
                </h3>

                <p
                  style={{
                    color: "var(--muted)",
                    lineHeight: 1.6,
                  }}
                >
                  Write down your approach before you open a
                  tutorial. Explain the decision in your own words,
                  then attach the evidence you created.
                </p>

                <label
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    fontWeight: 700,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={done}
                    onChange={(event) => {
                      const complete = event.target.checked;
                      setDone(complete);
                      void saveProgress(complete);
                    }}
                  />
                  I completed this mission
                </label>

                {done && (
                  <p
                    style={{
                      color: "#34765c",
                      fontSize: 13,
                    }}
                  >
                    Mission saved locally. Nice work.
                  </p>
                )}
              </div>
            </div>

            <div
              className="card"
              style={{
                padding: 26,
                marginTop: 18,
              }}
            >
              <h3 style={{ marginTop: 0 }}>
                Progressive hints
              </h3>

              {[
                "Start with the user problem, not the framework.",
                "Name the inputs, outputs, and one edge case.",
                "Sketch the flow before you choose an implementation.",
                "Turn the sketch into a small checklist you can verify.",
              ].map((hint, index) => (
                <details
                  key={hint}
                  style={{
                    borderTop: "1px solid var(--line)",
                    padding: "14px 0",
                  }}
                >
                  <summary
                    style={{
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                    onClick={() => localStorage.setItem(`jobready-hint:${projectId}:${missionId}:${index + 1}`, "used")}
                  >
                    Hint {index + 1}
                  </summary>

                  <p
                    style={{
                      color: "var(--muted)",
                      fontSize: 14,
                    }}
                  >
                    {hint}
                  </p>
                </details>
              ))}
            </div>
          </>
        )}
      </main>
    </AppShell>
  );
}
