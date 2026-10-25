import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { isProductionMode } from "@/lib/runtime";
import { projectRegistryEntry } from "@/lib/project-registry";

export async function GET(request: Request) {
  const projectId = new URL(request.url).searchParams.get("projectId");
  const registry = projectId ? projectRegistryEntry(projectId) : undefined;
  if (!projectId || !registry) {
    return NextResponse.json({ ok: false, message: "Unknown project." }, { status: 400 });
  }
  if (!isProductionMode()) return NextResponse.json({ ok: true, entitled: false, mode: "demo" });

  const auth = await requireAuthenticatedUser();
  if (auth.error || !auth.client) {
    return NextResponse.json({ ok: false, message: auth.error ?? "Authentication is required." }, { status: 401 });
  }
  const { data, error } = await auth.client
    .from("user_entitlements")
    .select("id, status")
    .eq("user_id", auth.user!.id)
    .eq("project_family_id", registry.familyId)
    .eq("status", "active")
    .maybeSingle();
  if (error) return NextResponse.json({ ok: false, message: "Entitlement status could not be checked." }, { status: 502 });
  return NextResponse.json({ ok: true, entitled: Boolean(data) });
}
