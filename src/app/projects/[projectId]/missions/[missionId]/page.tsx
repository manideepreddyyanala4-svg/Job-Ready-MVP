import { notFound, redirect } from "next/navigation";
import { MissionPage as MissionClient } from "./MissionClient";
import { projects } from "@/lib/domain";
import { isProductionMode } from "@/lib/runtime";
import { requireSupabaseUser } from "@/lib/supabase/server";

export const instant = false;

type Params = Promise<{ projectId: string; missionId: string }>;

export default async function MissionRoute({ params }: { params: Params }) {
  const { projectId, missionId } = await params;
  const project = projects.find((item) => item.id === projectId);
  const missionIndex = project?.missions.findIndex((item) => item.id === missionId) ?? -1;
  const mission = missionIndex >= 0 ? project?.missions[missionIndex] : undefined;
  if (!project || !mission) notFound();

  let entitled = false;
  if (isProductionMode()) {
    const { client, user } = await requireSupabaseUser();
    if (!client || !user) redirect(`/login?next=${encodeURIComponent(`/projects/${projectId}/missions/${missionId}`)}`);
    if (!mission.free) {
      const { data } = await client
        .from("user_entitlements")
        .select("id")
        .eq("user_id", user.id)
        .eq("variant_id", "00000000-0000-0000-0002-000000000001")
        .eq("status", "active")
        .maybeSingle();
      entitled = Boolean(data);
    }
  }

  const safeMission = !isProductionMode() || mission.free || entitled
    ? mission
    : {
        ...mission,
        objective: "This mission is part of the paid project workspace. Unlock the Project Pass to continue.",
        concepts: [],
        deliverable: "Unlock the workspace to view the deliverable.",
        hints: [],
        resources: [],
      };

  return (
    <MissionClient
      projectId={projectId}
      missionId={missionId}
      missionNumber={missionIndex + 1}
      project={{ id: project.id, title: project.title }}
      mission={safeMission}
      hasServerEntitlement={entitled}
    />
  );
}
