import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { asFeatures, asNumber } from "@/lib/admin/format";
import { asFaqCategory, type FaqCategory } from "@/lib/faq";
import { parseAddons, type PackageAddon } from "@/lib/package-addons";
import { commaList, lineList, parseGallery, parseMetrics, type ProjectMetric } from "@/lib/projects";
import { site } from "@/lib/site";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type PublicFaq = {
  id: string;
  question: string;
  answer: string;
  questionEn: string;
  answerEn: string;
  category: FaqCategory | null;
};

export type PublicPackage = {
  id: string;
  title: string;
  titleEn: string;
  tagline: string;
  taglineEn: string;
  price: number;
  oldPrice: number | null;
  priceNote: string;
  priceNoteEn: string;
  delivery: string;
  deliveryEn: string;
  badge: string;
  badgeEn: string;
  ctaLabel: string;
  ctaLabelEn: string;
  features: string[];
  featuresEn: string[];
  addons: PackageAddon[];
  isPopular: boolean;
};

export type PublicTestimonial = {
  id: string;
  name: string;
  title: string;
  titleEn: string;
  review: string;
  reviewEn: string;
  rating: number;
  isVerified: boolean;
};

export type PublicProject = {
  id: string;
  slug: string;
  clientName: string;
  clientNameEn: string;
  sector: string;
  sectorEn: string;
  summary: string;
  summaryEn: string;
  services: string[];
  servicesEn: string[];
  year: string;
  duration: string;
  durationEn: string;
  clientProblem: string;
  clientProblemEn: string;
  ourSolution: string;
  ourSolutionEn: string;
  metrics: ProjectMetric[];
  features: string[];
  featuresEn: string[];
  techFrontend: string;
  techBackend: string;
  techAdmin: string;
  quote: string;
  quoteEn: string;
  quoteAuthor: string;
  quoteAuthorEn: string;
  imageUrl: string;
  coverUrl: string;
  gallery: string[];
  websiteUrl: string;
  isFeatured: boolean;
};

export type SiteSettings = {
  phone: string;
  phoneHref: string;
  email: string;
  address: string;
  addressEn: string;
  footerText: string;
  footerTextEn: string;
  footerLogoUrl: string;
  whatsappDigits: string;
  projectSlots: number;
  social: {
    instagram: string;
    linkedin: string;
    x: string;
  };
};

export type HomeContent = {
  faqs: PublicFaq[];
  packages: PublicPackage[];
  projects: PublicProject[];
  testimonials: PublicTestimonial[];
};

type SettingRecord = {
  setting_key: string;
  value: string | null;
  address_en?: string | null;
  footer_text_en?: string | null;
  footer_logo_url?: string | null;
  instagram_url?: string | null;
  linkedin_url?: string | null;
  x_url?: string | null;
};

function trimOrEmpty(value: string | null | undefined) {
  return (value ?? "").trim();
}

function missingColumn(message: string | undefined) {
  return Boolean(message && /column|schema cache/i.test(message));
}

function clampRating(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(number)) return 5;
  return Math.min(5, Math.max(1, number));
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

const defaultProjectSlots = 2;

function projectSlots(value: string | undefined) {
  const number = Number((value ?? "").trim());
  if (!value?.trim() || !Number.isInteger(number) || number < 0) return defaultProjectSlots;
  return number;
}

function httpUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return url.href;
  } catch {
    return "";
  }
}

export const fallbackSiteSettings: SiteSettings = {
  phone: site.phoneDisplay,
  phoneHref: site.phoneHref,
  email: site.email,
  address: site.address.tr,
  addressEn: site.address.en,
  footerText: "",
  footerTextEn: "",
  footerLogoUrl: "",
  whatsappDigits: site.whatsapp,
  projectSlots: defaultProjectSlots,
  social: {
    instagram: site.social.instagram,
    linkedin: site.social.linkedin,
    x: site.social.x,
  },
};

