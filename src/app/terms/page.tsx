import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Terms", robots: { index: true, follow: true } };

export default function Terms() {
  return (
    <main className="narrow" style={{ padding: "44px 0 80px" }}>
      <Link href="/" className="site-logo"><span className="brand-mark" aria-hidden="true" />JobReady</Link>
      <div style={{ marginTop: 52 }}>
        <div className="eyebrow">Terms of use</div>
        <h1 className="page-title">JobReady provides career-readiness tools—not employment guarantees.</h1>
        <p className="page-lede">These private-beta terms explain the intended product boundaries in plain language. Final public-launch terms should be reviewed for the jurisdictions in which the product operates.</p>
      </div>

      <div className="stack" style={{ marginTop: 38 }}>
        <section className="card"><h2>Readiness and role fit</h2><p className="section-copy">Scores describe evidence visible in the information JobReady can parse and evaluate. They are not predictions of interview invitations, offers, salary, or employment probability.</p></section>
        <section className="card"><h2>Resume parsing can be incomplete</h2><p className="section-copy">Students are responsible for reviewing their source documents and project work. A missing item can mean the parser did not detect it, not that the student does not know it.</p></section>
        <section className="card"><h2>Project work remains the student&apos;s responsibility</h2><p className="section-copy">Missions, hints, starter materials, and acceptance criteria are learning and execution guidance. Students must understand, adapt, test, and defend the work they submit or present.</p></section>
        <section className="card"><h2>Project Pass</h2><p className="section-copy">Paid access, when enabled, unlocks the stated project workspace features. Payment does not buy an internship, job, certificate of employability, recruiter referral, or guaranteed outcome.</p></section>
        <section className="card"><h2>User-provided content</h2><p className="section-copy">Do not upload secrets, confidential employer code, copyrighted material you are not allowed to use, or credentials. Project evidence should be content you are permitted to store and share.</p></section>
        <section className="card"><h2>Beta status</h2><p className="section-copy">Features may change during private beta. Where external services such as payment processing are not configured, the product must present an honest unavailable state rather than pretending a transaction occurred.</p></section>
      </div>
      <div className="cluster" style={{ marginTop: 28 }}><Link href="/" className="btn btn-secondary">← Back home</Link><Link href="/privacy" className="btn btn-secondary">Privacy</Link></div>
    </main>
  );
}
