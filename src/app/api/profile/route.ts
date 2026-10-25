import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { isProductionMode } from "@/lib/runtime";

const allowedRoles = new Set([
  "Backend / Software Engineer",
  "Data Analyst",
  "AI / ML Engineer",
  "I am still exploring",
]);

export function validateProfile(value: unknown) {
  if (!value || typeof value !== "object") return "A profile object is required.";
  const profile = value as Record<string, unknown>;
  if (typeof profile.name !== "string" || profile.name.trim().length < 2 || profile.name.length > 120) return "Enter a valid name.";
  if (typeof profile.degree !== "string" || profile.degree.length > 160) return "Enter a valid degree.";
  if (typeof profile.college !== "string" || profile.college.length > 200) return "Enter a valid college.";
  if (typeof profile.studyYear !== "string" || profile.studyYear.length > 40) return "Enter a valid study year.";
  if (!Array.isArray(profile.roles) || profile.roles.length === 0 || profile.roles.some((role) => typeof role !== "string" || !allowedRoles.has(role))) return "Choose at least one valid target role.";
  if (typeof profile.weeklyHours !== "string" || profile.weeklyHours.length > 40) return "Choose a weekly time commitment.";
  return null;
}

export async function GET() {
  const auth = await requireAuthenticatedUser();
  if (auth.error) return NextResponse.json({ ok: false, message: auth.error }, { status: 401 });
  if (!isProductionMode()) return NextResponse.json({ ok: true, profile: null, mode: "demo" });
  const { data, error } = await auth.client!.from("profiles").select("*").eq("id", auth.user!.id).maybeSingle();
  if (error) return NextResponse.json({ ok: false, message: "Profile could not be loaded." }, { status: 502 });
  return NextResponse.json({ ok: true, profile: data });
}

export async function PATCH(request: Request) {
  const auth = await requireAuthenticatedUser();
  if (auth.error) return NextResponse.json({ ok: false, message: auth.error }, { status: 401 });
  const body = await request.json().catch(() => null);
  const validationError = validateProfile(body);
  if (validationError) return NextResponse.json({ ok: false, message: validationError }, { status: 422 });
  if (!isProductionMode()) return NextResponse.json({ ok: true, profile: body, mode: "demo" });

  const profile = body as Record<string, unknown>;
  const { data, error } = await auth.client!.from("profiles").upsert({
    id: auth.user!.id,
    full_name: profile.name,
    college: profile.college,
    degree: profile.degree,
    year: profile.studyYear,
    target_role: (profile.roles as string[])[0],
    weekly_hours: Number.parseInt((profile.weeklyHours as string).match(/\d+/)?.[0] ?? "0", 10) || null,
    onboarding_completed: true,
    updated_at: new Date().toISOString(),
  }).select().single();
  if (error) return NextResponse.json({ ok: false, message: "Profile could not be saved." }, { status: 502 });
  return NextResponse.json({ ok: true, profile: data });
}
