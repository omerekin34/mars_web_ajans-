export const emptyMark = "—";

export function formatTry(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}

export function asNumber(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function asFeatures(value: unknown): string[] {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      return asFeatures(JSON.parse(trimmed) as unknown);
    } catch {
      return trimmed
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
    }
  }
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .map((item) => item.trim());
}

export function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function textLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function isHttpUrl(value: string) {
  if (!value.trim()) return true;
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function friendlyError(message: string) {
  if (/column/i.test(message) && /schema cache|does not exist|could not find/i.test(message)) {
    return "Eksik sütun var. Referanslar için Supabase SQL Editor'da projects-detail-pages.sql dosyasını çalıştırın. Diğer eksik sütunlar için alter-tables.sql veya leads.sql yeterlidir.";
  }
  if (/could not find the table|schema cache|does not exist/i.test(message)) {
    return "Tablo bulunamadı. database-schema.sql dosyasını Supabase SQL Editor'da çalıştırın. Yalnızca müşteri yorumları için testimonials.sql yeterlidir.";
  }
  if (/row-level security|permission denied|42501/i.test(message)) {
    return "Bu işlem için yetki yok. SQL dosyasındaki erişim politikalarının çalıştığından emin olun.";
  }
  if (/invalid api key|failed to fetch|fetch failed|network/i.test(message)) {
    return "Supabase bağlantısı kurulamadı. URL ve anon anahtarını kontrol edin.";
  }
  return message;
}
