"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { MarsLogo } from "@/components/MarsLogo";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(payload?.error || "Giriş yapılamadı.");
        return;
      }

      const nextPath = searchParams.get("next");
      const safeNext = nextPath?.startsWith("/admin") && !nextPath.startsWith("//") ? nextPath : "/admin";
      router.replace(safeNext);
      router.refresh();
    } catch {
      setError("Bağlantı kurulamadı. Biraz sonra yeniden deneyin.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_42%),radial-gradient(circle_at_85%_80%,rgba(45,212,191,0.12),transparent_34%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl"
      />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 shadow-[0_40px_120px_rgba(2,6,23,0.55)] backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden flex-col justify-between border-r border-white/10 bg-slate-900/40 p-10 lg:flex">
          <MarsLogo wordmarkClassName="text-base" />
          <div>
            <p className="text-xs font-semibold tracking-[0.24em] text-emerald-300/80 uppercase">Yönetim paneli</p>
            <h1 className="mt-4 max-w-sm text-4xl font-semibold tracking-tight text-white">
              Mars Web Ajans içerik odası
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">
              Talepler, paketler, referanslar ve site ayarları bu panele özel Authentication hesabınızla açılır.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-300" aria-hidden />
            Giriş, Supabase Authentication &gt; Users kaydınızdaki e-posta ve şifreyle yapılır.
          </div>
        </section>

        <section className="p-6 sm:p-10">
          <div className="lg:hidden">
            <MarsLogo wordmarkClassName="text-sm" />
          </div>
          <div className="mt-8 lg:mt-2">
            <p className="text-xs font-semibold tracking-[0.22em] text-emerald-300/80 uppercase">Güvenli giriş</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">Panele hoş geldiniz</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">Authentication içine eklediğiniz e-posta ve şifreyi girin.</p>
          </div>

          <form method="post" action="/admin/login" className="mt-8 space-y-4" onSubmit={onSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-200">E-posta</span>
              <span className="relative block">
                <UserRound className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden />
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="email"
                  name="username"
                  type="email"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 py-3 pr-4 pl-11 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="e-posta adresiniz"
                />
              </span>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-200">Şifre</span>
              <span className="relative block">
                <LockKeyhole className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 py-3 pr-12 pl-11 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:text-white"
                  aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
                </button>
              </span>
            </label>

            {error ? (
              <p className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-100" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Kontrol ediliyor..." : "Giriş yap"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <AdminLoginForm />
    </Suspense>
  );
}
