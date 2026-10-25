"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ErrorState, LoadingState, PageHeader, Tabs } from "@/components/ui";
import { RoleMatchCard } from "@/components/domain-ui";
import { roles, roleScore, roleScoreFromResume } from "@/lib/domain";
import { loadStructuredResume } from "@/lib/demo-storage";
import { StructuredResume } from "@/lib/resume";

const readinessTabs = [{ href: "/analysis", label: "Overview" }, { href: "/roles", label: "Role matches" }, { href: "/gaps", label: "Evidence gaps" }];

export default function Roles() {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(process.env.NEXT_PUBLIC_JOBREADY_MODE === "production");
  const [failed, setFailed] = useState(false);

  const load = () => {
    setFailed(false);
    if (process.env.NEXT_PUBLIC_JOBREADY_MODE === "production") {
      setLoading(true);
      void fetch("/api/analysis")
        .then((response) => { if (!response.ok) throw new Error("load"); return response.json(); })
        .then((result: { roles?: Array<{ score: number; roles: { slug: string } }> }) => { if (result.roles) setScores(Object.fromEntries(result.roles.map((row) => [row.roles.slug, row.score]))); })
        .catch(() => setFailed(true))
        .finally(() => setLoading(false));
      return;
    }
    const resume = loadStructuredResume<StructuredResume>();
    if (resume) setScores(Object.fromEntries(roles.map((role) => [role.id, roleScoreFromResume(role.id, resume)])));
  };

  useEffect(() => { const timer = window.setTimeout(load, 0); return () => window.clearTimeout(timer); }, []);

  return <AppShell><main className="app-page">
    <Tabs items={readinessTabs} activePath="/roles" className="mobile-section-tabs" />
    <PageHeader eyebrow="Role matches" title="See where your current evidence fits best." description="Role Match Score describes evidence alignment with a role pattern. It is not a hiring probability." />
    {loading ? <LoadingState label="Loading role matches" /> : failed ? <ErrorState body="We couldn't load your role matches. Try again without changing your saved profile." retry={load} /> : <div className="three-column">{roles.map((role) => <RoleMatchCard key={role.id} label={role.shortName} title={role.name} description={role.description} score={scores[role.id] ?? roleScore(role.id)} skills={role.skills} />)}</div>}
  </main></AppShell>;
}
