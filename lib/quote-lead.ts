import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type QuoteLeadInput = {
  projectType: string;
  domainStatus: string;
  budgetRange: string;
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
};

function missingColumn(message: string) {
  return /column/i.test(message) && /schema cache|does not exist|could not find/i.test(message);
}

export async function submitQuoteLead(input: QuoteLeadInput) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { ok: false as const, reason: "config" as const };
  }

  const row = {
    ad_soyad: input.fullName,
    firma_adi: input.companyName,
    email: input.email,
    telefon: input.phone,
    project_type: input.projectType,
    domain_status: input.domainStatus,
    budget_range: input.budgetRange,
    status: "pending",
  };

  const inserted = await supabase.from("leads").insert(row);
  if (!inserted.error) return { ok: true as const };

  if (missingColumn(inserted.error.message)) {
    return { ok: false as const, reason: "schema" as const };
  }

  console.warn(inserted.error.message);
  return { ok: false as const, reason: "save" as const };
}
