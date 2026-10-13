"use client";

import { useEffect, useState, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  ChevronRight,
  CircleCheck,
  Clock,
  Lock,
  MessageCircle,
  Search,
  ShieldCheck,
  ShoppingBag,
  Star,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { LogoMarquee } from "@/components/logo-marquee";
import { useI18n } from "@/components/language-provider";
import { useSiteSettings } from "@/components/site-settings-provider";
import { formatTry, slotsText } from "@/lib/format";
import { localizedText } from "@/lib/localized";
import type { PublicProject, PublicTestimonial } from "@/lib/public-content";
import { scrollToId } from "@/lib/scroll";

const statIcons: LucideIcon[] = [TrendingUp, Clock, Search];
const notificationIcons: LucideIcon[] = [ShoppingBag, CalendarCheck, MessageCircle, Star];
const notificationTones = [
  "border-emerald-300/30 bg-emerald-400/15 text-emerald-300",
  "border-sky-300/30 bg-sky-400/15 text-sky-300",
  "border-green-300/30 bg-green-400/15 text-green-300",
  "border-amber-300/30 bg-amber-400/15 text-amber-300",
];
const avatarTones = [
  "from-emerald-400 to-teal-500",
  "from-sky-400 to-indigo-500",
  "from-amber-300 to-orange-500",
  "from-fuchsia-400 to-rose-500",
];

const chartValues = [18, 26, 22, 40, 55, 82];
const chartWidth = 300;
const chartHeight = 120;

function chartPoints() {
  const step = chartWidth / (chartValues.length - 1);
  return chartValues.map((value, index) => [index * step, chartHeight - value * 1.3] as const);
}

function smoothPath(points: ReadonlyArray<readonly [number, number]>) {
  return points.reduce((path, [x, y], index) => {
    if (index === 0) return `M${x},${y}`;
    const [px, py] = points[index - 1];
    const cx = (px + x) / 2;
    return `${path} C${cx},${py} ${cx},${y} ${x},${y}`;
  }, "");
}

function RotatingWords({ words }: { words: readonly string[] }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce || words.length < 2) return;
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % words.length), 2600);
    return () => window.clearInterval(timer);
  }, [reduce, words.length]);

  return (
    <span className="relative inline-grid max-w-full pb-2 align-bottom">
      {words.map((word, wordIndex) => {
        const active = wordIndex === index;
        return (
          <motion.span
            key={word}
            className="relative justify-self-center text-balance [grid-area:1/1] sm:whitespace-nowrap lg:justify-self-start"
            initial={false}
            animate={
              reduce
                ? { opacity: active ? 1 : 0 }
                : { opacity: active ? 1 : 0, y: active ? 0 : 24, filter: active ? "blur(0px)" : "blur(8px)" }
            }
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-sky-300 bg-clip-text text-transparent">{word}</span>
            <svg
              viewBox="0 0 300 12"
              preserveAspectRatio="none"
              className="absolute -bottom-2 left-0 h-3 w-full text-emerald-400/70"
              aria-hidden
            >
              <motion.path
                d="M2 9C60 3 120 2 180 4C220 5 260 7 298 3"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                initial={false}
                animate={{ pathLength: reduce || active ? 1 : 0 }}
                transition={{ duration: 0.8, delay: active ? 0.25 : 0, ease: "easeOut" }}
              />
            </svg>
          </motion.span>
        );
      })}
    </span>
  );
}

function RevenueCounter({ value }: { value: number }) {
  const { locale } = useI18n();
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 1.8,
      delay: 0.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: setDisplay,
    });
    return () => controls.stop();
  }, [reduce, value]);

  return <span className="tabular-nums">{formatTry(display, locale)}</span>;
}

