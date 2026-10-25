import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell, PageTitle } from "@/components/AppShell";
import { projects } from "@/lib/domain";
import { logisticsBackendContent } from "@/lib/project-content";
import { projectPassPriceLabel } from "@/lib/pricing";

export function generateStaticParams() {
  return projects.map((project) => ({ projectId: project.id }));
}

export default async function ProjectDetail({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = projects.find((item) => item.id === projectId);
  if (!project) notFound();

  const available = project.status === "available";

  return (
    <AppShell>
      <PageTitle
        eyebrow={project.track + " · " + project.family}
        title={project.title}
        body={project.description}
        actions={<span className={"badge " + (available ? "badge-success" : "badge-warning")}>{available ? "Available in beta" : "Planned family"}</span>}
      />

      {!available ? (
        <div className="two-col">
          <section className="card">
            <div className="eyebrow">Why it exists</div>
            <h2 style={{ margin: "10px 0 8px" }}>This project family is intentionally not open yet.</h2>
            <p className="section-copy">{project.why}</p>
            <div className="alert alert-info" style={{ marginTop: 18 }}>JobReady does not create a fake mission path just to make the catalog look larger. This family becomes available only after its missions, evidence rubric, verification approach, and defense path are validated.</div>
            <h3 style={{ marginTop: 24 }}>Planned evidence</h3>
            <div className="cluster">{project.skills.map((skill) => <span className="tag" key={skill}>{skill}</span>)}</div>
          </section>
          <aside className="card card-soft">
            <div className="eyebrow">Planned architecture</div>
            <div className="evidence-list">{(project.architecture ?? []).map((item) => <div className="evidence-item" key={item}><span className="evidence-icon">→</span><span>{item}</span></div>)}</div>
            <hr className="divider" />
            <p className="small muted">Target role: <strong>{project.targetRole}</strong></p>
            <p className="small muted">Expected effort: <strong>{project.duration}</strong></p>
            <p className="small muted">Verification: <strong>{project.verificationLabel}</strong></p>
            <Link className="btn btn-secondary" href="/projects">← Back to catalog</Link>
          </aside>
        </div>
      ) : (
        <>
          <div className="two-col">
            <div className="stack">
              <section className="card">
                <div className="eyebrow">Professional project brief</div>
                <h2 style={{ margin: "10px 0 8px" }}>Business / product problem</h2>
                <p className="section-copy">{logisticsBackendContent.problemStatement}</p>

                <div className="metrics-grid" style={{ marginTop: 22 }}>
                  <div className="metric-card"><div className="metric-label">Target role</div><strong>{project.targetRole}</strong></div>
                  <div className="metric-card"><div className="metric-label">Difficulty</div><strong>{project.difficulty}</strong></div>
                  <div className="metric-card"><div className="metric-label">Estimated effort</div><strong>{project.duration}</strong></div>
                </div>

                <h3 style={{ marginTop: 26 }}>Why this project matters</h3>
                <p className="section-copy">{project.why}</p>

                <h3 style={{ marginTop: 24 }}>Evidence you are expected to create</h3>
                <div className="cluster">{project.gaps.map((gap) => <span className="badge badge-warm" key={gap}>{gap}</span>)}</div>

                <h3 style={{ marginTop: 24 }}>Skills demonstrated</h3>
                <div className="cluster">{project.skills.map((skill) => <span className="tag" key={skill}>{skill}</span>)}</div>
              </section>

              <section className="card">
                <div className="eyebrow">Architecture overview</div>
                <h2 style={{ margin: "10px 0 8px" }}>A system you can explain, not just run.</h2>
                <div className="evidence-list">{(project.architecture ?? []).map((item, index) => <div className="evidence-item" key={item}><span className="evidence-icon">{index + 1}</span><span>{item}</span></div>)}</div>
                <h3 style={{ marginTop: 24 }}>Prerequisites</h3>
                <ul className="section-copy">{(project.prerequisites ?? []).map((item) => <li key={item}>{item}</li>)}</ul>
              </section>

              <section className="card">
                <div className="eyebrow">Verification approach</div>
                <h2 style={{ margin: "10px 0 8px" }}>Prove behavior, not attendance.</h2>
                <p className="section-copy">The current beta uses a structured rubric, mission acceptance criteria, artifact checks, deployment evidence, and project-defense preparation. Hidden automated verifier architecture exists, but the product does not pretend an automated check passed when execution infrastructure is not active.</p>
                <div className="three-col" style={{ marginTop: 18 }}>
                  {[
                    ["Implementation", "API behavior, data model, authorization, and business rules."],
                    ["Production evidence", "Tests, safe configuration, Docker, deployment runbook, and health behavior."],
                    ["Defense", "Explain architecture, failures, trade-offs, and next improvements from your own work."],
                  ].map(([title, body]) => <div className="metric-card" key={title}><strong>{title}</strong><p className="small muted">{body}</p></div>)}
                </div>
              </section>
            </div>

            <aside className="stack">
              <section className="card card-dark">
                <div className="eyebrow" style={{ color: "#ffb495" }}>Expected portfolio outcome</div>
                <h2 style={{ fontSize: 25, margin: "10px 0" }}>{project.outcome}</h2>
                <p className="muted small">Deployment is required. You should finish with repository evidence, a deployment/runbook, tests, architecture notes, and a clear defense story.</p>
                <Link href={"/projects/" + project.id + "/missions/m1"} className="btn btn-primary" style={{ width: "100%", marginTop: 10 }}>Start Mission 1 free →</Link>
              </section>

              <section className="card">
                <div className="eyebrow">Project Pass</div>
                <div className="split" style={{ marginTop: 8 }}><strong style={{ fontSize: 30 }}>{projectPassPriceLabel}</strong><span className="badge badge-muted">after Mission 1</span></div>
                <p className="small muted">Unlocks the full mission sequence, progressive hints, progress tracking, verification guidance, deployment guidance, and project-defense preparation. Production checkout remains disabled until Razorpay is configured and verified.</p>
              </section>

              <section className="card">
                <div className="eyebrow">Interview signal</div>
                <h3 style={{ margin: "10px 0 7px" }}>What this should let you defend</h3>
                <div className="evidence-list">
                  {["Why you chose the data model", "How ownership and authorization work", "Which failures your tests cover", "How you package and deploy the service", "What you would change at larger scale"].map((item) => <div className="evidence-item" key={item}><span className="evidence-icon">?</span><span>{item}</span></div>)}
                </div>
              </section>
            </aside>
          </div>

          <section className="card" style={{ marginTop: 18 }}>
            <div className="split mobile-stack"><div><div className="eyebrow">Mission path</div><h2 style={{ margin: "8px 0 0" }}>Twelve steps from scope to project defense</h2></div><span className="badge badge-muted">{project.missions.length} missions</span></div>
            <div style={{ marginTop: 18 }}>
              {project.missions.map((mission, index) => (
                <div key={mission.id} className="split mobile-stack" style={{ padding: "15px 0", borderTop: "1px solid var(--line)" }}>
                  <div className="cluster" style={{ alignItems: "flex-start" }}>
                    <span className="evidence-icon">{index + 1}</span>
                    <div><strong>{mission.title}</strong><span className="small muted" style={{ display: "block", marginTop: 4 }}>{mission.time} · {mission.free ? "Free" : "Project Pass"}</span></div>
                  </div>
                  <Link href={"/projects/" + project.id + "/missions/" + mission.id} className="btn btn-secondary">{mission.free ? "Start" : "View mission"}</Link>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </AppShell>
  );
}
