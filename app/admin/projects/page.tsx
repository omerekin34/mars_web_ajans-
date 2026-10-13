"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Cpu,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  ImageIcon,
  Info,
  Pencil,
  Plus,
  Star,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { AdminModal } from "@/components/admin/modal";
import {
  BilingualGrid,
  EmptyState,
  Field,
  IconButton,
  LanguageColumn,
  inputClass,
  ModalActions,
  PageHeader,
  Panel,
  primaryButtonClass,
  secondaryButtonClass,
  SetupNotice,
  StatusNote,
  TableSkeleton,
  ToggleField,
} from "@/components/admin/primitives";
import { useSupabaseResource } from "@/components/admin/use-resource";
import { useAdminToast } from "@/components/admin/toast-provider";
import type { ProjectRow } from "@/lib/admin/types";
import { emptyToNull, friendlyError, isHttpUrl } from "@/lib/admin/format";
import {
  commaList,
  isValidSlug,
  lineList,
  MAX_GALLERY,
  MAX_METRICS,
  parseGallery,
  parseMetrics,
  referenceHref,
  serializeMetrics,
  slugify,
  type ProjectMetric,
} from "@/lib/projects";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Draft = {
  client_name: string;
  client_name_en: string;
  sector: string;
  industry_en: string;
  summary: string;
  summary_en: string;
  services: string;
  services_en: string;
  slug: string;
  project_year: string;
  duration: string;
  duration_en: string;
  client_problem: string;
  client_problem_en: string;
  our_solution: string;
  our_solution_en: string;
  features: string;
  features_en: string;
  metrics: ProjectMetric[];
  client_quote: string;
  client_quote_en: string;
  quote_author: string;
  quote_author_en: string;
  image_url: string;
  cover_url: string;
  gallery: string[];
  website_url: string;
  tech_frontend: string;
  tech_backend: string;
  tech_admin: string;
  is_published: boolean;
  is_featured: boolean;
  sort_order: string;
};

type StringKey = { [K in keyof Draft]: Draft[K] extends string ? K : never }[keyof Draft];
type ErrorKey = "client_name" | "sector" | "slug" | "sort_order" | "metrics" | "image_url" | "cover_url" | "gallery" | "website_url";
type Editor = { mode: "create" | "edit"; id?: string };

const tabs = [
  { id: "general", label: "Genel Bilgiler", icon: Info },
  { id: "story", label: "Vaka Analizi", icon: FileText },
  { id: "results", label: "Sonuçlar & Yorum", icon: TrendingUp },
  { id: "media", label: "Görseller & Link", icon: ImageIcon },
  { id: "tech", label: "Teknoloji", icon: Cpu },
] as const;

type TabId = (typeof tabs)[number]["id"];

const errorTab: Record<ErrorKey, TabId> = {
  client_name: "general",
  sector: "general",
  slug: "general",
  sort_order: "general",
  metrics: "results",
  image_url: "media",
  cover_url: "media",
  gallery: "media",
  website_url: "media",
};

const SUMMARY_LIMIT = 220;

function blankDraft(order: number): Draft {
  return {
    client_name: "",
    client_name_en: "",
    sector: "",
    industry_en: "",
    summary: "",
    summary_en: "",
    services: "",
    services_en: "",
    slug: "",
    project_year: String(new Date().getFullYear()),
    duration: "",
    duration_en: "",
    client_problem: "",
    client_problem_en: "",
    our_solution: "",
    our_solution_en: "",
    features: "",
    features_en: "",
    metrics: [],
    client_quote: "",
    client_quote_en: "",
    quote_author: "",
    quote_author_en: "",
    image_url: "",
    cover_url: "",
    gallery: [],
    website_url: "",
    tech_frontend: "",
    tech_backend: "",
    tech_admin: "",
    is_published: true,
    is_featured: false,
    sort_order: String(order),
  };
}

function safeHttpUrl(value: string | null | undefined) {
  const trimmed = (value ?? "").trim();
  if (!trimmed || !isHttpUrl(trimmed)) return "";
  return trimmed;
}

function sortRows(rows: ProjectRow[]) {
  return [...rows].sort((a, b) => {
    const order = (a.sort_order ?? 0) - (b.sort_order ?? 0);
    if (order !== 0) return order;
    return b.created_at.localeCompare(a.created_at);
  });
}

const checklist: { label: string; done: (row: ProjectRow) => boolean }[] = [
  { label: "Kısa özet", done: (row) => Boolean(row.summary?.trim()) },
  { label: "Müşterinin ihtiyacı", done: (row) => Boolean(row.client_problem?.trim()) },
  { label: "Sunduğumuz çözüm", done: (row) => Boolean(row.our_solution?.trim()) },
  { label: "Sonuç metrikleri", done: (row) => parseMetrics(row.metrics).length > 0 },
  { label: "Öne çıkan özellikler", done: (row) => lineList(row.features).length > 0 },
  { label: "Logo", done: (row) => Boolean(safeHttpUrl(row.image_url)) },
  { label: "Kapak görseli", done: (row) => Boolean(safeHttpUrl(row.cover_url)) },
  { label: "Galeri", done: (row) => parseGallery(row.gallery).length > 0 },
  { label: "Teknolojiler", done: (row) => Boolean(row.tech_frontend?.trim() || row.tech_backend?.trim() || row.tech_admin?.trim()) },
  { label: "Müşteri yorumu", done: (row) => Boolean(row.client_quote?.trim()) },
];

