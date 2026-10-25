"use client";

import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
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
    if (!file) {
      setError("Choose a PDF or select the demo resume before continuing.");
      return;
    }
    setProcessing(true);
    const formData = new FormData();
    formData.append("resume", file);
    const response = await fetch("/api/resume/process", { method: "POST", body: formData });
    const result = await response.json() as { ok: boolean; resume?: StructuredResume; message?: string };
    setProcessing(false);
    if (!response.ok || !result.ok || !result.resume) {
      setError(result.message ?? "The resume could not be processed.");
      return;
    }
    saveAndAnalyze(result.resume);
  };

  const useDemoResume = () => {
    saveAndAnalyze(demoResume);
  };

  return <AppShell><main className="container" style={{ padding: "64px 0", maxWidth: 760 }}>
    <div className="eyebrow">Your evidence baseline</div>
    <h1 className="serif" style={{ fontSize: 54, margin: "10px 0 14px" }}>Add your resume.</h1>
    <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>We extract structure first, then score evidence. Missing text never means missing knowledge.</p>
    <div className="card" style={{ padding: 36, marginTop: 30, textAlign: "center", borderStyle: "dashed" }}>
      <div style={{ fontSize: 44 }}>↑</div>
      <h3>Choose a PDF resume</h3>
      <p style={{ color: "var(--muted)", fontSize: 14 }}>PDF only · up to 5 MB · private by default</p>
      <input type="file" accept=".pdf,application/pdf" onChange={selectResume} style={{ margin: "16px auto", display: "block" }} />
      {selectedName && <p className="tag" style={{ margin: "8px auto 16px", width: "fit-content" }}>{selectedName}</p>}
      {error && <p role="alert" style={{ color: "#b23b2e", fontSize: 13 }}>{error}</p>}
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        <button type="button" className="btn btn-ghost" onClick={useDemoResume}>Use demo resume</button>
        <button type="button" className="btn btn-primary" onClick={analyze} disabled={processing}>{processing ? "Extracting resume…" : "Analyze resume →"}</button>
      </div>
    </div>
    <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 18 }}>{process.env.NEXT_PUBLIC_JOBREADY_MODE === "production" ? "Your PDF and structured analysis are stored in your authenticated Supabase account." : "Uploads are processed deterministically in this local MVP. Production storage and authenticated server processing are adapter-ready."}</p>
  </main></AppShell>;
}
