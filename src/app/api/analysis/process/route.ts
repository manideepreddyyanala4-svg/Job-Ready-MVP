import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { gapsFromResume, readinessScoreFromResume, roleScoreFromResume, roles, type RoleId } from "@/lib/domain";
import { recommendProjects } from "@/lib/recommendations";
import type { StructuredResume } from "@/lib/resume";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

const roleUuid: Record<RoleId, string> = {
  backend: "00000000-0000-0000-0000-000000000001",
  analyst: "00000000-0000-0000-0000-000000000002",
  ml: "00000000-0000-0000-0000-000000000003",
};

const roleNameToId: Record<string, RoleId> = {
  "Backend / Software Engineer": "backend",
  "Data Analyst": "analyst",
  "AI / ML Engineer": "ml",
};

const gapSkillSlug: Record<string, string> = {
  "Production API design": "rest-apis",
  "Docker & deployment": "deployment",
  "Automated testing": "testing",
  "SQL & data handling": "sql",
  "Git workflow": "git",
  "System design basics": "system-design",
  "Dashboard / visualization": "visualization",
  "Statistics": "statistics",
  "Business communication": "business-thinking",
  "Reproducible analysis": "git",
  "ML foundations": "ml-fundamentals",
  "Evaluation": "evaluation",
  "API serving": "apis",
  "Deployment": "deployment",
  "Git / proof of work": "git",
};

export async function POST(request: Request) {
  const auth = await requireAuthenticatedUser();
  const admin = getSupabaseAdminClient();
  if (auth.error || !auth.client || !admin) {
    return NextResponse.json({ ok: false, message: auth.error ?? "Production database is not configured." }, { status: 401 });
  }

  const body = await request.json().catch(() => null) as { resumeParseId?: string } | null;
  if (!body?.resumeParseId) return NextResponse.json({ ok: false, message: "A parsed resume is required." }, { status: 422 });

  const { data: parse, error: parseError } = await admin
    .from("resume_parses")
    .select("structured_resume")
    .eq("id", body.resumeParseId)
    .eq("user_id", auth.user!.id)
    .single();
  if (parseError || !parse?.structured_resume) {
    return NextResponse.json({ ok: false, message: "The requested resume parse was not found." }, { status: 404 });
  }

  const resume = parse.structured_resume as StructuredResume;
  const score = readinessScoreFromResume(resume);

  let profileRoles: string[] = [];
  const multiRole = await auth.client.from("profiles").select("target_roles, target_role").eq("id", auth.user!.id).maybeSingle();
  if (!multiRole.error) {
    profileRoles = (multiRole.data?.target_roles as string[] | null) ?? (multiRole.data?.target_role ? [multiRole.data.target_role] : []);
  } else {
    const legacy = await auth.client.from("profiles").select("target_role").eq("id", auth.user!.id).maybeSingle();
    profileRoles = legacy.data?.target_role ? [legacy.data.target_role] : [];
  }
  const preferredRoles = profileRoles.flatMap((role) => roleNameToId[role] ? [roleNameToId[role]] : []);
  const primaryRole: RoleId = preferredRoles[0] ?? "backend";

  const { data: readiness, error: readinessError } = await admin.from("readiness_scores").insert({
    user_id: auth.user!.id,
    resume_parse_id: body.resumeParseId,
    scoring_version: "v2",
    score: score.total,
    breakdown: score.categories,
  }).select("id").single();
  if (readinessError) return NextResponse.json({ ok: false, message: "Readiness analysis could not be saved." }, { status: 502 });

  const roleRows = roles.map((role) => ({
    user_id: auth.user!.id,
    role_id: roleUuid[role.id],
    scoring_version: "v2",
    score: roleScoreFromResume(role.id, resume),
    evidence: { skills: resume.skills, projects: resume.projects, links: resume.links },
  }));
  const { error: roleError } = await admin.from("student_role_matches").upsert(roleRows, { onConflict: "user_id,role_id,scoring_version" });
  if (roleError) return NextResponse.json({ ok: false, message: "Role matches could not be saved." }, { status: 502 });

  const gaps = gapsFromResume(resume, primaryRole);
  const skillSlugs = [...new Set(gaps.map((gap) => gapSkillSlug[gap.label]).filter(Boolean))];
  const { data: skillRows } = await admin.from("skills").select("id, slug").in("slug", skillSlugs);
  const skillBySlug = new Map((skillRows ?? []).map((skill) => [skill.slug, skill.id]));

  await admin.from("student_skill_gaps").delete().eq("user_id", auth.user!.id).eq("scoring_version", "v2");
  const gapRows = gaps.map((gap) => ({
    user_id: auth.user!.id,
    role_id: roleUuid[primaryRole],
    skill_id: skillBySlug.get(gapSkillSlug[gap.label]) ?? null,
    classification: gap.state,
    priority: gap.priority === "High" ? 5 : gap.priority === "Medium" ? 3 : 1,
    scoring_version: "v2",
  }));
  const { error: gapError } = await admin.from("student_skill_gaps").insert(gapRows);
  if (gapError) return NextResponse.json({ ok: false, message: "Skill gaps could not be saved." }, { status: 502 });

  const recommendations = recommendProjects({
    skills: resume.skills,
    projects: resume.projects,
    links: resume.links,
    preferredRoles: preferredRoles.length ? preferredRoles : ["backend"],
  });
  await admin.from("project_recommendations").delete().eq("user_id", auth.user!.id).eq("scoring_version", "v2");

  const slugs = recommendations.map((item) => item.project.id);
  const { data: variants } = slugs.length
    ? await admin.from("project_variants").select("id, slug").in("slug", slugs)
    : { data: [] as Array<{ id: string; slug: string }> };
  const variantBySlug = new Map((variants ?? []).map((variant) => [variant.slug, variant.id]));
  const recommendationRows = recommendations.flatMap((recommendation) => {
    const variantId = variantBySlug.get(recommendation.project.id);
    return variantId ? [{
      user_id: auth.user!.id,
      variant_id: variantId,
      scoring_version: "v2",
      score: recommendation.recommendationScore,
      explanation: { domain: recommendation.domain, text: recommendation.explanation },
    }] : [];
  });
  if (recommendationRows.length) {
    const { error: recommendationError } = await admin.from("project_recommendations").insert(recommendationRows);
    if (recommendationError) return NextResponse.json({ ok: false, message: "Project recommendations could not be saved." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, readinessId: readiness.id, score });
}
