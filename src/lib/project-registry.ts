export type ProjectRegistryEntry = {
  variantId: string;
  familyId: string;
  familySlug: string;
};

export const projectRegistry: Record<string, ProjectRegistryEntry> = {
  "logistics-backend": {
    variantId: "00000000-0000-0000-0002-000000000001",
    familyId: "00000000-0000-0000-0001-000000000001",
    familySlug: "production-backend-system",
  },
  "retail-analytics": {
    variantId: "00000000-0000-0000-0002-000000000003",
    familyId: "00000000-0000-0000-0001-000000000002",
    familySlug: "business-analytics",
  },
  "document-intelligence": {
    variantId: "00000000-0000-0000-0002-000000000004",
    familyId: "00000000-0000-0000-0001-000000000003",
    familySlug: "ai-document-intelligence",
  },
};

export function projectRegistryEntry(projectId: string) {
  return projectRegistry[projectId];
}
