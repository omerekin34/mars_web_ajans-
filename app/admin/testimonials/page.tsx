"use client";

import { useState } from "react";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
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
import { TranslateButton } from "@/components/admin/translate-button";
import type { TestimonialRow } from "@/lib/admin/types";
import { emptyToNull, friendlyError } from "@/lib/admin/format";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Draft = {
  name: string;
  title: string;
  title_en: string;
  review: string;
  review_en: string;
  rating: string;
  is_verified: boolean;
  sort_order: string;
};

type Editor = { mode: "create" | "edit"; id?: string };
type FieldKey = "name" | "title" | "review" | "rating" | "sort_order";

function blankDraft(order: number): Draft {
  return {
    name: "",
    title: "",
    title_en: "",
    review: "",
    review_en: "",
    rating: "5",
    is_verified: true,
    sort_order: String(order),
  };
}

export default function TestimonialsPage() {
  const toast = useAdminToast();
  const { rows, loading, refreshing, error, ready, reload } = useSupabaseResource<TestimonialRow>(
    "testimonials",
    "sort_order",
    true,
  );
  const [editor, setEditor] = useState<Editor | null>(null);
  const [draft, setDraft] = useState<Draft>(blankDraft(1));
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<TestimonialRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openCreate = () => {
    setFieldErrors({});
    setDraft(blankDraft(rows.length + 1));
    setEditor({ mode: "create" });
  };

  const openEdit = (row: TestimonialRow) => {
    setFieldErrors({});
    setDraft({
      name: row.name,
      title: row.title,
      title_en: row.title_en ?? "",
      review: row.review,
      review_en: row.review_en ?? "",
      rating: String(row.rating),
      is_verified: row.is_verified,
      sort_order: String(row.sort_order),
    });
    setEditor({ mode: "edit", id: row.id });
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = draft.name.trim();
    const title = draft.title.trim();
    const review = draft.review.trim();
    const rating = Number(draft.rating);
    const sortOrder = Number(draft.sort_order);
    const nextErrors: Partial<Record<FieldKey, string>> = {};
    if (name.length < 2) nextErrors.name = "Müşteri adı en az 2 karakter olmalı.";
    if (title.length < 2) nextErrors.title = "Unvan ve şirket en az 2 karakter olmalı.";
    if (review.length < 2) nextErrors.review = "Yorum metni en az 2 karakter olmalı.";
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) nextErrors.rating = "Yıldız sayısı 1 ile 5 arasında olmalı.";
    if (!Number.isInteger(sortOrder) || sortOrder < 0) nextErrors.sort_order = "Sıralama 0 veya daha büyük bir tam sayı olmalı.";
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !editor) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      toast.notify("Supabase yapılandırması eksik.", "error");
      return;
    }

    setSaving(true);
    const payload = {
      name,
      title,
      title_en: emptyToNull(draft.title_en),
      review,
      review_en: emptyToNull(draft.review_en),
      rating,
      is_verified: draft.is_verified,
      sort_order: sortOrder,
    };
    const query =
      editor.mode === "create"
        ? supabase.from("testimonials").insert(payload)
        : supabase.from("testimonials").update(payload).eq("id", editor.id ?? "");
    const { error: mutationError } = await query;
    setSaving(false);

    if (mutationError) {
      toast.notify(friendlyError(mutationError.message), "error");
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
    const { error: mutationError } = await supabase.from("testimonials").delete().eq("id", pendingDelete.id);
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
        eyebrow="İçerik"
        title="Müşteri Yorumları"
        description="Türkçe ve İngilizce unvan ile yorumu, yıldız sayısını, onay rozetini ve sıralamayı ekleyin, düzenleyin veya silin. İngilizce boşsa sitede Türkçe görünür."
        onRefresh={() => void reload()}
        refreshing={refreshing}
        action={
          <button type="button" onClick={openCreate} className={primaryButtonClass}>
            <Plus className="h-4 w-4" aria-hidden />
            Yeni yorum
          </button>
        }
      />

      {!ready && !loading ? <SetupNotice /> : null}
      {error ? <StatusNote tone="error">{error}</StatusNote> : null}

      <Panel>
        {loading ? (
          <TableSkeleton />
        ) : !ready || (error && rows.length === 0) ? null : rows.length === 0 ? (
          <EmptyState
            title="Henüz yorum yok"
            body="Yeni yorum ekleyerek müşteri yorumları bölümünü oluşturun."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full text-left text-sm">
              <thead className="text-[11px] tracking-[0.14em] text-slate-400 uppercase">
                <tr>
                  <th className="px-5 py-3 font-semibold">Sıra</th>
                  <th className="px-5 py-3 font-semibold">Müşteri</th>
                  <th className="px-5 py-3 font-semibold">Yıldız</th>
                  <th className="px-5 py-3 font-semibold">Onay</th>
                  <th className="px-5 py-3 text-right font-semibold">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rows.map((row) => (
                  <tr key={row.id} className="transition hover:bg-emerald-500/5">
                    <td className="px-5 py-4 text-slate-400">{row.sort_order}</td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-white">{row.name}</p>
                      <p className="mt-1 text-slate-400">{row.title}</p>
                      <p className="mt-1 line-clamp-2 max-w-xl text-slate-500">{row.review}</p>
                      {row.title_en?.trim() ? <p className="mt-1 text-xs text-emerald-200/70">EN: {row.title_en}</p> : null}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 text-yellow-400">
                        <Star className="h-3.5 w-3.5 fill-yellow-400" aria-hidden />
                        {row.rating}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          row.is_verified ? "bg-emerald-500/15 text-emerald-200" : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {row.is_verified ? "Onaylı" : "Rozetsiz"}
                      </span>
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
        title={editor?.mode === "edit" ? "Yorumu düzenle" : "Yeni yorum"}
        description="İngilizce alanlar boş kalırsa ziyaretçi Türkçe metni görür."
        onClose={() => {
          if (!saving) setEditor(null);
        }}
      >
        <form onSubmit={(event) => void save(event)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Sıralama" hint="Küçük sayı listede daha üstte durur." error={fieldErrors.sort_order}>
              <input
                data-autofocus
                type="number"
                min={0}
                step={1}
                value={draft.sort_order}
                onChange={(event) => setDraft((current) => ({ ...current, sort_order: event.target.value }))}
                className={inputClass}
              />
            </Field>
            <Field label="Müşteri adı" error={fieldErrors.name}>
              <input
                value={draft.name}
                onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                className={inputClass}
                placeholder="Elif Karaca"
              />
            </Field>
            <Field label="Yıldız sayısı" error={fieldErrors.rating}>
              <select
                value={draft.rating}
                onChange={(event) => setDraft((current) => ({ ...current, rating: event.target.value }))}
                className={inputClass}
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </Field>
            <div className="flex items-end">
              <div className="w-full">
                <ToggleField
                  label="Onaylı müşteri"
                  checked={draft.is_verified}
                  onChange={(is_verified) => setDraft((current) => ({ ...current, is_verified }))}
                />
              </div>
            </div>
          </div>

          <BilingualGrid>
            <LanguageColumn title="Türkçe İçerik">
              <Field label="Unvan / Şirket" error={fieldErrors.title}>
                <input
                  value={draft.title}
                  onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                  className={inputClass}
                  placeholder="Operasyon Müdürü, Lumen Store"
                />
              </Field>
              <Field label="Yorum metni" error={fieldErrors.review}>
                <textarea
                  value={draft.review}
                  onChange={(event) => setDraft((current) => ({ ...current, review: event.target.value }))}
                  className={`${inputClass} min-h-32 resize-y`}
                  placeholder="Müşterinin Türkçe yorumu."
                />
              </Field>
            </LanguageColumn>
            <LanguageColumn
              title="İngilizce İçerik"
              action={
                <TranslateButton
                  draft={draft}
                  fields={[
                    { source: "title", target: "title_en" },
                    { source: "review", target: "review_en" },
                  ]}
                  onApply={(patch) => setDraft((current) => ({ ...current, ...patch }))}
                />
              }
            >
              <Field label="Unvan / Şirket (EN)" hint="Boş bırakılırsa Türkçe unvan gösterilir.">
                <input
                  value={draft.title_en}
                  onChange={(event) => setDraft((current) => ({ ...current, title_en: event.target.value }))}
                  className={inputClass}
                  placeholder="Operations Manager, Lumen Store"
                />
              </Field>
              <Field label="Yorum metni (EN)" hint="Boş bırakılırsa Türkçe yorum gösterilir.">
                <textarea
                  value={draft.review_en}
                  onChange={(event) => setDraft((current) => ({ ...current, review_en: event.target.value }))}
                  className={`${inputClass} min-h-32 resize-y`}
                  placeholder="The client's review in English."
                />
              </Field>
            </LanguageColumn>
          </BilingualGrid>

          <ModalActions onCancel={() => setEditor(null)} saving={saving} submitLabel={editor?.mode === "edit" ? "Güncelle" : "Ekle"} />
        </form>
      </AdminModal>

      <AdminModal
        open={Boolean(pendingDelete)}
        title="Yorumu sil"
        description="Bu işlem geri alınamaz."
        onClose={() => {
          if (!deleting) setPendingDelete(null);
        }}
      >
        <p className="text-sm leading-6 text-slate-300">
          {pendingDelete?.name}
          {pendingDelete?.title ? ` — ${pendingDelete.title}` : ""}
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
