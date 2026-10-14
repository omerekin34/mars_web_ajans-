"use client";

import { useEffect, useState } from "react";
import { Flame, Minus, Pencil, Plus, Trash2 } from "lucide-react";
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
} from "@/components/admin/primitives";
import { useSupabaseResource } from "@/components/admin/use-resource";
import { useAdminToast } from "@/components/admin/toast-provider";
import { TranslateButton } from "@/components/admin/translate-button";
import type { SiteSettingRow } from "@/lib/admin/types";
import { emptyToNull, friendlyError } from "@/lib/admin/format";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Draft = {
  setting_key: string;
  label: string;
  value: string;
  address_en: string;
  footer_text_en: string;
};

type Editor = { mode: "create" | "edit"; id?: string };

type FooterDraft = {
  footer_logo_url: string;
  instagram_url: string;
  linkedin_url: string;
  x_url: string;
  kvkk_text: string;
  kvkk_text_en: string;
  privacy_text: string;
  privacy_text_en: string;
  cookie_text: string;
  cookie_text_en: string;
};

type SettingsSection = "footer" | "legal";

const blankDraft: Draft = { setting_key: "", label: "", value: "", address_en: "", footer_text_en: "" };
const blankFooterDraft: FooterDraft = {
  footer_logo_url: "",
  instagram_url: "",
  linkedin_url: "",
  x_url: "",
  kvkk_text: "",
  kvkk_text_en: "",
  privacy_text: "",
  privacy_text_en: "",
  cookie_text: "",
  cookie_text_en: "",
};
const keyPattern = /^[a-z][a-z0-9_]{1,40}$/;
const slotsKey = "project_slots";
const maxSlots = 99;

const legalTextClass = `${inputClass} min-h-64 resize-y`;

function LegalTextPair({
  title,
  tr,
  en,
  onTr,
  onEn,
  enAction,
}: {
  title: string;
  tr: string;
  en: string;
  onTr: (value: string) => void;
  onEn: (value: string) => void;
  enAction?: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <BilingualGrid>
        <LanguageColumn title="Türkçe İçerik">
          <Field label="Metin" hint="Boş satır yeni paragraf açar.">
            <textarea value={tr} onChange={(event) => onTr(event.target.value)} className={legalTextClass} />
          </Field>
        </LanguageColumn>
        <LanguageColumn title="İngilizce İçerik" action={enAction}>
          <Field label="Metin" hint="Boş bırakılırsa Türkçe metin gösterilir.">
            <textarea value={en} onChange={(event) => onEn(event.target.value)} className={legalTextClass} />
          </Field>
        </LanguageColumn>
      </BilingualGrid>
    </div>
  );
}

function optionalHttpUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.href;
  } catch {
    return null;
  }
}

