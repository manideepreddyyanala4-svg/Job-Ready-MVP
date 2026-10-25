"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { demoStudent } from "@/lib/domain";
import { AppShell } from "@/components/AppShell";
import { useEffect } from "react";

type StudentProfile = {
  name: string;
  degree: string;
  college: string;
  studyYear: string;
  roles: string[];
  weeklyHours: string;
};

const defaultProfile: StudentProfile = {
  name: demoStudent.name,
  degree: demoStudent.degree,
  college: demoStudent.college,
  studyYear: demoStudent.year,
  roles: ["Backend / Software Engineer", "AI / ML Engineer"],
  weeklyHours: "8–12 hours per week",
};

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState(defaultProfile);
  const router = useRouter();
  const update = (patch: Partial<StudentProfile>) => setProfile((current) => ({ ...current, ...patch }));

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_JOBREADY_MODE !== "production") return;
    void fetch("/api/profile")
      .then((response) => response.json())
      .then((result: { profile?: { full_name?: string; degree?: string; college?: string; year?: string; target_role?: string; weekly_hours?: number } | null }) => {
        if (!result.profile) return;
        const saved = result.profile;
        setProfile((current) => ({
          ...current,
          name: saved.full_name ?? current.name,
          degree: saved.degree ?? current.degree,
          college: saved.college ?? current.college,
          studyYear: saved.year ?? current.studyYear,
          roles: saved.target_role ? [saved.target_role] : current.roles,
          weeklyHours: saved.weekly_hours ? `${saved.weekly_hours}+ hours per week` : current.weeklyHours,
        }));
      })
      .catch(() => undefined);
  }, []);

  const next = async () => {
    window.localStorage.setItem("jobready-onboarding-draft", JSON.stringify(profile));
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    if (process.env.NEXT_PUBLIC_JOBREADY_MODE === "production") {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!response.ok) return;
    }
    window.localStorage.setItem("jobready-student-profile", JSON.stringify(profile));
    window.localStorage.setItem("jobready-onboarded", "yes");
    router.push("/resume");
  };

  const toggleRole = (role: string) => {
    const roles = profile.roles.includes(role)
      ? profile.roles.filter((item) => item !== role)
      : [...profile.roles, role];
    update({ roles });
  };

  return <AppShell><main className="container" style={{ padding: "54px 0", maxWidth: 760 }}><div className="eyebrow">Step {step} of 3</div><div style={{ height: 7, background: "#dbe5e1", borderRadius: 8, margin: "12px 0 40px" }}><div style={{ height: "100%", width: `${step / 3 * 100}%`, background: "var(--orange)", borderRadius: 8 }} /></div>{step === 1 && <><h1 className="serif" style={{ fontSize: 50, margin: "0 0 12px" }}>Let&apos;s start with you.</h1><p style={{ color: "var(--muted)" }}>This takes about two minutes. We use your answers to make the report useful, not to judge your potential.</p><div className="grid" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 28 }}>{[["name", "Full name"], ["degree", "Degree"], ["college", "College / university"], ["studyYear", "Current study year"]].map(([key, label]) => <label key={key} style={{ fontSize: 13, fontWeight: 700 }}>{label}<input value={profile[key as keyof StudentProfile] as string} onChange={(event) => update({ [key]: event.target.value })} style={{ display: "block", width: "100%", marginTop: 7, padding: 13, border: "1px solid var(--line)", borderRadius: 9 }} /></label>)}</div></>}{step === 2 && <><h1 className="serif" style={{ fontSize: 50, margin: "0 0 12px" }}>Where are you heading?</h1><p style={{ color: "var(--muted)" }}>Pick what you are exploring. You can change this later.</p><div className="grid" style={{ marginTop: 26 }}>{["Backend / Software Engineer", "Data Analyst", "AI / ML Engineer", "I am still exploring"].map((role) => <label className="card" key={role} style={{ padding: 18, display: "flex", gap: 12, alignItems: "center", cursor: "pointer" }}><input type="checkbox" checked={profile.roles.includes(role)} onChange={() => toggleRole(role)} /><span><b>{role}</b><br /><small style={{ color: "var(--muted)" }}>{role === "I am still exploring" ? "We’ll use your profile to suggest a starting point." : "Include this role in your match report."}</small></span></label>)}</div></>}{step === 3 && <><h1 className="serif" style={{ fontSize: 50, margin: "0 0 12px" }}>What can you make time for?</h1><p style={{ color: "var(--muted)" }}>A realistic plan beats an ambitious one.</p><div className="grid" style={{ marginTop: 26 }}>{["5–7 hours per week", "8–12 hours per week", "12+ hours per week"].map((hours) => <label className="card" key={hours} style={{ padding: 18, display: "flex", gap: 12 }}><input type="radio" name="hours" checked={profile.weeklyHours === hours} onChange={() => update({ weeklyHours: hours })} /><b>{hours}</b></label>)}</div><p className="tag" style={{ marginTop: 22 }}>Demo profile: Arjun has Python, SQL, Pandas, Flask, and Git.</p></>}<button onClick={next} className="btn btn-primary" style={{ marginTop: 34 }}>{step === 3 ? "Save profile and continue →" : "Continue →"}</button></main></AppShell>;
}
