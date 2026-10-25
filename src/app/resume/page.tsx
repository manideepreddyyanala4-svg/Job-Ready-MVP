"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, PageTitle } from "@/components/AppShell";
import { demoResume, MAX_RESUME_BYTES, StructuredResume } from "@/lib/resume";
import { saveStructuredResume } from "@/lib/demo-storage";

type ResumeMeta = { id: string; original_filename: string; byte_size: number; created_at: string };

const production = process.env.NEXT_PUBLIC_JOBREADY_MODE === "production";

export default function ResumePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<StructuredResume | null>(null);
  const [latest, setLatest] = useState<ResumeMeta | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [processing, setProcessing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!production) return;
    void fetch("/api/resume")
      .then((response) => response.json())
      .then((result: { resume?: ResumeMeta | null }) => setLatest(result.resume ?? null))
      .catch(() => undefined);
  }, []);

  const selectResume = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    setError("");
    setNotice("");
    setParsed(null);
    if (!nextFile) { setFile(null); return; }
    if (!nextFile.name.toLowerCase().endsWith(".pdf") || nextFile.type !== "application/pdf") {
      setFile(null);
      setError("Choose an exported PDF resume.");
      return;
    }
    if (nextFile.size > MAX_RESUME_BYTES) {
      setFile(null);
      setError("Resume files must be 5 MB or smaller.");
      return;
    }
    setFile(nextFile);
  };

  const analyze = async () => {
    setError("");
    setNotice("");
    if (!file) { setError("Choose a PDF before continuing."); return; }
    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const response = await fetch("/api/resume/process", { method: "POST", body: formData });
      const result = await response.json() as { ok: boolean; resume?: StructuredResume; message?: string };
      if (!response.ok || !result.ok || !result.resume) {
        setError(result.message ?? "The resume could not be processed.");
        return;
      }
      if (!production) saveStructuredResume(result.resume);
      setParsed(result.resume);
      setNotice("Resume processed. Review what JobReady detected before opening the report.");
      if (production) {
        const latestResponse = await fetch("/api/resume");
        const latestResult = await latestResponse.json() as { resume?: ResumeMeta | null };
        setLatest(latestResult.resume ?? null);
      }
    } catch {
      setError("We could not process the resume. Check your connection and try again.");
    } finally {
      setProcessing(false);
    }
  };

  const useDemo = () => {
    saveStructuredResume(demoResume);
    setParsed(demoResume);
    setFile(null);
    setError("");
    setNotice("Demo resume loaded. The report will be clearly labeled as demo evidence.");
  };

  const continueToAnalysis = () => {
    if (!parsed) return;
    if (!production) {
      saveStructuredResume(parsed);
      window.localStorage.setItem("jobready-resume-ready", "yes");
    }
    router.push("/analysis");
  };

  const removeLatest = async () => {
    if (!production || !latest) return;
    setDeleting(true);
    setError("");
    const response = await fetch("/api/resume?resumeId=" + encodeURIComponent(latest.id), { method: "DELETE" });
    setDeleting(false);
    if (!response.ok) { setError("The resume could not be removed. Try again."); return; }
    setLatest(null);
    setParsed(null);
    setNotice("Resume removed. Upload a new resume to create a fresh report.");
  };

  return (
    <AppShell>
      <PageTitle
        eyebrow="Resume evidence"
        title="Add the profile evidence you want JobReady to inspect."
        body="JobReady extracts structured signals from a text-based PDF. Parsing is not perfect, and a missing item never means you do not know it."
        actions={<span className="badge badge-muted">PDF · maximum 5 MB</span>}
      />

      {latest && (
        <div className="card card-soft" style={{ marginBottom: 18 }}>
          <div className="split mobile-stack">
            <div><strong>Current resume</strong><p className="small muted" style={{ margin: "5px 0 0" }}>{latest.original_filename} · uploaded {new Date(latest.created_at).toLocaleDateString()}</p></div>
            <button className="btn btn-danger" onClick={removeLatest} disabled={deleting}>{deleting ? "Removing…" : "Remove current resume"}</button>
          </div>
        </div>
      )}

      <div className="two-col">
        <section className="card">
          <div className="eyebrow">1 · Upload</div>
          <h2 style={{ margin: "10px 0 8px" }}>Choose a text-based PDF resume.</h2>
          <p className="small muted">Scanned or image-only PDFs are not supported in this beta. Your production file is stored in a private user-scoped bucket.</p>
          <label className="field" style={{ marginTop: 22 }}>
            <span className="field-label">Resume PDF</span>
            <input className="input" type="file" accept=".pdf,application/pdf" onChange={selectResume} />
            <span className="field-help">{file ? file.name + " · " + Math.ceil(file.size / 1024) + " KB" : "No file selected."}</span>
          </label>
          <div className="cluster actions" style={{ marginTop: 18 }}>
            <button type="button" className="btn btn-primary" onClick={analyze} disabled={!file || processing}>{processing ? "Processing…" : "Process resume →"}</button>
            {!production && <button type="button" className="btn btn-secondary" onClick={useDemo}>Use demo resume</button>}
          </div>
          {error && <div className="alert alert-error" role="alert" style={{ marginTop: 16 }}>{error}</div>}
          {notice && <div className="alert alert-success" role="status" style={{ marginTop: 16 }}>{notice}</div>}
        </section>

        <aside className="card card-soft">
          <div className="eyebrow">Privacy boundary</div>
          <h3 style={{ margin: "10px 0" }}>What happens after upload</h3>
          <div className="evidence-list">
            {[
              "Validate the file type and size.",
              "Extract deterministic text structure on the server.",
              "Store only structured evidence used by the report; raw extracted text is not kept in the structured parse.",
              "Create an explainable readiness report and role fit.",
              "Keep raw resume contents out of product analytics.",
            ].map((item) => <div className="evidence-item" key={item}><span className="evidence-icon">✓</span><span>{item}</span></div>)}
          </div>
        </aside>
      </div>

      {parsed && (
        <section className="card" style={{ marginTop: 18 }}>
          <div className="split mobile-stack">
            <div>
              <div className="eyebrow">2 · Review detected evidence</div>
              <h2 style={{ margin: "9px 0 6px" }}>{parsed.fileName}</h2>
            </div>
            <span className={"badge " + (parsed.parseConfidence === "high" ? "badge-success" : parsed.parseConfidence === "medium" ? "badge-warning" : "badge-danger")}>{parsed.parseConfidence} parse confidence</span>
          </div>
          {parsed.warnings.length > 0 && <div className="alert alert-warning" style={{ marginTop: 16 }}>{parsed.warnings.join(" ")}</div>}
          <div className="three-col" style={{ marginTop: 20 }}>
            <div className="metric-card"><div className="metric-value">{parsed.skills.length}</div><div className="metric-label">Detected skills</div></div>
            <div className="metric-card"><div className="metric-value">{parsed.projects.length}</div><div className="metric-label">Detected project signals</div></div>
            <div className="metric-card"><div className="metric-value">{parsed.links.length}</div><div className="metric-label">Detected links</div></div>
          </div>
          <div className="two-col" style={{ marginTop: 20 }}>
            <div><strong>Skills detected</strong><div className="cluster" style={{ marginTop: 10 }}>{parsed.skills.length ? parsed.skills.map((skill) => <span className="tag" key={skill}>{skill}</span>) : <span className="small muted">No supported skills confidently detected.</span>}</div></div>
            <div><strong>Project evidence</strong><div className="stack" style={{ marginTop: 10 }}>{parsed.projects.length ? parsed.projects.map((project) => <div className="small muted" key={project}>{project}</div>) : <span className="small muted">No project section confidently detected.</span>}</div></div>
          </div>
          <div className="cluster actions" style={{ marginTop: 24 }}>
            <button className="btn btn-dark" onClick={continueToAnalysis}>Open readiness report →</button>
            <label className="btn btn-secondary" style={{ cursor: "pointer" }}>Choose another PDF<input className="sr-only" type="file" accept=".pdf,application/pdf" onChange={selectResume} /></label>
          </div>
        </section>
      )}
    </AppShell>
  );
}
