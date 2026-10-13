export const faqCategories = ["pricing", "process", "technical", "support"] as const;

export type FaqCategory = (typeof faqCategories)[number];

export function asFaqCategory(value: unknown): FaqCategory | null {
  return typeof value === "string" && (faqCategories as readonly string[]).includes(value)
    ? (value as FaqCategory)
    : null;
}
