import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Privacy", robots: { index: true, follow: true } };

export default function Privacy() {
  return (
    <main className="narrow" style={{ padding: "44px 0 80px" }}>
      <Link href="/" className="site-logo"><span className="brand-mark" aria-hidden="true" />JobReady</Link>
      <div style={{ marginTop: 52 }}>
        <div className="eyebrow">Privacy</div>
        <h1 className="page-title">Your career data should stay understandable and controlled.</h1>
        <p className="page-lede">This page describes the private-beta data model in plain language. It is not a substitute for jurisdiction-specific legal advice.</p>
      </div>

      <div className="stack" style={{ marginTop: 38 }}>
        <section className="card"><h2>What JobReady uses</h2><p className="section-copy">We use the profile details, career preferences, resume file, and structured resume evidence you choose to provide so we can generate readiness analysis, role matches, evidence gaps, project recommendations, and progress state.</p></section>
        <section className="card"><h2>Resume handling</h2><p className="section-copy">In production mode, resume PDFs are stored in a private user-scoped Supabase Storage bucket. The application stores a structured parse for analysis. Current parsing is deterministic and can miss information; scanned/image-only PDFs are not supported yet.</p></section>
        <section className="card"><h2>What is not sent to analytics</h2><p className="section-copy">Funnel analytics may contain event names and non-sensitive product context. Raw resume text, uploaded resume files, credentials, private project code, and secret values must not be sent as analytics properties.</p></section>
        <section className="card"><h2>Payments and access</h2><p className="section-copy">A payment record and a Project Pass entitlement are separate server-side records. Client state, a URL parameter, or localStorage cannot grant production paid access.</p></section>
        <section className="card"><h2>Delete or replace your data</h2><p className="section-copy">Authenticated users can replace or remove their current resume. Settings also provides an account-deletion request workflow for the private beta. Some operational records may need to be retained when legally required; any such retention should be documented before public launch.</p></section>
        <section className="card"><h2>No resume marketplace</h2><p className="section-copy">JobReady does not sell resumes, publish student resumes to recruiters by default, or claim a missing keyword proves that a student lacks a skill.</p></section>
      </div>
      <div className="cluster" style={{ marginTop: 28 }}><Link href="/" className="btn btn-secondary">← Back home</Link><Link href="/terms" className="btn btn-secondary">Terms</Link></div>
    </main>
  );
}
