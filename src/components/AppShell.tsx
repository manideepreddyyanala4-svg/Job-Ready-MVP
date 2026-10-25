"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type NavItem = { href: string; label: string };

const primary: NavItem[] = [{ href: "/dashboard", label: "Dashboard" }];
const readiness: NavItem[] = [
  { href: "/analysis", label: "Readiness overview" },
  { href: "/roles", label: "Role matches" },
  { href: "/gaps", label: "Evidence gaps" },
];
const projects: NavItem[] = [{ href: "/projects", label: "Projects" }];
const account: NavItem[] = [{ href: "/settings", label: "Profile & settings" }];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-layout">
      <Suspense fallback={<ShellNavigation />}>
        <ActiveNavigation />
      </Suspense>
      <main className="app-main">
        <div className="app-content">{children}</div>
      </main>
    </div>
  );
}

function ActiveNavigation() {
  return <ShellNavigation path={usePathname()} />;
}

function isActive(path: string | undefined, href: string) {
  if (!path) return false;
  if (href === "/projects") return path === href || path.startsWith("/projects/");
  return path === href;
}

function NavigationGroup({ label, items, path, onNavigate }: { label: string; items: NavItem[]; path?: string; onNavigate?: () => void }) {
  return (
    <div className="nav-section">
      <div className="nav-label">{label}</div>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="nav-link"
          aria-current={isActive(path, item.href) ? "page" : undefined}
          onClick={onNavigate}
        >
          <span className="nav-dot" aria-hidden="true" />
          {item.label}
        </Link>
      ))}
    </div>
  );
}

function ShellNavigation({ path }: { path?: string }) {
  const router = useRouter();

  const logout = async () => {
    [
      "jobready-user",
      "jobready-onboarded",
      "jobready-onboarding-draft",
      "jobready-student-profile",
      "jobready-structured-resume",
      "jobready-resume-ready",
      "jobready-resume-source",
      "jobready-entitlement",
    ].forEach((key) => window.localStorage.removeItem(key));
    await getSupabaseBrowserClient()?.auth.signOut();
    router.replace("/");
    router.refresh();
  };

  const nav = (
    <>
      <NavigationGroup label="Home" items={primary} path={path} />
      <NavigationGroup label="Readiness" items={readiness} path={path} />
      <NavigationGroup label="Projects" items={projects} path={path} />
      <NavigationGroup label="Account" items={account} path={path} />
    </>
  );

  return (
    <>
      <aside className="app-sidebar" aria-label="JobReady navigation">
        <Link href="/dashboard" className="app-brand">
          <span className="brand-mark" aria-hidden="true" />
          JobReady
        </Link>
        <nav>{nav}</nav>
        <div className="app-sidebar-footer">
          <Link href="/privacy" className="nav-link">Privacy</Link>
          <button type="button" className="btn btn-secondary" onClick={logout}>Log out</button>
        </div>
      </aside>
      <header className="app-topbar">
        <Link href="/dashboard" className="app-brand" style={{ padding: 0 }}>
          <span className="brand-mark" aria-hidden="true" />
          JobReady
        </Link>
        <details className="mobile-menu">
          <summary aria-label="Open navigation">Menu</summary>
          <nav className="mobile-menu-panel" aria-label="Mobile navigation">
            {nav}
            <div className="nav-section">
              <button type="button" className="btn btn-secondary" style={{ width: "100%" }} onClick={logout}>Log out</button>
            </div>
          </nav>
        </details>
      </header>
    </>
  );
}

export function PageTitle({
  eyebrow,
  title,
  body,
  actions,
}: {
  eyebrow: string;
  title: string;
  body: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="page-heading">
      <div className="page-heading-row">
        <div>
          <div className="eyebrow">{eyebrow}</div>
          <h1 className="page-title">{title}</h1>
          <p className="page-lede">{body}</p>
        </div>
        {actions ? <div className="page-actions">{actions}</div> : null}
      </div>
    </header>
  );
}
