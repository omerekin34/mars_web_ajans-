"use client";

import type { PointerEvent } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Clock, Code, FileCheck, Rocket, Search, Timer, UserRound } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { useI18n } from "@/components/language-provider";

const icons = [Search, Code, Rocket];
const summaryIcons = [Timer, UserRound, FileCheck];
const ease = [0.22, 1, 0.36, 1] as const;

const drawLine = (index: number) => ({
  scaleX: 1,
  scaleY: 1,
  transition: { duration: 0.8, delay: 0.4 + index * 0.4, ease },
});

function trackSpotlight(event: PointerEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--x", `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty("--y", `${event.clientY - rect.top}px`);
}

export function Process() {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const steps = t.process.steps;

  return (
    <section id="process" className="relative overflow-hidden px-6 py-24 md:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[32rem] w-[56rem] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-sky-500/10 via-emerald-400/10 to-teal-500/10 blur-3xl"
      />
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeading eyebrow={t.process.eyebrow} title={t.process.title} lead={t.process.lead} />
        </Reveal>

        <motion.ol
          className="mt-16 grid gap-6 md:grid-cols-3 md:gap-5"
          initial={reduce ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
        >
          {steps.map((step, index) => {
            const Icon = icons[index] ?? Search;
            const number = String(index + 1).padStart(2, "0");
            const isLast = index === steps.length - 1;

            return (
              <li key={step.title} className="relative">
                {!isLast ? (
                  <>
                    <div
                      aria-hidden
                      className="absolute top-[4.25rem] -bottom-6 left-7 w-px overflow-hidden bg-white/10 md:hidden"
                    >
                      <motion.div
                        className="h-full w-full origin-top bg-gradient-to-b from-emerald-400 to-teal-300"
                        custom={index}
                        variants={{ hidden: { scaleY: 0 }, visible: drawLine }}
                      />
                    </div>
                    <div
                      aria-hidden
                      className="absolute top-7 left-[calc(50%+2.25rem)] hidden h-px w-[calc(100%-3.25rem)] overflow-hidden bg-white/10 md:block"
                    >
                      <motion.div
                        className="h-full w-full origin-left bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400"
                        custom={index}
                        variants={{ hidden: { scaleX: 0 }, visible: drawLine }}
                      />
                    </div>
                  </>
                ) : null}

                <Reveal delay={index * 0.12} className="flex h-full gap-5 md:flex-col md:items-center md:gap-8">
                  <div className="relative z-10 shrink-0 self-start md:self-center">
                    <div
                      aria-hidden
                      className={`absolute inset-0 rounded-2xl blur-xl ${isLast ? "bg-emerald-400/40" : "bg-emerald-400/20"}`}
                    />
                    <div
                      className={`relative flex h-14 w-14 items-center justify-center rounded-2xl border bg-slate-950 ${
                        isLast
                          ? "border-emerald-300/60 text-emerald-200 shadow-[0_0_30px_-4px_rgba(16,185,129,0.8)]"
                          : "border-emerald-300/30 text-emerald-300 shadow-[0_0_30px_-8px_rgba(16,185,129,0.6)]"
                      }`}
                    >
                      <Icon className="h-6 w-6" aria-hidden />
                    </div>
                  </div>

                  <article
                    onPointerMove={trackSpotlight}
                    className={`group relative flex-1 overflow-hidden rounded-3xl border p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-300 hover:-translate-y-1 sm:p-7 md:w-full ${
                      isLast
                        ? "border-emerald-300/25 bg-emerald-400/[0.05] hover:border-emerald-300/40"
                        : "border-white/10 bg-white/[0.03] hover:border-emerald-300/25"
                    }`}
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{
                        background:
                          "radial-gradient(380px circle at var(--x) var(--y), rgba(52, 211, 153, 0.12), transparent 45%)",
                      }}
                    />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -right-3 -bottom-8 bg-gradient-to-b from-white/[0.08] to-transparent bg-clip-text text-[8.5rem] leading-none font-bold tracking-tighter text-transparent select-none"
                    >
                      {number}
                    </span>

                    <div className="relative">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold tracking-[0.2em] text-emerald-300/80 uppercase">
                          {t.process.stepLabel} {number}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-slate-300">
                          <Clock className="h-3 w-3 text-emerald-300" aria-hidden />
                          {step.time}
                        </span>
                      </div>

                      <h3 className="mt-5 text-lg font-semibold text-white sm:text-xl">{step.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-slate-300">{step.body}</p>

                      <ul className="mt-6 space-y-2.5 border-t border-white/10 pt-5">
                        {step.points.map((point) => (
                          <li key={point} className="flex items-center gap-2.5 text-sm text-slate-200">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                              <Check className="h-3 w-3" aria-hidden />
                            </span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                </Reveal>
              </li>
            );
          })}
        </motion.ol>

        <Reveal delay={0.1}>
          <div className="mt-12 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <ul className="grid divide-y divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {t.process.summary.map((item, index) => {
                const Icon = summaryIcons[index] ?? Timer;
                return (
                  <li key={item.label} className="flex items-center gap-4 px-6 py-5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-300/25 bg-emerald-400/10 text-emerald-300">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <p className="flex flex-col">
                      <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-sky-300 bg-clip-text text-xl font-bold tracking-tight text-transparent">
                        {item.value}
                      </span>
                      <span className="text-xs text-slate-400">{item.label}</span>
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="mt-6 flex justify-center">
            <Link
              href="/teklif-al"
              className="group inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-5 py-2.5 text-sm font-semibold text-emerald-200 transition hover:border-emerald-300/60 hover:bg-emerald-400/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
            >
              {t.process.cta}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
