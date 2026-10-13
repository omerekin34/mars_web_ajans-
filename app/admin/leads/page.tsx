"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Trash2, X } from "lucide-react";
import { AdminModal } from "@/components/admin/modal";
import { useAdminToast } from "@/components/admin/toast-provider";
import { EmptyState, inputClass, PageHeader, Panel, primaryButtonClass, secondaryButtonClass, SetupNotice, StatusNote, TableSkeleton } from "@/components/admin/primitives";
import { leadHasContent, leadNote, leadPackage, leadStatusLabel, normalizeLead, type LeadStatus, type LeadView } from "@/lib/admin/leads";
import { friendlyError } from "@/lib/admin/format";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const empty = "—";

type StatusFilter = "all" | LeadStatus;
type Acting = { id: string; kind: LeadStatus | "delete" };

const statusFilters: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "pending", label: "Bekleyenler" },
  { id: "accepted", label: "Kabul Edilenler" },
  { id: "rejected", label: "Reddedilenler" },
];

function StatusBadge({ status }: { status: LeadStatus }) {
  const tone =
    status === "accepted"
      ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
      : status === "rejected"
        ? "border-rose-400/35 bg-slate-700/50 text-rose-200"
        : "border-amber-300/40 bg-amber-400/10 text-amber-100";

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide ${tone}`}>
      {leadStatusLabel(status)}
    </span>
  );
}

function ActionButton({
  label,
  disabled,
  onClick,
  className,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-white/5 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="text-[11px] font-semibold tracking-[0.16em] text-slate-500 uppercase">{label}</dt>
      <dd className="text-sm leading-6 whitespace-pre-wrap text-slate-100">{value || empty}</dd>
    </div>
  );
}

export default function LeadsPage() {
  const toast = useAdminToast();
  const router = useRouter();
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leads, setLeads] = useState<LeadView[]>([]);
  const [sampleKeys, setSampleKeys] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [active, setActive] = useState<LeadView | null>(null);
  const [acting, setActing] = useState<Acting | null>(null);

  const load = async (isRefresh: boolean) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setConfigured(false);
      setLeads([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    setConfigured(true);
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    const ordered = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    const result =
      ordered.error && /created_at|column/i.test(ordered.error.message)
        ? await supabase.from("leads").select("*")
        : ordered;

    if (result.error) {
      setError(friendlyError(result.error.message));
      if (!isRefresh) setLeads([]);
    } else {
      const raw = (result.data ?? []) as Record<string, unknown>[];
      setLeads(raw.map(normalizeLead));
      setSampleKeys(raw[0] ? Object.keys(raw[0]) : []);
      setError(null);
    }

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("tr");
    return leads.filter((lead) => {
      if (statusFilter !== "all" && lead.status !== statusFilter) return false;
      if (!needle) return true;
      return [
        lead.adSoyad,
        lead.firmaAdi,
        lead.email,
        lead.telefon,
        lead.projectType,
        lead.budgetRange,
        lead.domainStatus,
        leadPackage(lead),
        lead.addons,
        leadNote(lead),
        lead.sektor,
        lead.adres,
        leadStatusLabel(lead.status),
      ].some((value) => value.toLocaleLowerCase("tr").includes(needle));
    });
  }, [leads, query, statusFilter]);

  const unmapped = leads.length > 0 && leads.every((lead) => !leadHasContent(lead));
  const narrowed = Boolean(query.trim()) || statusFilter !== "all";

  const updateStatus = async (lead: LeadView, status: LeadStatus) => {
    if (acting || lead.status === status || lead.id.startsWith("lead-")) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setConfigured(false);
      return;
    }

    setActing({ id: lead.id, kind: status });
    const { error: updateError } = await supabase.from("leads").update({ status }).eq("id", lead.id);
    setActing(null);

    if (updateError) {
      const message = friendlyError(updateError.message);
      setError(message);
      toast.notify(message, "error");
      return;
    }

    const next = { ...lead, status };
    setLeads((current) => current.map((item) => (item.id === lead.id ? next : item)));
    setActive((current) => (current?.id === lead.id ? next : current));
    setError(null);
    toast.success();
    router.refresh();
  };

  const removeLead = async (lead: LeadView) => {
    if (acting || lead.id.startsWith("lead-")) return;
    const confirmed = window.confirm("Bu talebi kalıcı olarak silmek istediğinize emin misiniz?");
    if (!confirmed) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setConfigured(false);
      return;
    }

    setActing({ id: lead.id, kind: "delete" });
    const { data: removed, error: deleteError } = await supabase
      .from("leads")
      .delete()
      .eq("id", lead.id)
      .select("id");
    setActing(null);

    if (deleteError || !removed?.length) {
      const message = deleteError
        ? friendlyError(deleteError.message)
        : "Kayıt silinemedi. leads.sql dosyasındaki silme iznini Supabase SQL Editor'da çalıştırın.";
      setError(message);
      toast.notify(message, "error");
      return;
    }

    setLeads((current) => current.filter((item) => item.id !== lead.id));
    setActive((current) => (current?.id === lead.id ? null : current));
    setError(null);
    toast.success();
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Talepler"
        title="Müşteri Talepleri (Leads)"
        description="Teklif sihirbazı ve paket formundan gelen talepler. Duruma göre süzün, bekleyenleri kabul edin veya reddedin, kaydı kalıcı olarak silin."
        onRefresh={() => void load(true)}
        refreshing={refreshing}
      />

      {!configured && !loading ? <SetupNotice /> : null}
      {error ? <StatusNote tone="error">{error}</StatusNote> : null}
      {unmapped ? (
        <StatusNote tone="warning">
          Kayıtlar geldi ancak beklenen sütun adları eşleşmedi. Tabloda şu alanlar aranıyor: ad_soyad, firma_adi, telefon,
          email, project_type, domain_status, budget_range, status. Mevcut alanlar: {sampleKeys.join(", ") || "—"}.
        </StatusNote>
      ) : null}

      {configured || loading ? (
      <Panel>
        <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4">
          <p className="text-sm text-slate-400">{loading ? "Yükleniyor" : `${filtered.length} talep`}</p>
          <div className="flex flex-wrap items-center gap-3">
            <div
              role="tablist"
              aria-label="Durum filtresi"
              className="inline-flex shrink-0 gap-1 rounded-xl border border-white/10 bg-slate-950/70 p-1"
            >
              {statusFilters.map((item) => {
                const selected = statusFilter === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setStatusFilter(item.id)}
                    className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                      selected ? "bg-emerald-500 text-slate-950 shadow-sm" : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Firma, proje tipi veya telefon ara"
              className={`${inputClass} w-full min-w-[16rem] flex-1 sm:w-auto sm:max-w-xs`}
              aria-label="Taleplerde ara"
            />
          </div>
        </div>
        {loading ? (
          <TableSkeleton />
        ) : !configured || (error && leads.length === 0) ? null : filtered.length === 0 ? (
          <EmptyState
            title={leads.length === 0 ? "Henüz talep yok" : "Eşleşen talep yok"}
            body={
              leads.length === 0
                ? "Teklif sihirbazından gelen kayıtlar burada görünecek."
                : narrowed
                  ? "Aramayı temizleyerek veya durum filtresini değiştirerek diğer taleplere dönebilirsiniz."
                  : "Aramayı temizleyerek tüm taleplere dönebilirsiniz."
            }
          />
        ) : (
          <div className="max-h-[70vh] overflow-auto">
            <table className="min-w-[1480px] w-full text-left text-sm">
              <thead className="sticky top-0 bg-slate-900/95 text-[11px] tracking-[0.14em] text-slate-400 uppercase backdrop-blur-md">
                <tr>
                  <th className="px-5 py-3 font-semibold">Ad Soyad</th>
                  <th className="px-5 py-3 font-semibold">Firma Adı</th>
                  <th className="px-5 py-3 font-semibold">Proje Tipi</th>
                  <th className="px-5 py-3 font-semibold">Bütçe</th>
                  <th className="px-5 py-3 font-semibold">Seçilen Paket</th>
                  <th className="px-5 py-3 font-semibold">Telefon</th>
                  <th className="px-5 py-3 font-semibold">E-posta</th>
                  <th className="px-5 py-3 font-semibold">Durum</th>
                  <th className="px-5 py-3 font-semibold">Detay</th>
                  <th className="px-5 py-3 text-right font-semibold">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((lead) => {
                  const rowBusy = acting?.id === lead.id;
                  const locked = Boolean(acting) || lead.id.startsWith("lead-");
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => setActive(lead)}
                      className="cursor-pointer align-top transition hover:bg-emerald-500/5"
                    >
                      <td className="px-5 py-4 font-medium text-white">{lead.adSoyad}</td>
                      <td className="px-5 py-4 text-slate-200">{lead.firmaAdi}</td>
                      <td className="px-5 py-4 text-slate-200">{lead.projectType}</td>
                      <td className="px-5 py-4 whitespace-nowrap text-slate-200">{lead.budgetRange}</td>
                      <td className="px-5 py-4 text-slate-300">
                        {lead.paket}
                        {lead.addons !== empty ? (
                          <span className="mt-1 block text-xs text-slate-400">+ {lead.addons}</span>
                        ) : null}
                        {lead.estimatedTotal !== empty ? (
                          <span className="mt-1 block text-xs font-semibold text-emerald-300">Toplam: {lead.estimatedTotal}</span>
                        ) : null}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-slate-300">{lead.telefon}</td>
                      <td className="px-5 py-4 text-slate-300">{lead.email}</td>
                      <td className="px-5 py-4">
                        <StatusBadge status={lead.status} />
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setActive(lead);
                          }}
                          className="text-xs font-semibold text-emerald-300 transition hover:text-emerald-200"
                        >
                          Detay
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {lead.status === "pending" ? (
                            <>
                              <ActionButton
                                label="Kabul et"
                                disabled={locked}
                                onClick={() => void updateStatus(lead, "accepted")}
                                className="border-emerald-400/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                              >
                                {rowBusy && acting?.kind === "accepted" ? (
                                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                                ) : (
                                  <Check className="h-4 w-4" aria-hidden />
                                )}
                              </ActionButton>
                              <ActionButton
                                label="Reddet"
                                disabled={locked}
                                onClick={() => void updateStatus(lead, "rejected")}
                                className="border-slate-500/50 bg-slate-800/70 text-slate-200 hover:border-rose-400/50 hover:text-rose-200"
                              >
                                {rowBusy && acting?.kind === "rejected" ? (
                                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                                ) : (
                                  <X className="h-4 w-4" aria-hidden />
                                )}
                              </ActionButton>
                            </>
                          ) : null}
                          <ActionButton
                            label="Sil"
                            disabled={locked}
                            onClick={() => void removeLead(lead)}
                            className="border-rose-400/40 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25"
                          >
                            {rowBusy && acting?.kind === "delete" ? (
                              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                            ) : (
                              <Trash2 className="h-4 w-4" aria-hidden />
                            )}
                          </ActionButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      ) : null}

      <AdminModal
        open={Boolean(active)}
        title={active?.firmaAdi && active.firmaAdi !== empty ? active.firmaAdi : active?.adSoyad && active.adSoyad !== empty ? active.adSoyad : "Talep detayı"}
        description={active ? leadStatusLabel(active.status) : undefined}
        onClose={() => setActive(null)}
      >
        {active ? (
          <div>
            <dl>
              <DetailRow label="Ad Soyad" value={active.adSoyad} />
              <DetailRow label="İşletme" value={active.firmaAdi} />
              <DetailRow label="E-posta" value={active.email} />
              <DetailRow label="Telefon" value={active.telefon} />
              <DetailRow label="Proje tipi" value={active.projectType} />
              <DetailRow label="Alan adı durumu" value={active.domainStatus} />
              <DetailRow label="Bütçe" value={active.budgetRange} />
              <DetailRow label="Seçilen paket" value={active.paket} />
              <DetailRow label="Ek hizmetler" value={active.addons} />
              <DetailRow label="Tahmini toplam" value={active.estimatedTotal} />
              <DetailRow label="Proje notu" value={leadNote(active)} />
              <DetailRow label="Durum" value={leadStatusLabel(active.status)} />
            </dl>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void updateStatus(active, "accepted")}
                disabled={Boolean(acting) || active.status === "accepted" || active.id.startsWith("lead-")}
                className={primaryButtonClass}
              >
                {acting?.id === active.id && acting.kind === "accepted" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                Kabul Et
              </button>
              <button
                type="button"
                onClick={() => void updateStatus(active, "rejected")}
                disabled={Boolean(acting) || active.status === "rejected" || active.id.startsWith("lead-")}
                className={`${secondaryButtonClass} border-rose-400/30 text-rose-100 hover:border-rose-300/60 hover:text-white`}
              >
                {acting?.id === active.id && acting.kind === "rejected" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                Reddet
              </button>
              <button
                type="button"
                onClick={() => void removeLead(active)}
                disabled={Boolean(acting) || active.id.startsWith("lead-")}
                className={`${secondaryButtonClass} border-rose-400/30 text-rose-100 hover:border-rose-300/60 hover:text-white`}
              >
                {acting?.id === active.id && acting.kind === "delete" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Trash2 className="h-4 w-4" aria-hidden />}
                Sil
              </button>
            </div>
          </div>
        ) : null}
      </AdminModal>
    </div>
  );
}
