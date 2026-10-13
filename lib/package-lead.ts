import { formatTry } from "@/lib/format";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type PackageLeadInput = {
  name: string;
  company: string;
  phone: string;
  email: string;
  notes: string;
  packageLabel: string;
  addons: string[];
  estimatedTotal: number;
};

function extrasSummary(input: PackageLeadInput) {
  if (input.addons.length === 0) return "";
  return [`Ek hizmetler: ${input.addons.join(", ")}`, `Tahmini toplam: ${formatTry(input.estimatedTotal, "tr")}`].join("\n");
}

function brief(input: PackageLeadInput) {
  return [
    `Ad Soyad: ${input.name}`,
    `Firma: ${input.company}`,
    `Telefon: ${input.phone}`,
    `E-posta: ${input.email}`,
    `Paket: ${input.packageLabel}`,
    extrasSummary(input),
    input.notes ? `Proje: ${input.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function missingColumn(message: string) {
  return /column/i.test(message) && /schema cache|does not exist|could not find/i.test(message);
}

export async function submitPackageLead(input: PackageLeadInput) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { ok: false as const, reason: "config" as const };
  }

  const notes = input.notes.trim();
  const base = {
    ad_soyad: input.name,
    firma_adi: input.company,
    telefon: input.phone,
    email: input.email,
    paket: input.packageLabel,
    sektor: input.packageLabel,
  };

  const inserted = await supabase.from("leads").insert({
    ...base,
    proje_notu: notes || null,
    addons: input.addons.length > 0 ? input.addons.join(", ") : null,
    estimated_total: input.estimatedTotal,
  });
  if (!inserted.error) return { ok: true as const };
  if (!missingColumn(inserted.error.message)) {
    console.error(inserted.error.message);
    return { ok: false as const, reason: "save" as const };
  }

  const combinedNotes = [notes, extrasSummary(input)].filter(Boolean).join("\n\n");
  const withoutExtras = await supabase.from("leads").insert({ ...base, proje_notu: combinedNotes || null });
  if (!withoutExtras.error) return { ok: true as const };

  if (missingColumn(withoutExtras.error.message)) {
    const legacy = await supabase.from("leads").insert({
      firma_adi: input.company,
      sektor: input.packageLabel,
      adres: input.name,
      telefon: input.phone,
      ai_email: brief(input),
    });
    if (!legacy.error) return { ok: true as const };
    console.error(legacy.error.message);
    return { ok: false as const, reason: "save" as const };
  }

  console.error(withoutExtras.error.message);
  return { ok: false as const, reason: "save" as const };
}
