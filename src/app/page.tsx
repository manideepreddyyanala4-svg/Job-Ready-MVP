import Link from "next/link";
import { projectPassPriceLabel } from "@/lib/pricing";

const steps = [
  ["01", "Upload your resume", "Start from the evidence already visible in your profile."],
  ["02", "Choose a direction", "Focus the analysis on the roles you actually want to explore."],
  ["03", "See the evidence gaps", "Separate missing knowledge from knowledge that simply is not proven yet."],
  ["04", "Build the right project", "Work through a controlled end-to-end project designed around those gaps."],
  ["05", "Verify the work", "Use acceptance criteria, tests, artifacts, and deployment checks instead of a completion badge."],
  ["06", "Defend it", "Practice explaining your architecture, failures, trade-offs, and next improvements."],
];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <div className="container site-header-inner">
          <Link href="/" className="site-logo"><span className="brand-mark" aria-hidden="true" />JobReady</Link>
          <nav className="site-nav" aria-label="Public navigation">
            <a href="#how">How it works</a>
            <a href="#difference">Why it is different</a>
            <a href="#pricing">Beta pricing</a>
            <Link className="btn btn-dark" href="/login">Get started</Link>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="eyebrow">For internships and fresher technical roles</div>
            <h1>Don&apos;t build random projects. <em>Build the evidence</em> your target job is missing.</h1>
            <p className="hero-copy">
              Upload your resume, see what your target roles require, identify what your profile does not prove yet, and build an end-to-end project designed to close those gaps.
            </p>
            <div className="cluster actions" style={{ marginTop: 28 }}>
              <Link className="btn btn-primary" href="/login">Check my readiness →</Link>
              <a className="btn btn-secondary" href="#how">See the mechanism</a>
            </div>
            <p className="hero-note">A readiness score describes visible profile evidence. It is not a probability of getting hired.</p>
          </div>

          <div className="card product-preview" aria-label="Sample JobReady readiness report">
            <div className="preview-window">
              <div className="preview-bar"><span className="preview-dot" /><span className="preview-dot" /><span className="preview-dot" /><span className="small muted" style={{ marginLeft: 6 }}>Sample product view</span></div>
              <div className="preview-body">
                <div className="eyebrow">Profile readiness</div>
                <div className="preview-score" style={{ marginTop: 12 }}>
                  <div className="preview-score-number">58</div>
                  <div>
                    <strong style={{ display: "block", fontSize: 18 }}>Developing evidence</strong>
                    <p className="small muted" style={{ marginBottom: 0 }}>Good technical foundations. Production proof is the biggest gap.</p>
                  </div>
                </div>
                <div style={{ marginTop: 20 }}>
                  <div className="preview-row"><span>Strong evidence</span><strong>Python · SQL · Git</strong></div>
                  <div className="preview-row"><span>Partial evidence</span><strong>API design</strong></div>
                  <div className="preview-row"><span>Not evidenced yet</span><strong>Testing · Docker</strong></div>
                  <div className="preview-row"><span>Best next project</span><strong>Logistics backend</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="difference" className="marketing-section alt">
        <div className="container">
          <div className="eyebrow">The distinction that matters</div>
          <h2 className="display section-title" style={{ color: "white", maxWidth: 680 }}>Knowing a skill and proving a skill are not the same thing.</h2>
          <p className="section-copy">A resume can fail to show evidence even when the student has learned the topic. JobReady keeps those two situations separate instead of turning every missing keyword into a knowledge deficit.</p>
          <div className="three-col" style={{ marginTop: 34 }}>
            <div className="card compare-card" style={{ background: "#123f51", borderColor: "#365b69" }}>
              <span className="badge badge-dark">Missing knowledge</span>
              <h3>You likely need to learn or practice the concept.</h3>
              <p className="small" style={{ color: "#bfd0d4" }}>Example: you cannot explain basic SQL joins and have no related work to inspect.</p>
            </div>
            <div className="card compare-card" style={{ background: "#123f51", borderColor: "#365b69" }}>
              <span className="badge badge-dark">Missing evidence</span>
              <h3>You may know it, but your profile does not prove it.</h3>
              <p className="small" style={{ color: "#bfd0d4" }}>Example: Python is listed, but there is no tested or deployed Python system a reviewer can inspect.</p>
            </div>
            <div className="card compare-card" style={{ background: "#123f51", borderColor: "#365b69" }}>
              <span className="badge badge-dark">JobReady&apos;s job</span>
              <h3>Turn the highest-value gaps into inspectable work.</h3>
              <p className="small" style={{ color: "#bfd0d4" }}>The project is selected because of the evidence it creates—not because it is trendy.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="marketing-section">
        <div className="container">
          <div className="eyebrow">Resume → evidence → project → defense</div>
          <h2 className="display section-title">A career loop that ends in proof.</h2>
          <p className="section-copy">JobReady is not another course catalog. The product starts from your current profile and works backward from the evidence your target role expects.</p>
          <div className="three-col" style={{ marginTop: 34 }}>
            {steps.map(([number, title, body]) => (
              <div className="step-card" key={number}>
                <div className="step-number">{number}</div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="marketing-section" style={{ paddingTop: 16 }}>
        <div className="container two-col">
          <div className="card">
            <div className="eyebrow">Example student journey</div>
            <h2 className="display section-title" style={{ fontSize: 34 }}>From “I know Flask” to evidence a reviewer can inspect.</h2>
            <div className="evidence-list">
              {[
                "Resume shows Python, SQL, Flask, and Git.",
                "Backend role fit is reasonable, but testing, authorization, Docker, and deployment are weak or missing.",
                "JobReady recommends a production backend project because one project can close several high-priority gaps together.",
                "The student works through scoped missions, produces artifacts, tests failure cases, documents trade-offs, and prepares to defend the project.",
              ].map((item, index) => <div className="evidence-item" key={item}><span className="evidence-icon">{index + 1}</span><span>{item}</span></div>)}
            </div>
          </div>
          <div className="card card-soft">
            <div className="eyebrow">What the project experience emphasizes</div>
            <h3 style={{ fontSize: 24, margin: "12px 0" }}>Build decisions, not copy-paste completion.</h3>
            <div className="evidence-list">
              {["Clear mission objective and why it matters", "Acceptance criteria and concrete deliverables", "Progressive hints instead of immediate full solutions", "Testing, deployment, and failure-path thinking", "Project-defense questions tied to your implementation"].map((item) => <div className="evidence-item" key={item}><span className="evidence-icon">✓</span><span>{item}</span></div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="marketing-section alt">
        <div className="container">
          <div className="eyebrow">Current beta scope</div>
          <h2 className="display section-title" style={{ color: "white" }}>Three role directions. One fully validated project path first.</h2>
          <p className="section-copy">The architecture supports more tracks later, but JobReady does not advertise project inventory that has not been designed and validated.</p>
          <div className="three-col" style={{ marginTop: 30 }}>
            {[
              ["Backend / Software Engineer", "Available", "Production backend evidence is the first complete project path."],
              ["Data Analyst", "Role analysis", "Role fit and gaps are supported; the full controlled project path is still being validated."],
              ["AI / ML Engineer", "Role analysis", "Role fit and gaps are supported; the full controlled project path is still being validated."],
            ].map(([role, status, body]) => <div className="card" key={role} style={{ background: "#123f51", borderColor: "#365b69" }}><span className="badge badge-dark">{status}</span><h3>{role}</h3><p className="small" style={{ color: "#bfd0d4" }}>{body}</p></div>)}
          </div>
        </div>
      </section>

      <section id="pricing" className="marketing-section">
        <div className="container two-col">
          <div>
            <div className="eyebrow">Beta pricing philosophy</div>
            <h2 className="display section-title">Mission 1 is free. The paid value is the structured execution layer.</h2>
            <p className="section-copy">There are no fake discounts, countdown timers, or promises that paying produces a job. Real checkout remains disabled until the payment and entitlement path is verified end to end.</p>
          </div>
          <div className="card card-warm">
            <div className="split">
              <div><div className="eyebrow">Project Pass</div><strong style={{ fontSize: 34, letterSpacing: "-.04em" }}>{projectPassPriceLabel}</strong></div>
              <span className="badge badge-warm">One-time beta price</span>
            </div>
            <hr className="divider" />
            <div className="evidence-list">
              {["Full mission sequence", "Progressive hints", "Acceptance and verification guidance", "Deployment guidance", "Project-defense preparation", "Progress tracking"].map((item) => <div className="evidence-item" key={item}><span className="evidence-icon">✓</span><span>{item}</span></div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="marketing-section" style={{ paddingTop: 14 }}>
        <div className="container">
          <div className="eyebrow">Questions before you upload</div>
          <h2 className="display section-title">FAQ</h2>
          <div className="faq" style={{ marginTop: 24 }}>
            <details><summary>Does the readiness score predict whether I will get hired?</summary><p>No. It is an explainable profile-readiness score based on evidence visible in the structured profile. Hiring decisions depend on many factors JobReady cannot know.</p></details>
            <details><summary>Does “missing” mean I do not know the skill?</summary><p>No. “Missing evidence” means your current profile does not prove it. JobReady avoids converting a missing resume mention into a claim about your knowledge.</p></details>
            <details><summary>Will JobReady generate hundreds of projects for me?</summary><p>No. Project families are controlled and validated. The catalog is designed to scale, but unfinished projects are shown as planned rather than pretending they are ready.</p></details>
            <details><summary>What happens to my resume?</summary><p>In production mode, resumes are stored in a private user-scoped bucket. The product stores structured evidence for analysis and does not send raw resume text to analytics.</p></details>
          </div>
          <div className="card card-dark" style={{ marginTop: 46 }}>
            <div className="two-col" style={{ alignItems: "center" }}>
              <div><div className="eyebrow" style={{ color: "#ffb495" }}>Start with evidence</div><h2 className="display" style={{ fontSize: 36, margin: "8px 0 10px" }}>Find the highest-value thing to prove next.</h2><p className="muted" style={{ margin: 0 }}>Your first useful output should be clarity, not another course recommendation.</p></div>
              <div style={{ justifySelf: "end" }}><Link className="btn btn-primary" href="/login">Check my readiness →</Link></div>
            </div>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container site-footer-inner">
          <span>© 2026 JobReady</span>
          <span className="cluster"><Link href="/privacy">Privacy</Link><span>·</span><Link href="/terms">Terms</Link><span>·</span><Link href="/login">Sign in</Link></span>
        </div>
      </footer>
    </main>
  );
}
