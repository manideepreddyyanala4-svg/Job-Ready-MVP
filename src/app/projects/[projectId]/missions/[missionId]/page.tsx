import { notFound, redirect } from "next/navigation";
import { MissionPage as MissionClient } from "./MissionClient";
import { projects } from "@/lib/domain";
import { isProductionMode } from "@/lib/runtime";
import { requireSupabaseUser } from "@/lib/supabase/server";
import { demoLogisticsMissionDetails, missionDetailFromDefinition, type MissionDetail } from "@/lib/mission-content";
import { projectRegistryEntry } from "@/lib/project-registry";

export const dynamic = "force-dynamic";

type Params = Promise<{ projectId: string; missionId: string }>;

export default async function MissionRoute({ params }: { params: Params }) {
  const { projectId, missionId } = await params;
  const project = projects.find((item) => item.id === projectId);
  const missionIndex = project?.missions.findIndex((item) => item.id === missionId) ?? -1;
  const summary = missionIndex >= 0 ? project?.missions[missionIndex] : undefined;
  if (!project || !summary || project.status !== "available") notFound();

  let entitled = false;
  let mission: MissionDetail | null = null;

  if (isProductionMode()) {
    const { client, user } = await requireSupabaseUser();
    if (!client || !user) {
      redirect("/login?next=" + encodeURIComponent("/projects/" + projectId + "/missions/" + missionId));
    }

    const registry = projectRegistryEntry(projectId);
    if (!registry) notFound();

    if (!summary.free) {
      const { data } = await client
        .from("user_entitlements")
        .select("id")
        .eq("user_id", user.id)
        .eq("project_family_id", registry.familyId)
        .eq("status", "active")
        .maybeSingle();
      entitled = Boolean(data);
    }

    if (summary.free || entitled) {
      const { data: missionRow } = await client
        .from("project_missions")
        .select("definition")
        .eq("variant_id", registry.variantId)
        .eq("mission_number", missionIndex + 1)
        .maybeSingle();
      if (missionRow?.definition && typeof missionRow.definition === "object") {
        mission = missionDetailFromDefinition(summary, missionRow.definition as Record<string, unknown>);
      }
    }
  } else {
    mission = projectId === "logistics-backend" ? demoLogisticsMissionDetails[missionId] ?? null : null;
  }

  const locked = !summary.free && !entitled && isProductionMode();

  return (
    <MissionClient
      projectId={projectId}
      missionId={missionId}
      missionNumber={missionIndex + 1}
      totalMissions={project.missions.length}
      project={{ id: project.id, title: project.title }}
      mission={mission}
      summary={summary}
      locked={locked}
      hasServerEntitlement={entitled}
    />
  );
}
