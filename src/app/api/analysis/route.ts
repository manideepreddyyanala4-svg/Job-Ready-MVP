import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";

export async function GET() {
  const auth = await requireAuthenticatedUser();
  if (auth.error || !auth.client) {
    return NextResponse.json({ ok: false, message: auth.error ?? "Authentication is required." }, { status: 401 });
  }

  const [readiness, roles, gaps, recommendations, parse] = await Promise.all([
    auth.client.from("readiness_scores").select("id, score, breakdown, scoring_version, created_at").eq("user_id", auth.user!.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    auth.client.from("student_role_matches").select("score, scoring_version, roles!inner(id, slug, name, description)").eq("user_id", auth.user!.id).eq("scoring_version", "v1").order("score", { ascending: false }),
    auth.client.from("student_skill_gaps").select("classification, priority, scoring_version, skills(name, slug)").eq("user_id", auth.user!.id).eq("scoring_version", "v1").order("priority", { ascending: false }),
    auth.client.from("project_recommendations").select("score, scoring_version, explanation, project_variants!inner(slug, definition, project_families(name, slug))").eq("user_id", auth.user!.id).eq("scoring_version", "v1").order("score", { ascending: false }),
    auth.client.from("resume_parses").select("id, structured_resume, created_at").eq("user_id", auth.user!.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);

  const failed = [readiness, roles, gaps, recommendations, parse].find((result) => result.error);
  if (failed?.error) return NextResponse.json({ ok: false, message: "Persisted analysis could not be loaded." }, { status: 502 });
  return NextResponse.json({
    ok: true,
    readiness: readiness.data,
    roles: roles.data ?? [],
    gaps: gaps.data ?? [],
    recommendations: recommendations.data ?? [],
    resume: parse.data?.structured_resume ?? null,
  });
}
