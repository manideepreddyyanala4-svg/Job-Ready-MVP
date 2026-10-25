import type { ReactNode } from "react";
import { Badge, Button, Card, ProgressBar } from "@/components/ui";

export function RoleMatchCard({ label, title, description, score, skills, href = "/gaps" }: { label: string; title: string; description: string; score: number; skills: string[]; href?: string }) {
  return <Card className="role-card"><Badge>{label}</Badge><div><h2 className="card-title">{title}</h2><p className="secondary-text" style={{ margin: "7px 0 0" }}>{description}</p></div><div className="role-score"><strong className="score-number" style={{ fontSize: 46 }}>{score}</strong><span className="muted-text">/100</span></div><div className="cluster">{skills.slice(0, 5).map((skill) => <Badge key={skill}>{skill}</Badge>)}</div><Button href={href} variant="ghost" block>See strengths & gaps →</Button></Card>;
}

export function ProjectCard({ eyebrow, title, description, skills, targetRole, score, explanation, meta, gaps, href }: { eyebrow: string; title: string; description: string; skills: string[]; targetRole: string; score?: number; explanation: string; meta: string; gaps?: string; href: string }) {
  return <Card className="project-card"><div><Badge tone="accent">{eyebrow}</Badge><h2 className="section-title" style={{ marginTop: 14 }}>{title}</h2><p className="secondary-text">{description}</p><div className="cluster">{skills.map((skill) => <Badge key={skill}>{skill}</Badge>)}</div></div><div className="project-card-aside"><div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "baseline" }}><strong>{targetRole}</strong>{typeof score === "number" && <span className="meta"><b style={{ color: "var(--text)" }}>{score}</b>/100 fit</span>}</div><p className="secondary-text" style={{ fontSize: 14 }}>{explanation}</p><p className="meta">{meta}</p>{gaps && <p className="meta">Closes: {gaps}</p>}<Button href={href} variant="secondary">Explore project →</Button></div></Card>;
}

export function MissionCard({ index, title, meta, href, action = "View", free = false, completed = false }: { index: number; title: string; meta: string; href: string; action?: string; free?: boolean; completed?: boolean }) {
  return <div className="mission-card"><div className="mission-index" aria-hidden="true">{completed ? "✓" : index}</div><div style={{ flex: 1, minWidth: 0 }}><div className="label">{title}</div><div className="meta">{meta}</div></div><Badge tone={completed ? "success" : free ? "info" : "neutral"}>{completed ? "Done" : free ? "Free" : "Pass"}</Badge><Button href={href} variant="ghost" size="sm">{action}</Button></div>;
}

export function EvidenceStatusItem({ title, detail, status, meta }: { title: string; detail: string; status: "strong" | "partial" | "missing" | "verified" | "warning" | "error"; meta?: ReactNode }) {
  const label = status === "strong" ? "Strong" : status === "partial" ? "Partial" : status === "missing" ? "Missing" : status === "verified" ? "Verified" : status === "warning" ? "Needs review" : "Blocked";
  const tone = status === "strong" || status === "verified" ? "success" : status === "partial" || status === "warning" ? "warning" : "error";
  return <div className="evidence-status"><span className="status-dot" data-status={status} aria-hidden="true" /><div><div className="label">{title}</div><div className="meta" style={{ marginTop: 3 }}>{detail}</div>{meta && <div style={{ marginTop: 7 }}>{meta}</div>}</div><Badge tone={tone}>{label}</Badge></div>;
}

export function ProjectProgressCard({ title, completed, total }: { title: string; completed: number; total: number }) {
  const progress = total ? Math.round((completed / total) * 100) : 0;
  return <Card className="card-pad"><h3 className="card-title">Project progress</h3><p className="secondary-text">{title}</p><ProgressBar value={progress} /><div className="meta" style={{ marginTop: 9 }}>{completed} of {total} missions · {progress}% complete</div></Card>;
}
