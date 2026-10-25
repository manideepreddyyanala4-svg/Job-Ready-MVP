import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Badge, Breadcrumb, Button, Card, PageHeader, SectionHeader } from "@/components/ui";
import { MissionCard } from "@/components/domain-ui";
import { projects } from "@/lib/domain";
import { logisticsBackendContent } from "@/lib/project-content";

export function generateStaticParams() { return projects.map((project) => ({ projectId: project.id })); }

export default async function ProjectDetail({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = projects.find((item) => item.id === projectId);
  if (!project) notFound();

  return <AppShell><main className="app-page"><Breadcrumb items={[{ label: "Projects", href: "/projects" }, { label: project.title }]} /><PageHeader eyebrow={project.family} title={project.title} description={project.description} actions={<Button href={`/projects/${project.id}/missions/m1`}>Start Mission 1 free →</Button>} />
    <div className="grid" style={{ gridTemplateColumns: "minmax(0, 1.25fr) minmax(280px, .75fr)" }}>
      <div className="stack">
        <Card className="card-pad"><SectionHeader title="Why this project?" /><p className="secondary-text">{project.why}</p><div className="grid" style={{ gridTemplateColumns: "1fr 1fr", margin: "22px 0" }}><div><div className="eyebrow">Target role</div><strong>{project.targetRole ?? "Exploring"}</strong></div><div><div className="eyebrow">Domain</div><strong>{project.domain ?? "Verified variant"}</strong></div></div><h3 className="card-title">Architecture summary</h3><ul className="secondary-text" style={{ lineHeight: 1.8 }}>{(project.architecture ?? ["Application layer", "Data layer", "Testing and deployment"]).map((item) => <li key={item}>{item}</li>)}</ul><h3 className="card-title">Prerequisites</h3><ul className="secondary-text" style={{ lineHeight: 1.8 }}>{(project.prerequisites ?? ["Basic programming", "Git fundamentals"]).map((item) => <li key={item}>{item}</li>)}</ul><h3 className="card-title">Evidence you will create</h3><div className="cluster" style={{ marginTop: 10 }}>{project.gaps.map((gap) => <Badge key={gap} tone="info">{gap}</Badge>)}</div>{project.id === "logistics-backend" && <div style={{ marginTop: 26 }}><h3 className="card-title">Starter repository</h3><p className="secondary-text">{logisticsBackendContent.repositoryName} gives you a constrained starting point without revealing a completed reference implementation.</p><h3 className="card-title">Assessment rubric</h3><ul className="secondary-text" style={{ lineHeight: 1.8 }}>{logisticsBackendContent.rubric.map((criterion) => <li key={criterion.id}><b style={{ color: "var(--text)" }}>{criterion.title}</b> · {criterion.points} points — {criterion.evidence}</li>)}</ul><h3 className="card-title">Interview preparation</h3><p className="secondary-text">The final mission uses a structured viva bank covering architecture, authorization, testing, operations, and trade-offs.</p></div>}<div style={{ marginTop: 22 }}><Badge tone="warning">₹499 one-time Project Pass after Mission 1</Badge></div></Card>
        <Card className="card-pad"><SectionHeader title="Mission path" description="Move from problem framing to a project you can explain in an interview." /><div>{project.missions.map((mission, index) => <MissionCard key={mission.id} index={index + 1} title={mission.title} meta={`${mission.time} · ${mission.free ? "Free" : "Locked after Mission 1"}`} free={Boolean(mission.free)} href={`/projects/${project.id}/missions/${mission.id}`} action={mission.free ? "Start" : "View"} />)}</div></Card>
      </div>
      <aside><Card className="card-pad"><div className="eyebrow">Portfolio outcome</div><h2 className="section-title" style={{ marginTop: 10 }}>{project.outcome}</h2><p className="secondary-text">Designed for {project.duration} at {project.difficulty} difficulty.</p><Button href={`/projects/${project.id}/missions/m1`} block>Start Mission 1 free →</Button></Card></aside>
    </div>
  </main></AppShell>;
}
