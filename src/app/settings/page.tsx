"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell, PageTitle } from "@/components/AppShell";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type Profile = {
  full_name?: string;
  college?: string;
  degree?: string;
  year?: string;
  target_role?: string;
  target_roles?: string[];
  weekly_hours?: number;
};

type ResumeMeta = { id: string; original_filename: string; byte_size: number; created_at: string };
type DeleteRequest = { status: string; requested_at?: string; completed_at?: string | null };

const production = process.env.NEXT_PUBLIC_JOBREADY_MODE === "production";

export default function SettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [resume, setResume] = useState<ResumeMeta | null>(null);
  const [deletion, setDeletion] = useState<DeleteRequest | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!production) {
      const localEmail = window.localStorage.getItem("jobready-user") ?? "demo account";
      const saved = window.localStorage.getItem("jobready-student-profile");
      let localProfile: Profile | null = null;
      if (saved) {
        try {
          const local = JSON.parse(saved) as { name?: string; degree?: string; college?: string; studyYear?: string; roles?: string[] };
          localProfile = { full_name: local.name, degree: local.degree, college: local.college, year: local.studyYear, target_roles: local.roles };
        } catch { /* ignore */ }
      }
      queueMicrotask(() => {
        setEmail(localEmail);
        setProfile(localProfile);
      });
      return;
    }

    void getSupabaseBrowserClient()?.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
    void Promise.all([
      fetch("/api/profile").then((response) => response.json()),
      fetch("/api/resume").then((response) => response.json()),
      fetch("/api/account/deletion-request").then((response) => response.json()),
    ]).then(([profileResult, resumeResult, deletionResult]: [
      { profile?: Profile | null },
      { resume?: ResumeMeta | null },
      { request?: DeleteRequest | null },
    ]) => {
      setProfile(profileResult.profile ?? null);
      setResume(resumeResult.resume ?? null);
      setDeletion(deletionResult.request ?? null);
    }).catch(() => setError("Some account information could not be loaded."));
  }, []);

  const clearDemo = () => {
    window.localStorage.clear();
    router.replace("/");
  };

  const requestDeletion = async () => {
    if (!production || !confirmDelete) return;
    setBusy(true);
    setError("");
    const response = await fetch("/api/account/deletion-request", { method: "POST" });
    const result = await response.json() as { request?: DeleteRequest; message?: string };
    setBusy(false);
    if (!response.ok || !result.request) {
      setError(result.message ?? "The deletion request could not be created.");
      return;
    }
    setDeletion(result.request);
    setMessage("Account deletion request created. This is a request workflow; the account is not silently deleted by the browser.");
  };

  return (
    <AppShell>
      <PageTitle
        eyebrow="Profile & settings"
        title="Keep your career context and data under control."
        body="Change the inputs that affect recommendations, replace resume evidence, review account state, or request account deletion."
      />

      {message && <div className="alert alert-success" role="status" style={{ marginBottom: 18 }}>{message}</div>}
      {error && <div className="alert alert-error" role="alert" style={{ marginBottom: 18 }}>{error}</div>}

      <div className="stack">
        <section className="card">
          <div className="split mobile-stack">
            <div><div className="eyebrow">Account</div><h2 style={{ margin: "8px 0 5px" }}>{email || "Account"}</h2><p className="small muted" style={{ margin: 0 }}>{production ? "Authenticated production account" : "Local demo account"}</p></div>
            <span className={"badge " + (production ? "badge-success" : "badge-muted")}>{production ? "Supabase session" : "Demo mode"}</span>
          </div>
        </section>

        <section className="card">
          <div className="split mobile-stack">
            <div><div className="eyebrow">Career profile</div><h2 style={{ margin: "8px 0 5px" }}>{profile?.full_name ?? "Profile not completed"}</h2><p className="small muted">{[profile?.degree, profile?.year, profile?.college].filter(Boolean).join(" · ") || "Complete onboarding to personalize role and project fit."}</p></div>
            <Link href="/onboarding" className="btn btn-secondary">Edit career profile</Link>
          </div>
          <hr className="divider" />
          <div className="cluster">{(profile?.target_roles?.length ? profile.target_roles : profile?.target_role ? [profile.target_role] : []).map((role) => <span className="tag" key={role}>{role}</span>)}</div>
        </section>

        <section className="card">
          <div className="split mobile-stack">
            <div><div className="eyebrow">Resume evidence</div><h2 style={{ margin: "8px 0 5px" }}>{resume?.original_filename ?? (production ? "No current resume" : "Demo/browser resume")}</h2><p className="small muted">{resume ? "Uploaded " + new Date(resume.created_at).toLocaleDateString() + " · " + Math.ceil(resume.byte_size / 1024) + " KB" : "Replace or remove resume evidence from the dedicated resume screen."}</p></div>
            <Link href="/resume" className="btn btn-secondary">{resume ? "Manage resume" : "Add resume"}</Link>
          </div>
        </section>

        <section className="card">
          <div className="eyebrow">Privacy</div>
          <h2 style={{ margin: "8px 0 5px" }}>Understand what JobReady stores.</h2>
          <p className="section-copy">Production resumes are private and user-scoped. Raw resume contents must not be sent to analytics. Readiness scores describe profile evidence, not employment probability.</p>
          <div className="cluster"><Link href="/privacy" className="btn btn-secondary">Privacy policy</Link><Link href="/terms" className="btn btn-secondary">Terms</Link></div>
        </section>

        {production ? (
          <section className="card">
            <div className="eyebrow">Account deletion</div>
            <h2 style={{ margin: "8px 0 5px" }}>Request deletion of your account and user-owned data.</h2>
            {deletion?.status === "pending" ? (
              <div className="alert alert-warning">Deletion request pending since {deletion.requested_at ? new Date(deletion.requested_at).toLocaleDateString() : "your latest request"}.</div>
            ) : (
              <>
                <p className="section-copy">This private-beta flow records a server-side deletion request. It does not perform a destructive database operation from the browser.</p>
                <label className="cluster" style={{ alignItems: "flex-start" }}><input type="checkbox" checked={confirmDelete} onChange={(event) => setConfirmDelete(event.target.checked)} /><span className="small">I understand this creates an account-deletion request and may make my JobReady data unavailable after it is processed.</span></label>
                <button className="btn btn-danger" style={{ marginTop: 16 }} onClick={requestDeletion} disabled={!confirmDelete || busy}>{busy ? "Creating request…" : "Request account deletion"}</button>
              </>
            )}
          </section>
        ) : (
          <section className="card">
            <div className="eyebrow">Demo data</div>
            <h2 style={{ margin: "8px 0 5px" }}>Clear local browser state.</h2>
            <p className="section-copy">This only removes the local demo profile, resume structure, mock entitlement, and progress keys stored in this browser.</p>
            <button className="btn btn-danger" onClick={clearDemo}>Clear demo data</button>
          </section>
        )}
      </div>
    </AppShell>
  );
}
