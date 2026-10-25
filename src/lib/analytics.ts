export type FunnelEvent =
  | "landing_cta"
  | "signup_started"
  | "signup_complete"
  | "onboarding_complete"
  | "resume_uploaded"
  | "analysis_complete"
  | "role_viewed"
  | "gap_viewed"
  | "project_viewed"
  | "project_selected"
  | "mission_started"
  | "mission_completed"
  | "paywall_viewed"
  | "checkout_started"
  | "checkout_success"
  | "project_completed";

const allowedPropertyKeys = new Set([
  "source",
  "roleId",
  "projectId",
  "missionId",
  "status",
  "mode",
]);

export type FunnelProperties = Record<string, string | number | boolean | undefined>;

export function sanitizeAnalyticsProperties(properties: FunnelProperties = {}) {
  return Object.fromEntries(
    Object.entries(properties)
      .filter(([key, value]) => allowedPropertyKeys.has(key) && ["string", "number", "boolean"].includes(typeof value))
      .map(([key, value]) => [key, value]),
  );
}

export function trackFunnelEvent(event: FunnelEvent, properties: FunnelProperties = {}) {
  const safe = sanitizeAnalyticsProperties(properties);
  if (process.env.NODE_ENV === "development" && typeof console !== "undefined") {
    console.info("[jobready:funnel]", event, safe);
  }
  // Production analytics intentionally remains provider-neutral.
  // A future adapter may consume only the sanitized event + properties.
  // Raw resume text, uploaded files, project code, credentials, and secrets are not accepted here.
}
