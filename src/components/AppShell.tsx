"use client";

import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { PageHeader } from "@/components/ui";

const readinessPaths = new Set(["/analysis", "/roles", "/gaps"]);

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "home" as const },
  { href: "/analysis", label: "Readiness", icon: "readiness" as const, children: [
    { href: "/analysis", label: "Overview" },
    { href: "/roles", label: "Role matches" },
    { href: "/gaps", label: "Evidence gaps" },
  ] },
  { href: "/projects", label: "Projects", icon: "projects" as const },
];

export function AppShell({ children }: { children: ReactNode }) {
  return <div className="app-shell"><a href="#main-content" className="skip-link">Skip to content</a><Suspense fallback={<ShellNavigation />}><ActiveShellNavigation /></Suspense><div className="app-shell-main"><Suspense fallback={<DesktopTopbar title="Workspace" />}><ActiveDesktopTopbar /></Suspense><Suspense fallback={<MobileHeader title="Workspace" />}><ActiveMobileHeader /></Suspense><div id="main-content" className="app-content" tabIndex={-1}>{children}</div></div><Suspense fallback={<MobileNavigation />}><ActiveMobileNavigation /></Suspense></div>;
}

function ActiveShellNavigation() { return <ShellNavigation path={usePathname()} />; }
function ActiveDesktopTopbar() { const path = usePathname(); return <DesktopTopbar title={sectionTitle(path)} />; }
function ActiveMobileHeader() { const path = usePathname(); return <MobileHeader title={sectionTitle(path)} />; }
function ActiveMobileNavigation() { return <MobileNavigation path={usePathname()} />; }

function ShellNavigation({ path }: { path?: string }) {
  const router = useRouter();
  const logout = async () => {
    ["jobready-user", "jobready-onboarded", "jobready-structured-resume", "jobready-resume-ready", "jobready-resume-source", "jobready-entitlement"].forEach((key) => window.localStorage.removeItem(key));
    await getSupabaseBrowserClient()?.auth.signOut();
    router.push("/");
  };

  return <aside className="app-sidebar" aria-label="Primary navigation"><div className="app-sidebar-inner"><Link href="/dashboard" className="app-brand" aria-label="JobReady dashboard"><span className="app-brand-mark" aria-hidden="true" />jobready</Link><nav className="app-nav">{navItems.map((item) => { const active = item.href === "/analysis" ? readinessPaths.has(path ?? "") : path === item.href || Boolean(path?.startsWith(`${item.href}/`)); return <div className="app-nav-group" key={item.href}><Link href={item.href} className="app-nav-link" data-active={active ? "true" : "false"} aria-current={path === item.href ? "page" : undefined}><NavIcon name={item.icon} /><span>{item.label}</span></Link>{item.children && <div className="app-subnav">{item.children.map((child) => <Link key={child.href} href={child.href} className="app-subnav-link" data-active={path === child.href ? "true" : "false"} aria-current={path === child.href ? "page" : undefined}>{child.label}</Link>)}</div>}</div>; })}</nav><div className="app-sidebar-footer"><Link href="/settings" className="app-nav-link" data-active={path === "/settings" ? "true" : "false"}><NavIcon name="settings" /><span>Settings</span></Link><button type="button" onClick={logout} className="app-nav-link" style={{ border: 0, width: "100%", background: "transparent", cursor: "pointer", textAlign: "left" }}><NavIcon name="logout" /><span>Log out</span></button></div></div></aside>;
}

function DesktopTopbar({ title }: { title: string }) { return <div className="app-topbar"><div className="app-topbar-title">{title}</div><Link href="/resume" className="btn btn-ghost btn-sm">Update resume</Link></div>; }
function MobileHeader({ title }: { title: string }) { return <header className="mobile-header"><Link href="/dashboard" className="app-brand" aria-label="JobReady dashboard"><span className="app-brand-mark" aria-hidden="true" />jobready</Link><span className="mobile-section">{title}</span></header>; }

function MobileNavigation({ path }: { path?: string }) {
  const items = [
    { href: "/dashboard", label: "Home", icon: "home" as const, active: path === "/dashboard" },
    { href: "/analysis", label: "Readiness", icon: "readiness" as const, active: readinessPaths.has(path ?? "") },
    { href: "/projects", label: "Projects", icon: "projects" as const, active: path === "/projects" || Boolean(path?.startsWith("/projects/")) },
    { href: "/settings", label: "Account", icon: "settings" as const, active: path === "/settings" || path === "/resume" },
  ];
  return <nav className="mobile-nav" aria-label="Mobile navigation">{items.map((item) => <Link key={item.href} href={item.href} className="mobile-nav-link" data-active={item.active ? "true" : "false"} aria-current={item.active ? "page" : undefined}><NavIcon name={item.icon} /><span>{item.label}</span></Link>)}</nav>;
}

function sectionTitle(path?: string) {
  if (path === "/dashboard") return "Dashboard";
  if (path === "/analysis") return "Readiness overview";
  if (path === "/roles") return "Role matches";
  if (path === "/gaps") return "Evidence gaps";
  if (path === "/projects" || path?.startsWith("/projects/")) return "Projects";
  if (path === "/resume") return "Resume";
  if (path === "/onboarding") return "Profile setup";
  if (path === "/settings") return "Settings";
  return "Workspace";
}

function NavIcon({ name }: { name: "home" | "readiness" | "projects" | "settings" | "logout" }) {
  if (name === "home") return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M3.5 10.5 12 3l8.5 7.5"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9.5 21v-6h5v6"/></svg>;
  if (name === "readiness") return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 19V9"/><path d="M10 19V5"/><path d="M16 19v-8"/><path d="M22 19V3"/></svg>;
  if (name === "projects") return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M8 4v5"/></svg>;
  if (name === "settings") return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2H10V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></svg>;
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M15 4h5v16h-5"/></svg>;
}

export function PageTitle({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) { return <PageHeader eyebrow={eyebrow} title={title} description={body} />; }
