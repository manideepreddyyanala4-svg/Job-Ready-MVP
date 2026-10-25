import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";

const variantByProject: Record<string, string> = {
  "logistics-backend": "00000000-0000-0000-0002-000000000001",
  "retail-analytics": "00000000-0000-0000-0002-000000000003",
  "document-intelligence": "00000000-0000-0000-0002-000000000004",
};

export async function GET(request: Request) {
  const auth = await requireAuthenticatedUser();
  if (auth.error || !auth.client) return NextResponse.json({ ok: false, message: auth.error ?? "Authentication is required." }, { status: 401 });
  const projectId = new URL(request.url).searchParams.get("projectId");
  const variantId = projectId ? variantByProject[projectId] : undefined;
  if (!variantId) return NextResponse.json({ ok: false, message: "Unknown project." }, { status: 400 });
  const { data: enrollment } = await auth.client.from("project_enrollments").select("id").eq("user_id", auth.user!.id).eq("variant_id", variantId).maybeSingle();
  if (!enrollment) return NextResponse.json({ ok: true, progress: [] });
  const { data, error } = await auth.client.from("mission_progress").select("mission_id, completed_at, hint_usage").eq("user_id", auth.user!.id).eq("enrollment_id", enrollment.id);
  if (error) return NextResponse.json({ ok: false, message: "Project progress could not be loaded." }, { status: 502 });
  return NextResponse.json({ ok: true, progress: data });
}

export async function POST(request: Request) {
  const auth = await requireAuthenticatedUser();
  if (auth.error || !auth.client) return NextResponse.json({ ok: false, message: auth.error ?? "Authentication is required." }, { status: 401 });
  const body = await request.json().catch(() => null) as { projectId?: string; missionId?: string; complete?: boolean; hintNumber?: number } | null;
  const variantId = body?.projectId ? variantByProject[body.projectId] : undefined;
  if (!variantId || !body?.missionId) return NextResponse.json({ ok: false, message: "Project and mission are required." }, { status: 400 });
  const { data: enrollment } = await auth.client.from("project_enrollments").select("id").eq("user_id", auth.user!.id).eq("variant_id", variantId).maybeSingle();
  if (!enrollment) return NextResponse.json({ ok: false, message: "Enroll in the project before saving progress." }, { status: 409 });
  const { data: mission } = await auth.client.from("project_missions").select("id").eq("variant_id", variantId).eq("definition->>id", body.missionId).maybeSingle();
  if (!mission) return NextResponse.json({ ok: false, message: "Unknown mission." }, { status: 400 });
  const { data: missionDefinition } = await auth.client.from("project_missions").select("definition").eq("id", mission.id).single();
  const isFree = Boolean((missionDefinition?.definition as { free?: boolean } | null)?.free);
  if (!isFree) {
    const { data: variant } = await auth.client.from("project_variants").select("family_id").eq("id", variantId).single();
    const { data: entitlement, error: entitlementError } = variant
      ? await auth.client.from("user_entitlements").select("id").eq("user_id", auth.user!.id).eq("project_family_id", variant.family_id).eq("status", "active").maybeSingle()
      : { data: null, error: new Error("Missing project family") };
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
