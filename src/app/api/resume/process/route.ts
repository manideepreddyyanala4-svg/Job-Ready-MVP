import { NextResponse } from "next/server";
import { processResumeFile } from "@/lib/resume";
import { requireAuthenticatedUser } from "@/lib/auth";
import { isProductionMode } from "@/lib/runtime";
import { isPdfUpload, resumeBucket, resumeStoragePath } from "@/lib/supabase/storage";
import { randomUUID } from "node:crypto";

export async function POST(request: Request) {
  try {
    const auth = await requireAuthenticatedUser();
    if (auth.error) return NextResponse.json({ ok: false, code: "unauthorized", message: auth.error }, { status: 401 });
    const formData = await request.formData();
    const file = formData.get("resume");
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, code: "unsupported", message: "A resume PDF is required." }, { status: 400 });
    }
    if (!isPdfUpload(file)) {
      return NextResponse.json({ ok: false, code: "unsupported", message: "Only PDF resumes are accepted." }, { status: 422 });
    }
    const result = await processResumeFile(file);
    if (!result.ok) return NextResponse.json(result, { status: 422 });

    if (isProductionMode() && auth.client) {
      const resumeId = randomUUID();
      const storagePath = resumeStoragePath(auth.user!.id, resumeId);
      const upload = await auth.client.storage.from(resumeBucket()).upload(storagePath, file, {
        contentType: "application/pdf",
        upsert: false,
      });
      if (upload.error) {
        return NextResponse.json({ ok: false, code: "storage", message: "The resume could not be stored securely." }, { status: 502 });
      }
      const metadata = await auth.client.from("resume_files").insert({
        id: resumeId,
        user_id: auth.user!.id,
        storage_path: storagePath,
        original_filename: file.name.slice(0, 255),
        mime_type: file.type,
        byte_size: file.size,
      });
      if (metadata.error) {
        await auth.client.storage.from(resumeBucket()).remove([storagePath]);
        return NextResponse.json({ ok: false, code: "persistence", message: "The resume metadata could not be saved." }, { status: 502 });
      }
      const parse = await auth.client.from("resume_parses").insert({
        resume_file_id: resumeId,
        user_id: auth.user!.id,
        parser_version: "deterministic-v1",
        structured_resume: result.resume,
      });
      if (parse.error) {
        await auth.client.storage.from(resumeBucket()).remove([storagePath]);
        return NextResponse.json({ ok: false, code: "persistence", message: "The structured resume could not be saved." }, { status: 502 });
      }
      const { data: parseRow } = await auth.client.from("resume_parses").select("id").eq("resume_file_id", resumeId).single();
      if (parseRow) {
        const analysis = await fetch(new URL("/api/analysis/process", request.url), {
          method: "POST",
          headers: { "Content-Type": "application/json", cookie: request.headers.get("cookie") ?? "" },
          body: JSON.stringify({ resumeParseId: parseRow.id }),
        });
        if (!analysis.ok) return NextResponse.json({ ok: false, code: "analysis", message: "The resume was saved, but analysis could not be completed." }, { status: 502 });
      }
    }
    return NextResponse.json(result, { status: result.ok ? 200 : 422 });
  } catch {
    return NextResponse.json({ ok: false, code: "unsupported", message: "The resume could not be processed. Please try again." }, { status: 400 });
  }
}
