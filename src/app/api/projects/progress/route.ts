import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { projectRegistryEntry } from "@/lib/project-registry";

export async function GET(request: Request) {
  const auth = await requireAuthenticatedUser();
  if (auth.error || !auth.client) {
    return NextResponse.json({ ok: false, message: auth.error ?? "Authentication is required." }, { status: 401 });
  }
  const projectId = new URL(request.url).searchParams.get("projectId");
  const registry = projectId ? projectRegistryEntry(projectId) : undefined;
  if (!registry) return NextResponse.json({ ok: false, message: "Unknown project." }, { status: 400 });

  const { data: enrollment } = await auth.client
    .from("project_enrollments")
    .select("id")
    .eq("user_id", auth.user!.id)
    .eq("variant_id", registry.variantId)
    .maybeSingle();

  if (!enrollment) return NextResponse.json({ ok: true, enrolled: false, progress: [] });

  const { data, error } = await auth.client
    .from("mission_progress")
    .select("mission_id, completed_at, hint_usage, project_missions!inner(definition)")
    .eq("user_id", auth.user!.id)
    .eq("enrollment_id", enrollment.id);

  if (error) return NextResponse.json({ ok: false, message: "Project progress could not be loaded." }, { status: 502 });

  const progress = (data ?? []).map((row) => ({
    mission_id: (row.project_missions as unknown as { definition?: { id?: string } } | null)?.definition?.id ?? row.mission_id,
    completed_at: row.completed_at,
    hint_usage: row.hint_usage,
  }));
  return NextResponse.json({ ok: true, enrolled: true, progress });
}

export async function POST(request: Request) {
  const auth = await requireAuthenticatedUser();
  if (auth.error || !auth.client) {
    return NextResponse.json({ ok: false, message: auth.error ?? "Authentication is required." }, { status: 401 });
  }
  const body = await request.json().catch(() => null) as {
    projectId?: string;
    missionId?: string;
    complete?: boolean;
    hintNumber?: number;
  } | null;
  const registry = body?.projectId ? projectRegistryEntry(body.projectId) : undefined;
  if (!registry || !body?.missionId) {
    return NextResponse.json({ ok: false, message: "Project and mission are required." }, { status: 400 });
  }

  const { data: enrollment } = await auth.client
    .from("project_enrollments")
    .select("id")
    .eq("user_id", auth.user!.id)
    .eq("variant_id", registry.variantId)
    .maybeSingle();
  if (!enrollment) return NextResponse.json({ ok: false, message: "Enroll in the project before saving progress." }, { status: 409 });

  const { data: mission } = await auth.client
    .from("project_missions")
    .select("id, definition")
    .eq("variant_id", registry.variantId)
    .eq("definition->>id", body.missionId)
    .maybeSingle();
  if (!mission) return NextResponse.json({ ok: false, message: "Unknown mission or access is not available." }, { status: 404 });

  const isFree = Boolean((mission.definition as { free?: boolean } | null)?.free);
  if (!isFree) {
    const { data: entitlement, error: entitlementError } = await auth.client
      .from("user_entitlements")
      .select("id")
      .eq("user_id", auth.user!.id)
      .eq("project_family_id", registry.familyId)
      .eq("status", "active")
      .maybeSingle();
    if (entitlementError) return NextResponse.json({ ok: false, message: "Entitlement could not be verified." }, { status: 502 });
    if (!entitlement) return NextResponse.json({ ok: false, message: "An active Project Pass is required for this mission." }, { status: 403 });
  }

  const { data, error } = await auth.client.rpc("save_mission_progress", {
    p_enrollment_id: enrollment.id,
    p_mission_id: mission.id,
    p_completed: Boolean(body.complete),
    p_hint_usage: body.hintNumber ? { [String(body.hintNumber)]: true } : {},
  });
  if (error) return NextResponse.json({ ok: false, message: "Mission progress could not be saved." }, { status: 502 });
  return NextResponse.json({ ok: true, progress: data });
}
