"use client";

import { useState } from "react";
import { Clock, EyeOff, Pencil, Plus, Sparkles, Trash2, X } from "lucide-react";
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
import type { PackageRow } from "@/lib/admin/types";
import { asFeatures, asNumber, emptyToNull, formatTry, friendlyError, textLines } from "@/lib/admin/format";
import { discountPercent, parseAddons, toAddonRecords, type PackageAddon } from "@/lib/package-addons";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type AddonDraft = { title: string; title_en: string; price: string };

type Draft = {
  title: string;
  title_en: string;
  tagline: string;
  tagline_en: string;
  price: string;
  old_price: string;
  price_note: string;
  price_note_en: string;
  delivery_time: string;
  delivery_time_en: string;
  badge: string;
  badge_en: string;
  cta_label: string;
  cta_label_en: string;
  features: string;
  features_en: string;
  addons: AddonDraft[];
  is_popular: boolean;
  is_active: boolean;
  sort_order: string;
};

type DraftErrors = Partial<Record<"title" | "price" | "old_price" | "sort_order" | "addons", string>>;

type Editor = { mode: "create" | "edit"; id?: string };

const upgradeHint = "Yeni paket alanları için packages-upgrade.sql dosyasını Supabase SQL Editor'da bir kez çalıştırın.";

function blankDraft(order: number): Draft {
  return {
    title: "",
    title_en: "",
    tagline: "",
    tagline_en: "",
    price: "",
    old_price: "",
    price_note: "+ KDV · Tek seferlik ödeme",
    price_note_en: "+ VAT · One-time payment",
    delivery_time: "",
    delivery_time_en: "",
    badge: "",
    badge_en: "",
    cta_label: "",
    cta_label_en: "",
    features: "",
    features_en: "",
    addons: [],
    is_popular: false,
    is_active: true,
    sort_order: String(order),
  };
}

function nextSortOrder(rows: PackageRow[]) {
  return rows.reduce((highest, row) => Math.max(highest, Number(row.sort_order) || 0), 0) + 1;
}

function missingColumn(message: string) {
  return /column/i.test(message) && /schema cache|does not exist|could not find/i.test(message);
}

function oldPriceOf(row: PackageRow) {
  return row.old_price === null || row.old_price === undefined ? null : asNumber(row.old_price);
}

