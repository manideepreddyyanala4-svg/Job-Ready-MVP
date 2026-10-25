import Link from "next/link";
import type { CSSProperties, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  block?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
  style?: CSSProperties;
};

export function Button({ children, href, variant = "primary", size = "md", block = false, className, type = "button", disabled, onClick, ariaLabel, style }: ButtonProps) {
  const classes = cx("btn", variant === "secondary" ? "btn-secondary" : `btn-${variant}`, size !== "md" && `btn-${size}`, block && "btn-block", className);
  if (href && !disabled) return <Link href={href} className={classes} aria-label={ariaLabel} style={style}>{children}</Link>;
  return <button type={type} className={classes} disabled={disabled} onClick={onClick} aria-label={ariaLabel} style={style}>{children}</button>;
}

export function Card({ children, className, subtle = false, strong = false, style }: { children: ReactNode; className?: string; subtle?: boolean; strong?: boolean; style?: CSSProperties }) {
  return <div className={cx("card", subtle && "card-subtle", strong && "card-strong", className)} style={style}>{children}</div>;
}

export function PageHeader({ eyebrow, title, description, actions, children }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode; children?: ReactNode }) {
  return <header className="page-header"><div className="page-header-copy">{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1 className="page-title">{title}</h1>{description && <p className="page-description">{description}</p>}{children}</div>{actions && <div className="page-header-actions">{actions}</div>}</header>;
}

export function SectionHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <div className="section-header"><div><h2 className="section-title">{title}</h2>{description && <p className="section-description">{description}</p>}</div>{action}</div>;
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "accent" | "success" | "warning" | "error" | "info" }) {
  return <span className={cx("badge", tone !== "neutral" && `badge-${tone}`)}>{children}</span>;
}

export function ProgressBar({ value, label, tone = "accent" }: { value: number; label?: string; tone?: "accent" | "success" }) {
  const safe = Math.max(0, Math.min(100, value));
  return <div>{label && <div className="meta" style={{ marginBottom: 7 }}>{label}</div>}<div className={cx("progress", tone === "success" && "progress-success")} role="progressbar" aria-label={label ?? "Progress"} aria-valuemin={0} aria-valuemax={100} aria-valuenow={safe}><div className="progress-bar" style={{ width: `${safe}%` }} /></div></div>;
}

export function ScoreDisplay({ value, max = 100, label, description }: { value: number; max?: number; label: string; description?: string }) {
  return <div><div className="eyebrow">{label}</div><div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "12px 0" }}><strong className="score-number">{value}</strong><span className="muted-text">/ {max}</span></div>{description && <p className="secondary-text" style={{ margin: 0 }}>{description}</p>}</div>;
}

export function MetricRow({ label, value, meta }: { label: string; value: ReactNode; meta?: string }) {
  return <div className="metric-row"><div><div className="label">{label}</div>{meta && <div className="meta">{meta}</div>}</div><strong>{value}</strong></div>;
}

export function Alert({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "success" | "warning" | "error" }) {
  return <div className={cx("alert", `alert-${tone}`)} role={tone === "error" ? "alert" : "status"}>{children}</div>;
}

export function EmptyState({ title, body, action, icon = "○" }: { title: string; body: string; action?: ReactNode; icon?: ReactNode }) {
  return <section className="empty-state"><div className="empty-state-icon" aria-hidden="true">{icon}</div><h2>{title}</h2><p>{body}</p>{action}</section>;
}

export function ErrorState({ title = "Something went wrong", body, retry }: { title?: string; body: string; retry?: () => void }) {
  return <section className="error-state" role="alert"><div className="state-icon" aria-hidden="true">!</div><h2>{title}</h2><p>{body}</p>{retry && <Button variant="ghost" onClick={retry}>Try again</Button>}</section>;
}

export function LoadingState({ label = "Loading your workspace…" }: { label?: string }) {
  return <section className="loading-state" aria-busy="true" aria-live="polite"><Skeleton width="42%" height={18} /><Skeleton width="78%" height={38} /><Skeleton width="100%" height={116} /><span className="visually-hidden">{label}</span></section>;
}

export function Skeleton({ width = "100%", height = 18, radius = 8 }: { width?: string; height?: number; radius?: number }) {
  return <div className="skeleton" aria-hidden="true" style={{ width, height, borderRadius: radius }} />;
}

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return <span className="tooltip"><span tabIndex={0} aria-label={label}>{children}</span><span className="tooltip-content" role="tooltip">{label}</span></span>;
}

export function Tabs({ items, activePath }: { items: Array<{ href: string; label: string }>; activePath: string }) {
  return <nav className="tabs" aria-label="Section navigation">{items.map((item) => <Link key={item.href} href={item.href} className="tab" data-active={activePath === item.href ? "true" : "false"} aria-current={activePath === item.href ? "page" : undefined}>{item.label}</Link>)}</nav>;
}

export function Breadcrumb({ items }: { items: Array<{ label: string; href?: string }> }) {
  return <nav className="breadcrumb" aria-label="Breadcrumb">{items.map((item, index) => <span key={`${item.label}-${index}`} style={{ display: "contents" }}>{index > 0 && <span className="breadcrumb-separator" aria-hidden="true">/</span>}{item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}</span>)}</nav>;
}

export function StepIndicator({ current, total, label }: { current: number; total: number; label?: string }) {
  return <div><div className="step-indicator" aria-label={label ?? `Step ${current} of ${total}`}>{Array.from({ length: total }, (_, i) => { const step = i + 1; const state = step < current ? "complete" : step === current ? "current" : "upcoming"; return <span className="step-dot" data-state={state} key={step} aria-hidden="true" />; })}</div><span className="visually-hidden">{label ?? `Step ${current} of ${total}`}</span></div>;
}

export function FilterChip({ children, selected, onClick }: { children: ReactNode; selected?: boolean; onClick?: () => void }) {
  return <button type="button" className="filter-chip" aria-pressed={Boolean(selected)} onClick={onClick}>{children}</button>;
}

type FieldBase = { label: string; helper?: string; error?: string; id: string };

export function InputField({ label, helper, error, id, ...props }: FieldBase & InputHTMLAttributes<HTMLInputElement>) {
  const helperId = helper ? `${id}-helper` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return <label className={cx("field", error && "field-error")} htmlFor={id}><span className="field-label">{label}</span><input {...props} id={id} className={cx("input", props.className)} aria-describedby={[helperId, errorId].filter(Boolean).join(" ") || undefined} aria-invalid={Boolean(error)} />{helper && <span id={helperId} className="helper-text">{helper}</span>}{error && <span id={errorId} className="error-text" role="alert">{error}</span>}</label>;
}

export function SelectField({ label, helper, error, id, children, ...props }: FieldBase & SelectHTMLAttributes<HTMLSelectElement>) {
  return <label className={cx("field", error && "field-error")} htmlFor={id}><span className="field-label">{label}</span><select {...props} id={id} className={cx("select", props.className)} aria-invalid={Boolean(error)}>{children}</select>{helper && <span className="helper-text">{helper}</span>}{error && <span className="error-text" role="alert">{error}</span>}</label>;
}

export function TextareaField({ label, helper, error, id, ...props }: FieldBase & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <label className={cx("field", error && "field-error")} htmlFor={id}><span className="field-label">{label}</span><textarea {...props} id={id} className={cx("textarea", props.className)} aria-invalid={Boolean(error)} />{helper && <span className="helper-text">{helper}</span>}{error && <span className="error-text" role="alert">{error}</span>}</label>;
}

export function FileUploadArea({ children }: { children: ReactNode }) {
  return <div className="file-upload">{children}</div>;
}
