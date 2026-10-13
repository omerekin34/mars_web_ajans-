"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ReferenceCard } from "@/components/reference-card";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { useI18n } from "@/components/language-provider";
import { localizedText } from "@/lib/localized";
import type { PublicProject } from "@/lib/public-content";

const HOME_LIMIT = 6;

function filterDomId(id: string) {
  const slug = id.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-|-$/g, "") || "sector";
  return `portfolio-filter-${slug}`;
}

export function ReferenceGrid({ projects, limit }: { projects: PublicProject[]; limit?: number }) {
  const { locale, t } = useI18n();
  const reduce = useReducedMotion();
  const [filter, setFilter] = useState("all");
  const scrollerRef = useRef<HTMLDivElement>(null);

  const sectors = useMemo(() => {
    const seen = new Map<string, { label: string; count: number }>();
    for (const project of projects) {
      if (!project.sector) continue;
      const current = seen.get(project.sector);
      if (current) current.count += 1;
      else seen.set(project.sector, { label: localizedText(locale, project.sector, project.sectorEn), count: 1 });
    }
    return [...seen.entries()].map(([id, value]) => ({ id, ...value }));
  }, [locale, projects]);

  const filters = useMemo(
    () => [{ id: "all", label: t.portfolio.filters.all, count: projects.length }, ...sectors],
    [projects.length, sectors, t.portfolio.filters.all],
  );

  useEffect(() => {
    if (filter !== "all" && !sectors.some((sector) => sector.id === filter)) setFilter("all");
  }, [filter, sectors]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const active = scroller?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!scroller || !active) return;
    const scrollerBox = scroller.getBoundingClientRect();
    const activeBox = active.getBoundingClientRect();
    const delta = activeBox.left + activeBox.width / 2 - (scrollerBox.left + scrollerBox.width / 2);
    scroller.scrollTo({ left: scroller.scrollLeft + delta, behavior: reduce ? "auto" : "smooth" });
  }, [filter, reduce]);

  const visible = useMemo(() => {
    const filtered = projects.filter((project) => filter === "all" || project.sector === filter);
    return limit ? filtered.slice(0, limit) : filtered;
  }, [filter, limit, projects]);

  if (projects.length === 0) {
    return <p className="mt-12 text-center text-sm text-slate-500">{t.portfolio.empty}</p>;
  }

  return (
    <>
      {sectors.length > 1 ? (
        <div ref={scrollerRef} className="mt-12 -mx-6 overflow-x-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div role="tablist" aria-label={t.portfolio.filterLabel} className="mx-auto flex w-max gap-2">
            {filters.map((item) => {
              const active = filter === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  id={filterDomId(item.id)}
                  aria-selected={active}
                  aria-controls="portfolio-grid"
                  onClick={() => setFilter(item.id)}
                  className={`relative shrink-0 overflow-hidden rounded-full border px-4 py-2.5 text-sm backdrop-blur-xl transition-colors duration-300 ${
                    active
                      ? "border-emerald-300/60 font-semibold text-slate-950"
                      : "border-white/10 bg-white/[0.04] text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-emerald-300/30 hover:text-slate-200"
                  }`}
                >
                  {active ? (
                    <motion.span
                      layoutId={reduce ? undefined : "portfolio-filter-pill"}
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 shadow-[0_8px_28px_-6px_rgba(16,185,129,0.7)]"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  ) : null}
                  <span className="relative z-10 flex items-center gap-2 font-medium whitespace-nowrap">
                    {item.label}
                    <span
                      className={`rounded-full px-1.5 text-[10px] leading-4 tabular-nums ${
                        active ? "bg-slate-950/15 text-slate-900" : "bg-white/[0.06] text-slate-500"
                      }`}
                    >
                      {item.count}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <motion.div layout className="mt-10">
        <div
          id="portfolio-grid"
          role={sectors.length > 1 ? "tabpanel" : undefined}
          aria-labelledby={sectors.length > 1 ? filterDomId(filter) : undefined}
          className="flex flex-wrap justify-center gap-5"
        >
          <AnimatePresence mode="popLayout">
            {visible.map((project) => (
              <motion.article
                key={project.id}
                layout
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="w-full md:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]"
              >
                <ReferenceCard project={project} />
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}

export function PortfolioSection({ projects }: { projects: PublicProject[] }) {
  const { t } = useI18n();
  const ordered = useMemo(
    () => [...projects.filter((project) => project.isFeatured), ...projects.filter((project) => !project.isFeatured)],
    [projects],
  );

  return (
    <section id="portfolio" className="relative px-6 py-24 md:py-32" aria-labelledby="portfolio-title">
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[34rem] w-[60rem] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-emerald-500/10 via-teal-400/[0.07] to-sky-500/10 blur-3xl"
      />
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeading
            eyebrow={t.portfolio.eyebrow}
            title={t.portfolio.title}
            lead={t.portfolio.lead}
            titleId="portfolio-title"
          />
        </Reveal>

        <ReferenceGrid projects={ordered} limit={HOME_LIMIT} />

        {projects.length > 0 ? (
          <div className="mt-12 flex justify-center">
            <Link
              href="/referanslar"
              className="group inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-6 py-3 text-sm font-semibold text-emerald-100 backdrop-blur-xl transition hover:border-emerald-300/60 hover:bg-emerald-400/15 hover:shadow-[0_10px_30px_-10px_rgba(16,185,129,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
            >
              {t.portfolio.viewAll}
              <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[11px] font-medium text-emerald-200">
                {t.portfolio.count.replace("{count}", String(projects.length))}
              </span>
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
