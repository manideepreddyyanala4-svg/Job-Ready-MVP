"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type Notice = { kind: "error" | "success" | "info"; message: string } | null;

function safeNext(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") && !value.includes("\\") ? value : null;
}

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState<Notice>(() => {
    if (typeof window === "undefined") return null;
    const error = new URLSearchParams(window.location.search).get("error");
    if (error === "auth_callback") return { kind: "error", message: "That sign-in link could not be completed. Request a new secure link below." };
    if (error === "configuration") return { kind: "error", message: "Sign-in is temporarily unavailable because this environment is not fully configured." };
    return null;
  });
  const [busy, setBusy] = useState(false);
  const production = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_JOBREADY_MODE === "production",
  );

  const submit = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setNotice({ kind: "error", message: "Enter a valid email address." });
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const next = safeNext(params.get("next"));

    if (production) {
      setBusy(true);
      setNotice(null);
      const client = getSupabaseBrowserClient();
      const callback = new URL("/auth/callback", window.location.origin);
      if (next) callback.searchParams.set("next", next);
      const { error } = await client!.auth.signInWithOtp({
        email: cleanEmail,
        options: { emailRedirectTo: callback.toString() },
      });
      setBusy(false);
      if (error) {
        setNotice({ kind: "error", message: "We could not send the sign-in link. Try again in a moment." });
        return;
      }
      setNotice({ kind: "success", message: "Check your email for a secure sign-in link. You can close this tab after opening it." });
      return;
    }

    window.localStorage.setItem("jobready-user", cleanEmail);
    router.push(next ?? "/onboarding");
  };

  return (
    <main className="narrow" style={{ padding: "42px 0 70px" }}>
      <Link href="/" className="site-logo"><span className="brand-mark" aria-hidden="true" />JobReady</Link>
      <div className="card" style={{ marginTop: 48, padding: "clamp(24px, 6vw, 40px)" }}>
        <div className="eyebrow">{production ? "Secure sign-in" : "Explore the private-beta flow"}</div>
        <h1 className="display section-title" style={{ fontSize: 42 }}>{production ? "Sign in to your JobReady account." : "Start with your profile, not a random course."}</h1>
        <p className="section-copy">
          {production
            ? "We use an email magic link so there is no JobReady password to remember."
            : "Demo mode stores your working state in this browser. Production uses authenticated, user-owned records."}
        </p>

        <div className="field" style={{ marginTop: 26 }}>
          <label className="field-label" htmlFor="email">Email address</label>
          <input
            id="email"
            className="input"
            value={email}
            onChange={(event) => { setEmail(event.target.value); setNotice(null); }}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            disabled={busy}
          />
        </div>

        {notice && <div role={notice.kind === "error" ? "alert" : "status"} className={"alert " + (notice.kind === "error" ? "alert-error" : notice.kind === "success" ? "alert-success" : "alert-info")} style={{ marginTop: 14 }}>{notice.message}</div>}

        <button className="btn btn-primary" style={{ width: "100%", marginTop: 18 }} onClick={submit} disabled={busy}>
          {busy ? "Sending secure link…" : production ? "Email me a sign-in link →" : "Continue in demo mode →"}
        </button>

        <p className="small muted" style={{ textAlign: "center", marginTop: 16 }}>
          JobReady does not sell your resume or use a readiness score as a hiring guarantee.
        </p>
      </div>
    </main>
  );
}
