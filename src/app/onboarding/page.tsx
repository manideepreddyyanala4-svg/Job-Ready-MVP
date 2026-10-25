"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Alert, Button, Card, InputField, PageHeader, StepIndicator } from "@/components/ui";
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
    }).catch(() => undefined);
  }, []);

  const next = async () => {
    setError("");
    window.localStorage.setItem("jobready-onboarding-draft", JSON.stringify(profile));
    if (step < 3) { setStep(step + 1); return; }
    if (process.env.NEXT_PUBLIC_JOBREADY_MODE === "production") {
      setSaving(true);
      try {
        const response = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) });
        if (!response.ok) { const result = await response.json().catch(() => null) as { message?: string } | null; setError(result?.message ?? "We couldn't save your profile. Try again."); return; }
      } catch { setError("We couldn't save your profile. Check your connection and try again."); return; }
      finally { setSaving(false); }
    }
    window.localStorage.setItem("jobready-student-profile", JSON.stringify(profile));
    window.localStorage.setItem("jobready-onboarded", "yes");
    router.push("/resume");
  };

  const toggleRole = (role: string) => update({ roles: profile.roles.includes(role) ? profile.roles.filter((item) => item !== role) : [...profile.roles, role] });

  return <AppShell><main className="app-page app-page-narrow">
    <StepIndicator current={step} total={3} label={`Profile setup, step ${step} of 3`} />
    <div style={{ marginTop: 18 }}>
      {step === 1 && <><PageHeader eyebrow="Profile setup" title="Let's start with you." description="This takes about two minutes. Your answers make the readiness report more useful; they are not a judgment of your potential." /><div className="form-grid"><InputField id="name" label="Full name" value={profile.name} onChange={(event) => update({ name: event.target.value })} /><InputField id="degree" label="Degree" value={profile.degree} onChange={(event) => update({ degree: event.target.value })} /><InputField id="college" label="College / university" value={profile.college} onChange={(event) => update({ college: event.target.value })} /><InputField id="studyYear" label="Current study year" value={profile.studyYear} onChange={(event) => update({ studyYear: event.target.value })} /></div></>}
      {step === 2 && <><PageHeader eyebrow="Profile setup" title="Where are you heading?" description="Pick the roles you are exploring. You can update this later." /><div className="stack">{["Backend / Software Engineer", "Data Analyst", "AI / ML Engineer", "I am still exploring"].map((role) => <Card key={role} className="choice-card"><input id={`role-${role}`} type="checkbox" checked={profile.roles.includes(role)} onChange={() => toggleRole(role)} /><label htmlFor={`role-${role}`} style={{ cursor: "pointer" }}><span className="label">{role}</span><span className="helper-text" style={{ display: "block", marginTop: 3 }}>{role === "I am still exploring" ? "We'll use your profile to suggest a useful starting point." : "Include this role in your match report."}</span></label></Card>)}</div></>}
      {step === 3 && <><PageHeader eyebrow="Profile setup" title="What can you realistically make time for?" description="A realistic project plan beats an ambitious one you cannot sustain." /><div className="stack">{["5–7 hours per week", "8–12 hours per week", "12+ hours per week"].map((hours) => <Card key={hours} className="choice-card"><input id={`hours-${hours}`} type="radio" name="hours" checked={profile.weeklyHours === hours} onChange={() => update({ weeklyHours: hours })} /><label htmlFor={`hours-${hours}`} className="label" style={{ cursor: "pointer" }}>{hours}</label></Card>)}</div></>}
    </div>
    {error && <div style={{ marginTop: 18 }}><Alert tone="error">{error}</Alert></div>}
    <div className="cluster" style={{ marginTop: 28 }}>{step > 1 && <Button variant="ghost" onClick={() => setStep((current) => current - 1)}>Back</Button>}<Button onClick={next} disabled={saving}>{saving ? "Saving profile…" : step === 3 ? "Save profile and continue →" : "Continue →"}</Button></div>
  </main></AppShell>;
}
