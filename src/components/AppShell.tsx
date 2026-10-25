"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={<SiteHeader />}>
        <ActiveSiteHeader />
      </Suspense>
      {children}
    </>
  );
}

function ActiveSiteHeader() {
  const path = usePathname();
  return <SiteHeader path={path} />;
}

function SiteHeader({ path }: { path?: string }) {
  const router = useRouter();
  const links = [
    ["/dashboard", "Overview"],
    ["/analysis", "Analysis"],
    ["/roles", "Roles"],
    ["/projects", "Projects"],
    ["/settings", "Settings"],
  ];

  const logout = async () => {
    window.localStorage.removeItem("jobready-user");
    window.localStorage.removeItem("jobready-onboarded");
    window.localStorage.removeItem("jobready-structured-resume");
    window.localStorage.removeItem("jobready-resume-ready");
    window.localStorage.removeItem("jobready-resume-source");
    window.localStorage.removeItem("jobready-entitlement");
    await getSupabaseBrowserClient()?.auth.signOut();
    router.push("/");
  };

  return (
    <header
      style={{ background: "#fff", borderBottom: "1px solid var(--line)" }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 0",
        }}
      >
        <Link href="/dashboard" style={{ fontWeight: 800, fontSize: 20 }}>
          <span style={{ color: "var(--orange)" }}>●</span> jobready
        </Link>
        <nav
          style={{ display: "flex", gap: 18, alignItems: "center", fontSize: 13 }}
        >
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              style={{
                fontWeight: path === href ? 700 : 400,
                color: path === href ? "var(--orange)" : "var(--muted)",
              }}
            >
              {label}
            </Link>
          ))}
          <button type="button" onClick={logout} className="btn btn-ghost" style={{ padding: "8px 14px" }}>
            Log out
          </button>
        </nav>
      </div>
    </header>
  );
}

export function PageTitle({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return <div style={{marginBottom:32}}><div className="eyebrow">{eyebrow}</div><h1 className="serif" style={{fontSize:"clamp(38px,5vw,58px)", lineHeight:1.02, letterSpacing:"-.045em", margin:"10px 0 12px"}}>{title}</h1><p style={{color:"var(--muted)", lineHeight:1.6, maxWidth:680, margin:0}}>{body}</p></div>;
}
