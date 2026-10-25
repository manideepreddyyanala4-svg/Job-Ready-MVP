import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { projectRegistryEntry } from "@/lib/project-registry";

export async function POST(request: Request) {
  const auth = await requireAuthenticatedUser();
  if (auth.error || !auth.client) {
    return NextResponse.json({ ok: false, message: auth.error ?? "Authentication is required." }, { status: 401 });
  }
  const body = await request.json().catch(() => null) as { projectId?: string } | null;
  const registry = body?.projectId ? projectRegistryEntry(body.projectId) : undefined;
  if (!registry) return NextResponse.json({ ok: false, message: "Unknown project." }, { status: 400 });

  const { data, error } = await auth.client.from("project_enrollments").upsert({
    user_id: auth.user!.id,
    variant_id: registry.variantId,
  }, { onConflict: "user_id,variant_id" }).select().single();

  if (error) return NextResponse.json({ ok: false, message: "Project enrollment could not be saved." }, { status: 502 });
  return NextResponse.json({ ok: true, enrollment: data });
}
