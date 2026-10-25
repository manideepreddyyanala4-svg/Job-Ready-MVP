"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Badge, Button, Card, PageHeader, SectionHeader } from "@/components/ui";

export default function Settings() {
  const router = useRouter();
  const production = process.env.NEXT_PUBLIC_JOBREADY_MODE === "production";
  const clearDemoData = () => { window.localStorage.clear(); router.push("/"); };

  return <AppShell><main className="app-page app-page-narrow">
    <PageHeader eyebrow="Account & privacy" title="Your account and data." description={production ? "Review the account surfaces connected to your JobReady workspace." : "This demo keeps local progress in your browser. Production accounts use authenticated Supabase records."} />
    <div className="stack">
      <Card className="card-pad"><SectionHeader title={production ? "Account" : "Demo account"} /><p className="secondary-text">{production ? "Signed in with your secure JobReady account." : "arjun@example.com"}</p><Badge tone={production ? "success" : "info"}>{production ? "Authenticated mode" : "Local demo mode"}</Badge></Card>
      <Card className="card-pad"><SectionHeader title="Privacy controls" description={production ? "Account export and server-side deletion workflows remain a launch task." : "Your demo profile and project state are stored only in this browser."} /><div className="cluster">{!production && <Button variant="danger" onClick={clearDemoData}>Delete local demo data</Button>}<Button href="/privacy" variant="ghost">Read privacy policy</Button></div></Card>
      <Card className="card-pad" subtle><SectionHeader title="Production boundaries" /><ul className="secondary-text" style={{ marginBottom: 0, paddingLeft: 20 }}><li>Supabase Auth and row ownership policies</li><li>Private resume storage</li><li>Server-checked project entitlements</li></ul></Card>
    </div>
  </main></AppShell>;
}
