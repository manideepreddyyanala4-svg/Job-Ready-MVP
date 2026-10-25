import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/dashboard";
  const client = await getSupabaseServerClient();
  if (!client || !code) return NextResponse.redirect(new URL("/login?error=auth_callback", url));

  const { error } = await client.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/login?error=auth_callback", url));
  const candidate = next.startsWith("/") && !next.startsWith("//") && !next.includes("\\")
    ? new URL(next, url)
    : new URL("/dashboard", url);
  const destination = candidate.origin === url.origin ? candidate : new URL("/dashboard", url);
  return NextResponse.redirect(destination);
}
