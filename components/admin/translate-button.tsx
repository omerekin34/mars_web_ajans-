"use client";

import { Languages, Loader2 } from "lucide-react";
import { useAdminToast } from "@/components/admin/toast-provider";
import { useAutoTranslate, type TranslateField } from "@/components/admin/use-auto-translate";

type TranslateButtonProps<T extends object> = {
  draft: T;
  fields: TranslateField<T>[];
  onApply: (patch: Partial<T>) => void;
  onlyEmpty?: boolean;
  label?: string;
};

export function TranslateButton<T extends object>({
  draft,
  fields,
  onApply,
  onlyEmpty = false,
  label = "Otomatik Çevir",
}: TranslateButtonProps<T>) {
  const toast = useAdminToast();
  const { translating, translateDraft } = useAutoTranslate();

  const handleClick = async () => {
    try {
      const count = await translateDraft(draft, fields, onApply, { onlyEmpty });
      if (count === 0) {
        toast.notify(
          onlyEmpty ? "Boş İngilizce alanların dolu Türkçe karşılığı yok." : "Çevrilecek dolu Türkçe alan yok.",
          "error",
        );
      } else {
        toast.notify(`${count} alan İngilizceye çevrildi.`, "success");
      }
    } catch (error) {
      toast.notify(error instanceof Error ? error.message : "Çeviri başarısız.", "error");
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      disabled={translating}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-violet-400/30 bg-violet-500/10 px-2.5 py-1.5 text-[11px] font-semibold tracking-wide text-violet-100 normal-case transition hover:border-violet-300/60 hover:bg-violet-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {translating ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
      ) : (
        <Languages className="h-3.5 w-3.5" aria-hidden />
      )}
      {translating ? "Çevriliyor" : label}
    </button>
  );
}
