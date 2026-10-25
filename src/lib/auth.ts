import { isProductionMode } from "@/lib/runtime";
import { requireSupabaseUser } from "@/lib/supabase/server";

export async function requireAuthenticatedUser() {
  if (!isProductionMode()) return { user: { id: "demo-user" }, client: null, error: null };
  const { client, user } = await requireSupabaseUser();
  if (!user) return { user: null, client, error: "Authentication is required." };
  return { user, client, error: null };
}
