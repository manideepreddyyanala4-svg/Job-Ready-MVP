"use client";

import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Alert, Badge, Button, FileUploadArea, PageHeader } from "@/components/ui";
import { demoResume, StructuredResume } from "@/lib/resume";
import { saveStructuredResume } from "@/lib/demo-storage";

export default function Resume() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [selectedName, setSelectedName] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const selectResume = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    setError("");
    setFile(nextFile);
    setSelectedName(nextFile?.name ?? "");
  };

  const saveAndAnalyze = (resume: StructuredResume) => {
    if (process.env.NEXT_PUBLIC_JOBREADY_MODE !== "production") {
      saveStructuredResume(resume);
      window.localStorage.setItem("jobready-resume-ready", "yes");
    }
    router.push("/analysis");
  };

  const analyze = async () => {
    setError("");
    if (!file) { setError("Choose a PDF or select the demo resume before continuing."); return; }
    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const response = await fetch("/api/resume/process", { method: "POST", body: formData });
      const result = await response.json() as { ok: boolean; resume?: StructuredResume; message?: string };
      if (!response.ok || !result.ok || !result.resume) { setError(result.message ?? "The resume could not be processed."); return; }
      saveAndAnalyze(result.resume);
    } catch {
      setError("We couldn't process that resume. Try again or use the demo resume.");
    } finally { setProcessing(false); }
  };

  return <AppShell><main className="app-page app-page-narrow">
    <PageHeader eyebrow="Profile evidence" title="Add your resume." description="We extract structure first, then score visible evidence. Missing text never means missing knowledge." />
    <FileUploadArea>
      <div aria-hidden="true" style={{ fontSize: 30, lineHeight: 1 }}>↑</div>
      <div><h2 className="card-title">Choose a PDF resume</h2><p className="helper-text" style={{ margin: "5px 0 0" }}>PDF only · up to 5 MB · private by default</p></div>
      <input type="file" accept=".pdf,application/pdf" onChange={selectResume} aria-label="Choose resume PDF" />
      {selectedName && <Badge tone="info">{selectedName}</Badge>}
      {error && <Alert tone="error">{error}</Alert>}
      <div className="cluster" style={{ justifyContent: "center" }}><Button variant="ghost" onClick={() => saveAndAnalyze(demoResume)}>Use demo resume</Button><Button onClick={analyze} disabled={processing}>{processing ? "Extracting resume…" : "Analyze resume →"}</Button></div>
    </FileUploadArea>
    <p className="helper-text" style={{ marginTop: 14 }}>{process.env.NEXT_PUBLIC_JOBREADY_MODE === "production" ? "Your PDF and structured analysis are stored in your authenticated account." : "Uploads are processed deterministically in this local MVP. Production storage remains behind the authenticated Supabase boundary."}</p>
  </main></AppShell>;
}
