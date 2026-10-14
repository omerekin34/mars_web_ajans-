"use client";

import { useCallback, useState } from "react";

type FieldPair<T> = {
  source: keyof T & string;
  target: keyof T & string;
};

type CustomField<T> = {
  get: (draft: T) => string;
  set: (draft: T, translated: string) => Partial<T>;
  hasContent?: (draft: T) => boolean;
};

export type TranslateField<T> = FieldPair<T> | CustomField<T>;

export function useAutoTranslate() {
  const [translating, setTranslating] = useState(false);

  const translateDraft = useCallback(
    async <T extends object>(
      draft: T,
      fields: TranslateField<T>[],
      onApply: (patch: Partial<T>) => void,
      options?: { onlyEmpty?: boolean },
    ): Promise<number> => {
      const onlyEmpty = options?.onlyEmpty ?? false;
      const jobs = fields
        .map((field) => {
          if ("source" in field) {
            return {
              text: String(draft[field.source] ?? ""),
              filled: Boolean(String(draft[field.target] ?? "").trim()),
              apply: (patch: Partial<T>, value: string) => {
                (patch as Record<string, unknown>)[field.target] = value;
              },
            };
          }
          return {
            text: field.get(draft),
            filled: field.hasContent ? field.hasContent(draft) : false,
            apply: (patch: Partial<T>, value: string) => {
              Object.assign(patch, field.set(draft, value));
            },
          };
        })
        .filter((job) => job.text.trim().length > 0 && !(onlyEmpty && job.filled));

      if (jobs.length === 0) return 0;

      setTranslating(true);
      try {
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texts: jobs.map((job) => job.text) }),
        });
        const data = (await response.json().catch(() => null)) as {
          translations?: unknown;
          error?: unknown;
        } | null;
        if (!response.ok || !Array.isArray(data?.translations)) {
          throw new Error(typeof data?.error === "string" ? data.error : "Çeviri servisi yanıt vermedi.");
        }

        const patch: Partial<T> = {};
        let applied = 0;
        jobs.forEach((job, index) => {
          const value = String((data.translations as unknown[])[index] ?? "").trim();
          if (value) {
            job.apply(patch, value);
            applied += 1;
          }
        });
        if (applied > 0) onApply(patch);
        return applied;
      } finally {
        setTranslating(false);
      }
    },
    [],
  );

  return { translating, translateDraft };
}