function NotificationToast() {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const items = t.hero.notifications;

  useEffect(() => {
    if (reduce || items.length < 2) return;
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % items.length), 3200);
    return () => window.clearInterval(timer);
  }, [reduce, items.length]);

  const item = items[index % items.length];
  const Icon = notificationIcons[index % notificationIcons.length];

  return (
    <div className="relative h-[4.25rem] w-[16.5rem]" aria-live="polite">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 16, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.94 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex items-center gap-3 rounded-2xl border border-white/15 bg-slate-900/80 px-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl"
        >
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${notificationTones[index % notificationTones.length]}`}
          >
            <Icon className="h-4 w-4" aria-hidden />
          </span>
          <span className="min-w-0 flex-1 text-left">
            <span className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-semibold text-white">{item.title}</span>
              <span className="shrink-0 text-[10px] text-slate-500">{t.hero.notificationTime}</span>
            </span>
            <span className="block truncate text-xs text-slate-400">{item.detail}</span>
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function HeroVisual() {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const dashboard = t.hero.dashboard;
  const points = chartPoints();
  const line = smoothPath(points);
  const area = `${line} L${chartWidth},${chartHeight} L0,${chartHeight} Z`;
  const [lastX, lastY] = points[points.length - 1];

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [7, -7]), { stiffness: 140, damping: 18 });
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-9, 9]), { stiffness: 140, damping: 18 });

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reduce || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const onPointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  const metrics = [
    { label: dashboard.visitorsLabel, value: dashboard.visitors },
    { label: dashboard.conversionLabel, value: dashboard.conversion },
    { label: dashboard.rankLabel, value: dashboard.rank },
  ];

  const floatTransition = (delay: number) =>
    reduce ? undefined : { duration: 6, repeat: Infinity, ease: "easeInOut" as const, delay };

  return (
    <div
      className="relative mx-auto w-full max-w-[32rem] [perspective:1400px]"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-10 rounded-full bg-gradient-to-tr from-emerald-500/25 via-teal-400/10 to-sky-500/25 blur-3xl"
      />

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        style={reduce ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative rounded-[1.75rem] border border-white/15 bg-gradient-to-b from-slate-800/80 to-slate-900/90 p-1.5 shadow-[0_40px_120px_-20px_rgba(16,185,129,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-xl"
      >
        <div className="flex items-center gap-3 px-3 py-2.5">
          <span className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          </span>
          <span className="flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-[11px] text-slate-400">
            <Lock className="h-3 w-3 shrink-0 text-emerald-400" aria-hidden />
            <span className="truncate">{dashboard.url}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] font-semibold tracking-wider text-emerald-300 uppercase">
            <span className="relative flex h-1.5 w-1.5" aria-hidden>
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 motion-safe:animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            {dashboard.live}
          </span>
        </div>

        <div className="rounded-[1.35rem] border border-white/10 bg-slate-950/80 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="text-left">
              <p className="text-xs font-medium text-slate-400">{dashboard.revenueLabel}</p>
              <p className="mt-1.5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                <RevenueCounter value={dashboard.revenue} />
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-xs font-bold text-emerald-300 shadow-[0_0_24px_rgba(16,185,129,0.25)]">
              <TrendingUp className="h-3.5 w-3.5" aria-hidden />
              {dashboard.growth}
            </span>
          </div>

          <div className="relative mt-5">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-32 w-full overflow-visible sm:h-36" aria-hidden>
              <defs>
                <linearGradient id="hero-chart-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="hero-chart-line" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#2dd4bf" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>
              {[0.25, 0.5, 0.75].map((ratio) => (
                <line
                  key={ratio}
                  x1="0"
                  x2={chartWidth}
                  y1={chartHeight * ratio}
                  y2={chartHeight * ratio}
                  stroke="rgba(148,163,184,0.12)"
                  strokeDasharray="4 6"
                />
              ))}
              <motion.path
                d={area}
                fill="url(#hero-chart-fill)"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.2 }}
              />
              <motion.path
                d={line}
                fill="none"
                stroke="url(#hero-chart-line)"
                strokeWidth="3"
                strokeLinecap="round"
                initial={reduce ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.6, delay: 0.5, ease: "easeInOut" }}
              />
              <motion.g
                initial={reduce ? false : { opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 2 }}
                style={{ transformOrigin: `${lastX}px ${lastY}px` }}
              >
                <circle cx={lastX} cy={lastY} r="10" fill="#38bdf8" opacity="0.25" />
                <circle cx={lastX} cy={lastY} r="4.5" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="2" />
              </motion.g>
            </svg>
            <div className="mt-2 flex justify-between text-[10px] font-medium text-slate-500">
              {dashboard.months.map((month) => (
                <span key={month}>{month}</span>
              ))}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2.5">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-left">
                <p className="text-[10px] font-medium tracking-wider text-slate-500 uppercase">{metric.label}</p>
                <p className="mt-0.5 text-base font-bold text-white sm:text-lg">{metric.value}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute -top-8 left-1/2 z-20 -translate-x-1/2 sm:-top-6 sm:-left-10 sm:translate-x-0"
        initial={reduce ? false : { opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 1 }}
      >
        <motion.div animate={reduce ? undefined : { y: [-6, 6, -6] }} transition={floatTransition(0)}>
          <NotificationToast />
        </motion.div>
      </motion.div>

      {t.hero.stats.map((stat, index) => {
        const Icon = statIcons[index] ?? TrendingUp;
        const position = [
          "-left-6 top-[44%] lg:-left-14",
          "-right-6 top-[60%] lg:-right-14",
          "-left-4 -bottom-7 lg:left-10",
        ][index];
        return (
          <motion.div
            key={stat.label}
            className={`pointer-events-none absolute z-20 hidden sm:block ${position}`}
            initial={reduce ? false : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1.3 + index * 0.15 }}
          >
            <motion.div
              animate={reduce ? undefined : { y: [8, -8, 8] }}
              transition={floatTransition(index * 0.7)}
              className="flex items-center gap-2.5 rounded-2xl border border-white/15 bg-slate-900/75 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-300/25 bg-emerald-400/10 text-emerald-300">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="text-left">
                <span className="block text-sm font-bold leading-tight text-white">{stat.value}</span>
                <span className="block text-[10px] font-medium tracking-[0.14em] text-slate-400 uppercase">{stat.label}</span>
              </span>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

const maxFaces = 4;

function SocialProof({ projects, testimonials }: { projects: PublicProject[]; testimonials: PublicTestimonial[] }) {
  const { locale, t } = useI18n();
  const faces = projects.slice(0, maxFaces);
  const extra = projects.length - faces.length;
  const rating = testimonials.length
    ? `${(testimonials.reduce((sum, item) => sum + item.rating, 0) / testimonials.length).toFixed(1)}/5`
    : t.hero.proofRating;

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row lg:items-center">
      <div className="flex -space-x-2.5">
        {faces.map((project, index) => {
          const name = localizedText(locale, project.clientName, project.clientNameEn);
          return (
            <span
              key={project.id}
              className={`relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-slate-950 bg-gradient-to-br text-xs font-bold text-slate-950 ${avatarTones[index % avatarTones.length]}`}
              title={name}
            >
              {project.imageUrl ? (
                <Image src={project.imageUrl} alt="" width={36} height={36} unoptimized className="h-full w-full bg-white object-contain p-1" />
              ) : (
                name.slice(0, 1).toUpperCase()
              )}
            </span>
          );
        })}
        {extra > 0 && (
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-950 bg-slate-800 text-[11px] font-bold text-emerald-300">
            +{extra}
          </span>
        )}
      </div>
      <div className="text-center sm:text-left">
        <div className="flex items-center justify-center gap-1.5 sm:justify-start">
          <span className="flex text-amber-300" aria-hidden>
            {[0, 1, 2, 3, 4].map((star) => (
              <Star key={star} className="h-3.5 w-3.5 fill-current" />
            ))}
          </span>
          <span className="text-sm font-semibold text-white">{rating}</span>
        </div>
        <p className="mt-0.5 text-xs text-slate-400">{t.hero.proofText.replace("{count}", String(projects.length))}</p>
      </div>
    </div>
  );
}

export function Hero({ projects, testimonials }: { projects: PublicProject[]; testimonials: PublicTestimonial[] }) {
  const { t } = useI18n();
  const { projectSlots } = useSiteSettings();
  const reduce = useReducedMotion();
  const kicker = slotsText(projectSlots, { many: t.hero.kicker, one: t.hero.kickerOne, full: t.hero.kickerFull });

  const fadeUp = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden px-6 pt-32 md:pt-40">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_35%,black_30%,transparent_80%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(16,185,129,0.28),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -left-40 h-[28rem] w-[28rem] rounded-full bg-emerald-500/10 blur-3xl motion-safe:animate-[hero-drift_14s_ease-in-out_infinite]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/4 -right-40 h-[30rem] w-[30rem] rounded-full bg-sky-500/10 blur-3xl motion-safe:animate-[hero-drift_18s_ease-in-out_infinite_reverse]"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-slate-950" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 items-center gap-20 pb-16 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] lg:gap-12 lg:pb-24">
        <div className="text-center lg:text-left">
          <motion.div {...fadeUp(0)}>
            <Link
              href="/teklif-al"
              className="group inline-flex max-w-full items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.06] py-1 pr-3 pl-1 text-xs text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_0_30px_rgba(16,185,129,0.15)] backdrop-blur-xl transition hover:border-emerald-300/40 hover:bg-white/[0.09] sm:text-sm"
            >
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 px-2 py-1.5 text-[10px] font-bold tracking-wider text-slate-950 uppercase sm:px-2.5 sm:py-1 sm:text-[11px]">
                <span className="relative flex h-1.5 w-1.5" aria-hidden>
                  <span className="absolute inline-flex h-full w-full rounded-full bg-slate-950/60 motion-safe:animate-ping" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-slate-950" />
                </span>
                <span className="hidden sm:inline">{projectSlots > 0 ? t.hero.kickerTag : t.hero.kickerTagFull}</span>
              </span>
              <span className="truncate">{kicker}</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-emerald-300 transition group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </motion.div>

          <motion.h1
            {...fadeUp(0.08)}
            className="mt-7 text-[2.35rem] leading-[1.08] font-bold tracking-tight text-white sm:text-6xl lg:text-[3.6rem] xl:text-[4.1rem]"
          >
            <span className="sr-only">{t.hero.title}</span>
            <span aria-hidden>
              <span className="block text-balance">{t.hero.titleBefore}</span>
              <RotatingWords words={t.hero.titleWords} />
              <span className="block text-balance text-slate-200">{t.hero.titleAfter}</span>
            </span>
          </motion.h1>

          <motion.p
            {...fadeUp(0.16)}
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-pretty text-slate-300 md:text-lg lg:mx-0"
          >
            {t.hero.subtitle}
          </motion.p>

          <motion.ul
            {...fadeUp(0.22)}
            className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-slate-200 lg:justify-start"
          >
            {t.hero.bullets.map((bullet) => (
              <li key={bullet} className="inline-flex items-center gap-1.5">
                <CircleCheck className="h-4 w-4 text-emerald-400" aria-hidden />
                {bullet}
              </li>
            ))}
          </motion.ul>

          <motion.div
            {...fadeUp(0.3)}
            className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
          >
            <button
              type="button"
              onClick={() => scrollToId("calculator")}
              className="group relative inline-flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-[length:200%_100%] px-5 py-4 text-[15px] font-bold whitespace-nowrap sm:px-7 sm:text-base text-slate-950 shadow-[0_10px_40px_-8px_rgba(16,185,129,0.7)] ring-1 ring-white/30 transition-all duration-500 hover:[background-position:100%_0] hover:shadow-[0_14px_50px_-6px_rgba(45,212,191,0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:w-auto"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-20deg] bg-white/50 blur-md motion-safe:animate-[hero-shine_3.5s_ease-in-out_infinite]"
              />
              <span className="relative">{t.hero.cta}</span>
              <ArrowRight className="relative h-5 w-5 transition group-hover:translate-x-1" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => scrollToId("portfolio")}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 py-4 text-base font-semibold text-white backdrop-blur transition hover:border-white/30 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 sm:w-auto"
            >
              {t.hero.secondaryCta}
              <ArrowUpRight className="h-4 w-4 text-emerald-300 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
            </button>
          </motion.div>

          <motion.p
            {...fadeUp(0.36)}
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-slate-500"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500/80" aria-hidden />
            {t.hero.note}
          </motion.p>

          {projects.length > 0 && (
            <motion.div {...fadeUp(0.42)} className="mt-8 flex justify-center border-t border-white/10 pt-6 lg:justify-start">
              <SocialProof projects={projects} testimonials={testimonials} />
            </motion.div>
          )}
        </div>

        <div className="relative pt-6 lg:pt-0">
          <HeroVisual />
        </div>
      </div>

      <div className="relative z-10 -mx-6 mt-auto">
        <LogoMarquee projects={projects} />
      </div>
    </section>
  );
}
