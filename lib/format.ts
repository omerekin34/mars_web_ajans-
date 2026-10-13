import type { Locale } from "@/lib/translations";

const intlLocale = (locale: Locale) => (locale === "tr" ? "tr-TR" : "en-US");

export function formatTry(value: number, locale: Locale) {
  const formatted = new Intl.NumberFormat(intlLocale(locale), {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
  return locale === "tr" ? `${formatted} ₺` : `₺${formatted}`;
}

export function formatNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(intlLocale(locale), {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

export function formatRatio(value: number, locale: Locale) {
  const digits = value >= 10 ? 0 : 1;
  return new Intl.NumberFormat(intlLocale(locale), {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function fill(template: string, vars: Record<string, string>) {
  return Object.entries(vars).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, value),
    template,
  );
}

export function slotsText(count: number, texts: { many: string; one: string; full: string }) {
  if (count <= 0) return texts.full;
  return fill(count === 1 ? texts.one : texts.many, { count: String(count) });
}

export function lossTone(percent: number) {
  if (percent > 66) {
    return "text-rose-500 drop-shadow-[0_0_18px_rgba(244,63,94,0.45)]";
  }
  if (percent > 33) {
    return "text-rose-400";
  }
  return "text-rose-300";
}

export function clampPercent(value: number, min: number, max: number) {
  if (max === min) return 0;
  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
}
