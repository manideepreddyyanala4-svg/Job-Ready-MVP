import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { gapsFromResume, readinessScoreFromResume, roleScoreFromResume, roles } from "@/lib/domain";
import { recommendProjects } from "@/lib/recommendations";
import type { StructuredResume } from "@/lib/resume";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const auth = await requireAuthenticatedUser();
  const admin = getSupabaseAdminClient();
  if (auth.error || !auth.client || !admin) return NextResponse.json({ ok: false, message: auth.error ?? "Production database is not configured." }, { status: 401 });
  const body = await request.json().catch(() => null) as { resumeParseId?: string } | null;
  if (!body?.resumeParseId) return NextResponse.json({ ok: false, message: "A parsed resume is required." }, { status: 422 });
  const { data: parse, error: parseError } = await admin
    .from("resume_parses")
    .select("structured_resume")
    .eq("id", body.resumeParseId)
    .eq("user_id", auth.user!.id)
    .single();
  if (parseError || !parse?.structured_resume) return NextResponse.json({ ok: false, message: "The requested resume parse was not found." }, { status: 404 });
  const resume = parse.structured_resume as StructuredResume;
  const score = readinessScoreFromResume(resume);
  const { data: readiness, error: readinessError } = await admin.from("readiness_scores").insert({
    user_id: auth.user!.id,
    resume_parse_id: body.resumeParseId,
    scoring_version: "v1",
    score: score.total,
    breakdown: score.categories,
  }).select("id").single();
  if (readinessError) return NextResponse.json({ ok: false, message: "Readiness analysis could not be saved." }, { status: 502 });

  const roleRows = roles.map((role) => ({
    user_id: auth.user!.id,
    role_id: role.id === "backend" ? "00000000-0000-0000-0000-000000000001" : role.id === "analyst" ? "00000000-0000-0000-0000-000000000002" : "00000000-0000-0000-0000-000000000003",
    scoring_version: "v1",
    score: roleScoreFromResume(role.id, resume),
    evidence: { skills: resume.skills, projects: resume.projects, links: resume.links },
  }));
  const { error: roleError } = await admin.from("student_role_matches").upsert(roleRows);
  if (roleError) return NextResponse.json({ ok: false, message: "Role matches could not be saved." }, { status: 502 });

  const gaps = gapsFromResume(resume);
  const gapRows = gaps.map((gap) => ({
    user_id: auth.user!.id,
    role_id: "00000000-0000-0000-0000-000000000001",
    classification: gap.state,
    priority: gap.priority === "High" ? 5 : gap.priority === "Medium" ? 3 : 1,
    scoring_version: "v1",
  }));
  const { error: gapError } = await admin.from("student_skill_gaps").insert(gapRows);
  if (gapError) return NextResponse.json({ ok: false, message: "Skill gaps could not be saved." }, { status: 502 });

  const recommendations = recommendProjects({ skills: resume.skills, projects: resume.projects, links: resume.links, preferredRoles: ["backend", "analyst", "ml"] });
  const variantSlugs = ["logistics-backend", "retail-analytics", "document-intelligence"];
  const { data: variants } = await admin.from("project_variants").select("id, slug").in("slug", variantSlugs);
  const variantBySlug = new Map((variants ?? []).map((variant) => [variant.slug, variant.id]));
  const recommendationRows = recommendations.flatMap((recommendation) => {
    const slug = recommendation.project.id;
    const variantId = variantBySlug.get(slug);
    return variantId ? [{ user_id: auth.user!.id, variant_id: variantId, scoring_version: "v1", score: recommendation.recommendationScore, explanation: { domain: recommendation.domain, text: recommendation.explanation } }] : [];
  });
  if (recommendationRows.length) {
    const { error: recommendationError } = await admin.from("project_recommendations").insert(recommendationRows);
    if (recommendationError) return NextResponse.json({ ok: false, message: "Project recommendations could not be saved." }, { status: 502 });
  }
  return NextResponse.json({ ok: true, readinessId: readiness.id, score });
}
