"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeDollarSign,
  CircleHelp,
  Images,
  Inbox,
  LayoutDashboard,
  Menu,
  Quote,
  Settings,
  X,
  type LucideIcon,
} from "lucide-react";
import { MarsLogo } from "@/components/MarsLogo";
import { ToastProvider } from "@/components/admin/toast-provider";

const navItems: { href: string; label: string; icon: LucideIcon; exact?: boolean }[] = [
  { href: "/admin", label: "Dashboard (Özet)", icon: LayoutDashboard, exact: true },
  { href: "/admin/leads", label: "Müşteri Talepleri (Leads)", icon: Inbox },
  { href: "/admin/packages", label: "Paketler & Fiyatlar", icon: BadgeDollarSign },
  { href: "/admin/faqs", label: "Sıkça Sorulan Sorular", icon: CircleHelp },
  { href: "/admin/projects", label: "Referanslarımız", icon: Images },
  { href: "/admin/testimonials", label: "Müşteri Yorumları", icon: Quote },
  { href: "/admin/settings", label: "Genel Ayarlar", icon: Settings },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarNav({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="mt-8 space-y-1" aria-label="Yönetim">
      <p className="px-3 pb-2 text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase">Yönetim</p>
      {navItems.map((item) => {
        const active = isActive(pathname, item.href, item.exact);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
              active
                ? "bg-emerald-500/15 text-emerald-200 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.35)]"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon className={`h-4 w-4 shrink-0 ${active ? "text-emerald-400" : "text-slate-500"}`} aria-hidden />
            <span className="leading-5">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setOpen(false), 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-950 text-slate-200">
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-white/10 bg-slate-950 px-4 pt-6 pb-8 lg:flex">
          <Link href="/admin" className="px-2">
            <MarsLogo wordmarkClassName="text-sm" />
          </Link>
          <p className="mt-3 px-3 text-xs text-slate-500">Yönetim paneli</p>
          <SidebarNav pathname={pathname} />
          <div className="mt-auto rounded-2xl border border-white/10 bg-slate-900/50 p-4 backdrop-blur-md">
            <p className="text-xs leading-5 text-slate-400">İçerikler Supabase üzerinden yayınlanır.</p>
            <Link href="/" className="mt-3 inline-flex text-sm font-medium text-emerald-300 transition hover:text-emerald-200">
              Siteyi görüntüle
            </Link>
          </div>
        </aside>

        {open ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button type="button" aria-label="Menüyü kapat" className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <aside className="absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col border-r border-white/10 bg-slate-950 px-4 py-5">
              <div className="flex items-center justify-between">
                <MarsLogo wordmarkClassName="text-sm" />
                <button
                  type="button"
                  aria-label="Menüyü kapat"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-300"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <SidebarNav pathname={pathname} onNavigate={() => setOpen(false)} />
            </aside>
          </div>
        ) : null}

        <div className="relative lg:pl-72">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.14),transparent_62%)]" />
          <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/10 bg-slate-950/80 px-4 py-3 backdrop-blur-md lg:hidden">
            <button
              type="button"
              aria-label="Menüyü aç"
              onClick={() => setOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-200"
            >
              <Menu className="h-4 w-4" aria-hidden />
            </button>
            <MarsLogo wordmarkClassName="text-sm" />
          </header>
          <main className="relative mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 sm:py-10">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
