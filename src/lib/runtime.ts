export type JobReadyMode = "demo" | "production";

export function jobReadyMode(): JobReadyMode {
  return process.env.JOBREADY_MODE === "production" ? "production" : "demo";
}

export function isProductionMode() {
  return jobReadyMode() === "production";
}
