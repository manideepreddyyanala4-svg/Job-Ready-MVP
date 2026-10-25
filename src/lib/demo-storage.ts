const progressKey = (projectId: string, missionId: string) =>
  `jobready-progress:${projectId}:${missionId}`;

export const resumeKey = "jobready-structured-resume";

export function saveStructuredResume(resume: unknown) {
  if (typeof window !== "undefined") window.localStorage.setItem(resumeKey, JSON.stringify(resume));
}

export function loadStructuredResume<T>() {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(resumeKey);
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function isMissionComplete(projectId: string, missionId: string) {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(progressKey(projectId, missionId)) === "complete";
}

export function setMissionComplete(
  projectId: string,
  missionId: string,
  complete: boolean,
) {
  if (typeof window === "undefined") return;
  if (complete) {
    window.localStorage.setItem(progressKey(projectId, missionId), "complete");
  } else {
    window.localStorage.removeItem(progressKey(projectId, missionId));
  }
}

export function completedMissionCount(projectId: string, missionIds: string[]) {
  return missionIds.filter((missionId) => isMissionComplete(projectId, missionId)).length;
}
