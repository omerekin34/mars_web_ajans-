"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  Check,
  CircleCheck,
  ImageIcon,
  LayoutDashboard,
  Phone,
  Search,
  Smartphone,
  Star,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { AnimatedCounter } from "@/components/animated-counter";
import { useI18n } from "@/components/language-provider";
import type { Dictionary } from "@/lib/translations";

type Tech = Dictionary["tech"];

const SPEED_SCORE = 99;
const GAUGE_RADIUS = 52;

function BentoCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--y", `${event.clientY - rect.top}px`);
  };

  return (
    <article
      onPointerMove={onPointerMove}
      className={`group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-colors duration-300 hover:border-emerald-300/25 ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: "radial-gradient(420px circle at var(--x) var(--y), rgba(52, 211, 153, 0.12), transparent 45%)",
        }}
      />
      <div className="relative flex h-full flex-col">{children}</div>
    </article>
  );
}

function CardHeader({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <div>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-300/25 bg-emerald-400/10 text-emerald-300 shadow-[0_0_30px_-6px_rgba(16,185,129,0.5)]">
        <Icon className="h-6 w-6" aria-hidden />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-white sm:text-xl">{title}</h3>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-300">{body}</p>
    </div>
  );
}

function SpeedVisual({ copy }: { copy: Tech["speed"] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  const progress = useMotionValue(0);
  const score = useTransform(progress, (value) => Math.round(value));
  const pathLength = useTransform(progress, (value) => value / 100);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      progress.set(SPEED_SCORE);
      return;
    }
    const controls = animate(progress, SPEED_SCORE, { duration: 1.8, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [inView, progress, reduce]);

  const bars = [
    { label: copy.ours, time: copy.oursTime, width: "19%", tone: "from-emerald-400 to-teal-300", text: "text-emerald-300" },
    { label: copy.theirs, time: copy.theirsTime, width: "100%", tone: "from-rose-500/80 to-orange-400/80", text: "text-rose-300" },
  ];

  return (
    <div ref={ref} className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
      <div className="relative h-36 w-36 shrink-0">
        <div aria-hidden className="absolute inset-4 rounded-full bg-emerald-400/20 blur-2xl" />
        <svg viewBox="0 0 120 120" className="relative h-full w-full -rotate-90">
          <circle cx="60" cy="60" r={GAUGE_RADIUS} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
          <motion.circle
            cx="60"
            cy="60"
            r={GAUGE_RADIUS}
            fill="none"
            stroke="url(#speed-gauge)"
            strokeWidth="10"
            strokeLinecap="round"
            style={{ pathLength }}
          />
          <defs>
            <linearGradient id="speed-gauge" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span className="text-4xl font-bold tracking-tight text-white tabular-nums">{score}</motion.span>
          <span className="mt-0.5 text-[10px] font-semibold tracking-[0.18em] text-emerald-300/90 uppercase">
            {copy.score}
          </span>
        </div>
      </div>

      <div className="w-full flex-1 space-y-4">
        <p className="text-xs font-medium tracking-[0.18em] text-slate-500 uppercase">{copy.caption}</p>
        {bars.map((bar, index) => (
          <div key={bar.label}>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-slate-300">{bar.label}</span>
              <span className={`font-semibold tabular-nums ${bar.text}`}>{bar.time}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                className={`h-full origin-left rounded-full bg-gradient-to-r ${bar.tone}`}
                style={{ width: bar.width }}
                initial={reduce ? false : { scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: index === 0 ? 0.6 : 2.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileVisual({ copy }: { copy: Tech["mobile"] }) {
  const reduce = useReducedMotion();

  return (
    <div className="relative mt-8 flex flex-1 items-center justify-center">
      <div aria-hidden className="absolute h-48 w-48 rounded-full bg-teal-400/20 blur-3xl" />
      <motion.div
        className="relative w-[12.5rem]"
        animate={reduce ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="rounded-[2.2rem] border border-white/15 bg-slate-950 p-2 shadow-[0_30px_80px_-20px_rgba(16,185,129,0.45)]">
          <div className="relative overflow-hidden rounded-[1.7rem] bg-slate-900">
            <div className="mx-auto mt-2 h-4 w-20 rounded-full bg-slate-950" />
            <div className="flex items-center justify-between px-4 pt-3">
              <span className="h-2.5 w-14 rounded-full bg-white/80" />
              <span className="space-y-1">
                <span className="block h-0.5 w-4 rounded bg-white/60" />
                <span className="block h-0.5 w-4 rounded bg-white/60" />
              </span>
            </div>
            <div className="mx-3 mt-3 rounded-2xl bg-gradient-to-br from-emerald-400/90 via-teal-400/80 to-sky-500/80 p-3.5">
              <span className="block h-2 w-20 rounded-full bg-white/90" />
              <span className="mt-1.5 block h-2 w-14 rounded-full bg-white/60" />
              <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-slate-950 px-2.5 py-1 text-[9px] font-bold text-emerald-300">
                <Phone className="h-2.5 w-2.5" aria-hidden />
                {copy.call}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 p-3">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="rounded-xl border border-white/5 bg-white/[0.04] p-2">
                  <span className="block h-8 rounded-lg bg-white/[0.07]" />
                  <span className="mt-2 block h-1.5 w-10 rounded-full bg-white/30" />
                  <span className="mt-1 block h-1.5 w-6 rounded-full bg-emerald-300/60" />
                </div>
              ))}
            </div>
            <div className="mx-auto mb-2 h-1 w-16 rounded-full bg-white/30" />
          </div>
        </div>

        <div className="absolute top-16 -right-4 inline-flex whitespace-nowrap sm:-right-10 items-center gap-1.5 rounded-full border border-emerald-300/30 bg-slate-950/90 px-3 py-1.5 text-xs font-semibold text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.3)] backdrop-blur">
          <CircleCheck className="h-3.5 w-3.5" aria-hidden />
          {copy.badge}
        </div>
      </motion.div>
    </div>
  );
}

function SeoVisual({ copy }: { copy: Tech["seo"] }) {
  return (
    <div className="mt-7 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs text-slate-300">
        <Search className="h-3.5 w-3.5 text-slate-500" aria-hidden />
        <span className="truncate">{copy.query}</span>
        <span aria-hidden className="h-3.5 w-px bg-emerald-300 motion-safe:animate-pulse" />
      </div>
      <div className="mt-3 rounded-xl border border-emerald-300/30 bg-emerald-400/[0.07] p-3 shadow-[0_0_30px_-10px_rgba(16,185,129,0.6)]">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-400 text-[10px] font-bold text-slate-950">
            1
          </span>
          <span className="truncate text-[11px] text-emerald-300/90">{copy.domain}</span>
        </div>
        <p className="mt-1.5 truncate text-sm font-semibold text-sky-300">{copy.result}</p>
        <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
          <span className="flex text-amber-300">
            {[0, 1, 2, 3, 4].map((star) => (
              <Star key={star} className="h-3 w-3 fill-current" aria-hidden />
            ))}
          </span>
          <span className="truncate">{copy.rating}</span>
        </div>
      </div>
      {[0, 1].map((row) => (
        <div key={row} className="mt-3 px-3 opacity-40">
          <span className="block h-1.5 w-20 rounded-full bg-white/20" />
          <span className="mt-1.5 block h-2 w-40 max-w-full rounded-full bg-white/25" />
        </div>
      ))}
    </div>
  );
}

function AdminVisual({ copy }: { copy: Tech["admin"] }) {
  const reduce = useReducedMotion();
  const [priceIndex, setPriceIndex] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const timer = window.setInterval(() => {
      setPriceIndex((index) => (index + 1) % copy.prices.length);
    }, 2800);
    return () => window.clearInterval(timer);
  }, [copy.prices.length, reduce]);

  return (
    <div className="mt-7 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-white">{copy.title}</span>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-300">
          <span className="relative flex h-4 w-7 items-center rounded-full bg-emerald-400/80 px-0.5">
            <span className="ml-auto h-3 w-3 rounded-full bg-white" />
          </span>
          {copy.live}
        </span>
      </div>

      <div className="mt-4 space-y-2.5">
        <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5">
          <span className="text-[11px] text-slate-400">{copy.phone}</span>
          <span className="text-xs font-medium text-slate-200 tabular-nums">{copy.phoneValue}</span>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-emerald-300/30 bg-emerald-400/[0.06] px-3 py-2.5">
          <span className="text-[11px] text-slate-400">{copy.price}</span>
          <span className="relative flex h-4 items-center overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={priceIndex}
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -14, opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="text-xs font-semibold text-white tabular-nums"
              >
                {copy.prices[priceIndex]}
              </motion.span>
            </AnimatePresence>
          </span>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400/40 to-emerald-400/40">
            <ImageIcon className="h-3.5 w-3.5 text-white/80" aria-hidden />
          </span>
          <span className="h-1.5 w-16 rounded-full bg-white/20" />
          <AnimatePresence mode="wait">
            <motion.span
              key={priceIndex}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300"
            >
              <Check className="h-3 w-3" aria-hidden />
              {copy.saved}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export function TechGrid() {
  const { t } = useI18n();
  const [speed, mobile, seo, admin] = t.tech.items;

  return (
    <section id="why" className="relative overflow-hidden px-6 py-24 md:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[36rem] w-[60rem] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-emerald-500/10 via-teal-400/5 to-sky-500/10 blur-3xl"
      />
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeading eyebrow={t.tech.eyebrow} title={t.tech.title} lead={t.tech.lead} />
        </Reveal>

        <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Reveal className="md:col-span-2">
            <BentoCard>
              <div className="grid h-full items-center gap-8 lg:grid-cols-[1fr_1.15fr]">
                <CardHeader icon={Zap} title={speed.title} body={speed.body} />
                <SpeedVisual copy={t.tech.speed} />
              </div>
            </BentoCard>
          </Reveal>

          <Reveal className="md:row-span-2" delay={0.06}>
            <BentoCard>
              <CardHeader icon={Smartphone} title={mobile.title} body={mobile.body} />
              <MobileVisual copy={t.tech.mobile} />
            </BentoCard>
          </Reveal>

          <Reveal delay={0.12}>
            <BentoCard>
              <CardHeader icon={Search} title={seo.title} body={seo.body} />
              <SeoVisual copy={t.tech.seo} />
            </BentoCard>
          </Reveal>

          <Reveal delay={0.18}>
            <BentoCard>
              <CardHeader icon={LayoutDashboard} title={admin.title} body={admin.body} />
              <AdminVisual copy={t.tech.admin} />
            </BentoCard>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <dl className="mt-4 grid grid-cols-2 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] md:grid-cols-4">
            {t.tech.stats.map((stat, index) => {
              const value = stat.value;
              let number = 0;
              let prefix = "";
              let suffix = "";

              if (value.startsWith("%")) {
                prefix = "%";
                number = parseInt(value.replace("%", ""), 10);
              } else if (value.endsWith("+")) {
                number = parseInt(value.replace("+", ""), 10);
                suffix = "+";
              } else if (value.endsWith(" gün")) {
                number = parseInt(value.replace(" gün", ""), 10);
                suffix = " gün";
              } else if (value.endsWith(" muhatap")) {
                number = parseInt(value.replace(" muhatap", ""), 10);
                suffix = " muhatap";
              } else {
                number = parseInt(value, 10);
              }

              return (
                <div
                  key={stat.label}
                  className={`flex flex-col px-6 py-7 text-center ${index % 2 === 1 ? "border-l border-white/10" : ""} ${index >= 2 ? "border-t border-white/10 md:border-t-0" : ""} ${index === 2 ? "md:border-l" : ""}`}
                >
                  <dt className="order-2 mt-1 text-xs text-slate-400 sm:text-sm">{stat.label}</dt>
                  <dd className="order-1 bg-gradient-to-r from-emerald-300 via-teal-200 to-sky-300 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
                    <AnimatedCounter value={number} prefix={prefix} suffix={suffix} duration={2} />
                  </dd>
                </div>
              );
            })}
          </dl>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-12 flex flex-col items-center gap-3">
            <Link
              href="/teklif-al"
              className="group inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-[length:200%_100%] px-7 py-4 text-base font-bold text-slate-950 shadow-[0_10px_40px_-8px_rgba(16,185,129,0.7)] ring-1 ring-white/30 transition-all duration-500 hover:[background-position:100%_0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {t.tech.cta}
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" aria-hidden />
            </Link>
            <p className="text-xs text-slate-500">{t.tech.ctaNote}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
