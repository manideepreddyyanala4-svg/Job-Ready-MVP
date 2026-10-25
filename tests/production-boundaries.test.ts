import { describe, expect, it } from "vitest";
import { validateProfile } from "@/app/api/profile/route";
import { projectRegistryEntry } from "@/lib/project-registry";
import { resumeStoragePath } from "@/lib/supabase/storage";
import { sanitizeAnalyticsProperties } from "@/lib/analytics";

describe("production boundaries", () => {
  it("rejects malformed or unsupported profile input", () => {
    expect(validateProfile(null)).toBe("A profile object is required.");
    expect(validateProfile({ name: "A" })).toBe("Enter a valid name.");
    expect(validateProfile({
      name: "Student",
      degree: "B.Tech",
      college: "College",
      studyYear: "3rd year",
      roles: ["Recruiter"],
      weeklyHours: "8–12 hours per week",
    })).toBe("Choose at least one valid target role.");
  });

  it("accepts the supported onboarding shape", () => {
    expect(validateProfile({
      name: "Student",
      degree: "B.Tech",
      college: "College",
      studyYear: "3rd year",
      roles: ["Backend / Software Engineer", "AI / ML Engineer"],
      weeklyHours: "8–12 hours per week",
    })).toBeNull();
  });

  it("generates user-scoped UUID storage paths", () => {
    const path = resumeStoragePath("user-a", "00000000-0000-0000-0000-000000000001");
    expect(path).toBe("resumes/user-a/00000000-0000-0000-0000-000000000001.pdf");
    expect(path).not.toContain("resume.pdf");
  });

  it("maps project ids to trusted server-side entitlement identifiers", () => {
    expect(projectRegistryEntry("logistics-backend")?.familyId).toBe("00000000-0000-0000-0001-000000000001");
    expect(projectRegistryEntry("unknown")).toBeUndefined();
  });

  it("drops unsupported analytics properties", () => {
    const safe = sanitizeAnalyticsProperties({
      projectId: "logistics-backend",
      status: "started",
      rawResumeText: "secret resume contents",
      token: "secret-token",
    });
    expect(safe).toEqual({ projectId: "logistics-backend", status: "started" });
  });
});