function normalizeSettings(rows: SettingRecord[], useFooterColumns: boolean): SiteSettings {
  const map = new Map(rows.map((row) => [row.setting_key, (row.value ?? "").trim()]));
  const phone = map.get("phone") ?? "";
  const phoneDigits = digitsOnly(phone);
  const whatsappDigits = digitsOnly(map.get("whatsapp") ?? "") || phoneDigits;
  const addressRow = rows.find((row) => row.setting_key === "address");
  const footerTextRow = rows.find((row) => row.setting_key === "footer_text");
  const footerRow = rows.find((row) => row.setting_key === "footer");

  return {
    phone,
    phoneHref: phoneDigits ? `tel:+${phoneDigits}` : "",
    email: map.get("email") ?? "",
    address: map.get("address") ?? "",
    addressEn: trimOrEmpty(addressRow?.address_en),
    footerText: trimOrEmpty(map.get("footer_text")),
    footerTextEn: trimOrEmpty(footerTextRow?.footer_text_en),
    footerLogoUrl: useFooterColumns ? httpUrl(footerRow?.footer_logo_url ?? "") : "",
    whatsappDigits,
    projectSlots: projectSlots(map.get("project_slots")),
    social: useFooterColumns
      ? {
          instagram: httpUrl(footerRow?.instagram_url ?? ""),
          linkedin: httpUrl(footerRow?.linkedin_url ?? ""),
          x: httpUrl(footerRow?.x_url ?? ""),
        }
      : {
          instagram: httpUrl(map.get("instagram") ?? "") || site.social.instagram,
          linkedin: httpUrl(map.get("linkedin") ?? "") || site.social.linkedin,
          x: httpUrl(map.get("x") ?? "") || site.social.x,
        },
  };
}

const emptyHome: HomeContent = {
  faqs: [],
  packages: [],
  projects: [],
  testimonials: [],
};

export type LegalDocumentKey = "kvkk" | "privacy" | "cookie";

export type LegalDocument = {
  tr: string;
  en: string;
};

type LegalRow = {
  kvkk_text: string | null;
  kvkk_text_en: string | null;
  privacy_text: string | null;
  privacy_text_en: string | null;
  cookie_text: string | null;
  cookie_text_en: string | null;
};

const legalFields: Record<LegalDocumentKey, { tr: keyof LegalRow; en: keyof LegalRow }> = {
  kvkk: { tr: "kvkk_text", en: "kvkk_text_en" },
  privacy: { tr: "privacy_text", en: "privacy_text_en" },
  cookie: { tr: "cookie_text", en: "cookie_text_en" },
};

