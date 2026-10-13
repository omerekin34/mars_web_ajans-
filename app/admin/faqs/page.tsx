"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
import type { FaqRow } from "@/lib/admin/types";
import { emptyToNull, friendlyError } from "@/lib/admin/format";
import { asFaqCategory, faqCategories } from "@/lib/faq";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { translations } from "@/lib/translations";

const categoryLabels = translations.tr.faq.categories;

type Draft = {
  question: string;
  answer: string;
  question_en: string;
  answer_en: string;
  category: string;
  is_active: boolean;
  sort_order: string;
};

type Editor = { mode: "create" | "edit"; id?: string };

function blankDraft(order: number): Draft {
  return {
    question: "",
    answer: "",
    question_en: "",
    answer_en: "",
    category: "",
    is_active: true,
    sort_order: String(order),
  };
}

export default function FaqsPage() {
  const toast = useAdminToast();
  const { rows, loading, refreshing, error, ready, reload } = useSupabaseResource<FaqRow>("faqs", "sort_order", true);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [draft, setDraft] = useState<Draft>(blankDraft(1));
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<"question" | "answer" | "sort_order", string>>>({});
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<FaqRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openCreate = () => {
    setFieldErrors({});
    setDraft(blankDraft(rows.length + 1));
    setEditor({ mode: "create" });
  };

  const openEdit = (row: FaqRow) => {
    setFieldErrors({});
    setDraft({
      question: row.question,
      answer: row.answer,
      question_en: row.question_en ?? "",
      answer_en: row.answer_en ?? "",
      category: asFaqCategory(row.category) ?? "",
      is_active: row.is_active,
      sort_order: String(row.sort_order),
    });
    setEditor({ mode: "edit", id: row.id });
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const question = draft.question.trim();
    const answer = draft.answer.trim();
    const sortOrder = Number(draft.sort_order);
    const nextErrors: Partial<Record<"question" | "answer" | "sort_order", string>> = {};
    if (question.length < 2) nextErrors.question = "Soru en az 2 karakter olmalı.";
    if (answer.length < 2) nextErrors.answer = "Cevap en az 2 karakter olmalı.";
    if (!Number.isInteger(sortOrder) || sortOrder < 0)
      nextErrors.sort_order = "Sıralama 0 veya daha büyük bir tam sayı olmalı.";
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !editor) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      toast.notify("Supabase yapılandırması eksik.", "error");
      return;
    }

    setSaving(true);
    const payload = {
      question,
      answer,
      question_en: emptyToNull(draft.question_en),
      answer_en: emptyToNull(draft.answer_en),
      category: asFaqCategory(draft.category),
      is_active: draft.is_active,
      sort_order: sortOrder,
    };
    const query =
      editor.mode === "create"
        ? supabase.from("faqs").insert(payload)
        : supabase
            .from("faqs")
            .update(payload)
            .eq("id", editor.id ?? "");
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
    const { error: mutationError } = await supabase.from("faqs").delete().eq("id", pendingDelete.id);
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
        title="Sıkça Sorulan Sorular"
        description="Türkçe ve İngilizce soru-cevap, aktiflik ve sıralamayı ekleyin, düzenleyin veya silin. İngilizce boşsa sitede Türkçe görünür."
        onRefresh={() => void reload()}
        refreshing={refreshing}
        action={
          <button type="button" onClick={openCreate} className={primaryButtonClass}>
            <Plus className="h-4 w-4" aria-hidden />
            Yeni soru
          </button>
        }
      />

      {!ready && !loading ? <SetupNotice /> : null}
      {error ? <StatusNote tone="error">{error}</StatusNote> : null}

      <Panel>
        {loading ? (
          <TableSkeleton />
        ) : !ready || (error && rows.length === 0) ? null : rows.length === 0 ? (
          <EmptyState title="Henüz soru yok" body="Yeni soru ekleyerek sıkça sorulan sorular listesini oluşturun." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full text-left text-sm">
              <thead className="text-[11px] tracking-[0.14em] text-slate-400 uppercase">
                <tr>
                  <th className="px-5 py-3 font-semibold">Sıra</th>
                  <th className="px-5 py-3 font-semibold">Soru</th>
                  <th className="px-5 py-3 font-semibold">Durum</th>
                  <th className="px-5 py-3 text-right font-semibold">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rows.map((row) => {
                  const category = asFaqCategory(row.category);
                  return (
                    <tr key={row.id} className="transition hover:bg-emerald-500/5">
                      <td className="px-5 py-4 text-slate-400">{row.sort_order}</td>
                      <td className="px-5 py-4">
                        {category ? (
                          <span className="mb-1.5 inline-flex rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-200">
                            {categoryLabels[category]}
                          </span>
                        ) : null}
                        <p className="font-medium text-white">{row.question}</p>
                        <p className="mt-1 line-clamp-2 max-w-xl text-slate-400">{row.answer}</p>
                        {row.question_en?.trim() ? (
                          <p className="mt-1 text-xs text-emerald-200/70">EN: {row.question_en}</p>
                        ) : null}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            row.is_active ? "bg-emerald-500/15 text-emerald-200" : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {row.is_active ? "Aktif" : "Pasif"}
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
        title={editor?.mode === "edit" ? "Soruyu düzenle" : "Yeni soru"}
        description="İngilizce alanlar boş kalırsa ziyaretçi Türkçe metni görür."
        onClose={() => {
          if (!saving) setEditor(null);
        }}
      >
        <form onSubmit={(event) => void save(event)} className="space-y-4">
          <BilingualGrid>
            <LanguageColumn title="Türkçe İçerik">
              <Field label="Soru" error={fieldErrors.question}>
                <input
                  data-autofocus
                  value={draft.question}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      question: event.target.value,
                    }))
                  }
                  className={inputClass}
                  placeholder="Teslim süresi ne kadar?"
                />
              </Field>
              <Field label="Cevap" error={fieldErrors.answer}>
                <textarea
                  value={draft.answer}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      answer: event.target.value,
                    }))
                  }
                  className={`${inputClass} min-h-32 resize-y`}
                  placeholder="Kısa ve net bir cevap yazın."
                />
              </Field>
            </LanguageColumn>
            <LanguageColumn title="İngilizce İçerik">
              <Field label="Soru" hint="Boş bırakılırsa Türkçe soru gösterilir.">
                <input
                  value={draft.question_en}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      question_en: event.target.value,
                    }))
                  }
                  className={inputClass}
                  placeholder="How long does delivery take?"
                />
              </Field>
              <Field label="Cevap" hint="Boş bırakılırsa Türkçe cevap gösterilir.">
                <textarea
                  value={draft.answer_en}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      answer_en: event.target.value,
                    }))
                  }
                  className={`${inputClass} min-h-32 resize-y`}
                  placeholder="Write a short, direct answer."
                />
              </Field>
            </LanguageColumn>
          </BilingualGrid>
          <Field
            label="Kategori"
            hint="Sitede soruların filtrelendiği sekme. Boş bırakılırsa yalnızca 'Tümü' sekmesinde görünür."
          >
            <select
              value={draft.category}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  category: event.target.value,
                }))
              }
              className={inputClass}
            >
              <option value="">Kategori yok</option>
              {faqCategories.map((key) => (
                <option key={key} value={key}>
                  {categoryLabels[key]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Sıralama" hint="Küçük sayı listede daha üstte durur." error={fieldErrors.sort_order}>
            <input
              type="number"
              min={0}
              step={1}
              value={draft.sort_order}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  sort_order: event.target.value,
                }))
              }
              className={inputClass}
            />
          </Field>
          <ToggleField
            label="Aktif"
            checked={draft.is_active}
            onChange={(is_active) => setDraft((current) => ({ ...current, is_active }))}
          />
          <ModalActions
            onCancel={() => setEditor(null)}
            saving={saving}
            submitLabel={editor?.mode === "edit" ? "Güncelle" : "Ekle"}
          />
        </form>
      </AdminModal>

      <AdminModal
        open={Boolean(pendingDelete)}
        title="Soruyu sil"
        description="Bu işlem geri alınamaz."
        onClose={() => {
          if (!deleting) setPendingDelete(null);
        }}
      >
        <p className="text-sm leading-6 text-slate-300">{pendingDelete?.question}</p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className={secondaryButtonClass}
            disabled={deleting}
            onClick={() => setPendingDelete(null)}
          >
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
