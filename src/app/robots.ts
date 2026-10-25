import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/privacy", "/terms"],
      disallow: ["/dashboard", "/analysis", "/roles", "/gaps", "/projects", "/resume", "/onboarding", "/settings", "/api"],
    },
  };
}
