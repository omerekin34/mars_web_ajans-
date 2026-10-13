"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { translations, type Dictionary, type Locale } from "@/lib/translations";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [locale, setLocale] = useState<Locale>("tr");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("mars-locale");
    if (saved === "tr" || saved === "en") {
      setLocale(saved);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const copy = translations[locale];
    const onQuote = pathname === "/teklif-al";
    document.documentElement.lang = locale;
    window.localStorage.setItem("mars-locale", locale);
    if (pathname === "/referanslar") document.title = copy.reference.listMetaTitle;
    if (pathname !== "/" && !onQuote) return;
    document.title = onQuote ? copy.quote.metaTitle : copy.meta.title;
    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.setAttribute("content", onQuote ? copy.quote.metaDescription : copy.meta.description);
    }
  }, [hydrated, locale, pathname]);

  const value = useMemo(
    () => ({ locale, setLocale, t: translations[locale] }),
    [locale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useI18n must be used within LanguageProvider");
  }
  return context;
}
