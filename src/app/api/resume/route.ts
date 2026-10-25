import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { isProductionMode } from "@/lib/runtime";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { resumeBucket } from "@/lib/supabase/storage";

export async function GET() {
  const auth = await requireAuthenticatedUser();
  if (auth.error) return NextResponse.json({ ok: false, message: auth.error }, { status: 401 });
  if (!isProductionMode() || !auth.client) return NextResponse.json({ ok: true, resume: null, mode: "demo" });

  const { data, error } = await auth.client
    .from("resume_files")
    .select("id, original_filename, byte_size, created_at")
    .eq("user_id", auth.user!.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return NextResponse.json({ ok: false, message: "Resume information could not be loaded." }, { status: 502 });
  return NextResponse.json({ ok: true, resume: data });
}

export async function DELETE(request: Request) {
  const auth = await requireAuthenticatedUser();
  if (auth.error || !auth.client) return NextResponse.json({ ok: false, message: auth.error ?? "Authentication is required." }, { status: 401 });
  if (!isProductionMode()) return NextResponse.json({ ok: true, mode: "demo" });

  const requestedId = new URL(request.url).searchParams.get("resumeId");
  let query = auth.client.from("resume_files").select("id, storage_path").eq("user_id", auth.user!.id);
  query = requestedId ? query.eq("id", requestedId) : query.order("created_at", { ascending: false }).limit(1);
  const { data, error } = await query.maybeSingle();
  if (error) return NextResponse.json({ ok: false, message: "Resume could not be found." }, { status: 502 });
  if (!data) return NextResponse.json({ ok: true, deleted: false });

  const storage = await auth.client.storage.from(resumeBucket()).remove([data.storage_path]);
  if (storage.error) return NextResponse.json({ ok: false, message: "Resume file could not be deleted." }, { status: 502 });

  const removed = await auth.client.from("resume_files").delete().eq("id", data.id).eq("user_id", auth.user!.id);
  if (removed.error) return NextResponse.json({ ok: false, message: "Resume record could not be deleted." }, { status: 502 });

  const admin = getSupabaseAdminClient();
  if (admin) {
    await Promise.all([
      admin.from("readiness_scores").delete().eq("user_id", auth.user!.id),
      admin.from("student_role_matches").delete().eq("user_id", auth.user!.id),
      admin.from("student_skill_gaps").delete().eq("user_id", auth.user!.id),
      admin.from("project_recommendations").delete().eq("user_id", auth.user!.id),
    ]);
  }

  return NextResponse.json({ ok: true, deleted: true });
}
