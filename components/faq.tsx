"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, MessageCircle, MessageCircleQuestion, Plus } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { useI18n } from "@/components/language-provider";
import { useSiteSettings } from "@/components/site-settings-provider";
import { faqCategories, type FaqCategory } from "@/lib/faq";
import { localizedText } from "@/lib/localized";
import type { PublicFaq } from "@/lib/public-content";
import { whatsAppUrl } from "@/lib/whatsapp";

type Filter = FaqCategory | "all";

const ease = [0.22, 1, 0.36, 1] as const;

function AskCard({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  const settings = useSiteSettings();
  const whatsappHref = settings.whatsappDigits ? whatsAppUrl(t.faq.askMessage, settings.whatsappDigits) : "";

  return (
    <div
      className={`relative min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/[0.12] via-white/[0.03] to-transparent p-6 sm:p-7 ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl"
      />
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-emerald-300/30 bg-emerald-400/10 text-emerald-300">
          <MessageCircleQuestion className="h-5 w-5" aria-hidden />
        </span>
        <p className="min-w-0 text-xs font-medium tracking-[0.18em] text-emerald-200/80 uppercase">{t.faq.askEyebrow}</p>
      </div>
      <h3 className="mt-5 text-xl font-semibold text-white">{t.faq.askTitle}</h3>
      <p className="mt-2 text-sm leading-relaxed text-pretty text-slate-400">{t.faq.askBody}</p>
      <ul className="mt-5 space-y-2.5">
        {t.faq.points.map((point) => (
          <li key={point} className="flex items-center gap-2.5 text-sm text-slate-300">
            <Check className="h-4 w-4 shrink-0 text-emerald-300" aria-hidden />
            {point}
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row lg:flex-col xl:flex-row">
        {whatsappHref ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            {t.faq.askWhatsapp}
          </a>
        ) : null}
        <Link
          href="/teklif-al"
          className="group inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-white transition hover:border-emerald-300/50 hover:bg-emerald-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
        >
          {t.faq.askQuote}
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
        </Link>
      </div>
    </div>
  );
}

export function Faq({ items }: { items: PublicFaq[] }) {
  const { locale, t } = useI18n();
  const reduce = useReducedMotion();
  const baseId = useId();
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState(items[0]?.id ?? "");

  const categories = useMemo(
    () =>
      faqCategories
        .map((key) => ({
          key,
          count: items.filter((item) => item.category === key).length,
        }))
        .filter((entry) => entry.count > 0),
    [items],
  );
  const visible = filter === "all" ? items : items.filter((item) => item.category === filter);

  const selectFilter = (next: Filter) => {
    setFilter(next);
    const list = next === "all" ? items : items.filter((item) => item.category === next);
    setOpenId(list[0]?.id ?? "");
  };

  const structuredData = useMemo(
    () =>
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({
          "@type": "Question",
          name: localizedText(locale, item.question, item.questionEn),
          acceptedAnswer: {
            "@type": "Answer",
            text: localizedText(locale, item.answer, item.answerEn),
          },
        })),
      }).replace(/</g, "\\u003c"),
    [items, locale],
  );

  const chipClass = (active: boolean) =>
    `inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 ${
      active
        ? "border-emerald-300/50 bg-emerald-400/15 text-emerald-100 shadow-[0_0_20px_-8px_rgba(16,185,129,0.6)]"
        : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-white"
    }`;
  const countClass = (active: boolean) =>
    `rounded-full px-1.5 text-[11px] tabular-nums ${active ? "bg-emerald-300/20 text-emerald-100" : "bg-white/5 text-slate-500"}`;

  return (
    <section id="faq" className="relative overflow-x-clip px-6 py-24 md:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 left-1/2 -z-10 h-[28rem] w-[48rem] max-w-full -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-500/10 via-teal-400/5 to-sky-500/10 blur-3xl"
      />
      {items.length > 0 ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
      ) : null}

      <div className="mx-auto grid min-w-0 max-w-6xl gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <SectionHeading eyebrow={t.faq.eyebrow} title={t.faq.title} lead={t.faq.lead} align="start" />
          </Reveal>
          <Reveal delay={0.1} className="hidden lg:block">
            <AskCard className="mt-10" />
          </Reveal>
        </div>

        <div className="min-w-0">
          {items.length === 0 ? (
            <p className="text-center text-sm text-slate-500 lg:text-left">{t.faq.empty}</p>
          ) : (
            <Reveal>
              {categories.length > 1 ? (
                <div
                  role="group"
                  aria-label={t.faq.filterLabel}
                  className="-mx-6 mb-6 flex min-w-0 gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
                >
                  <button
                    type="button"
                    aria-pressed={filter === "all"}
                    onClick={() => selectFilter("all")}
                    className={chipClass(filter === "all")}
                  >
                    {t.faq.all}
                    <span className={countClass(filter === "all")}>{items.length}</span>
                  </button>
                  {categories.map(({ key, count }) => (
                    <button
                      key={key}
                      type="button"
                      aria-pressed={filter === key}
                      onClick={() => selectFilter(key)}
                      className={chipClass(filter === key)}
                    >
                      {t.faq.categories[key]}
                      <span className={countClass(filter === key)}>{count}</span>
                    </button>
                  ))}
                </div>
              ) : null}

              <motion.div
                key={filter}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease }}
                className="space-y-3"
              >
                {visible.map((item, index) => {
                  const open = openId === item.id;
                  const question = localizedText(locale, item.question, item.questionEn);
                  const answer = localizedText(locale, item.answer, item.answerEn);
                  const number = String(index + 1).padStart(2, "0");
                  const buttonId = `${baseId}-q-${item.id}`;
                  const panelId = `${baseId}-a-${item.id}`;
                  return (
                    <div
                      key={item.id}
                      className={`relative overflow-hidden rounded-2xl border transition duration-300 ${
                        open
                          ? "border-emerald-300/30 bg-emerald-400/[0.05] shadow-[0_0_40px_-18px_rgba(16,185,129,0.55)]"
                          : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-emerald-300 via-teal-400 to-sky-400 transition-opacity duration-300 ${
                          open ? "opacity-100" : "opacity-0"
                        }`}
                      />
                      <h3>
                        <button
                          id={buttonId}
                          type="button"
                          aria-expanded={open}
                          aria-controls={panelId}
                          onClick={() => setOpenId(open ? "" : item.id)}
                          className="flex w-full items-start gap-4 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-inset sm:px-6 sm:py-5"
                        >
                          <span
                            className={`mt-1 font-mono text-xs tabular-nums transition ${open ? "text-emerald-300" : "text-slate-500"}`}
                          >
                            {number}
                          </span>
                          <span className="flex-1 text-[15px] leading-snug font-medium text-white sm:text-base">
                            {question}
                          </span>
                          <span
                            className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border transition duration-300 ${
                              open
                                ? "rotate-45 border-emerald-300/50 bg-emerald-400/15 text-emerald-200"
                                : "border-white/10 text-slate-400"
                            }`}
                          >
                            <Plus className="h-4 w-4" aria-hidden />
                          </span>
                        </button>
                      </h3>
                      <AnimatePresence initial={false}>
                        {open ? (
                          <motion.div
                            id={panelId}
                            role="region"
                            aria-labelledby={buttonId}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease }}
                          >
                            <div className="flex gap-4 px-5 pb-5 sm:px-6 sm:pb-6">
                              <span aria-hidden className="invisible font-mono text-xs">
                                {number}
                              </span>
                              <p className="flex-1 text-sm sm:pr-11 leading-relaxed text-pretty text-slate-400 sm:text-[15px]">
                                {answer}
                              </p>
                            </div>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </motion.div>
            </Reveal>
          )}

          <Reveal className="lg:hidden">
            <AskCard className="mt-10" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
