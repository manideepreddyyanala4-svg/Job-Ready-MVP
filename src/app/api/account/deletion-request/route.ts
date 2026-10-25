import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { isProductionMode } from "@/lib/runtime";

export async function GET() {
  const auth = await requireAuthenticatedUser();
  if (auth.error || !auth.client) return NextResponse.json({ ok: false, message: auth.error ?? "Authentication is required." }, { status: 401 });
  if (!isProductionMode()) return NextResponse.json({ ok: true, request: null, mode: "demo" });

  const { data, error } = await auth.client
    .from("account_deletion_requests")
    .select("id, status, requested_at, completed_at")
    .eq("user_id", auth.user!.id)
    .maybeSingle();
  if (error) return NextResponse.json({ ok: false, message: "Deletion request status could not be loaded." }, { status: 502 });
  return NextResponse.json({ ok: true, request: data });
}

export async function POST() {
  const auth = await requireAuthenticatedUser();
  if (auth.error || !auth.client) return NextResponse.json({ ok: false, message: auth.error ?? "Authentication is required." }, { status: 401 });
  if (!isProductionMode()) return NextResponse.json({ ok: true, request: { status: "demo-only" }, mode: "demo" });

  const { data, error } = await auth.client
    .from("account_deletion_requests")
    .upsert({
      user_id: auth.user!.id,
      status: "pending",
      requested_at: new Date().toISOString(),
      completed_at: null,
    }, { onConflict: "user_id" })
    .select("id, status, requested_at, completed_at")
    .single();
  if (error) return NextResponse.json({ ok: false, message: "Deletion request could not be created." }, { status: 502 });
  return NextResponse.json({ ok: true, request: data });
}
