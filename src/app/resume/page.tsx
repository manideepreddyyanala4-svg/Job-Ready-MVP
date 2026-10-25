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
    setError(""); setFile(nextFile); setSelectedName(nextFile?.name ?? "");
  };
  const saveAndAnalyze = (resume: StructuredResume) => {
    if (process.env.NEXT_PUBLIC_JOBREADY_MODE !== "production") { saveStructuredResume(resume); window.localStorage.setItem("jobready-resume-ready", "yes"); }
    router.push("/analysis");
  };
  const analyze = async () => {
    setError("");
    if (!file) { setError("Choose a PDF or select the demo resume before continuing."); return; }
    setProcessing(true);
    try {
      const formData = new FormData(); formData.append("resume", file);
      const response = await fetch("/api/resume/process", { method: "POST", body: formData });
      const result = await response.json() as { ok: boolean; resume?: StructuredResume; message?: string };
      if (!response.ok || !result.ok || !result.resume) { setError(result.message ?? "The resume could not be processed."); return; }
      saveAndAnalyze(result.resume);
    } catch { setError("We couldn't process that resume. Please try again."); }
    finally { setProcessing(false); }
  };

  return <AppShell><main className="app-page app-page-narrow"><PageHeader eyebrow="Profile · Resume" title="Add the evidence baseline." description="JobReady extracts structure first, then scores visible evidence. Missing text never means missing knowledge." />
    <FileUploadArea><div style={{ maxWidth: 520 }}><div className="state-icon" style={{ margin: "0 auto 14px" }} aria-hidden="true">↑</div><h2 className="card-title">Choose a PDF resume</h2><p className="secondary-text">PDF only · up to 5 MB · private by default</p><input type="file" accept=".pdf,application/pdf" onChange={selectResume} aria-label="Choose PDF resume" style={{ margin: "14px auto", display: "block", maxWidth: "100%" }} />{selectedName && <Badge tone="info">{selectedName}</Badge>}{error && <div style={{ marginTop: 14 }}><Alert tone="error">{error}</Alert></div>}<div className="cluster" style={{ justifyContent: "center", marginTop: 18 }}><Button variant="ghost" onClick={() => saveAndAnalyze(demoResume)}>Use demo resume</Button><Button onClick={analyze} disabled={processing}>{processing ? "Extracting resume…" : "Analyze resume →"}</Button></div></div></FileUploadArea>
    <p className="helper-text" style={{ marginTop: 16 }}>{process.env.NEXT_PUBLIC_JOBREADY_MODE === "production" ? "Your PDF and structured analysis are stored in your authenticated Supabase account." : "Uploads are processed deterministically in this local MVP. Production storage and authenticated server processing are adapter-ready."}</p>
  </main></AppShell>;
}
