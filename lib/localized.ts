import type { Locale } from "@/lib/translations";

export function localizedText(locale: Locale, tr: string, en?: string | null) {
  const english = typeof en === "string" ? en.trim() : "";
  if (locale === "en" && english) return english;
  return tr;
}

export function localizedList(locale: Locale, tr: string[], en?: string[] | null) {
  const english = (en ?? []).map((item) => item.trim()).filter(Boolean);
  if (locale === "en" && english.length > 0) return english;
  return tr;
}