export default function PackagesPage() {
  const toast = useAdminToast();
  const { rows, loading, refreshing, error, ready, reload } = useSupabaseResource<PackageRow>("packages", "sort_order", true);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [draft, setDraft] = useState<Draft>(blankDraft(1));
  const [fieldErrors, setFieldErrors] = useState<DraftErrors>({});
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PackageRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((current) => ({ ...current, [key]: value }));

  const setAddon = (index: number, key: keyof AddonDraft, value: string) =>
    setDraft((current) => ({
      ...current,
      addons: current.addons.map((addon, position) => (position === index ? { ...addon, [key]: value } : addon)),
    }));

  const openCreate = () => {
    setFieldErrors({});
    setDraft(blankDraft(nextSortOrder(rows)));
    setEditor({ mode: "create" });
  };

  const openEdit = (row: PackageRow) => {
    setFieldErrors({});
    const oldPrice = oldPriceOf(row);
    setDraft({
      title: row.title,
      title_en: row.title_en ?? "",
      tagline: row.tagline ?? "",
      tagline_en: row.tagline_en ?? "",
      price: String(asNumber(row.price)),
      old_price: oldPrice ? String(oldPrice) : "",
      price_note: row.price_note ?? "",
      price_note_en: row.price_note_en ?? "",
      delivery_time: row.delivery_time ?? "",
      delivery_time_en: row.delivery_time_en ?? "",
      badge: row.badge ?? "",
      badge_en: row.badge_en ?? "",
      cta_label: row.cta_label ?? "",
      cta_label_en: row.cta_label_en ?? "",
      features: asFeatures(row.features).join("\n"),
      features_en: asFeatures(row.features_en).join("\n"),
      addons: parseAddons(row.addons).map((addon) => ({ title: addon.title, title_en: addon.titleEn, price: String(addon.price) })),
      is_popular: row.is_popular,
      is_active: row.is_active !== false,
      sort_order: String(row.sort_order ?? 0),
    });
    setEditor({ mode: "edit", id: row.id });
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const title = draft.title.trim();
    const price = Number(draft.price);
    const oldPrice = draft.old_price.trim() ? Number(draft.old_price) : null;
    const sortOrder = Number(draft.sort_order);
    const filledAddons = draft.addons.filter((addon) => addon.title.trim() || addon.title_en.trim() || addon.price.trim());
    const addons: PackageAddon[] = filledAddons.map((addon) => ({
      title: addon.title.trim(),
      titleEn: addon.title_en.trim(),
      price: Number(addon.price),
    }));

    const nextErrors: DraftErrors = {};
    if (title.length < 2) nextErrors.title = "Başlık en az 2 karakter olmalı.";
    if (!Number.isFinite(price) || price < 0) nextErrors.price = "Fiyat 0 veya daha büyük bir sayı olmalı.";
    if (oldPrice !== null && (!Number.isFinite(oldPrice) || oldPrice <= price)) {
      nextErrors.old_price = "Eski fiyat, güncel fiyattan büyük olmalı. İndirim göstermek istemiyorsanız boş bırakın.";
    }
    if (!Number.isInteger(sortOrder) || sortOrder < 0) nextErrors.sort_order = "Sıralama 0 veya daha büyük bir tam sayı olmalı.";
    if (addons.some((addon) => addon.title.length < 2 || !Number.isFinite(addon.price) || addon.price < 0)) {
      nextErrors.addons = "Her ek hizmetin Türkçe adı ve 0 veya daha büyük bir fiyatı olmalı.";
    }
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !editor) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      toast.notify("Supabase yapılandırması eksik.", "error");
      return;
    }

    setSaving(true);
    const englishFeatures = textLines(draft.features_en);
    const payload = {
      title,
      title_en: emptyToNull(draft.title_en),
      tagline: emptyToNull(draft.tagline),
      tagline_en: emptyToNull(draft.tagline_en),
      price,
      old_price: oldPrice,
      price_note: emptyToNull(draft.price_note),
      price_note_en: emptyToNull(draft.price_note_en),
      delivery_time: emptyToNull(draft.delivery_time),
      delivery_time_en: emptyToNull(draft.delivery_time_en),
      badge: emptyToNull(draft.badge),
      badge_en: emptyToNull(draft.badge_en),
      cta_label: emptyToNull(draft.cta_label),
      cta_label_en: emptyToNull(draft.cta_label_en),
      features: textLines(draft.features),
      features_en: englishFeatures.length > 0 ? englishFeatures : null,
      addons: toAddonRecords(addons),
      is_popular: draft.is_popular,
      is_active: draft.is_active,
      sort_order: sortOrder,
    };
    const query =
      editor.mode === "create"
        ? supabase.from("packages").insert(payload)
        : supabase.from("packages").update(payload).eq("id", editor.id ?? "");
    const { error: mutationError } = await query;
    setSaving(false);

    if (mutationError) {
      toast.notify(missingColumn(mutationError.message) ? upgradeHint : friendlyError(mutationError.message), "error");
      return;
    }

    setEditor(null);
    toast.success();
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
    const { error: mutationError } = await supabase.from("packages").delete().eq("id", pendingDelete.id);
    setDeleting(false);
    if (mutationError) {
      toast.notify(friendlyError(mutationError.message), "error");
      return;
    }
    setPendingDelete(null);
    toast.success();
    await reload();
  };

  const needsUpgrade = rows.length > 0 && rows.every((row) => !("addons" in row));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Teklif"
        title="Paketler & Fiyatlar"
        description="Fiyat, indirim, teslim süresi, rozet, buton yazısı, özellikler ve müşterinin talep formunda seçebileceği ek hizmetleri yönetin."
        onRefresh={() => void reload()}
        refreshing={refreshing}
        action={
          <button type="button" onClick={openCreate} className={primaryButtonClass}>
            <Plus className="h-4 w-4" aria-hidden />
            Yeni paket
          </button>
        }
      />

      {!ready && !loading ? <SetupNotice /> : null}
      {error ? <StatusNote tone="error">{error}</StatusNote> : null}
      {needsUpgrade ? <StatusNote tone="warning">{upgradeHint}</StatusNote> : null}

      <Panel>
        {loading ? (
          <TableSkeleton />
        ) : !ready || (error && rows.length === 0) ? null : rows.length === 0 ? (
          <EmptyState title="Henüz paket yok" body="İlk fiyat paketini ekleyerek teklif sayfasının kaynağını oluşturun." />
        ) : (
          <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-2">
            {rows.map((row) => {
              const features = asFeatures(row.features);
              const addons = parseAddons(row.addons);
              const price = asNumber(row.price);
              const oldPrice = oldPriceOf(row);
              const discount = discountPercent(price, oldPrice);
              const hidden = row.is_active === false;
              return (
                <article
                  key={row.id}
                  className={`rounded-2xl border border-white/10 bg-slate-950/40 p-5 ${hidden ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-white">{row.title}</h2>
                        {row.title_en?.trim() ? <p className="text-xs text-emerald-200/70">EN: {row.title_en}</p> : null}
                        <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-300">Sıra {row.sort_order ?? 0}</span>
                        {row.is_popular ? (
                          <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-200">Popüler</span>
                        ) : null}
                        {row.badge?.trim() ? (
                          <span className="rounded-full bg-violet-500/15 px-2.5 py-1 text-xs font-medium text-violet-200">{row.badge}</span>
                        ) : null}
                        {hidden ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-700/60 px-2.5 py-1 text-xs font-medium text-slate-200">
                            <EyeOff className="h-3 w-3" aria-hidden />
                            Gizli
                          </span>
                        ) : null}
                      </div>
                      {row.tagline?.trim() ? <p className="mt-2 text-sm text-slate-400">{row.tagline}</p> : null}
                      <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <p className="text-2xl font-semibold tracking-tight text-emerald-300">{formatTry(price)}</p>
                        {oldPrice && oldPrice > price ? (
                          <p className="text-sm text-slate-500 line-through">{formatTry(oldPrice)}</p>
                        ) : null}
                        {discount > 0 ? <span className="text-xs font-semibold text-emerald-200">%{discount} indirim</span> : null}
                      </div>
                      {row.price_note?.trim() ? <p className="mt-1 text-xs text-slate-500">{row.price_note}</p> : null}
                      {row.delivery_time?.trim() ? (
                        <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-300">
                          <Clock className="h-3.5 w-3.5 text-emerald-300" aria-hidden />
                          Teslim: {row.delivery_time}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex gap-2">
                      <IconButton label="Düzenle" onClick={() => openEdit(row)}>
                        <Pencil className="h-4 w-4" aria-hidden />
                      </IconButton>
                      <IconButton label="Sil" tone="danger" onClick={() => setPendingDelete(row)}>
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </IconButton>
                    </div>
                  </div>
                  {features.length > 0 ? (
                    <ul className="mt-4 space-y-2 text-sm text-slate-300">
                      {features.map((feature) => (
                        <li key={feature} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" aria-hidden />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-4 text-sm text-slate-500">Özellik eklenmemiş.</p>
                  )}
                  {addons.length > 0 ? (
                    <div className="mt-4 border-t border-white/10 pt-4">
                      <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.16em] text-violet-200/80 uppercase">
                        <Sparkles className="h-3.5 w-3.5" aria-hidden />
                        Ek hizmetler
                      </p>
                      <ul className="mt-2 space-y-1.5 text-sm text-slate-300">
                        {addons.map((addon, index) => (
                          <li key={`${addon.title}-${index}`} className="flex justify-between gap-3">
                            <span>{addon.title}</span>
                            <span className="shrink-0 text-slate-400 tabular-nums">+{formatTry(addon.price)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </Panel>

      <AdminModal
        open={Boolean(editor)}
        wide
        title={editor?.mode === "edit" ? "Paketi düzenle" : "Yeni paket"}
        description="Özellikleri her satıra bir madde olacak şekilde yazın. İngilizce alanlar boşsa Türkçe içerik gösterilir."
        onClose={() => {
          if (!saving) setEditor(null);
        }}
      >
        <form onSubmit={(event) => void save(event)} className="space-y-4">
          <BilingualGrid>
            <LanguageColumn title="Türkçe İçerik">
              <Field label="Başlık" error={fieldErrors.title}>
                <input
                  data-autofocus
                  value={draft.title}
                  onChange={(event) => set("title", event.target.value)}
                  className={inputClass}
                  placeholder="Kurumsal Vitrin"
                />
              </Field>
              <Field label="Kısa açıklama" hint="Başlığın altında tek cümle olarak görünür.">
                <input
                  value={draft.tagline}
                  onChange={(event) => set("tagline", event.target.value)}
                  className={inputClass}
                  placeholder="Güven veren, Google'da bulunan kurumsal site."
                />
              </Field>
              <Field label="Özellikler" hint="Her satır bir özellik olarak kaydedilir.">
                <textarea
                  value={draft.features}
                  onChange={(event) => set("features", event.target.value)}
                  className={`${inputClass} min-h-36 resize-y`}
                  placeholder={"8 sayfaya kadar kurumsal site\nMobil uyum\nGelişmiş SEO"}
                />
              </Field>
              <Field label="Teslim süresi">
                <input
                  value={draft.delivery_time}
                  onChange={(event) => set("delivery_time", event.target.value)}
                  className={inputClass}
                  placeholder="10–14 iş günü"
                />
              </Field>
              <Field label="Fiyat notu" hint="Fiyatın hemen altında küçük yazı.">
                <input
                  value={draft.price_note}
                  onChange={(event) => set("price_note", event.target.value)}
                  className={inputClass}
                  placeholder="+ KDV · Tek seferlik ödeme"
                />
              </Field>
              <Field label="Rozet" hint="Boşsa popüler pakette 'En çok tercih edilen' yazar.">
                <input
                  value={draft.badge}
                  onChange={(event) => set("badge", event.target.value)}
                  className={inputClass}
                  placeholder="Satışa hazır"
                />
              </Field>
              <Field label="Buton yazısı" hint="Boşsa 'Bu paketi seç' yazar.">
                <input
                  value={draft.cta_label}
                  onChange={(event) => set("cta_label", event.target.value)}
                  className={inputClass}
                  placeholder="Bu paketle başla"
                />
              </Field>
            </LanguageColumn>
            <LanguageColumn title="İngilizce İçerik">
              <Field label="Başlık" hint="Boş bırakılırsa Türkçe başlık gösterilir.">
                <input
                  value={draft.title_en}
                  onChange={(event) => set("title_en", event.target.value)}
                  className={inputClass}
                  placeholder="Corporate Showcase"
                />
              </Field>
              <Field label="Kısa açıklama">
                <input
                  value={draft.tagline_en}
                  onChange={(event) => set("tagline_en", event.target.value)}
                  className={inputClass}
                  placeholder="A corporate site that builds trust."
                />
              </Field>
              <Field label="Özellikler" hint="Boş bırakılırsa Türkçe özellikler gösterilir.">
                <textarea
                  value={draft.features_en}
                  onChange={(event) => set("features_en", event.target.value)}
                  className={`${inputClass} min-h-36 resize-y`}
                  placeholder={"Corporate site up to 8 pages\nMobile layout\nAdvanced SEO"}
                />
              </Field>
              <Field label="Teslim süresi">
                <input
                  value={draft.delivery_time_en}
                  onChange={(event) => set("delivery_time_en", event.target.value)}
                  className={inputClass}
                  placeholder="10–14 business days"
                />
              </Field>
              <Field label="Fiyat notu">
                <input
                  value={draft.price_note_en}
                  onChange={(event) => set("price_note_en", event.target.value)}
                  className={inputClass}
                  placeholder="+ VAT · One-time payment"
                />
              </Field>
              <Field label="Rozet">
                <input
                  value={draft.badge_en}
                  onChange={(event) => set("badge_en", event.target.value)}
                  className={inputClass}
                  placeholder="Ready to sell"
                />
              </Field>
              <Field label="Buton yazısı">
                <input
                  value={draft.cta_label_en}
                  onChange={(event) => set("cta_label_en", event.target.value)}
                  className={inputClass}
                  placeholder="Start with this package"
                />
              </Field>
            </LanguageColumn>
          </BilingualGrid>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Fiyat (TRY)" error={fieldErrors.price}>
              <input
                type="number"
                min={0}
                step="0.01"
                value={draft.price}
                onChange={(event) => set("price", event.target.value)}
                className={inputClass}
                placeholder="24900"
              />
            </Field>
            <Field label="Eski fiyat (üstü çizili)" hint="Opsiyonel. İndirim rozeti otomatik hesaplanır." error={fieldErrors.old_price}>
              <input
                type="number"
                min={0}
                step="0.01"
                value={draft.old_price}
                onChange={(event) => set("old_price", event.target.value)}
                className={inputClass}
                placeholder="32900"
              />
            </Field>
            <Field label="Sıralama (1, 2, 3...)" hint="Küçük sayı solda gelir." error={fieldErrors.sort_order}>
              <input
                type="number"
                min={0}
                step={1}
                value={draft.sort_order}
                onChange={(event) => set("sort_order", event.target.value)}
                className={inputClass}
                placeholder="1"
              />
            </Field>
          </div>

          <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.18em] text-emerald-300/80 uppercase">Ek hizmetler</p>
                <p className="mt-1 text-xs text-slate-500">Müşteri talep formunda bunları işaretleyebilir ve tahmini toplamı görür.</p>
              </div>
              <button
                type="button"
                className={secondaryButtonClass}
                onClick={() => set("addons", [...draft.addons, { title: "", title_en: "", price: "" }])}
              >
                <Plus className="h-4 w-4" aria-hidden />
                Ek hizmet ekle
              </button>
            </div>
            {draft.addons.length === 0 ? (
              <p className="text-sm text-slate-500">Henüz ek hizmet yok. Örn: Logo tasarımı, İngilizce dil, 1 yıl bakım.</p>
            ) : (
              <div className="space-y-2">
                {draft.addons.map((addon, index) => (
                  <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_8rem_auto]">
                    <input
                      aria-label={`Ek hizmet ${index + 1} Türkçe adı`}
                      value={addon.title}
                      onChange={(event) => setAddon(index, "title", event.target.value)}
                      className={inputClass}
                      placeholder="Logo tasarımı"
                    />
                    <input
                      aria-label={`Ek hizmet ${index + 1} İngilizce adı`}
                      value={addon.title_en}
                      onChange={(event) => setAddon(index, "title_en", event.target.value)}
                      className={inputClass}
                      placeholder="Logo design"
                    />
                    <input
                      aria-label={`Ek hizmet ${index + 1} fiyatı`}
                      type="number"
                      min={0}
                      step="0.01"
                      value={addon.price}
                      onChange={(event) => setAddon(index, "price", event.target.value)}
                      className={inputClass}
                      placeholder="3500"
                    />
                    <IconButton
                      label="Ek hizmeti kaldır"
                      tone="danger"
                      onClick={() => set("addons", draft.addons.filter((_, position) => position !== index))}
                    >
                      <X className="h-4 w-4" aria-hidden />
                    </IconButton>
                  </div>
                ))}
              </div>
            )}
            {fieldErrors.addons ? <p className="text-xs text-rose-300">{fieldErrors.addons}</p> : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <ToggleField label="Popüler paket (vurgulu kart)" checked={draft.is_popular} onChange={(value) => set("is_popular", value)} />
            <ToggleField label="Sitede göster" checked={draft.is_active} onChange={(value) => set("is_active", value)} />
          </div>
          <ModalActions onCancel={() => setEditor(null)} saving={saving} submitLabel={editor?.mode === "edit" ? "Güncelle" : "Ekle"} />
        </form>
      </AdminModal>

      <AdminModal
        open={Boolean(pendingDelete)}
        title="Paketi sil"
        description="Bu işlem geri alınamaz. Sadece siteden kaldırmak için paketi düzenleyip 'Sitede göster' seçeneğini kapatabilirsiniz."
        onClose={() => {
          if (!deleting) setPendingDelete(null);
        }}
      >
        <p className="text-sm leading-6 text-slate-300">{pendingDelete?.title}</p>
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
