"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell, PageTitle } from "@/components/AppShell";
import { roleEvidenceFromResume, roles, roleScoreFromResume, type RoleId } from "@/lib/domain";
import { loadStructuredResume } from "@/lib/demo-storage";
import { demoResume, StructuredResume } from "@/lib/resume";

const production = process.env.NEXT_PUBLIC_JOBREADY_MODE === "production";

function fitLabel(score: number) {
  if (score >= 70) return "Strong current fit";
  if (score >= 50) return "Developing fit";
  return "Early fit";
}

export default function RolesPage() {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [resume, setResume] = useState<StructuredResume | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (production) {
      void fetch("/api/analysis")
        .then((response) => response.json())
        .then((result: { roles?: Array<{ score: number; roles: { slug: string } }>; resume?: StructuredResume | null }) => {
          setScores(Object.fromEntries((result.roles ?? []).map((row) => [row.roles.slug, row.score])));
          setResume(result.resume ?? null);
        })
        .finally(() => setLoaded(true));
      return;
    }
    const local = loadStructuredResume<StructuredResume>() ?? demoResume;
    setResume(local);
    setScores(Object.fromEntries(roles.map((role) => [role.id, roleScoreFromResume(role.id, local)])));
    setLoaded(true);
  }, []);

  return (
    <AppShell>
      <PageTitle
        eyebrow="Profile-to-role fit"
        title="Compare where your current evidence fits best."
        body="Role fit compares visible profile evidence with the supported role pattern. It is not a hiring probability, job recommendation, or guarantee."
      />

      {!loaded ? <div className="card" aria-busy="true">Comparing your role evidence…</div> : !resume ? (
        <div className="empty-state"><div className="empty-icon">↗</div><h2>No role analysis yet.</h2><p className="section-copy" style={{ margin: "0 auto 20px" }}>Upload a resume so JobReady can compare your visible evidence across the supported roles.</p><Link href="/resume" className="btn btn-primary">Add resume →</Link></div>
      ) : (
        <div className="three-col">
          {roles.map((role) => {
            const score = scores[role.id] ?? roleScoreFromResume(role.id, resume);
            const evidence = roleEvidenceFromResume(role.id as RoleId, resume);
            return (
              <article className="card" key={role.id}>
                <div className="split"><span className="badge badge-muted">{fitLabel(score)}</span><strong style={{ fontSize: 26 }}>{score}<small className="muted" style={{ fontSize: 12 }}>/100</small></strong></div>
                <h2 style={{ fontSize: 22, margin: "16px 0 7px" }}>{role.name}</h2>
                <p className="small muted" style={{ minHeight: 60 }}>{role.description}</p>
                <hr className="divider" />
                <strong className="small">Strong / visible evidence</strong>
                <div className="cluster" style={{ marginTop: 9 }}>{evidence.strong.length ? evidence.strong.slice(0, 5).map((item) => <span className="badge badge-success" key={item}>{item}</span>) : <span className="small muted">No strong role evidence detected yet.</span>}</div>
                <strong className="small" style={{ display: "block", marginTop: 16 }}>Evidence not visible yet</strong>
                <div className="cluster" style={{ marginTop: 9 }}>{evidence.missing.length ? evidence.missing.slice(0, 5).map((item) => <span className="badge badge-warm" key={item}>{item}</span>) : <span className="small muted">The supported skill pattern is well covered.</span>}</div>
                <p className="small muted" style={{ marginTop: 18 }}>Best improvement: add inspectable evidence for one or two high-value missing items rather than adding more keywords.</p>
                <Link href="/gaps" className="btn btn-secondary" style={{ width: "100%", marginTop: 10 }}>See evidence gaps →</Link>
              </article>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
