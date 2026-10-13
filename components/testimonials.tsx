"use client";

import type { MouseEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, Quote, Star, TrendingUp } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { useI18n } from "@/components/language-provider";
import { localizedText } from "@/lib/localized";
import type { PublicTestimonial } from "@/lib/public-content";

const listVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.06 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const METRIC_PATTERN = /(%\s?\d+(?:[.,]\d+)?|\d+(?:[.,]\d+)?\s?%)/g;

const AVATAR_GRADIENTS = [
  "from-cyan-400 to-violet-500",
  "from-emerald-400 to-cyan-500",
  "from-violet-400 to-fuchsia-500",
  "from-amber-300 to-rose-500",
  "from-sky-400 to-indigo-500",
];

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "•";
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : (parts[0]?.[1] ?? "");
  return `${first}${second}`.toLocaleUpperCase("tr-TR");
}

function gradientForName(name: string) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

function firstMetric(text: string) {
  return text.match(METRIC_PATTERN)?.[0]?.replace(/\s/g, "") ?? null;
}

function HighlightedReview({ text }: { text: string }) {
  return text.split(METRIC_PATTERN).map((part, index) =>
    index % 2 === 1 ? (
      <span key={index} className="font-semibold text-cyan-300 not-italic">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

function trackSpotlight(event: MouseEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--x", `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty("--y", `${event.clientY - rect.top}px`);
}

function Stars({ rating, label, size = "h-4 w-4" }: { rating: number; label: string; size?: string }) {
  return (
    <div className="flex gap-1" role="img" aria-label={label}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={
            index < rating
              ? `${size} fill-yellow-500 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.55)]`
              : `${size} text-slate-600`
          }
          aria-hidden
        />
      ))}
    </div>
  );
}

