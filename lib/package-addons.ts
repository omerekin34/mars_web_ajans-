export type PackageAddon = {
  title: string;
  titleEn: string;
  price: number;
};

export type PackageAddonRecord = {
  title: string;
  title_en: string | null;
  price: number;
};

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

export function parseAddons(value: unknown): PackageAddon[] {
  const list = typeof value === "string" ? parseJson(value) : value;
  if (!Array.isArray(list)) return [];
  return list.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    const title = typeof record.title === "string" ? record.title.trim() : "";
    const price = typeof record.price === "number" ? record.price : Number(record.price);
    if (!title || !Number.isFinite(price) || price < 0) return [];
    const titleEn = typeof record.title_en === "string" ? record.title_en.trim() : "";
    return [{ title, titleEn, price }];
  });
}

export function toAddonRecords(addons: PackageAddon[]): PackageAddonRecord[] {
  return addons.map((addon) => ({
    title: addon.title,
    title_en: addon.titleEn || null,
    price: addon.price,
  }));
}

export function discountPercent(price: number, oldPrice: number | null) {
  if (!oldPrice || oldPrice <= price || price <= 0) return 0;
  return Math.round((1 - price / oldPrice) * 100);
}