export async function getLegalDocument(key: LegalDocumentKey): Promise<LegalDocument> {
  const empty = { tr: "", en: "" };
  const supabase = createSupabaseServerClient();
  if (!supabase) return empty;

  const query = await supabase
    .from("site_settings")
    .select("kvkk_text, kvkk_text_en, privacy_text, privacy_text_en, cookie_text, cookie_text_en")
    .eq("setting_key", "footer")
    .maybeSingle();

  if (query.error || !query.data) return empty;

  const row = query.data as LegalRow;
  const fields = legalFields[key];
  return {
    tr: trimOrEmpty(row[fields.tr]),
    en: trimOrEmpty(row[fields.en]),
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return fallbackSiteSettings;

  const enriched = await supabase
    .from("site_settings")
    .select("setting_key, value, address_en, footer_text_en, footer_logo_url, instagram_url, linkedin_url, x_url");
  if (!enriched.error && enriched.data) return normalizeSettings(enriched.data as SettingRecord[], true);
  if (!missingColumn(enriched.error?.message)) return fallbackSiteSettings;

  const bilingual = await supabase.from("site_settings").select("setting_key, value, address_en, footer_text_en");
  if (!bilingual.error && bilingual.data) return normalizeSettings(bilingual.data as SettingRecord[], false);
  if (!missingColumn(bilingual.error?.message)) return fallbackSiteSettings;

  const plain = await supabase.from("site_settings").select("setting_key, value");
  if (plain.error || !plain.data) return fallbackSiteSettings;
  return normalizeSettings(plain.data as SettingRecord[], false);
}

type PackageRecord = {
  id: string;
  title: string;
  title_en?: string | null;
  tagline?: string | null;
  tagline_en?: string | null;
  price: number | string;
  old_price?: number | string | null;
  price_note?: string | null;
  price_note_en?: string | null;
  delivery_time?: string | null;
  delivery_time_en?: string | null;
  badge?: string | null;
  badge_en?: string | null;
  cta_label?: string | null;
  cta_label_en?: string | null;
  features: unknown;
  features_en?: unknown;
  addons?: unknown;
  is_popular: boolean;
  is_active?: boolean | null;
};

function fetchFaqs(supabase: SupabaseClient) {
  return supabase
    .from("faqs")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
}

async function fetchPackages(supabase: SupabaseClient) {
  const ordered = await supabase
    .from("packages")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (!ordered.error || !missingColumn(ordered.error.message)) return ordered;

  return supabase
    .from("packages")
    .select("*")
    .order("is_popular", { ascending: false })
    .order("created_at", { ascending: true });
}

function toPublicPackage(row: PackageRecord): PublicPackage {
  const price = asNumber(row.price);
  const oldPrice = row.old_price === null || row.old_price === undefined ? 0 : asNumber(row.old_price);
  return {
    id: row.id,
    title: row.title.trim(),
    titleEn: trimOrEmpty(row.title_en),
    tagline: trimOrEmpty(row.tagline),
    taglineEn: trimOrEmpty(row.tagline_en),
    price,
    oldPrice: oldPrice > price ? oldPrice : null,
    priceNote: trimOrEmpty(row.price_note),
    priceNoteEn: trimOrEmpty(row.price_note_en),
    delivery: trimOrEmpty(row.delivery_time),
    deliveryEn: trimOrEmpty(row.delivery_time_en),
    badge: trimOrEmpty(row.badge),
    badgeEn: trimOrEmpty(row.badge_en),
    ctaLabel: trimOrEmpty(row.cta_label),
    ctaLabelEn: trimOrEmpty(row.cta_label_en),
    features: asFeatures(row.features),
    featuresEn: asFeatures(row.features_en),
    addons: parseAddons(row.addons),
    isPopular: Boolean(row.is_popular),
  };
}

type ProjectRecord = {
  id: string;
  slug?: string | null;
  client_name: string;
  client_name_en?: string | null;
  sector: string;
  industry_en?: string | null;
  summary?: string | null;
  summary_en?: string | null;
  services?: string | null;
  services_en?: string | null;
  project_year?: string | null;
  duration?: string | null;
  duration_en?: string | null;
  client_problem?: string | null;
  client_problem_en?: string | null;
  our_solution?: string | null;
  our_solution_en?: string | null;
  metrics?: unknown;
  features?: string | null;
  features_en?: string | null;
  tech_frontend?: string | null;
  tech_backend?: string | null;
  tech_admin?: string | null;
  client_quote?: string | null;
  client_quote_en?: string | null;
  quote_author?: string | null;
  quote_author_en?: string | null;
  image_url: string | null;
  cover_url?: string | null;
  gallery?: unknown;
  website_url: string | null;
  is_published?: boolean | null;
  is_featured?: boolean | null;
};

async function fetchProjects(supabase: SupabaseClient) {
  const ordered = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (!ordered.error || !missingColumn(ordered.error.message)) return ordered;

  return supabase.from("projects").select("*").order("created_at", { ascending: false });
}

function toPublicProject(row: ProjectRecord): PublicProject {
  const httpUrls = (urls: string[]) => urls.map(httpUrl).filter(Boolean);
  return {
    id: row.id,
    slug: trimOrEmpty(row.slug) || row.id,
    clientName: row.client_name.trim(),
    clientNameEn: trimOrEmpty(row.client_name_en),
    sector: row.sector.trim(),
    sectorEn: trimOrEmpty(row.industry_en),
    summary: trimOrEmpty(row.summary),
    summaryEn: trimOrEmpty(row.summary_en),
    services: commaList(row.services),
    servicesEn: commaList(row.services_en),
    year: trimOrEmpty(row.project_year),
    duration: trimOrEmpty(row.duration),
    durationEn: trimOrEmpty(row.duration_en),
    clientProblem: trimOrEmpty(row.client_problem),
    clientProblemEn: trimOrEmpty(row.client_problem_en),
    ourSolution: trimOrEmpty(row.our_solution),
    ourSolutionEn: trimOrEmpty(row.our_solution_en),
    metrics: parseMetrics(row.metrics),
    features: lineList(row.features),
    featuresEn: lineList(row.features_en),
    techFrontend: trimOrEmpty(row.tech_frontend),
    techBackend: trimOrEmpty(row.tech_backend),
    techAdmin: trimOrEmpty(row.tech_admin),
    quote: trimOrEmpty(row.client_quote),
    quoteEn: trimOrEmpty(row.client_quote_en),
    quoteAuthor: trimOrEmpty(row.quote_author),
    quoteAuthorEn: trimOrEmpty(row.quote_author_en),
    imageUrl: httpUrl(row.image_url ?? ""),
    coverUrl: httpUrl(row.cover_url ?? ""),
    gallery: httpUrls(parseGallery(row.gallery)),
    websiteUrl: httpUrl(row.website_url ?? ""),
    isFeatured: Boolean(row.is_featured),
  };
}

function toPublicProjects(rows: ProjectRecord[]) {
  return rows.filter((row) => row.client_name.trim() && row.is_published !== false).map(toPublicProject);
}

export async function getProjects(): Promise<PublicProject[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];
  const query = await fetchProjects(supabase);
  if (query.error) return [];
  return toPublicProjects((query.data ?? []) as ProjectRecord[]);
}

