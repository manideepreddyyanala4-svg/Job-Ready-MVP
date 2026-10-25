"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Button, EmptyState, ErrorState, LoadingState, PageHeader, Tabs } from "@/components/ui";
import { RoleMatchCard } from "@/components/domain-ui";
import { roles, roleScore, roleScoreFromResume } from "@/lib/domain";
import { loadStructuredResume } from "@/lib/demo-storage";
import { StructuredResume } from "@/lib/resume";

const readinessTabs = [{ href: "/analysis", label: "Overview" }, { href: "/roles", label: "Role matches" }, { href: "/gaps", label: "Evidence gaps" }];

export default function Roles() {
  const path = usePathname();
  const production = process.env.NEXT_PUBLIC_JOBREADY_MODE === "production";
  const [scores, setScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(production);
  const [error, setError] = useState("");
  const [hasMatches, setHasMatches] = useState(!production);
  useEffect(() => {
    if (production) {
      void fetch("/api/analysis").then((response) => { if (!response.ok) throw new Error(); return response.json(); }).then((result: { roles?: Array<{ score: number; roles: { slug: string } }> }) => { if (result.roles?.length) { setScores(Object.fromEntries(result.roles.map((row) => [row.roles.slug, row.score]))); setHasMatches(true); } }).catch(() => setError("We couldn't load your role matches right now.")).finally(() => setLoading(false));
      return;
    }
    const timer = window.setTimeout(() => { const resume = loadStructuredResume<StructuredResume>(); if (resume) setScores(Object.fromEntries(roles.map((role) => [role.id, roleScoreFromResume(role.id, resume)]))); }, 0);
    return () => window.clearTimeout(timer);
  }, [production]);

  if (loading) return <AppShell><main className="app-page"><LoadingState label="Loading role matches…" /></main></AppShell>;
  if (error) return <AppShell><main className="app-page"><ErrorState body={error} retry={() => window.location.reload()} /></main></AppShell>;
  if (!hasMatches) return <AppShell><main className="app-page"><PageHeader eyebrow="Readiness · Role matches" title="Role matches need an evidence baseline." description="Analyze your resume first so JobReady can compare visible evidence with each supported role." /><EmptyState title="No role matches yet" body="Add or re-analyze your resume to create role evidence matches." action={<Button href="/resume">Add resume →</Button>} /></main></AppShell>;
  return <AppShell><main className="app-page"><PageHeader eyebrow="Readiness · Role matches" title="Where your current evidence fits best." description="Role Match Score shows how much of a role's current evidence pattern your profile covers. It is not a hiring probability."><div style={{ marginTop: 20 }}><Tabs items={readinessTabs} activePath={path} /></div></PageHeader><div className="grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>{roles.map((role) => <RoleMatchCard key={role.id} label={role.shortName} title={role.name} description={role.description} score={scores[role.id] ?? roleScore(role.id)} skills={role.skills} />)}</div></main></AppShell>;
}
