"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/components/language-provider";
import { ReferenceGrid } from "@/components/portfolio-section";
import { Reveal } from "@/components/reveal";
import type { PublicProject } from "@/lib/public-content";

export function ReferencesIndex({ projects }: { projects: PublicProject[] }) {
  const { t } = useI18n();

  return (
    <>
      <section className="relative overflow-hidden px-6 pt-36 pb-24 md:pt-44 md:pb-32">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(16,185,129,0.14),transparent_70%)]"
        />
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold tracking-[0.22em] text-violet-300/80 uppercase">{t.reference.listEyebrow}</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance text-white md:text-6xl">{t.reference.listTitle}</h1>
            <p className="mt-5 text-base leading-relaxed text-pretty text-slate-400 sm:text-lg">{t.reference.listLead}</p>
          </Reveal>
          <ReferenceGrid projects={projects} />
        </div>
      </section>

      <section className="px-6 pb-28 md:pb-32">
        <Reveal className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-6 rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_15%_0%,rgba(16,185,129,0.22),transparent_55%),#030712] px-6 py-12 text-center md:flex-row md:px-12 md:text-left">
            <div>
              <p className="text-xs font-semibold tracking-[0.22em] text-emerald-300/80 uppercase">{t.reference.ctaEyebrow}</p>
              <h2 className="mt-3 max-w-xl text-2xl font-semibold tracking-tight text-balance text-white md:text-3xl">{t.reference.ctaTitle}</h2>
            </div>
            <Link
              href="/teklif-al"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-emerald-400 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_12px_32px_-8px_rgba(16,185,129,0.7)] transition hover:bg-emerald-300"
            >
              {t.reference.quote}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
