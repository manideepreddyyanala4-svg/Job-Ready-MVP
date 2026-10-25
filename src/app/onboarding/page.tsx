"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { demoStudent } from "@/lib/domain";

type StudentProfile = {
  name: string;
  degree: string;
  college: string;
  studyYear: string;
  roles: string[];
  weeklyHours: string;
};

const roleOptions = [
  ["Backend / Software Engineer", "APIs, services, databases, testing, and production systems."],
  ["Data Analyst", "SQL, analysis, dashboards, and decision communication."],
  ["AI / ML Engineer", "Modeling, evaluation, serving, and production ML evidence."],
  ["I am still exploring", "Use the profile analysis to compare the supported directions."],
] as const;

const production = process.env.NEXT_PUBLIC_JOBREADY_MODE === "production";

const blankProfile: StudentProfile = {
  name: "",
  degree: "",
  college: "",
  studyYear: "",
  roles: [],
  weeklyHours: "",
};

const demoProfile: StudentProfile = {
  name: demoStudent.name,
  degree: demoStudent.degree,
  college: demoStudent.college,
  studyYear: demoStudent.year,
  roles: ["Backend / Software Engineer", "AI / ML Engineer"],
  weeklyHours: "8–12 hours per week",
};

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<StudentProfile>(production ? blankProfile : demoProfile);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const update = (patch: Partial<StudentProfile>) => {
    setError("");
    setProfile((current) => ({ ...current, ...patch }));
  };

  useEffect(() => {
    if (!production) {
      const draft = window.localStorage.getItem("jobready-onboarding-draft");
      if (draft) {
        try { setProfile(JSON.parse(draft) as StudentProfile); } catch { /* ignore malformed demo state */ }
      }
      return;
    }

    void fetch("/api/profile")
      .then((response) => response.json())
      .then((result: { profile?: { full_name?: string; degree?: string; college?: string; year?: string; target_role?: string; target_roles?: string[]; weekly_hours?: number } | null }) => {
        if (!result.profile) return;
        const saved = result.profile;
        setProfile({
          name: saved.full_name ?? "",
          degree: saved.degree ?? "",
          college: saved.college ?? "",
          studyYear: saved.year ?? "",
          roles: saved.target_roles?.length ? saved.target_roles : saved.target_role ? [saved.target_role] : [],
          weeklyHours: saved.weekly_hours ? (saved.weekly_hours >= 12 ? "12+ hours per week" : saved.weekly_hours >= 8 ? "8–12 hours per week" : "5–7 hours per week") : "",
        });
      })
      .catch(() => setError("We could not restore your saved profile. You can still continue."));
  }, []);

  const validateStep = () => {
    if (step === 1 && (!profile.name.trim() || !profile.degree.trim() || !profile.college.trim() || !profile.studyYear.trim())) return "Complete the four profile fields before continuing.";
    if (step === 2 && profile.roles.length === 0) return "Choose at least one role direction.";
    if (step === 3 && !profile.weeklyHours) return "Choose a realistic weekly time range.";
    return "";
  };

  const next = async () => {
    const validation = validateStep();
    if (validation) { setError(validation); return; }

    window.localStorage.setItem("jobready-onboarding-draft", JSON.stringify(profile));
    if (step < 3) {
      setStep((current) => current + 1);
      return;
    }

    setSaving(true);
    if (production) {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const result = await response.json().catch(() => ({ message: "Profile could not be saved." })) as { message?: string };
      if (!response.ok) {
        setSaving(false);
        setError(result.message ?? "Profile could not be saved.");
        return;
      }
    } else {
      window.localStorage.setItem("jobready-student-profile", JSON.stringify(profile));
      window.localStorage.setItem("jobready-onboarded", "yes");
    }
    setSaving(false);
    router.push("/resume");
  };

  const back = () => {
    setError("");
    setStep((current) => Math.max(1, current - 1));
  };

  const toggleRole = (role: string) => {
    if (role === "I am still exploring") {
      update({ roles: profile.roles.includes(role) ? [] : [role] });
      return;
    }
    const withoutExploring = profile.roles.filter((item) => item !== "I am still exploring");
    const roles = withoutExploring.includes(role)
      ? withoutExploring.filter((item) => item !== role)
      : [...withoutExploring, role].slice(0, 3);
    update({ roles });
  };

  return (
    <AppShell>
      <div className="narrow">
        <div className="split mobile-stack">
          <div>
            <div className="eyebrow">Profile setup · Step {step} of 3</div>
            <p className="small muted" style={{ margin: "7px 0 0" }}>Only collect what changes the recommendation.</p>
          </div>
          <span className="badge badge-muted">About 2 minutes</span>
        </div>
        <div className="progress-track" aria-label={"Onboarding step " + step + " of 3"} style={{ margin: "16px 0 36px" }}>
          <div className="progress-fill progress-fill-accent" style={{ width: (step / 3 * 100) + "%" }} />
        </div>

        {step === 1 && (
          <section>
            <h1 className="page-title">Start with the context that changes your report.</h1>
            <p className="page-lede">Your degree and study stage help JobReady keep the recommendations realistic for an early-career profile.</p>
            <div className="two-col" style={{ marginTop: 28 }}>
              <label className="field"><span className="field-label">Full name</span><input className="input" value={profile.name} onChange={(e) => update({ name: e.target.value })} autoComplete="name" /></label>
              <label className="field"><span className="field-label">Degree</span><input className="input" value={profile.degree} onChange={(e) => update({ degree: e.target.value })} placeholder="B.Tech CSE" /></label>
              <label className="field"><span className="field-label">College / university</span><input className="input" value={profile.college} onChange={(e) => update({ college: e.target.value })} /></label>
              <label className="field"><span className="field-label">Current study year</span><input className="input" value={profile.studyYear} onChange={(e) => update({ studyYear: e.target.value })} placeholder="3rd year" /></label>
            </div>
          </section>
        )}

        {step === 2 && (
          <section>
            <h1 className="page-title">Which directions are worth comparing?</h1>
            <p className="page-lede">Pick up to three. These are role-fit directions, not commitments. You can change them later.</p>
            <div className="stack" style={{ marginTop: 28 }}>
              {roleOptions.map(([role, body]) => {
                const checked = profile.roles.includes(role);
                return (
                  <label className="card" key={role} style={{ display: "flex", gap: 14, alignItems: "flex-start", cursor: "pointer", borderColor: checked ? "#8eb1a7" : "var(--line)" }}>
                    <input type="checkbox" checked={checked} onChange={() => toggleRole(role)} style={{ marginTop: 3 }} />
                    <span><strong>{role}</strong><span className="small muted" style={{ display: "block", marginTop: 5 }}>{body}</span></span>
                  </label>
                );
              })}
            </div>
          </section>
        )}

        {step === 3 && (
          <section>
            <h1 className="page-title">How much time can you actually protect each week?</h1>
            <p className="page-lede">A realistic project plan is more useful than an ambitious plan you cannot sustain.</p>
            <div className="three-col" style={{ marginTop: 28 }}>
              {["5–7 hours per week", "8–12 hours per week", "12+ hours per week"].map((hours) => (
                <label className="card" key={hours} style={{ cursor: "pointer", borderColor: profile.weeklyHours === hours ? "#8eb1a7" : "var(--line)" }}>
                  <div className="cluster"><input type="radio" name="hours" checked={profile.weeklyHours === hours} onChange={() => update({ weeklyHours: hours })} /><strong>{hours}</strong></div>
                </label>
              ))}
            </div>
            <div className="alert alert-info" style={{ marginTop: 20 }}>This time range influences project-fit guidance. It does not change your readiness score.</div>
          </section>
        )}

        {error && <div className="alert alert-error" role="alert" style={{ marginTop: 22 }}>{error}</div>}

        <div className="cluster actions" style={{ marginTop: 30 }}>
          {step > 1 && <button type="button" onClick={back} className="btn btn-secondary" disabled={saving}>← Back</button>}
          <button type="button" onClick={next} className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : step === 3 ? "Save and add resume →" : "Continue →"}</button>
        </div>
      </div>
    </AppShell>
  );
}