export function Testimonials({ items }: { items: PublicTestimonial[] }) {
  const { locale, t } = useI18n();
  const reduce = useReducedMotion();

  const average = items.length > 0 ? items.reduce((sum, item) => sum + item.rating, 0) / items.length : 0;
  const averageLabel = average.toLocaleString(locale === "tr" ? "tr-TR" : "en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const verifiedCount = items.filter((item) => item.isVerified).length;
  const restCount = items.length - 1;

  return (
    <section id="testimonials" className="relative px-6 py-24 md:py-32" aria-labelledby="testimonials-title">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/3 -z-10 mx-auto h-[420px] max-w-4xl rounded-full bg-violet-600/10 blur-[120px]"
      />
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeading
            eyebrow={t.testimonials.eyebrow}
            title={t.testimonials.title}
            lead={t.testimonials.lead}
            titleId="testimonials-title"
          />
        </Reveal>

        {items.length === 0 ? (
          <p className="mt-12 text-center text-sm text-slate-500">{t.testimonials.empty}</p>
        ) : (
          <>
            <Reveal>
              <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-x-8 gap-y-4 rounded-2xl border border-slate-800 bg-slate-900/40 px-6 py-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <p className="text-3xl font-semibold tracking-tight text-white">{averageLabel}</p>
                  <div>
                    <Stars rating={Math.round(average)} label={t.testimonials.summaryRating} size="h-3.5 w-3.5" />
                    <p className="mt-1 text-xs text-slate-500">{t.testimonials.summaryRating}</p>
                  </div>
                </div>
                <span aria-hidden className="hidden h-10 w-px bg-slate-800 sm:block" />
                <div className="text-center">
                  <p className="text-2xl font-semibold text-white">{items.length}</p>
                  <p className="text-xs text-slate-500">{t.testimonials.summaryReviews}</p>
                </div>
                <span aria-hidden className="hidden h-10 w-px bg-slate-800 sm:block" />
                <div className="text-center">
                  <p className="flex items-center justify-center gap-1.5 text-2xl font-semibold text-white">
                    <BadgeCheck className="h-5 w-5 text-sky-400" aria-hidden />
                    {verifiedCount}
                  </p>
                  <p className="text-xs text-slate-500">{t.testimonials.summaryVerified}</p>
                </div>
              </div>
            </Reveal>

            <motion.ul
              className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-flow-dense lg:grid-cols-3"
              initial={reduce ? false : "hidden"}
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              variants={reduce ? undefined : listVariants}
            >
              {items.map((item, index) => {
                const review = localizedText(locale, item.review, item.reviewEn);
                const title = localizedText(locale, item.title, item.titleEn);
                const ratingLabel = t.testimonials.rating.replace("{rating}", String(item.rating));
                const metric = firstMetric(review);
                const featured = index === 0;
                const stretchLast = !featured && index === items.length - 1 && restCount % 2 === 1;

                return (
                  <motion.li
                    key={item.id}
                    className={
                      featured
                        ? "h-full md:col-span-2 lg:row-span-2"
                        : stretchLast
                          ? "h-full md:col-span-2 lg:col-span-1"
                          : "h-full"
                    }
                    variants={reduce ? undefined : cardVariants}
                  >
                    <article
                      onMouseMove={trackSpotlight}
                      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-slate-900/50 backdrop-blur-sm transition duration-300 hover:-translate-y-1.5 hover:border-cyan-400/35 hover:shadow-[0_22px_50px_-16px_rgba(34,211,238,0.35)] ${
                        featured
                          ? "border-cyan-400/25 p-8 shadow-[0_0_60px_-20px_rgba(139,92,246,0.45)] md:p-10"
                          : "border-slate-800 p-7"
                      }`}
                    >
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{
                          background:
                            "radial-gradient(420px circle at var(--x, 50%) var(--y, 50%), rgba(34,211,238,0.10), transparent 45%)",
                        }}
                      />
                      {featured ? (
                        <div
                          aria-hidden
                          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"
                        />
                      ) : null}
                      {featured || !metric ? (
                        <Quote
                          aria-hidden
                          className={`pointer-events-none absolute text-white/[0.04] ${
                            featured ? "top-6 right-6 h-28 w-28" : "top-5 right-5 h-14 w-14"
                          }`}
                        />
                      ) : null}

                      <div className="relative flex items-start justify-between gap-4">
                        <Stars rating={item.rating} label={ratingLabel} size={featured ? "h-5 w-5" : "h-4 w-4"} />
                        {metric && !featured ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                            <TrendingUp className="h-3.5 w-3.5" aria-hidden />
                            {metric}
                          </span>
                        ) : null}
                      </div>

                      {featured ? (
                        <div className="relative flex flex-1 flex-col justify-center py-4">
                          {metric ? (
                            <div className="mt-6">
                              <p className="bg-gradient-to-r from-cyan-300 via-emerald-300 to-violet-400 bg-clip-text text-6xl font-semibold tracking-tight text-transparent md:text-7xl">
                                {metric}
                              </p>
                              <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium tracking-[0.18em] text-slate-400 uppercase">
                                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" aria-hidden />
                                {t.testimonials.result}
                              </p>
                            </div>
                          ) : null}
                          <blockquote className="mt-8 text-xl leading-relaxed text-pretty text-slate-200 md:text-2xl">
                            <HighlightedReview text={review} />
                          </blockquote>
                        </div>
                      ) : (
                        <blockquote className="relative mt-5 flex-1 text-[15px] leading-relaxed text-pretty text-slate-300">
                          <HighlightedReview text={review} />
                        </blockquote>
                      )}

                      <footer className="relative mt-8 flex items-center gap-4 border-t border-slate-800/80 pt-6">
                        <div
                          className={`shrink-0 rounded-full bg-gradient-to-br p-[1.5px] ${gradientForName(item.name)} ${
                            featured ? "h-14 w-14" : "h-12 w-12"
                          }`}
                          aria-hidden
                        >
                          <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-950 text-sm font-semibold tracking-wide text-white">
                            {initialsFromName(item.name)}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <p className={`font-semibold text-white ${featured ? "text-lg" : ""}`}>{item.name}</p>
                            {item.isVerified ? (
                              <span className="inline-flex items-center gap-1 text-sky-400">
                                <BadgeCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
                                <span className="text-[10px] leading-none font-medium tracking-wide text-sky-300/90">
                                  {t.testimonials.verified}
                                </span>
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-sm text-slate-500">{title}</p>
                        </div>
                      </footer>
                    </article>
                  </motion.li>
                );
              })}
            </motion.ul>
          </>
        )}
      </div>
    </section>
  );
}
