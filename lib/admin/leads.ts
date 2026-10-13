import { formatTry } from "@/lib/admin/format";

export type LeadStatus = "pending" | "accepted" | "rejected";

export type LeadView = {
  id: string;
  adSoyad: string;
  firmaAdi: string;
  email: string;
  telefon: string;
  paket: string;
  projeNotu: string;
  sektor: string;
  adres: string;
  aiEmail: string;
  projectType: string;
  domainStatus: string;
  budgetRange: string;
  addons: string;
  estimatedTotal: string;
  status: LeadStatus;
};

const EMPTY = "—";

function money(value: unknown) {
  const number = typeof value === "number" ? value : Number(text(value));
  if (!text(value) || !Number.isFinite(number) || number <= 0) return EMPTY;
  return formatTry(number);
}

function text(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function first(row: Record<string, unknown>, keys: string[]) {
  const lowered = new Map(Object.entries(row).map(([key, value]) => [key.toLowerCase(), value]));
  for (const key of keys) {
    const value = text(row[key] ?? lowered.get(key.toLowerCase()));
    if (value) return value;
  }
  return EMPTY;
}

export function leadStatus(value: unknown): LeadStatus {
  const normalized = text(value).toLowerCase();
  if (normalized === "accepted" || normalized === "kabul" || normalized === "approved") return "accepted";
  if (normalized === "rejected" || normalized === "reddedildi" || normalized === "red" || normalized === "declined") {
    return "rejected";
  }
  return "pending";
}

export function leadStatusLabel(status: LeadStatus) {
  if (status === "accepted") return "Kabul Edildi";
  if (status === "rejected") return "Reddedildi";
  return "Bekliyor";
}

export function normalizeLead(row: Record<string, unknown>, index: number): LeadView {
  const id = text(row.id) || `lead-${index}`;
  return {
    id,
    adSoyad: first(row, ["ad_soyad", "adsoyad", "full_name", "name", "contact_name"]),
    firmaAdi: first(row, ["firma_adi", "firma", "company_name", "business_name", "business", "company"]),
    email: first(row, ["email", "e_posta", "eposta", "mail"]),
    telefon: first(row, ["telefon", "phone", "phone_number", "tel", "gsm"]),
    paket: first(row, ["paket", "package", "selected_package", "paket_adi"]),
    projeNotu: first(row, ["proje_notu", "proje_hakkinda", "notes", "note", "message"]),
    sektor: first(row, ["sektor", "sector", "industry"]),
    adres: first(row, ["adres", "address", "lokasyon", "location"]),
    aiEmail: first(row, ["ai_email", "ai_metin"]),
    projectType: first(row, ["project_type", "proje_tipi", "solution_type"]),
    domainStatus: first(row, ["domain_status", "alan_adi", "alan_adi_durumu"]),
    budgetRange: first(row, ["budget_range", "butce", "butce_araligi", "budget"]),
    addons: first(row, ["addons", "ek_hizmetler"]),
    estimatedTotal: money(row.estimated_total ?? row.tahmini_tutar),
    status: leadStatus(row.status ?? row.durum),
  };
}

export function leadPackage(lead: LeadView) {
  if (lead.paket !== EMPTY) return lead.paket;
  if (lead.projectType !== EMPTY) return lead.projectType;
  return lead.sektor;
}

export function leadNote(lead: LeadView) {
  return lead.projeNotu !== EMPTY ? lead.projeNotu : lead.aiEmail;
}

export function leadHasContent(lead: LeadView) {
  return [
    lead.adSoyad,
    lead.firmaAdi,
    lead.email,
    lead.telefon,
    lead.paket,
    lead.projeNotu,
    lead.sektor,
    lead.adres,
    lead.aiEmail,
    lead.projectType,
    lead.domainStatus,
    lead.budgetRange,
    lead.addons,
  ].some((value) => value !== EMPTY);
}
