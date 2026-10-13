"use client";

import { Loader2, RefreshCw } from "lucide-react";

export const inputClass =
  "w-full rounded-xl border border-white/10 bg-slate-950/70 px-3.5 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-500/20";

export const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60";

export const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 disabled:cursor-not-allowed disabled:opacity-60";

export function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={`overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 shadow-[0_24px_80px_rgba(2,6,23,0.35)] backdrop-blur-md ${className}`}
    >
      {children}
    </section>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  onRefresh,
  refreshing = false,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  onRefresh?: () => void;
  refreshing?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.22em] text-emerald-300/80 uppercase">{eyebrow}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {onRefresh ? (
          <button type="button" onClick={onRefresh} className={secondaryButtonClass} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} aria-hidden />
            Yenile
          </button>
        ) : null}
        {action}
      </div>
    </div>
  );
}

export function BilingualGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>;
}

export function LanguageColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
      <p className="text-[11px] font-semibold tracking-[0.18em] text-emerald-300/80 uppercase">{title}</p>
      {children}
    </div>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">{label}</span>
      {children}
      {error ? <span className="block text-xs text-rose-300">{error}</span> : hint ? <span className="block text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}

export function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-slate-950/50 px-3.5 py-3">
      <span className="text-sm text-slate-200">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-emerald-500"
      />
    </label>
  );
}

export function IconButton({
  label,
  tone = "default",
  onClick,
  children,
}: {
  label: string;
  tone?: "default" | "danger";
  onClick: () => void;
  children: React.ReactNode;
}) {
  const toneClass =
    tone === "danger" ? "hover:border-rose-400/50 hover:text-rose-200" : "hover:border-emerald-400/50 hover:text-emerald-200";
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-300 transition ${toneClass}`}
    >
      {children}
    </button>
  );
}

export function StatusNote({ tone, children }: { tone: "error" | "warning"; children: React.ReactNode }) {
  const styles =
    tone === "error"
      ? "border-rose-400/30 bg-rose-500/10 text-rose-100"
      : "border-amber-300/30 bg-amber-400/10 text-amber-50";
  return <div className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${styles}`}>{children}</div>;
}

export function SetupNotice() {
  return (
    <StatusNote tone="warning">
      Panel Supabase&apos;e bağlanamadı. Proje kökünde <code className="text-amber-100">.env.local</code> dosyasına{" "}
      <code className="text-amber-100">NEXT_PUBLIC_SUPABASE_URL</code> ve{" "}
      <code className="text-amber-100">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> ekleyip geliştirme sunucusunu yeniden başlatın.
      Ardından <code className="text-amber-100">database-schema.sql</code> dosyasını Supabase SQL Editor&apos;da çalıştırın.
    </StatusNote>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-4 sm:p-5" aria-busy="true" aria-label="Yükleniyor">
      <div className="h-10 animate-pulse rounded-lg bg-slate-800/80" />
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="grid grid-cols-4 gap-3">
          <div className="col-span-2 h-11 animate-pulse rounded-lg bg-slate-800/70" />
          <div className="h-11 animate-pulse rounded-lg bg-slate-800/50" />
          <div className="h-11 animate-pulse rounded-lg bg-slate-800/40" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true" aria-label="Yükleniyor">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-32 animate-pulse rounded-2xl border border-white/10 bg-slate-900/50" />
      ))}
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="px-6 py-16 text-center">
      <p className="text-base font-medium text-white">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">{body}</p>
    </div>
  );
}

export function ModalActions({
  onCancel,
  saving,
  submitLabel,
}: {
  onCancel: () => void;
  saving: boolean;
  submitLabel: string;
}) {
  return (
    <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <button type="button" onClick={onCancel} className={secondaryButtonClass} disabled={saving}>
        Vazgeç
      </button>
      <button type="submit" className={primaryButtonClass} disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
        {saving ? "Kaydediliyor" : submitLabel}
      </button>
    </div>
  );
}
