import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell, PageTitle } from "@/components/AppShell";
import { projects } from "@/lib/domain";
import { logisticsBackendContent } from "@/lib/project-content";

export function generateStaticParams() {
  return projects.map((project) => ({
    projectId: project.id,
  }));
}

export default async function ProjectDetail({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    notFound();
  }

  return (
    <AppShell>
      <main
        className="container"
        style={{ padding: "54px 0" }}
      >
        <PageTitle
          eyebrow={project.family}
          title={project.title}
          body={project.description}
        />

        <div
          className="grid"
          style={{ gridTemplateColumns: "1.1fr .9fr" }}
        >
          <div>
            <div
              className="card"
              style={{ padding: 26 }}
            >
              <h2 style={{ marginTop: 0 }}>
                Why this project?
              </h2>

              <p
                style={{
                  lineHeight: 1.65,
                  color: "var(--muted)",
                }}
              >
                {project.why}
              </p>

              <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", margin: "22px 0" }}>
                <div><div className="eyebrow">Target role</div><b>{project.targetRole ?? "Exploring"}</b></div>
                <div><div className="eyebrow">Domain</div><b>{project.domain ?? "Verified variant"}</b></div>
              </div>

              <h3>Architecture summary</h3>
              <ul style={{ lineHeight: 1.8, color: "var(--muted)" }}>
                {(project.architecture ?? ["Application layer", "Data layer", "Testing and deployment"]).map((item) => <li key={item}>{item}</li>)}
              </ul>

              <h3>Prerequisites</h3>
              <ul style={{ lineHeight: 1.8, color: "var(--muted)" }}>
                {(project.prerequisites ?? ["Basic programming", "Git fundamentals"]).map((item) => <li key={item}>{item}</li>)}
              </ul>

              <h3>Evidence you will create</h3>

              <ul
                style={{
                  lineHeight: 2,
                  color: "var(--muted)",
                }}
              >
                {project.gaps.map((gap) => (
                  <li key={gap}>{gap}</li>
                ))}
              </ul>

              {project.id === "logistics-backend" && (
                <>
                  <h3>Starter repository</h3>
                  <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
                    {logisticsBackendContent.repositoryName} gives you a constrained starting point without revealing a completed reference implementation.
                  </p>
                  <h3>Assessment rubric</h3>
                  <ul style={{ lineHeight: 1.8, color: "var(--muted)" }}>
                    {logisticsBackendContent.rubric.map((criterion) => (
                      <li key={criterion.id}>{criterion.title} · {criterion.points} points — {criterion.evidence}</li>
                    ))}
                  </ul>
                  <h3>Interview preparation</h3>
                  <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
                    The final mission uses a structured viva bank covering architecture, authorization, testing, operations, and trade-offs.
                  </p>
                </>
              )}

              <span className="tag">
                ₹499 one-time Project Pass after Mission 1
              </span>
            </div>

            <div
              className="card"
              style={{
                padding: 26,
                marginTop: 18,
              }}
            >
              <h2 style={{ marginTop: 0 }}>
                Mission path
              </h2>

              {project.missions.map((mission, index) => (
                <div
                  key={mission.id}
                  style={{
                    display: "flex",
                    gap: 14,
                    padding: "16px 0",
                    borderTop: "1px solid var(--line)",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: mission.free
                        ? "#eaf4f1"
                        : "#f4f5f3",
                      display: "grid",
                      placeItems: "center",
                      fontWeight: 700,
                    }}
                  >
                    {index + 1}
                  </div>

                  <div style={{ flex: 1 }}>
                    <b>{mission.title}</b>

                    <small
                      style={{
                        display: "block",
                        color: "var(--muted)",
                        marginTop: 4,
                      }}
                    >
                      {mission.time} ·{" "}
                      {mission.free
                        ? "Free"
                        : "Locked after Mission 1"}
                    </small>
                  </div>

                  <Link
                    href={`/projects/${project.id}/missions/${mission.id}`}
                    className="btn btn-ghost"
                    style={{ padding: "8px 13px" }}
                  >
                    {mission.free ? "Start" : "View"}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <aside
            className="card"
            style={{
              padding: 26,
              height: "fit-content",
            }}
          >
            <div className="eyebrow">
              Portfolio outcome
            </div>

            <h2 style={{ fontSize: 26 }}>
              {project.outcome}
            </h2>

            <div
              style={{
                height: 1,
                background: "var(--line)",
                margin: "22px 0",
              }}
            />

            <p
              style={{
                color: "var(--muted)",
                fontSize: 14,
              }}
            >
              Designed for {project.duration} at{" "}
              {project.difficulty} difficulty.
            </p>

            <Link
              href={`/projects/${project.id}/missions/m1`}
              className="btn btn-primary"
              style={{
                width: "100%",
                marginTop: 12,
              }}
            >
              Start Mission 1 free →
            </Link>
          </aside>
        </div>
      </main>
    </AppShell>
  );
}
