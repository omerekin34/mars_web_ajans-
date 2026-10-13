"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, BadgeCheck, CircleCheck, EyeOff, SearchCheck, ShieldAlert, Store, Swords } from "lucide-react";
import { BeforeAfterSlider, CompareStats } from "@/components/before-after-slider";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { useI18n } from "@/components/language-provider";

const problemIcons = [EyeOff, ShieldAlert, Swords];
const solutionIcons = [SearchCheck, BadgeCheck, Store];

export function Agitation() {
  const { t } = useI18n();
  const reduce = useReducedMotion();

  return (
    <section id="cozumler" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeading eyebrow={t.agitation.eyebrow} title={t.agitation.title} lead={t.agitation.lead} />
        </Reveal>
        <div className="mt-16 grid gap-5 md:grid-cols-3 md:gap-y-0">
          {t.agitation.cards.map((card, index) => {
            const ProblemIcon = problemIcons[index] ?? EyeOff;
            const SolutionIcon = solutionIcons[index] ?? SearchCheck;
            return (
              <Reveal
                key={card.title}
                delay={index * 0.08}
                className="md:row-span-3 md:grid md:grid-rows-subgrid"
              >
                <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition duration-500 hover:border-cyan-400/30 hover:shadow-[0_0_60px_-15px_rgba(34,211,238,0.35)] md:row-span-3 md:grid md:grid-rows-subgrid">
                  <div className="relative p-7 pb-10">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-400/20 bg-rose-500/10">
                        <ProblemIcon className="h-5 w-5 text-rose-300" aria-hidden />
                      </div>
                      <span className="rounded-full border border-rose-400/20 bg-rose-500/10 px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] text-rose-300 uppercase">
                        {t.agitation.problemLabel}
                      </span>
                    </div>
                    <h3 className="mt-6 text-xl font-semibold text-white/90">{card.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-400">{card.body}</p>
                  </div>

                  <div aria-hidden className="relative h-px">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                    <motion.div
                      className="absolute inset-0 origin-center bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent"
                      initial={reduce ? false : { scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 0.9, delay: 0.3 + index * 0.12, ease: [0.22, 1, 0.36, 1] }}
                    />
                    <div className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
                      <span className="absolute inset-0 rounded-full border border-cyan-400/40 motion-safe:animate-ping" />
                      <span className="relative flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/40 bg-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.35)] transition duration-500 group-hover:scale-110">
                        <ArrowDown className="h-4 w-4 text-cyan-300" />
                      </span>
                    </div>
                  </div>

                  <div className="relative flex-1 bg-gradient-to-b from-cyan-500/[0.08] via-emerald-500/[0.04] to-transparent p-7 pt-10">
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -top-10 left-1/2 h-40 w-56 -translate-x-1/2 rounded-full bg-cyan-400/10 opacity-60 blur-3xl transition duration-500 group-hover:opacity-100"
                    />
                    <div className="relative">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/15 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                          <SolutionIcon className="h-5 w-5 text-cyan-300" aria-hidden />
                        </div>
                        <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] text-emerald-300 uppercase">
                          {t.agitation.solutionLabel}
                        </span>
                      </div>
                      <h3 className="mt-6 text-xl font-semibold text-white">{card.solution.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-gray-300">{card.solution.body}</p>
                      <ul className="mt-5 space-y-2.5">
                        {card.solution.points.map((point) => (
                          <li key={point} className="flex items-start gap-2.5 text-sm text-slate-200">
                            <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
        <Reveal>
          <div className="mx-auto mt-32 max-w-5xl">
            <SectionHeading eyebrow={t.compare.eyebrow} title={t.compare.title} lead={t.compare.lead} />
            <div className="mt-12">
              <BeforeAfterSlider />
            </div>
            <CompareStats />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