export const getProjectDetail = cache(async (slug: string) => {
  const projects = await getProjects();
  const index = projects.findIndex((project) => project.slug === slug || project.id === slug);
  if (index === -1) return null;
  const project = projects[index];
  const others = projects.filter((item) => item.id !== project.id);
  const sameSector = others.filter((item) => item.sector === project.sector);
  const related = [...sameSector, ...others.filter((item) => item.sector !== project.sector)].slice(0, 3);
  return {
    project,
    previous: projects.length > 1 ? projects[(index - 1 + projects.length) % projects.length] : null,
    next: projects.length > 1 ? projects[(index + 1) % projects.length] : null,
    related,
  };
});

export async function getHomeContent(): Promise<HomeContent> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return emptyHome;

  const [faqsQuery, packagesQuery, projectsResult, testimonialsResult] = await Promise.all([
    fetchFaqs(supabase),
    fetchPackages(supabase),
    fetchProjects(supabase),
    supabase
      .from("testimonials")
      .select("id, name, title, title_en, review, review_en, rating, is_verified")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);

  const faqs: PublicFaq[] = faqsQuery.error
    ? []
    : ((faqsQuery.data ?? []) as {
        id: string;
        question: string;
        answer: string;
        question_en?: string | null;
        answer_en?: string | null;
        category?: string | null;
      }[])
        .filter((row) => row.question.trim() && row.answer.trim())
        .map((row) => ({
          id: row.id,
          question: row.question.trim(),
          answer: row.answer.trim(),
          questionEn: trimOrEmpty(row.question_en),
          answerEn: trimOrEmpty(row.answer_en),
          category: asFaqCategory(row.category),
        }));

  const packages: PublicPackage[] = packagesQuery.error
    ? []
    : ((packagesQuery.data ?? []) as PackageRecord[])
        .filter((row) => row.title.trim() && row.is_active !== false)
        .map(toPublicPackage);

  const projects: PublicProject[] = projectsResult.error
    ? []
    : toPublicProjects((projectsResult.data ?? []) as ProjectRecord[]);

  const testimonials: PublicTestimonial[] = testimonialsResult.error
    ? []
    : ((testimonialsResult.data ?? []) as {
        id: string;
        name: string;
        title: string;
        title_en?: string | null;
        review: string;
        review_en?: string | null;
        rating: number | null;
        is_verified: boolean | null;
      }[])
        .filter((row) => row.name.trim() && row.review.trim())
        .map((row) => ({
          id: row.id,
          name: row.name.trim(),
          title: row.title.trim(),
          titleEn: trimOrEmpty(row.title_en),
          review: row.review.trim(),
          reviewEn: trimOrEmpty(row.review_en),
          rating: clampRating(row.rating),
          isVerified: Boolean(row.is_verified),
        }));

  return { faqs, packages, projects, testimonials };
}
