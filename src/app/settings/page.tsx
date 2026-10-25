"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Alert, Badge, Button, Card, PageHeader, SectionHeader } from "@/components/ui";

export default function Settings() {
  const router = useRouter();
  const clearDemoData = () => { window.localStorage.clear(); router.push("/"); };
  const production = process.env.NEXT_PUBLIC_JOBREADY_MODE === "production";

  return <AppShell><main className="app-page app-page-narrow"><PageHeader eyebrow="Account" title="Profile and settings." description="Review the account mode, resume entry point, and privacy controls available in this build." />
    <div className="stack">
      <Card className="card-pad"><SectionHeader title={production ? "Authenticated account" : "Demo account"} /><p className="secondary-text">{production ? "Your profile and progress are stored in your authenticated account." : "arjun@example.com · progress is stored locally in this browser."}</p><Badge tone={production ? "success" : "info"}>{production ? "Production mode" : "Local demo mode"}</Badge></Card>
      <Card className="card-pad"><SectionHeader title="Profile evidence" description="Your resume is the baseline used across readiness, gaps, and project recommendations." /><div className="cluster"><Button href="/resume" variant="secondary">Update resume</Button><Button href="/onboarding" variant="ghost">Edit profile setup</Button></div></Card>
      <Card className="card-pad"><SectionHeader title="Privacy controls" />{production ? <Alert tone="info">Account export and deletion workflows are not yet exposed in this beta UI. The current production architecture keeps user-owned data behind authenticated Supabase policies.</Alert> : <><p className="secondary-text">Your demo profile, onboarding marker, progress, and mock entitlement are stored only in this browser.</p><div className="cluster"><Button variant="danger" onClick={clearDemoData}>Delete local demo data</Button><Link className="btn btn-ghost" href="/privacy">Read privacy policy</Link></div></>}</Card>
    </div>
  </main></AppShell>;
}
