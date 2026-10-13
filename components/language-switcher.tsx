"use client";

import { useI18n } from "@/components/language-provider";
import type { Locale } from "@/lib/translations";

const locales: Locale[] = ["tr", "en"];

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      className="flex items-center rounded-full border border-white/10 bg-white/5 p-1"
      role="group"
      aria-label={t.nav.language}
    >
      {locales.map((code) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            aria-pressed={active}
            className={`rounded-full px-3 py-1 text-xs font-semibold tracking-[0.14em] transition ${
              active ? "bg-white text-slate-950" : "text-slate-400 hover:text-white"
            }`}
          >
            {code.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
