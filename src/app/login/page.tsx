"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Alert, Button, Card, InputField } from "@/components/ui";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function Login() {
  const router = useRouter();
  const production = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_JOBREADY_MODE === "production");
  const [email, setEmail] = useState(production ? "" : "arjun@example.com");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    setError(""); setSent(false);
    if (!email.trim() || !email.includes("@")) { setError("Enter a valid email address to continue."); return; }
    if (production) {
      setBusy(true);
      const client = getSupabaseBrowserClient();
      const { error: authError } = await client!.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });
      setBusy(false);
      if (authError) { setError("We couldn't send the sign-in link. Please try again."); return; }
      setSent(true); return;
    }
    localStorage.setItem("jobready-user", email.trim()); router.push("/onboarding");
  };

  return <main className="reading-container" style={{ padding: "48px 0 72px" }}><Link href="/" className="app-brand" style={{ padding: 0 }}><span className="app-brand-mark" aria-hidden="true" />jobready</Link><Card className="card-pad" style={{ marginTop: 42 }}><div className="eyebrow">Start with a clear baseline</div><h1 className="page-title" style={{ fontSize: 38 }}>Check your job readiness.</h1><p className="secondary-text">{production ? "Sign in with a secure magic link. Your profile and progress stay connected to your account." : "Use the demo account to explore the full JobReady flow in this browser."}</p><div style={{ marginTop: 22 }}><InputField id="email" label="Email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} helper={production ? "We'll email you a secure sign-in link." : "The demo account is prefilled for local exploration."} /></div>{error && <div style={{ marginTop: 14 }}><Alert tone="error">{error}</Alert></div>}{sent && <div style={{ marginTop: 14 }}><Alert tone="success">Check your email for the secure sign-in link.</Alert></div>}<Button block size="lg" onClick={submit} disabled={busy} style={{ marginTop: 18 }}>{busy ? "Sending secure link…" : production ? "Send secure sign-in link →" : "Continue with demo account →"}</Button><p className="helper-text" style={{ textAlign: "center", marginBottom: 0 }}>{production ? "Supabase Auth handles the session; JobReady does not store a password." : "Demo progress is local to this browser."}</p></Card></main>;
}
