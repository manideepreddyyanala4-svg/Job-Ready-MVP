"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell, PageTitle } from "@/components/AppShell";

export default function Settings() {
  const router = useRouter();

  const clearDemoData = () => {
    window.localStorage.clear();
    router.push("/");
  };

  return (
    <AppShell>
      <main className="container" style={{ padding: "54px 0", maxWidth: 820 }}>
        <PageTitle
          eyebrow="Account & privacy"
          title="Your data, on your terms."
          body="This demo keeps progress in your browser. Production accounts will use user-owned Supabase records with deletion and export workflows."
        />
        <div className="grid">
          <section className="card" style={{ padding: 26 }}>
            <h2 style={{ marginTop: 0, fontSize: 22 }}>Demo account</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>arjun@example.com</p>
            <span className="tag">Local demo mode</span>
          </section>
          <section className="card" style={{ padding: 26 }}>
            <h2 style={{ marginTop: 0, fontSize: 22 }}>Privacy controls</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
              Your demo profile, onboarding marker, and project entitlement are stored only in this browser. No resume file is uploaded by the demo flow.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button type="button" className="btn btn-ghost" onClick={clearDemoData}>Delete local demo data</button>
              <Link className="btn btn-dark" href="/privacy">Read privacy policy</Link>
            </div>
          </section>
          <section className="card" style={{ padding: 26 }}>
            <h2 style={{ marginTop: 0, fontSize: 22 }}>Production readiness</h2>
            <ul style={{ color: "var(--muted)", lineHeight: 1.8, paddingLeft: 20 }}>
              <li>Supabase Auth and row ownership policies</li>
              <li>Server-side resume deletion and export request</li>
              <li>Verified Razorpay entitlements, never client-only unlocks</li>
            </ul>
          </section>
        </div>
      </main>
    </AppShell>
  );
}
