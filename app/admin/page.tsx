"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BadgeDollarSign, CircleHelp, Images, Inbox, Quote, Users, type LucideIcon } from "lucide-react";
import { CardSkeleton, PageHeader, Panel, SetupNotice, StatusNote, TableSkeleton } from "@/components/admin/primitives";
import { leadHasContent, leadPackage, normalizeLead, type LeadView } from "@/lib/admin/leads";
import { friendlyError } from "@/lib/admin/format";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Counts = {
  users: number | null;
  leads: number | null;
  packages: number | null;
  faqs: number | null;
  projects: number | null;
  testimonials: number | null;
};

const cards: { key: keyof Counts; label: string; href: string; icon: LucideIcon }[] = [
  { key: "users", label: "Users", href: "/admin/users", icon: Users },
  { key: "leads", label: "Müşteri talepleri", href: "/admin/leads", icon: Inbox },
  { key: "packages", label: "Paketler", href: "/admin/packages", icon: BadgeDollarSign },
  { key: "faqs", label: "Sıkça sorulan sorular", href: "/admin/faqs", icon: CircleHelp },
  { key: "projects", label: "Referanslar", href: "/admin/projects", icon: Images },
  { key: "testimonials", label: "Müşteri yorumları", href: "/admin/testimonials", icon: Quote },
];

export default function AdminDashboardPage() {
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState<Counts>({ users: null, leads: null, packages: null, faqs: null, projects: null, testimonials: null });
  const [recent, setRecent] = useState<LeadView[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        if (!cancelled) {
          setConfigured(false);
          setLoading(false);
        }
        return;
      }

      const [leadsCount, packagesCount, faqsCount, projectsCount, testimonialsCount, recentLeads, usersResult] = await Promise.all([
        supabase.from("leads").select("*", { count: "exact", head: true }),
        supabase.from("packages").select("*", { count: "exact", head: true }),
        supabase.from("faqs").select("*", { count: "exact", head: true }),
        supabase.from("projects").select("*", { count: "exact", head: true }),
        supabase.from("testimonials").select("*", { count: "exact", head: true }),
        supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(5),
        fetch("/api/admin/users", { cache: "no-store" }),
      ]);

      const recentResult = recentLeads.error
        ? await supabase.from("leads").select("*").limit(5)
        : recentLeads;

      if (cancelled) return;

      const usersPayload = usersResult.ok ? ((await usersResult.json().catch(() => null)) as { users?: unknown[] } | null) : null;
      const firstError = [leadsCount.error, packagesCount.error, faqsCount.error, projectsCount.error, testimonialsCount.error, recentResult.error].find(Boolean);
      setCounts({
        users: usersPayload?.users ? usersPayload.users.length : null,
        leads: leadsCount.error ? null : (leadsCount.count ?? 0),
        packages: packagesCount.error ? null : (packagesCount.count ?? 0),
        faqs: faqsCount.error ? null : (faqsCount.count ?? 0),
        projects: projectsCount.error ? null : (projectsCount.count ?? 0),
        testimonials: testimonialsCount.error ? null : (testimonialsCount.count ?? 0),
      });
      setRecent(((recentResult.data ?? []) as Record<string, unknown>[]).map(normalizeLead));
      setError(firstError ? friendlyError(firstError.message) : null);
      setConfigured(true);
      setLoading(false);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Mars Web Ajans"
        title="Dashboard (Özet)"
        description="Talepler, paketler, sorular, referanslar ve müşteri yorumları tek bakışta. Ayrıntılı işlemler soldaki sekmelerde."
      />

      {!configured && !loading ? <SetupNotice /> : null}
      {configured && error ? <StatusNote tone="error">{error}</StatusNote> : null}

      {loading ? (
        <CardSkeleton />
      ) : configured ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            const value = counts[card.key];
            return (
              <Link
                key={card.key}
                href={card.href}
                className="group rounded-2xl border border-white/10 bg-slate-900/50 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.28)] backdrop-blur-md transition hover:border-emerald-400/40"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-slate-500 transition group-hover:text-emerald-300" aria-hidden />
                </div>
                <p className="mt-5 text-3xl font-semibold tracking-tight text-white">{value === null ? "—" : value}</p>
                <p className="mt-1 text-sm text-slate-400">{card.label}</p>
              </Link>
            );
          })}
        </section>
      ) : null}

      {configured ? (
      <Panel>
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-sm font-semibold text-white">Son müşteri talepleri</h2>
          <Link href="/admin/leads" className="text-sm font-medium text-emerald-300 transition hover:text-emerald-200">
            Tümünü gör
          </Link>
        </div>
        {loading ? (
          <TableSkeleton rows={3} />
        ) : recent.length === 0 ? (
          <p className="px-5 py-10 text-sm text-slate-400">Henüz listelenecek talep yok.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[640px] w-full text-left text-sm">
              <thead className="text-[11px] tracking-[0.14em] text-slate-500 uppercase">
                <tr>
                  <th className="px-5 py-3 font-semibold">Firma Adı</th>
                  <th className="px-5 py-3 font-semibold">Paket</th>
                  <th className="px-5 py-3 font-semibold">Telefon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recent.map((lead) => (
                  <tr key={lead.id} className="text-slate-200">
                    <td className="px-5 py-3 font-medium text-white">{leadHasContent(lead) ? lead.firmaAdi : "Talep"}</td>
                    <td className="px-5 py-3">{leadPackage(lead)}</td>
                    <td className="px-5 py-3">{lead.telefon}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      ) : null}
    </div>
  );
}
