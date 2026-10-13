export type ProjectMetric = {
  value: string;
  label: string;
  labelEn: string;
};

export const MAX_METRICS = 4;
export const MAX_GALLERY = 8;

const turkishMap: Record<string, string> = {
  ç: "c",
  ğ: "g",
  ı: "i",
  İ: "i",
  ö: "o",
  ş: "s",
  ü: "u",
  â: "a",
  î: "i",
  û: "u",
};

export function slugify(value: string) {
  return value
    .replace(/[çğıİöşüâîû]/gi, (char) => turkishMap[char] ?? turkishMap[char.toLowerCase()] ?? char)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

export function isValidSlug(value: string) {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value);
}

export function commaList(value: string | null | undefined) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function lineList(value: string | null | undefined) {
  return (value ?? "")
    .split("\n")
    .map((item) => item.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}

function parseJson(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function parseMetrics(value: unknown): ProjectMetric[] {
  const parsed = parseJson(value);
  if (!Array.isArray(parsed)) return [];
  return parsed
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      return { value: text(record.value), label: text(record.label), labelEn: text(record.label_en) };
    })
    .filter((item): item is ProjectMetric => Boolean(item && item.value && item.label))
    .slice(0, MAX_METRICS);
}

export function serializeMetrics(metrics: ProjectMetric[]) {
  return metrics
    .map((item) => ({ value: item.value.trim(), label: item.label.trim(), label_en: item.labelEn.trim() }))
    .filter((item) => item.value && item.label)
    .slice(0, MAX_METRICS);
}

export function parseGallery(value: unknown): string[] {
  const parsed = parseJson(value);
  if (!Array.isArray(parsed)) return [];
  return parsed.map(text).filter(Boolean).slice(0, MAX_GALLERY);
}

export function referenceHref(slug: string) {
  return `/referanslar/${encodeURIComponent(slug)}`;
}

export function displayHost(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return "";
  }
}