function completeness(row: ProjectRow) {
  const missing = checklist.filter((item) => !item.done(row)).map((item) => item.label);
  return { done: checklist.length - missing.length, total: checklist.length, missing };
}

function UrlInput({
  value,
  onChange,
  placeholder = "https://",
  autoFocus = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const preview = safeHttpUrl(value);
  return (
    <div className="flex items-center gap-3">
      <input
        value={value}
        autoFocus={autoFocus}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
        placeholder={placeholder}
        inputMode="url"
      />
      <div className="flex h-11 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-slate-950/70">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- Önizleme rastgele dış adresten gelir.
          <img src={preview} alt="" className="h-full w-full object-contain" />
        ) : (
          <ImageIcon className="h-4 w-4 text-slate-600" aria-hidden />
        )}
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const toast = useAdminToast();
  const { rows: rawRows, loading, refreshing, error, ready, reload } = useSupabaseResource<ProjectRow>("projects", "created_at", false);
  const rows = useMemo(() => sortRows(rawRows), [rawRows]);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [tab, setTab] = useState<TabId>("general");
  const [draft, setDraft] = useState<Draft>(blankDraft(1));
  const [slugTouched, setSlugTouched] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<ErrorKey, string>>>({});
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ProjectRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const needsMigration = rows.length > 0 && !("slug" in rows[0]);
  const publishedCount = rows.filter((row) => row.is_published !== false).length;
  const featuredCount = rows.filter((row) => row.is_featured).length;
  const averageScore = rows.length
    ? Math.round((rows.reduce((sum, row) => sum + completeness(row).done / checklist.length, 0) / rows.length) * 100)
    : 0;

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const bind = (key: StringKey) => ({
    value: draft[key],
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(key, event.target.value),
  });

  const openCreate = () => {
    setFieldErrors({});
    setTab("general");
    setSlugTouched(false);
    const lastOrder = rows.reduce((max, row) => Math.max(max, row.sort_order ?? 0), 0);
    setDraft(blankDraft(lastOrder + 1));
    setEditor({ mode: "create" });
  };

  const openEdit = (row: ProjectRow) => {
    setFieldErrors({});
    setTab("general");
    setSlugTouched(Boolean(row.slug?.trim()));
    setDraft({
      client_name: row.client_name,
      client_name_en: row.client_name_en ?? "",
      sector: row.sector,
      industry_en: row.industry_en ?? "",
      summary: row.summary ?? "",
      summary_en: row.summary_en ?? "",
      services: row.services ?? "",
      services_en: row.services_en ?? "",
      slug: row.slug?.trim() || slugify(row.client_name),
      project_year: row.project_year ?? "",
      duration: row.duration ?? "",
      duration_en: row.duration_en ?? "",
      client_problem: row.client_problem ?? "",
      client_problem_en: row.client_problem_en ?? "",
      our_solution: row.our_solution ?? "",
      our_solution_en: row.our_solution_en ?? "",
      features: row.features ?? "",
      features_en: row.features_en ?? "",
      metrics: parseMetrics(row.metrics),
      client_quote: row.client_quote ?? "",
      client_quote_en: row.client_quote_en ?? "",
      quote_author: row.quote_author ?? "",
      quote_author_en: row.quote_author_en ?? "",
      image_url: row.image_url ?? "",
      cover_url: row.cover_url ?? "",
      gallery: parseGallery(row.gallery),
      website_url: row.website_url ?? "",
      tech_frontend: row.tech_frontend ?? "",
      tech_backend: row.tech_backend ?? "",
      tech_admin: row.tech_admin ?? "",
      is_published: row.is_published !== false,
      is_featured: Boolean(row.is_featured),
      sort_order: String(row.sort_order ?? 0),
    });
    setEditor({ mode: "edit", id: row.id });
  };

  const onClientNameChange = (value: string) => {
    setDraft((current) => ({ ...current, client_name: value, slug: slugTouched ? current.slug : slugify(value) }));
  };

  const updateMetric = (index: number, patch: Partial<ProjectMetric>) =>
    setDraft((current) => ({
      ...current,
      metrics: current.metrics.map((metric, position) => (position === index ? { ...metric, ...patch } : metric)),
    }));

  const updateGallery = (next: string[]) => set("gallery", next);

  const moveGallery = (index: number, step: number) => {
    const target = index + step;
    if (target < 0 || target >= draft.gallery.length) return;
    const next = [...draft.gallery];
    [next[index], next[target]] = [next[target], next[index]];
    updateGallery(next);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editor) return;
    const clientName = draft.client_name.trim();
    const sector = draft.sector.trim();
    const slug = draft.slug.trim();
    const sortOrder = Number(draft.sort_order);
    const gallery = draft.gallery.map((url) => url.trim()).filter(Boolean);
    const nextErrors: Partial<Record<ErrorKey, string>> = {};

    if (clientName.length < 2) nextErrors.client_name = "Müşteri adı en az 2 karakter olmalı.";
    if (sector.length < 2) nextErrors.sector = "Sektör en az 2 karakter olmalı.";
    if (!isValidSlug(slug)) nextErrors.slug = "Yalnızca küçük harf, rakam ve tire kullanın. Örn. cnr-grup-danismanlik";
    else if (rows.some((row) => row.slug === slug && row.id !== editor.id)) nextErrors.slug = "Bu adres başka bir referansta kullanılıyor.";
    if (!Number.isInteger(sortOrder) || sortOrder < 0) nextErrors.sort_order = "Sıralama 0 veya daha büyük bir tam sayı olmalı.";
    if (draft.metrics.some((metric) => Boolean(metric.value.trim()) !== Boolean(metric.label.trim()))) {
      nextErrors.metrics = "Her sonuç için hem değeri hem Türkçe açıklamayı yazın.";
    }
    if (!isHttpUrl(draft.image_url)) nextErrors.image_url = "Logo adresi http veya https ile başlamalı.";
    if (!isHttpUrl(draft.cover_url)) nextErrors.cover_url = "Kapak adresi http veya https ile başlamalı.";
    if (gallery.some((url) => !isHttpUrl(url))) nextErrors.gallery = "Tüm galeri adresleri http veya https ile başlamalı.";
    if (!isHttpUrl(draft.website_url)) nextErrors.website_url = "Site adresi http veya https ile başlamalı.";

    setFieldErrors(nextErrors);
    const firstError = (Object.keys(nextErrors) as ErrorKey[])[0];
    if (firstError) {
      setTab(errorTab[firstError]);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      toast.notify("Supabase yapılandırması eksik.", "error");
      return;
    }

    setSaving(true);
    const payload = {
      client_name: clientName,
      client_name_en: emptyToNull(draft.client_name_en),
      sector,
      industry_en: emptyToNull(draft.industry_en),
      slug,
      summary: emptyToNull(draft.summary),
      summary_en: emptyToNull(draft.summary_en),
      services: emptyToNull(commaList(draft.services).join(", ")),
      services_en: emptyToNull(commaList(draft.services_en).join(", ")),
      project_year: emptyToNull(draft.project_year),
      duration: emptyToNull(draft.duration),
      duration_en: emptyToNull(draft.duration_en),
      client_problem: emptyToNull(draft.client_problem),
      client_problem_en: emptyToNull(draft.client_problem_en),
      our_solution: emptyToNull(draft.our_solution),
      our_solution_en: emptyToNull(draft.our_solution_en),
      features: emptyToNull(lineList(draft.features).join("\n")),
      features_en: emptyToNull(lineList(draft.features_en).join("\n")),
      metrics: serializeMetrics(draft.metrics),
      client_quote: emptyToNull(draft.client_quote),
      client_quote_en: emptyToNull(draft.client_quote_en),
      quote_author: emptyToNull(draft.quote_author),
      quote_author_en: emptyToNull(draft.quote_author_en),
      image_url: draft.image_url.trim(),
      cover_url: emptyToNull(draft.cover_url),
      gallery,
      website_url: draft.website_url.trim(),
      tech_frontend: emptyToNull(draft.tech_frontend),
      tech_backend: emptyToNull(draft.tech_backend),
      tech_admin: emptyToNull(draft.tech_admin),
      is_published: draft.is_published,
      is_featured: draft.is_featured,
      sort_order: sortOrder,
    };
    const query =
      editor.mode === "create"
        ? supabase.from("projects").insert(payload)
        : supabase.from("projects").update(payload).eq("id", editor.id ?? "");
    const { error: mutationError } = await query;
    setSaving(false);

    if (mutationError) {
      if (/projects_slug_key|duplicate key/i.test(mutationError.message)) {
        setFieldErrors({ slug: "Bu adres başka bir referansta kullanılıyor." });
        setTab("general");
        return;
      }
      toast.notify(friendlyError(mutationError.message), "error");
      return;
    }

    setEditor(null);
    toast.success();
    await reload();
  };

  const quickUpdate = async (row: ProjectRow, patch: Partial<Pick<ProjectRow, "is_published" | "is_featured">>) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      toast.notify("Supabase yapılandırması eksik.", "error");
      return;
    }
    setBusyId(row.id);
    const { error: mutationError } = await supabase.from("projects").update(patch).eq("id", row.id);
    setBusyId(null);
    if (mutationError) {
      toast.notify(friendlyError(mutationError.message), "error");
      return;
    }
    toast.success();
    await reload();
  };

  const move = async (index: number, step: number) => {
    const target = index + step;
    if (target < 0 || target >= rows.length) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      toast.notify("Supabase yapılandırması eksik.", "error");
      return;
    }
    const ordered = [...rows];
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    const changes = ordered
      .map((row, position) => ({ row, order: position + 1 }))
      .filter(({ row, order }) => row.sort_order !== order);
    setBusyId(rows[index].id);
    const results = await Promise.all(
      changes.map(({ row, order }) => supabase.from("projects").update({ sort_order: order }).eq("id", row.id)),
    );
    setBusyId(null);
    const failed = results.find((result) => result.error);
    if (failed?.error) toast.notify(friendlyError(failed.error.message), "error");
    await reload();
  };

  const remove = async () => {
    if (!pendingDelete) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      toast.notify("Supabase yapılandırması eksik.", "error");
      return;
    }
    setDeleting(true);
    const { error: mutationError } = await supabase.from("projects").delete().eq("id", pendingDelete.id);
    setDeleting(false);
    if (mutationError) {
      toast.notify(friendlyError(mutationError.message), "error");
      return;
    }
    setPendingDelete(null);
    toast.success();
    await reload();
  };

  const tabHasError = (id: TabId) => (Object.keys(fieldErrors) as ErrorKey[]).some((key) => errorTab[key] === id);
  const summaryHint = (value: string) => `${value.trim().length}/${SUMMARY_LIMIT} karakter. Kartta ve detay sayfasının girişinde görünür.`;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Portfolyo"
        title="Referanslarımız"
        description="Her referansın kartını ve /referanslar altındaki vaka analizi sayfasını buradan yönetin. Detay doluluğu yükseldikçe sayfa daha ikna edici olur."
        onRefresh={() => void reload()}
        refreshing={refreshing}
        action={
          <>
            <a href="/referanslar" target="_blank" rel="noreferrer" className={secondaryButtonClass}>
              <ExternalLink className="h-4 w-4" aria-hidden />
              Sitede gör
            </a>
            <button type="button" onClick={openCreate} className={primaryButtonClass}>
              <Plus className="h-4 w-4" aria-hidden />
              Yeni referans
            </button>
          </>
        }
      />

      {!ready && !loading ? <SetupNotice /> : null}
      {error ? <StatusNote tone="error">{error}</StatusNote> : null}
      {needsMigration ? (
        <StatusNote tone="warning">
          Detay sayfası alanları veritabanında henüz yok. Supabase SQL Editor&apos;da{" "}
          <code className="text-amber-100">projects-detail-pages.sql</code> dosyasını bir kez çalıştırın; ardından bu sayfayı yenileyin.
        </StatusNote>
      ) : null}

      {rows.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: "Toplam referans", value: String(rows.length) },
            { label: "Yayında", value: String(publishedCount) },
            { label: "Öne çıkan", value: String(featuredCount) },
            { label: "Ortalama detay doluluğu", value: `%${averageScore}` },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-500 uppercase">{stat.label}</p>
              <p className="mt-1 text-2xl font-semibold text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      <Panel>
        {loading ? (
          <TableSkeleton />
        ) : !ready || (error && rows.length === 0) ? null : rows.length === 0 ? (
          <EmptyState title="Henüz referans yok" body="Tamamlanan işleri müşteri adı, sektör ve vaka analiziyle ekleyin." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="text-[11px] tracking-[0.14em] text-slate-400 uppercase">
                <tr>
                  <th className="px-5 py-3 font-semibold">Sıra</th>
                  <th className="px-5 py-3 font-semibold">Referans</th>
                  <th className="px-5 py-3 font-semibold">Sektör</th>
                  <th className="px-5 py-3 font-semibold">Durum</th>
                  <th className="px-5 py-3 font-semibold">Detay doluluğu</th>
                  <th className="px-5 py-3 text-right font-semibold">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rows.map((row, index) => {
                  const thumb = safeHttpUrl(row.cover_url) || safeHttpUrl(row.image_url);
                  const score = completeness(row);
                  const percent = Math.round((score.done / score.total) * 100);
                  const published = row.is_published !== false;
                  const busy = busyId === row.id;
                  const slug = row.slug?.trim() || row.id;
                  return (
                    <tr key={row.id} className={`transition hover:bg-emerald-500/5 ${busy ? "opacity-60" : ""}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <IconButton label="Yukarı taşı" onClick={() => void move(index, -1)}>
                            <ArrowUp className="h-3.5 w-3.5" aria-hidden />
                          </IconButton>
                          <IconButton label="Aşağı taşı" onClick={() => void move(index, 1)}>
                            <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                          </IconButton>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {thumb ? (
                            // eslint-disable-next-line @next/next/no-img-element -- Referans görselleri rastgele dış adreslerden gelir.
                            <img
                              src={thumb}
                              alt={`${row.client_name} görseli`}
                              className="h-12 w-20 shrink-0 rounded-lg border border-white/10 bg-slate-950 object-cover object-top"
                            />
                          ) : (
                            <div className="flex h-12 w-20 shrink-0 items-center justify-center rounded-lg border border-dashed border-white/10 text-[11px] text-slate-500">
                              Yok
                            </div>
                          )}
                          <div className="min-w-0">
                            <button type="button" onClick={() => openEdit(row)} className="text-left font-medium text-white hover:text-emerald-200">
                              {row.client_name}
                            </button>
                            <p className="mt-0.5 truncate font-mono text-[11px] text-slate-500">/referanslar/{slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-300">
                        <p>{row.sector}</p>
                        {row.industry_en?.trim() ? <p className="mt-1 text-xs text-emerald-200/70">EN: {row.industry_en}</p> : null}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                              published ? "bg-emerald-500/15 text-emerald-200" : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {published ? "Yayında" : "Taslak"}
                          </span>
                          {row.is_featured ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2.5 py-1 text-xs font-medium text-amber-100">
                              <Star className="h-3 w-3 fill-amber-200" aria-hidden />
                              Öne çıkan
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="w-40" title={score.missing.length ? `Eksik: ${score.missing.join(", ")}` : "Tüm alanlar dolu"}>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-300">
                              {score.done}/{score.total}
                            </span>
                            <span className="text-slate-500">%{percent}</span>
                          </div>
                          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-800">
                            <div
                              className={`h-full rounded-full ${percent >= 80 ? "bg-emerald-400" : percent >= 50 ? "bg-amber-300" : "bg-rose-400"}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          {score.missing.length ? (
                            <p className="mt-1.5 truncate text-[11px] text-slate-500">Eksik: {score.missing.slice(0, 2).join(", ")}</p>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <IconButton label={published ? "Taslağa al" : "Yayınla"} onClick={() => void quickUpdate(row, { is_published: !published })}>
                            {published ? <Eye className="h-4 w-4" aria-hidden /> : <EyeOff className="h-4 w-4" aria-hidden />}
                          </IconButton>
                          <IconButton
                            label={row.is_featured ? "Öne çıkarmayı kaldır" : "Öne çıkar"}
                            onClick={() => void quickUpdate(row, { is_featured: !row.is_featured })}
                          >
                            <Star className={`h-4 w-4 ${row.is_featured ? "fill-amber-300 text-amber-300" : ""}`} aria-hidden />
                          </IconButton>
                          <a
                            href={referenceHref(slug)}
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Detay sayfasını aç"
                            title="Detay sayfasını aç"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-300 transition hover:border-emerald-400/50 hover:text-emerald-200"
                          >
                            <ExternalLink className="h-4 w-4" aria-hidden />
                          </a>
                          <IconButton label="Düzenle" onClick={() => openEdit(row)}>
                            <Pencil className="h-4 w-4" aria-hidden />
                          </IconButton>
                          <IconButton label="Sil" tone="danger" onClick={() => setPendingDelete(row)}>
                            <Trash2 className="h-4 w-4" aria-hidden />
                          </IconButton>
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

      <AdminModal
        open={Boolean(editor)}
        wide
        title={editor?.mode === "edit" ? "Referansı düzenle" : "Yeni referans"}
        description="İngilizce alanlar boş kalırsa sitede Türkçe metin gösterilir. Yalnızca müşteri adı, sektör ve sayfa adresi zorunludur."
        onClose={() => {
          if (!saving) setEditor(null);
        }}
      >
        <form onSubmit={(event) => void save(event)} className="space-y-5">
          <div role="tablist" aria-label="Referans bölümleri" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
            {tabs.map((item) => {
              const active = tab === item.id;
              const hasError = tabHasError(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(item.id)}
                  className={`relative inline-flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition ${
                    active
                      ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-100"
                      : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-slate-200"
                  }`}
                >
                  <item.icon className="h-4 w-4" aria-hidden />
                  {item.label}
                  {hasError ? <span className="h-2 w-2 rounded-full bg-rose-400" aria-label="Hata var" /> : null}
                </button>
              );
            })}
          </div>

          <div role="tabpanel" hidden={tab !== "general"} className="space-y-4">
            <BilingualGrid>
              <LanguageColumn title="Türkçe İçerik">
                <Field label="Müşteri adı" error={fieldErrors.client_name}>
                  <input
                    data-autofocus
                    value={draft.client_name}
                    onChange={(event) => onClientNameChange(event.target.value)}
                    className={inputClass}
                    placeholder="Atlas Vakfı"
                  />
                </Field>
                <Field label="Sektör" error={fieldErrors.sector} hint="Filtrelerde bu ad kullanılır. Aynı sektörü hep aynı yazın.">
                  <input {...bind("sector")} className={inputClass} placeholder="Kurumsal" list="project-sectors" />
                </Field>
                <Field label="Kısa özet" hint={summaryHint(draft.summary)}>
                  <textarea
                    rows={3}
                    maxLength={SUMMARY_LIMIT + 40}
                    {...bind("summary")}
                    className={`${inputClass} resize-y leading-relaxed`}
                    placeholder="Vakfın bağış sürecini dijitale taşıyan, yönetim panelli kurumsal web sitesi."
                  />
                </Field>
                <Field label="Verilen hizmetler" hint="Virgülle ayırın. Kartta ilk 3 tanesi görünür.">
                  <input {...bind("services")} className={inputClass} placeholder="Web Tasarım, Yönetim Paneli, SEO" />
                </Field>
                <Field label="Teslim süresi">
                  <input {...bind("duration")} className={inputClass} placeholder="3 hafta" />
                </Field>
              </LanguageColumn>
              <LanguageColumn title="İngilizce İçerik">
                <Field label="Müşteri adı" hint="Opsiyonel. Boşsa Türkçe ad gösterilir.">
                  <input {...bind("client_name_en")} className={inputClass} placeholder="Atlas Foundation" />
                </Field>
                <Field label="Sektör" hint="Boşsa Türkçe sektör gösterilir.">
                  <input {...bind("industry_en")} className={inputClass} placeholder="Corporate" />
                </Field>
                <Field label="Short summary" hint={summaryHint(draft.summary_en)}>
                  <textarea
                    rows={3}
                    maxLength={SUMMARY_LIMIT + 40}
                    {...bind("summary_en")}
                    className={`${inputClass} resize-y leading-relaxed`}
                    placeholder="A corporate site with an admin panel that moved the foundation's donations online."
                  />
                </Field>
                <Field label="Services" hint="Virgülle ayırın.">
                  <input {...bind("services_en")} className={inputClass} placeholder="Web Design, Admin Panel, SEO" />
                </Field>
                <Field label="Delivery time">
                  <input {...bind("duration_en")} className={inputClass} placeholder="3 weeks" />
                </Field>
              </LanguageColumn>
            </BilingualGrid>
            <datalist id="project-sectors">
              {[...new Set(rows.map((row) => row.sector))].map((sector) => (
                <option key={sector} value={sector} />
              ))}
            </datalist>

            <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-[11px] font-semibold tracking-[0.18em] text-emerald-300/80 uppercase">Sayfa ve yayın ayarları</p>
              <Field label="Sayfa adresi" error={fieldErrors.slug} hint="Müşteri adından otomatik üretilir. Yayına aldıktan sonra değiştirmemeniz önerilir.">
                <div className="flex items-stretch overflow-hidden rounded-xl border border-white/10 bg-slate-950/70 focus-within:border-emerald-400/70 focus-within:ring-2 focus-within:ring-emerald-500/20">
                  <span className="flex items-center border-r border-white/10 px-3 font-mono text-xs text-slate-500">/referanslar/</span>
                  <input
                    value={draft.slug}
                    onChange={(event) => {
                      setSlugTouched(true);
                      const raw = event.target.value;
                      const base = slugify(raw);
                      set("slug", base && /[-\s_]$/.test(raw) ? `${base}-` : base);
                    }}
                    onBlur={() => set("slug", slugify(draft.slug))}
                    className="min-w-0 flex-1 bg-transparent px-3 py-2.5 font-mono text-sm text-slate-100 outline-none placeholder:text-slate-500"
                    placeholder="atlas-vakfi"
                  />
                </div>
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Proje yılı">
                  <input {...bind("project_year")} className={inputClass} placeholder="2026" inputMode="numeric" />
                </Field>
                <Field label="Sıralama" hint="Küçük sayı önce gelir. Listedeki oklarla da değiştirebilirsiniz." error={fieldErrors.sort_order}>
                  <input type="number" min={0} step={1} {...bind("sort_order")} className={inputClass} />
                </Field>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ToggleField label="Sitede yayında" checked={draft.is_published} onChange={(value) => set("is_published", value)} />
                <ToggleField label="Öne çıkan (ana sayfada önce)" checked={draft.is_featured} onChange={(value) => set("is_featured", value)} />
              </div>
            </div>
          </div>

          <div role="tabpanel" hidden={tab !== "story"} className="space-y-4">
            <BilingualGrid>
              <LanguageColumn title="Türkçe İçerik">
                <Field label="Müşterinin sorunu / ihtiyacı" hint="Paragraf için boş satır bırakın.">
                  <textarea
                    rows={7}
                    {...bind("client_problem")}
                    className={`${inputClass} resize-y leading-relaxed`}
                    placeholder="Müşterinin karşılaştığı darboğazı, kaybı veya ihtiyacı yazın."
                  />
                </Field>
                <Field label="Sunduğumuz çözüm" hint="Paragraf için boş satır bırakın.">
                  <textarea
                    rows={7}
                    {...bind("our_solution")}
                    className={`${inputClass} resize-y leading-relaxed`}
                    placeholder="Nasıl çözdüğünüzü, kapsamı ve elde edilen sonucu yazın."
                  />
                </Field>
                <Field label="Öne çıkan özellikler" hint="Her satır bir madde. Detay sayfasında onay işaretli liste olur.">
                  <textarea
                    rows={6}
                    {...bind("features")}
                    className={`${inputClass} resize-y leading-relaxed`}
                    placeholder={"Online bağış ve iyzico ödeme\nMobil uyumlu etkinlik takvimi\nYönetim panelinden haber girişi"}
                  />
                </Field>
              </LanguageColumn>
              <LanguageColumn title="İngilizce İçerik">
                <Field label="Client problem / need" hint="Boşsa Türkçe metin gösterilir.">
                  <textarea
                    rows={7}
                    {...bind("client_problem_en")}
                    className={`${inputClass} resize-y leading-relaxed`}
                    placeholder="Describe the bottleneck, loss, or need."
                  />
                </Field>
                <Field label="Our solution" hint="Boşsa Türkçe metin gösterilir.">
                  <textarea
                    rows={7}
                    {...bind("our_solution_en")}
                    className={`${inputClass} resize-y leading-relaxed`}
                    placeholder="Describe how you solved it and what changed."
                  />
                </Field>
                <Field label="Key features" hint="Her satır bir madde. Boşsa Türkçe liste gösterilir.">
                  <textarea
                    rows={6}
                    {...bind("features_en")}
                    className={`${inputClass} resize-y leading-relaxed`}
                    placeholder={"Online donations with iyzico\nMobile-friendly event calendar\nNews managed from the admin panel"}
                  />
                </Field>
              </LanguageColumn>
            </BilingualGrid>
          </div>

          <div role="tabpanel" hidden={tab !== "results"} className="space-y-4">
            <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.18em] text-emerald-300/80 uppercase">Sonuç metrikleri</p>
                <p className="mt-1 text-xs text-slate-500">
                  En fazla {MAX_METRICS} kart. Somut rakamlar en ikna edici içeriktir: +%180 organik trafik, 2,1 sn açılış, 3 kat teklif talebi.
                </p>
              </div>
              {draft.metrics.map((metric, index) => (
                <div key={index} className="grid grid-cols-1 gap-2 rounded-xl border border-white/5 bg-slate-950/50 p-3 sm:grid-cols-[120px_1fr_1fr_auto] sm:items-center">
                  <input
                    value={metric.value}
                    onChange={(event) => updateMetric(index, { value: event.target.value })}
                    className={inputClass}
                    placeholder="+%180"
                    aria-label={`${index + 1}. sonuç değeri`}
                  />
                  <input
                    value={metric.label}
                    onChange={(event) => updateMetric(index, { label: event.target.value })}
                    className={inputClass}
                    placeholder="Organik trafik artışı"
                    aria-label={`${index + 1}. sonuç açıklaması`}
                  />
                  <input
                    value={metric.labelEn}
                    onChange={(event) => updateMetric(index, { labelEn: event.target.value })}
                    className={inputClass}
                    placeholder="Organic traffic growth (EN)"
                    aria-label={`${index + 1}. sonuç İngilizce açıklaması`}
                  />
                  <IconButton
                    label="Sonucu kaldır"
                    tone="danger"
                    onClick={() => set("metrics", draft.metrics.filter((_, position) => position !== index))}
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </IconButton>
                </div>
              ))}
              {fieldErrors.metrics ? <p className="text-xs text-rose-300">{fieldErrors.metrics}</p> : null}
              {draft.metrics.length < MAX_METRICS ? (
                <button
                  type="button"
                  onClick={() => set("metrics", [...draft.metrics, { value: "", label: "", labelEn: "" }])}
                  className={secondaryButtonClass}
                >
                  <Plus className="h-4 w-4" aria-hidden />
                  Sonuç ekle
                </button>
              ) : null}
            </div>

            <BilingualGrid>
              <LanguageColumn title="Müşteri yorumu (Türkçe)">
                <Field label="Yorum" hint="Detay sayfasında büyük alıntı olarak görünür.">
                  <textarea
                    rows={4}
                    {...bind("client_quote")}
                    className={`${inputClass} resize-y leading-relaxed`}
                    placeholder="Site yayına girdikten sonra telefonla gelen talepler ikiye katlandı."
                  />
                </Field>
                <Field label="Yorum sahibi">
                  <input {...bind("quote_author")} className={inputClass} placeholder="Ayşe Demir, Genel Müdür" />
                </Field>
              </LanguageColumn>
              <LanguageColumn title="Müşteri yorumu (İngilizce)">
                <Field label="Quote" hint="Boşsa Türkçe yorum gösterilir.">
                  <textarea
                    rows={4}
                    {...bind("client_quote_en")}
                    className={`${inputClass} resize-y leading-relaxed`}
                    placeholder="Phone enquiries doubled after the site went live."
                  />
                </Field>
                <Field label="Author">
                  <input {...bind("quote_author_en")} className={inputClass} placeholder="Ayşe Demir, General Manager" />
                </Field>
              </LanguageColumn>
            </BilingualGrid>
          </div>

          <div role="tabpanel" hidden={tab !== "media"} className="space-y-4">
            <Field label="Logo URL" error={fieldErrors.image_url} hint="Şeffaf arka planlı PNG veya SVG en iyi sonucu verir. Kartta ve detay sayfasında görünür.">
              <UrlInput value={draft.image_url} onChange={(value) => set("image_url", value)} />
            </Field>
            <Field
              label="Kapak görseli URL"
              error={fieldErrors.cover_url}
              hint="Sitenin masaüstü ekran görüntüsü (ör. 1440×900). Kartta ve detay sayfasında tarayıcı çerçevesi içinde gösterilir."
            >
              <UrlInput value={draft.cover_url} onChange={(value) => set("cover_url", value)} />
            </Field>

            <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.18em] text-emerald-300/80 uppercase">Galeri</p>
                <p className="mt-1 text-xs text-slate-500">
                  En fazla {MAX_GALLERY} görsel. Mobil görünüm, yönetim paneli ve önemli sayfaların ekran görüntülerini ekleyin.
                </p>
              </div>
              {draft.gallery.map((url, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-5 shrink-0 text-center text-xs text-slate-500 tabular-nums">{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <UrlInput
                      value={url}
                      autoFocus={index === draft.gallery.length - 1 && !url}
                      onChange={(value) => updateGallery(draft.gallery.map((item, position) => (position === index ? value : item)))}
                    />
                  </div>
                  <IconButton label="Yukarı taşı" onClick={() => moveGallery(index, -1)}>
                    <ArrowUp className="h-3.5 w-3.5" aria-hidden />
                  </IconButton>
                  <IconButton label="Aşağı taşı" onClick={() => moveGallery(index, 1)}>
                    <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                  </IconButton>
                  <IconButton label="Görseli kaldır" tone="danger" onClick={() => updateGallery(draft.gallery.filter((_, position) => position !== index))}>
                    <X className="h-4 w-4" aria-hidden />
                  </IconButton>
                </div>
              ))}
              {fieldErrors.gallery ? <p className="text-xs text-rose-300">{fieldErrors.gallery}</p> : null}
              {draft.gallery.length < MAX_GALLERY ? (
                <button type="button" onClick={() => updateGallery([...draft.gallery, ""])} className={secondaryButtonClass}>
                  <Plus className="h-4 w-4" aria-hidden />
                  Görsel ekle
                </button>
              ) : null}
            </div>

            <Field label="Web sitesi linki" error={fieldErrors.website_url} hint="Detay sayfasındaki “Canlı Siteyi Gör” butonu bu adrese gider.">
              <input
                value={draft.website_url}
                onChange={(event) => set("website_url", event.target.value)}
                className={inputClass}
                placeholder="https://"
                inputMode="url"
              />
            </Field>
          </div>

          <div role="tabpanel" hidden={tab !== "tech"} className="space-y-4">
            <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.18em] text-emerald-300/80 uppercase">Kullanılan teknolojiler</p>
                <p className="mt-1 text-xs text-slate-500">Dil ayrımı yoktur. Virgülle ayırın; ön yüzde rozet olarak listelenir.</p>
              </div>
              <Field label="Arayüz (Frontend)">
                <input {...bind("tech_frontend")} className={inputClass} placeholder="Next.js, Tailwind CSS" />
              </Field>
              <Field label="Altyapı (Backend)">
                <input {...bind("tech_backend")} className={inputClass} placeholder="Supabase, Node.js" />
              </Field>
              <Field label="Yönetim paneli">
                <input {...bind("tech_admin")} className={inputClass} placeholder="React" />
              </Field>
            </div>
          </div>

          <ModalActions onCancel={() => setEditor(null)} saving={saving} submitLabel={editor?.mode === "edit" ? "Güncelle" : "Ekle"} />
        </form>
      </AdminModal>

      <AdminModal
        open={Boolean(pendingDelete)}
        title="Referansı sil"
        description="Bu işlem geri alınamaz. Detay sayfası da yayından kalkar."
        onClose={() => {
          if (!deleting) setPendingDelete(null);
        }}
      >
        <p className="text-sm leading-6 text-slate-300">{pendingDelete?.client_name}</p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" className={secondaryButtonClass} disabled={deleting} onClick={() => setPendingDelete(null)}>
            Vazgeç
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={() => void remove()}
            className="inline-flex items-center justify-center rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:opacity-60"
          >
            {deleting ? "Siliniyor" : "Sil"}
          </button>
        </div>
      </AdminModal>
    </div>
  );
}
