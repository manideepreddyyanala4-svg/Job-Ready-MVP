import { randomUUID } from "node:crypto";

export const resumeBucket = () => process.env.SUPABASE_STORAGE_BUCKET || "resumes";

export function resumeStoragePath(userId: string, resumeId = randomUUID()) {
  return `resumes/${userId}/${resumeId}.pdf`;
}

export function isPdfUpload(file: File) {
  return file.type === "application/pdf" && file.name.toLowerCase().endsWith(".pdf");
}
