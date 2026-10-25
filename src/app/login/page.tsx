"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function Login() {
  const router = useRouter(); const [email, setEmail] = useState("arjun@example.com");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const production = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_JOBREADY_MODE === "production");
  const submit = async () => {
    if (!email.trim() || !email.includes("@")) {
      setError("Enter a valid email address to continue.");
      return;
    }
    if (production) {
      setBusy(true);
      const client = getSupabaseBrowserClient();
      const { error: authError } = await client!.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      setBusy(false);
      if (authError) {
        setError(authError.message);
        return;
      }
      setError("Check your email for a secure sign-in link.");
      return;
    }
    localStorage.setItem("jobready-user", email.trim());
    router.push("/onboarding");
  };
  return <main className="container" style={{padding:"70px 0", maxWidth:560}}><Link href="/" style={{fontWeight:800, fontSize:20}}><span style={{color:"var(--orange)"}}>●</span> jobready</Link><div className="card" style={{padding:32, marginTop:60}}><div className="eyebrow">Start with a clear baseline</div><h1 className="serif" style={{fontSize:42, margin:"10px 0"}}>Check your job readiness.</h1><p style={{color:"var(--muted)", lineHeight:1.5}}>{production ? "Sign in with a secure magic link. Your profile and progress are stored in your account." : "Use the demo account to explore the complete V0 flow. Your progress is stored locally in this browser."}</p><label style={{display:"block", marginTop:24, fontSize:13, fontWeight:700}}>Email<input value={email} onChange={e=>{setEmail(e.target.value);setError("");}} type="email" autoComplete="email" style={{display:"block", width:"100%", marginTop:8, padding:13, border:"1px solid var(--line)", borderRadius:9}}/></label>{error&&<p role="alert" style={{color:"#b23b2e",fontSize:13}}>{error}</p>}<button className="btn btn-primary" style={{width:"100%", marginTop:18}} onClick={submit} disabled={busy}>{busy ? "Sending secure link…" : production ? "Send secure sign-in link →" : "Continue with demo account →"}</button><p style={{fontSize:12, color:"var(--muted)", textAlign:"center", marginTop:18}}>{production ? "Supabase Auth handles the session; no password is stored by JobReady." : "Supabase Auth adapter is ready for production credentials. No password is stored by this demo."}</p></div></main>;
}