export default function SettingsPage() {
  const toast = useAdminToast();
  const { rows, loading, refreshing, error, ready, reload } = useSupabaseResource<SiteSettingRow>(
    "site_settings",
    "created_at",
    true,
  );
  const [editor, setEditor] = useState<Editor | null>(null);
  const [draft, setDraft] = useState<Draft>(blankDraft);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<"setting_key" | "label" | "value", string>>>({});
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<SiteSettingRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [footerDraft, setFooterDraft] = useState<FooterDraft>(blankFooterDraft);
  const [footerErrors, setFooterErrors] = useState<Partial<Record<"footer_logo_url" | "instagram_url" | "linkedin_url" | "x_url", string>>>({});
  const [footerSaving, setFooterSaving] = useState(false);
  const [section, setSection] = useState<SettingsSection>("footer");
  const [slotsDraft, setSlotsDraft] = useState("2");
  const [slotsError, setSlotsError] = useState("");
  const [slotsSaving, setSlotsSaving] = useState(false);
  const footerRow = rows.find((row) => row.setting_key === "footer");
  const slotsRow = rows.find((row) => row.setting_key === slotsKey);
  const settingRows = rows.filter((row) => row.setting_key !== "footer" && row.setting_key !== slotsKey);

  useEffect(() => {
    setSlotsDraft(slotsRow?.value?.trim() || "2");
  }, [slotsRow]);

  const stepSlots = (delta: number) => {
    setSlotsError("");
    setSlotsDraft((current) => {
      const number = Number.parseInt(current, 10);
      const base = Number.isInteger(number) ? number : 0;
      return String(Math.min(maxSlots, Math.max(0, base + delta)));
    });
  };

  const saveSlots = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = slotsDraft.trim();
    const number = Number(value);
    if (!/^\d+$/.test(value) || number > maxSlots) {
      setSlotsError(`0 ile ${maxSlots} arasında tam sayı girin.`);
      return;
    }
    setSlotsError("");

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      toast.notify("Supabase yapılandırması eksik.", "error");
      return;
    }

    setSlotsSaving(true);
    const mutation = slotsRow
      ? await supabase.from("site_settings").update({ value: String(number) }).eq("id", slotsRow.id)
      : await supabase.from("site_settings").insert({
          setting_key: slotsKey,
          label: "Kalan Proje Kontenjanı",
          value: String(number),
        });
    setSlotsSaving(false);

    if (mutation.error) {
      toast.notify(friendlyError(mutation.error.message), "error");
      return;
    }

    toast.success();
    await reload();
  };

  useEffect(() => {
    setFooterDraft({
      footer_logo_url: footerRow?.footer_logo_url ?? "",
      instagram_url: footerRow?.instagram_url ?? "",
      linkedin_url: footerRow?.linkedin_url ?? "",
      x_url: footerRow?.x_url ?? "",
      kvkk_text: footerRow?.kvkk_text ?? "",
      kvkk_text_en: footerRow?.kvkk_text_en ?? "",
      privacy_text: footerRow?.privacy_text ?? "",
      privacy_text_en: footerRow?.privacy_text_en ?? "",
      cookie_text: footerRow?.cookie_text ?? "",
      cookie_text_en: footerRow?.cookie_text_en ?? "",
    });
  }, [footerRow]);

  const openCreate = () => {
    setFieldErrors({});
    setDraft(blankDraft);
    setEditor({ mode: "create" });
  };

  const openEdit = (row: SiteSettingRow) => {
    setFieldErrors({});
    setDraft({
      setting_key: row.setting_key,
      label: row.label,
      value: row.value ?? "",
      address_en: row.address_en ?? "",
      footer_text_en: row.footer_text_en ?? "",
    });
    setEditor({ mode: "edit", id: row.id });
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const settingKey = draft.setting_key.trim();
    const label = draft.label.trim();
    const value = draft.value.trim();
    const nextErrors: Partial<Record<"setting_key" | "label" | "value", string>> = {};
    if (!keyPattern.test(settingKey)) nextErrors.setting_key = "Anahtar küçük harfle başlamalı; harf, rakam ve alt çizgi kullanın.";
    if (label.length < 2) nextErrors.label = "Etiket en az 2 karakter olmalı.";
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !editor) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      toast.notify("Supabase yapılandırması eksik.", "error");
      return;
    }

    setSaving(true);
    const payload: {
      setting_key?: string;
      label: string;
      value: string;
      address_en?: string | null;
      footer_text_en?: string | null;
    } = { label, value };
    if (settingKey === "address") payload.address_en = emptyToNull(draft.address_en);
    if (settingKey === "footer_text") payload.footer_text_en = emptyToNull(draft.footer_text_en);
    const mutation =
      editor.mode === "create"
        ? await supabase.from("site_settings").insert({ ...payload, setting_key: settingKey })
        : await supabase.from("site_settings").update(payload).eq("id", editor.id ?? "");
    setSaving(false);
    const mutationError = mutation.error;

    if (mutationError) {
      toast.notify(friendlyError(mutationError.message), "error");
      return;
    }

    setEditor(null);
    toast.success();
    await reload();
  };

  const saveFooter = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Partial<Record<"footer_logo_url" | "instagram_url" | "linkedin_url" | "x_url", string>> = {};
    const logo = optionalHttpUrl(footerDraft.footer_logo_url);
    const instagram = optionalHttpUrl(footerDraft.instagram_url);
    const linkedin = optionalHttpUrl(footerDraft.linkedin_url);
    const x = optionalHttpUrl(footerDraft.x_url);
    if (logo === null) nextErrors.footer_logo_url = "http:// veya https:// ile başlayan bir görsel linki girin.";
    if (instagram === null) nextErrors.instagram_url = "http:// veya https:// ile başlayan bir link girin.";
    if (linkedin === null) nextErrors.linkedin_url = "http:// veya https:// ile başlayan bir link girin.";
    if (x === null) nextErrors.x_url = "http:// veya https:// ile başlayan bir link girin.";
    setFooterErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setSection("footer");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      toast.notify("Supabase yapılandırması eksik.", "error");
      return;
    }

    setFooterSaving(true);
    const payload = {
      footer_logo_url: emptyToNull(logo ?? ""),
      instagram_url: emptyToNull(instagram ?? ""),
      linkedin_url: emptyToNull(linkedin ?? ""),
      x_url: emptyToNull(x ?? ""),
      kvkk_text: emptyToNull(footerDraft.kvkk_text),
      kvkk_text_en: emptyToNull(footerDraft.kvkk_text_en),
      privacy_text: emptyToNull(footerDraft.privacy_text),
      privacy_text_en: emptyToNull(footerDraft.privacy_text_en),
      cookie_text: emptyToNull(footerDraft.cookie_text),
      cookie_text_en: emptyToNull(footerDraft.cookie_text_en),
    };
    const mutation = footerRow
      ? await supabase.from("site_settings").update(payload).eq("id", footerRow.id)
      : await supabase.from("site_settings").insert({
          setting_key: "footer",
          label: "Footer",
          value: "",
          ...payload,
        });
    setFooterSaving(false);

    if (mutation.error) {
      toast.notify(friendlyError(mutation.error.message), "error");
      return;
    }

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
    const { error: mutationError } = await supabase.from("site_settings").delete().eq("id", pendingDelete.id);
    setDeleting(false);
    if (mutationError) {
      toast.notify(friendlyError(mutationError.message), "error");
      return;
    }
    setPendingDelete(null);
    toast.success();
    await reload();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Site"
        title="Genel Ayarlar"
        description="Footer, sosyal medya ve yasal metinler tek kayıtta güncellenir. Boş sosyal link gizlenir; boş İngilizce metin Türkçeye döner."
        onRefresh={() => void reload()}
        refreshing={refreshing}
        action={
          <button type="button" onClick={openCreate} className={primaryButtonClass}>
            <Plus className="h-4 w-4" aria-hidden />
            Yeni ayar
          </button>
        }
      />

      {!ready && !loading ? <SetupNotice /> : null}
      {error ? <StatusNote tone="error">{error}</StatusNote> : null}

      {ready ? (
        <Panel>
          <form
            onSubmit={(event) => void saveSlots(event)}
            className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <Flame className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <h2 className="text-base font-semibold text-white">Sınırlı Kontenjan</h2>
                <p className="mt-1 max-w-xl text-sm leading-6 text-slate-400">
                  Ana sayfadaki rozet ve hesaplayıcı uyarısında görünen kalan proje sayısı. 0 girilirse sitede “Kontenjan Doldu” yazar.
                </p>
                <p className="mt-2 text-xs text-emerald-200/80">
                  Sitede:{" "}
                  {/^\d+$/.test(slotsDraft.trim()) && Number(slotsDraft) === 0
                    ? "Bu ayın kontenjanı doldu, gelecek ay için yerinizi ayırtın"
                    : `Bu ay için sadece ${slotsDraft.trim() || "…"} proje kontenjanı kaldı`}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-start">
              <div>
                <div className="flex items-center gap-2">
                  <IconButton label="Azalt" onClick={() => stepSlots(-1)}>
                    <Minus className="h-4 w-4" aria-hidden />
                  </IconButton>
                  <input
                    value={slotsDraft}
                    onChange={(event) => {
                      setSlotsError("");
                      setSlotsDraft(event.target.value.replace(/\D/g, "").slice(0, 2));
                    }}
                    inputMode="numeric"
                    aria-label="Kalan proje kontenjanı"
                    aria-invalid={Boolean(slotsError)}
                    className={`${inputClass} w-20 text-center text-lg font-semibold`}
                  />
                  <IconButton label="Artır" onClick={() => stepSlots(1)}>
                    <Plus className="h-4 w-4" aria-hidden />
                  </IconButton>
                </div>
                {slotsError ? <p className="mt-1.5 text-xs text-rose-400">{slotsError}</p> : null}
              </div>
              <button type="submit" className={primaryButtonClass} disabled={loading || slotsSaving}>
                {slotsSaving ? "Kaydediliyor" : "Kaydet"}
              </button>
            </div>
          </form>
        </Panel>
      ) : null}

      {ready ? (
        <Panel>
          <form onSubmit={(event) => void saveFooter(event)} className="space-y-6 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">Footer ve yasal metinler</h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
                  Logo boşsa noktalı Mars Web Ajans logosu kalır. Sosyal link boşsa ikon gizlenir. Kayıt, iki bölümü birlikte günceller.
                </p>
              </div>
              <div role="tablist" aria-label="Ayar bölümleri" className="flex rounded-xl border border-white/10 bg-slate-950/50 p-1">
                <button
                  type="button"
                  role="tab"
                  aria-selected={section === "footer"}
                  onClick={() => setSection("footer")}
                  className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                    section === "footer" ? "bg-emerald-500 text-slate-950" : "text-slate-300 hover:text-white"
                  }`}
                >
                  Footer & Sosyal Medya
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={section === "legal"}
                  onClick={() => setSection("legal")}
                  className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                    section === "legal" ? "bg-emerald-500 text-slate-950" : "text-slate-300 hover:text-white"
                  }`}
                >
                  Yasal Metinler
                </button>
              </div>
            </div>

            {section === "footer" ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Footer Logo URL" hint="Görselin doğrudan linki. Boşsa statik logo görünür." error={footerErrors.footer_logo_url}>
                  <input
                    value={footerDraft.footer_logo_url}
                    onChange={(event) => setFooterDraft((current) => ({ ...current, footer_logo_url: event.target.value }))}
                    className={inputClass}
                    placeholder="https://.../logo.png"
                    inputMode="url"
                  />
                </Field>
                <Field label="Instagram Linki" hint="Boş bırakılırsa ikon gizlenir." error={footerErrors.instagram_url}>
                  <input
                    value={footerDraft.instagram_url}
                    onChange={(event) => setFooterDraft((current) => ({ ...current, instagram_url: event.target.value }))}
                    className={inputClass}
                    placeholder="https://www.instagram.com/..."
                    inputMode="url"
                  />
                </Field>
                <Field label="LinkedIn Linki" hint="Boş bırakılırsa ikon gizlenir." error={footerErrors.linkedin_url}>
                  <input
                    value={footerDraft.linkedin_url}
                    onChange={(event) => setFooterDraft((current) => ({ ...current, linkedin_url: event.target.value }))}
                    className={inputClass}
                    placeholder="https://www.linkedin.com/..."
                    inputMode="url"
                  />
                </Field>
                <Field label="X (Twitter) Linki" hint="Boş bırakılırsa ikon gizlenir." error={footerErrors.x_url}>
                  <input
                    value={footerDraft.x_url}
                    onChange={(event) => setFooterDraft((current) => ({ ...current, x_url: event.target.value }))}
                    className={inputClass}
                    placeholder="https://x.com/..."
                    inputMode="url"
                  />
                </Field>
              </div>
            ) : (
              <div className="space-y-8">
                <LegalTextPair
                  title="KVKK Aydınlatma Metni"
                  tr={footerDraft.kvkk_text}
                  en={footerDraft.kvkk_text_en}
                  onTr={(value) => setFooterDraft((current) => ({ ...current, kvkk_text: value }))}
                  onEn={(value) => setFooterDraft((current) => ({ ...current, kvkk_text_en: value }))}
                  enAction={
                    <TranslateButton
                      draft={footerDraft}
                      fields={[{ source: "kvkk_text", target: "kvkk_text_en" }]}
                      onApply={(patch) => setFooterDraft((current) => ({ ...current, ...patch }))}
                    />
                  }
                />
                <LegalTextPair
                  title="Gizlilik Politikası"
                  tr={footerDraft.privacy_text}
                  en={footerDraft.privacy_text_en}
                  onTr={(value) => setFooterDraft((current) => ({ ...current, privacy_text: value }))}
                  onEn={(value) => setFooterDraft((current) => ({ ...current, privacy_text_en: value }))}
                  enAction={
                    <TranslateButton
                      draft={footerDraft}
                      fields={[{ source: "privacy_text", target: "privacy_text_en" }]}
                      onApply={(patch) => setFooterDraft((current) => ({ ...current, ...patch }))}
                    />
                  }
                />
                <LegalTextPair
                  title="Çerez Politikası"
                  tr={footerDraft.cookie_text}
                  en={footerDraft.cookie_text_en}
                  onTr={(value) => setFooterDraft((current) => ({ ...current, cookie_text: value }))}
                  onEn={(value) => setFooterDraft((current) => ({ ...current, cookie_text_en: value }))}
                  enAction={
                    <TranslateButton
                      draft={footerDraft}
                      fields={[{ source: "cookie_text", target: "cookie_text_en" }]}
                      onApply={(patch) => setFooterDraft((current) => ({ ...current, ...patch }))}
                    />
                  }
                />
              </div>
            )}

            <div className="flex justify-end border-t border-white/10 pt-5">
              <button type="submit" className={primaryButtonClass} disabled={loading || footerSaving}>
                {footerSaving ? "Kaydediliyor" : "Kaydet"}
              </button>
            </div>
          </form>
        </Panel>
      ) : null}

      <Panel>
        {loading ? (
          <TableSkeleton />
        ) : !ready || (error && settingRows.length === 0) ? null : settingRows.length === 0 ? (
          <EmptyState title="Henüz ayar yok" body="İletişim numarası, e-posta ve adres için bir kayıt ekleyin." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full text-left text-sm">
              <thead className="text-[11px] tracking-[0.14em] text-slate-400 uppercase">
                <tr>
                  <th className="px-5 py-3 font-semibold">Alan</th>
                  <th className="px-5 py-3 font-semibold">Anahtar</th>
                  <th className="px-5 py-3 font-semibold">Değer</th>
                  <th className="px-5 py-3 text-right font-semibold">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {settingRows.map((row) => (
                  <tr key={row.id} className="transition hover:bg-emerald-500/5">
                    <td className="px-5 py-4 font-medium text-white">{row.label}</td>
                    <td className="px-5 py-4 font-mono text-xs text-emerald-200/80">{row.setting_key}</td>
                    <td className="max-w-sm px-5 py-4 whitespace-pre-wrap text-slate-300">
                      <p>{row.value || "—"}</p>
                      {row.setting_key === "address" && row.address_en?.trim() ? (
                        <p className="mt-1 text-xs text-emerald-200/70">EN: {row.address_en}</p>
                      ) : null}
                      {row.setting_key === "footer_text" && row.footer_text_en?.trim() ? (
                        <p className="mt-1 text-xs text-emerald-200/70">EN: {row.footer_text_en}</p>
                      ) : null}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <IconButton label="Düzenle" onClick={() => openEdit(row)}>
                          <Pencil className="h-4 w-4" aria-hidden />
                        </IconButton>
                        <IconButton label="Sil" tone="danger" onClick={() => setPendingDelete(row)}>
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <AdminModal
        open={Boolean(editor)}
        wide
        title={editor?.mode === "edit" ? "Ayarı düzenle" : "Yeni ayar"}
        description="address anahtarında İngilizce adres, footer_text anahtarında İngilizce alt bilgi girilir. Diğer anahtarlar çevrilmez."
        onClose={() => {
          if (!saving) setEditor(null);
        }}
      >
        <form onSubmit={(event) => void save(event)} className="space-y-4">
          <Field label="Anahtar" hint="Örnek: phone, email, address, footer_text" error={fieldErrors.setting_key}>
            <input
              data-autofocus
              value={draft.setting_key}
              disabled={editor?.mode === "edit"}
              onChange={(event) => setDraft((current) => ({ ...current, setting_key: event.target.value }))}
              className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-60`}
              placeholder="phone"
            />
          </Field>
          <Field label="Etiket" error={fieldErrors.label}>
            <input
              value={draft.label}
              onChange={(event) => setDraft((current) => ({ ...current, label: event.target.value }))}
              className={inputClass}
              placeholder="İletişim Numarası"
            />
          </Field>
          <BilingualGrid>
            <LanguageColumn title="Türkçe İçerik">
              <Field label="Değer">
                <textarea
                  value={draft.value}
                  onChange={(event) => setDraft((current) => ({ ...current, value: event.target.value }))}
                  className={`${inputClass} min-h-28 resize-y`}
                  placeholder="+90 212 000 00 00"
                />
              </Field>
            </LanguageColumn>
            <LanguageColumn
              title="İngilizce İçerik"
              action={
                draft.setting_key.trim() === "address" || draft.setting_key.trim() === "footer_text" ? (
                  <TranslateButton
                    draft={draft}
                    fields={[
                      draft.setting_key.trim() === "address"
                        ? { source: "value", target: "address_en" }
                        : { source: "value", target: "footer_text_en" },
                    ]}
                    onApply={(patch) => setDraft((current) => ({ ...current, ...patch }))}
                  />
                ) : undefined
              }
            >
              {draft.setting_key.trim() === "address" ? (
                <Field label="Adres" hint="Boş bırakılırsa Türkçe adres gösterilir.">
                  <textarea
                    value={draft.address_en}
                    onChange={(event) => setDraft((current) => ({ ...current, address_en: event.target.value }))}
                    className={`${inputClass} min-h-28 resize-y`}
                    placeholder="Maslak, Sarıyer / Istanbul"
                  />
                </Field>
              ) : draft.setting_key.trim() === "footer_text" ? (
                <Field label="Alt bilgi" hint="Boş bırakılırsa Türkçe alt bilgi gösterilir.">
                  <textarea
                    value={draft.footer_text_en}
                    onChange={(event) => setDraft((current) => ({ ...current, footer_text_en: event.target.value }))}
                    className={`${inputClass} min-h-28 resize-y`}
                    placeholder="Turnkey digital branches for SMBs."
                  />
                </Field>
              ) : (
                <p className="text-sm leading-6 text-slate-400">
                  Bu anahtarın ayrı bir İngilizce sütunu yok. Adres için <span className="text-emerald-200">address</span>, alt bilgi için{" "}
                  <span className="text-emerald-200">footer_text</span> kullanın.
                </p>
              )}
            </LanguageColumn>
          </BilingualGrid>
          <ModalActions onCancel={() => setEditor(null)} saving={saving} submitLabel={editor?.mode === "edit" ? "Güncelle" : "Ekle"} />
        </form>
      </AdminModal>

      <AdminModal
        open={Boolean(pendingDelete)}
        title="Ayarı sil"
        description="Bu işlem geri alınamaz."
        onClose={() => {
          if (!deleting) setPendingDelete(null);
        }}
      >
        <p className="text-sm leading-6 text-slate-300">
          {pendingDelete?.label} <span className="text-slate-500">({pendingDelete?.setting_key})</span>
        </p>
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
