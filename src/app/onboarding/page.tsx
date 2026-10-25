"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Alert, Badge, Button, Card, InputField, PageHeader, StepIndicator } from "@/components/ui";
import { demoStudent } from "@/lib/domain";

type StudentProfile = { name: string; degree: string; college: string; studyYear: string; roles: string[]; weeklyHours: string };
const defaultProfile: StudentProfile = { name: demoStudent.name, degree: demoStudent.degree, college: demoStudent.college, studyYear: demoStudent.year, roles: ["Backend / Software Engineer", "AI / ML Engineer"], weeklyHours: "8–12 hours per week" };

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState(defaultProfile);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const update = (patch: Partial<StudentProfile>) => setProfile((current) => ({ ...current, ...patch }));

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_JOBREADY_MODE !== "production") return;
    void fetch("/api/profile").then((response) => response.json()).then((result: { profile?: { full_name?: string; degree?: string; college?: string; year?: string; target_role?: string; weekly_hours?: number } | null }) => {
      if (!result.profile) return;
      const saved = result.profile;
      setProfile((current) => ({ ...current, name: saved.full_name ?? current.name, degree: saved.degree ?? current.degree, college: saved.college ?? current.college, studyYear: saved.year ?? current.studyYear, roles: saved.target_role ? [saved.target_role] : current.roles, weeklyHours: saved.weekly_hours ? `${saved.weekly_hours}+ hours per week` : current.weeklyHours }));
    }).catch(() => setError("We couldn't restore your saved profile. You can still continue with the fields below."));
  }, []);

  const next = async () => {
    setError("");
    window.localStorage.setItem("jobready-onboarding-draft", JSON.stringify(profile));
    if (step < 3) { setStep(step + 1); return; }
    if (process.env.NEXT_PUBLIC_JOBREADY_MODE === "production") {
      setSaving(true);
      try {
        const response = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) });
        if (!response.ok) { const result = await response.json().catch(() => null) as { message?: string } | null; setError(result?.message ?? "We couldn't save your profile. Please review the fields and try again."); return; }
      } catch { setError("We couldn't save your profile. Check your connection and try again."); return; }
      finally { setSaving(false); }
    }
    window.localStorage.setItem("jobready-student-profile", JSON.stringify(profile));
    window.localStorage.setItem("jobready-onboarded", "yes");
    router.push("/resume");
  };

  const toggleRole = (role: string) => update({ roles: profile.roles.includes(role) ? profile.roles.filter((item) => item !== role) : [...profile.roles, role] });

  return <AppShell><main className="app-page app-page-narrow"><PageHeader eyebrow="Profile setup" title={step === 1 ? "Start with your current profile." : step === 2 ? "Choose the roles you are exploring." : "Set a realistic weekly pace."} description={step === 1 ? "This takes about two minutes. Your answers make the diagnosis useful; they do not judge your potential." : step === 2 ? "Pick the paths you genuinely want JobReady to compare against your evidence." : "A project plan only works when the time expectation matches your week."}><div style={{ marginTop: 18 }}><StepIndicator current={step} total={3} label={`Profile setup step ${step} of 3`} /></div></PageHeader>
    {error && <div style={{ marginBottom: 18 }}><Alert tone="error">{error}</Alert></div>}
    {step === 1 && <div className="form-grid"><InputField id="name" label="Full name" value={profile.name} onChange={(event) => update({ name: event.target.value })} /><InputField id="degree" label="Degree" value={profile.degree} onChange={(event) => update({ degree: event.target.value })} /><InputField id="college" label="College / university" value={profile.college} onChange={(event) => update({ college: event.target.value })} /><InputField id="studyYear" label="Current study year" value={profile.studyYear} onChange={(event) => update({ studyYear: event.target.value })} /></div>}
    {step === 2 && <div className="stack">{["Backend / Software Engineer", "Data Analyst", "AI / ML Engineer", "I am still exploring"].map((role) => <Card className="card-pad" key={role}><label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer" }}><input type="checkbox" checked={profile.roles.includes(role)} onChange={() => toggleRole(role)} style={{ marginTop: 5 }} /><span><span className="label">{role}</span><span className="helper-text" style={{ display: "block", marginTop: 3 }}>{role === "I am still exploring" ? "JobReady will use your profile to suggest a starting point." : "Include this role in your match report."}</span></span></label></Card>)}</div>}
    {step === 3 && <><div className="stack">{["5–7 hours per week", "8–12 hours per week", "12+ hours per week"].map((hours) => <Card className="card-pad" key={hours}><label style={{ display: "flex", gap: 12, cursor: "pointer" }}><input type="radio" name="hours" checked={profile.weeklyHours === hours} onChange={() => update({ weeklyHours: hours })} /><span className="label">{hours}</span></label></Card>)}</div><div style={{ marginTop: 18 }}><Badge tone="info">Demo profile includes Python, SQL, Pandas, Flask, and Git</Badge></div></>}
    <div className="cluster" style={{ marginTop: 28, justifyContent: "space-between" }}>{step > 1 ? <Button variant="ghost" onClick={() => setStep((current) => Math.max(1, current - 1))}>Back</Button> : <span /> }<Button onClick={next} disabled={saving}>{saving ? "Saving profile…" : step === 3 ? "Save profile and continue →" : "Continue →"}</Button></div>
  </main></AppShell>;
}
