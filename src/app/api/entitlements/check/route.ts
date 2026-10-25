import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { isProductionMode } from "@/lib/runtime";

const familyByProject: Record<string, string> = {
  "logistics-backend": "production-backend-system",
  "retail-analytics": "business-analytics",
  "document-intelligence": "ai-document-intelligence",
};

export async function GET(request: Request) {
  const projectId = new URL(request.url).searchParams.get("projectId");
  if (!projectId || !familyByProject[projectId]) {
    return NextResponse.json({ ok: false, message: "Unknown project." }, { status: 400 });
  }
  if (!isProductionMode()) return NextResponse.json({ ok: true, entitled: false, mode: "demo" });

  const auth = await requireAuthenticatedUser();
  if (auth.error || !auth.client) return NextResponse.json({ ok: false, message: auth.error ?? "Authentication is required." }, { status: 401 });
  const { data, error } = await auth.client
    .from("user_entitlements")
    .select("id, status, project_families!inner(slug)")
    .eq("user_id", auth.user!.id)
    .eq("status", "active")
    .eq("project_families.slug", familyByProject[projectId])
    .maybeSingle();
  if (error) return NextResponse.json({ ok: false, message: "Entitlement status could not be checked." }, { status: 502 });
  return NextResponse.json({ ok: true, entitled: Boolean(data) });
}
