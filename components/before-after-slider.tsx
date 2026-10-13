"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  BellRing,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ImageOff,
  Lock,
  MessageCircle,
  Search,
  Sofa,
  Star,
  TriangleAlert,
  Zap,
} from "lucide-react";
import { useI18n } from "@/components/language-provider";
import type { Dictionary } from "@/lib/translations";

type CompareCopy = Dictionary["compare"];

const REST = 50;
const INTRO = 90;
const HANDLE_SPRING = { stiffness: 980, damping: 58, mass: 0.18, restDelta: 0.001, restSpeed: 0.01 };

function moveToPercent(container: HTMLDivElement | null, clientX: number) {
  const bounds = container?.getBoundingClientRect();
  if (!bounds || bounds.width === 0) return null;
  const next = ((clientX - bounds.left) / bounds.width) * 100;
  return Math.min(100, Math.max(0, next));
}

function clamp(value: number) {
  return Math.min(100, Math.max(0, value));
}

export function BeforeAfterSlider() {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const frameRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<{ stop: () => void } | null>(null);
  const draggingRef = useRef(false);
  const [dragging, setDragging] = useState(false);
  const [touched, setTouched] = useState(false);
  const [announced, setAnnounced] = useState(REST);

  const position = useMotionValue(REST);
  const smooth = useSpring(position, HANDLE_SPRING);
  const clipPath = useTransform(smooth, (value) => `inset(0 ${100 - value}% 0 0)`);
  const left = useTransform(smooth, (value) => `${value}%`);

  const copyRef = useRef(t.compare);
  copyRef.current = t.compare;

  const writeAria = useCallback((value: number) => {
    const node = frameRef.current;
    if (!node) return;
    const rounded = Math.round(value);
    const { before, after } = copyRef.current;
    node.setAttribute("aria-valuenow", String(rounded));
    node.setAttribute("aria-valuetext", `${before} ${rounded}%, ${after} ${Math.round(100 - value)}%`);
  }, []);

  useLayoutEffect(() => {
    writeAria(smooth.get());
  });

  useMotionValueEvent(smooth, "change", (value) => {
    writeAria(value);
  });

  useLayoutEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    position.jump(INTRO);
    smooth.jump(INTRO);
    const controls = animate(position, REST, {
      type: "spring",
      stiffness: 52,
      damping: 14,
      mass: 0.9,
      delay: 0.5,
    });
    introRef.current = controls;
    return () => controls.stop();
  }, [position, smooth]);

  useEffect(() => {
    if (!dragging) return;
    const previous = document.body.style.cursor;
    document.body.style.cursor = "ew-resize";
    return () => {
      document.body.style.cursor = previous;
    };
  }, [dragging]);

  const pointTo = useCallback(
    (clientX: number, snap: boolean) => {
      const next = moveToPercent(frameRef.current, clientX);
      if (next === null) return;
      position.set(next);
      if (snap) smooth.jump(next);
    },
    [position, smooth],
  );

  const endDrag = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    setAnnounced(Math.round(position.get()));
  }, [position]);

  useEffect(() => {
    const stop = () => endDrag();
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, [endDrag]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    introRef.current?.stop();
    draggingRef.current = true;
    setDragging(true);
    setTouched(true);
    pointTo(event.clientX, true);
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // A cancelled pointer cannot be captured. Later move events still track the handle.
    }
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    pointTo(event.clientX, false);
  };

  const nudge = (delta: number) => {
    introRef.current?.stop();
    setTouched(true);
    const next = clamp(position.get() + delta);
    if (reduce) {
      position.jump(next);
      smooth.jump(next);
    } else {
      animate(position, next, { type: "spring", stiffness: 520, damping: 36, mass: 0.45 });
    }
    setAnnounced(Math.round(next));
  };

  const pulse = !reduce && !dragging;

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-10 -inset-y-12 -z-10 bg-[radial-gradient(ellipse_at_25%_50%,rgba(244,63,94,0.10),transparent_55%),radial-gradient(ellipse_at_75%_50%,rgba(16,185,129,0.18),transparent_55%)] blur-2xl"
      />
      <div
        ref={frameRef}
        role="slider"
        aria-label={t.compare.slider}
        aria-orientation="horizontal"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={announced}
        aria-valuetext={`${t.compare.before} ${announced}%, ${t.compare.after} ${100 - announced}%`}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onLostPointerCapture={endDrag}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            nudge(-5);
          } else if (event.key === "ArrowRight") {
            event.preventDefault();
            nudge(5);
          } else if (event.key === "Home") {
            event.preventDefault();
            nudge(-position.get());
          } else if (event.key === "End") {
            event.preventDefault();
            nudge(100 - position.get());
          }
        }}
        className="@container relative aspect-[4/5] w-full max-w-full cursor-ew-resize touch-none overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#05080d] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.85),0_0_0_1px_rgba(16,185,129,0.08)] select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 sm:aspect-[16/11] lg:aspect-[16/10]"
        style={{ touchAction: "none" }}
      >
        <AfterPane copy={t.compare.afterSite} label={t.compare.after} caption={t.compare.afterCaption} />

        <motion.div className="absolute inset-0 z-20 h-full w-full will-change-[clip-path]" style={{ clipPath }}>
          <BeforePane copy={t.compare.beforeSite} label={t.compare.before} caption={t.compare.beforeCaption} />
        </motion.div>

        <motion.div className="pointer-events-none absolute inset-y-0 z-30 w-0" style={{ left }}>
          <div aria-hidden className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black/35 to-transparent" />
          <motion.div
            aria-hidden
            className="absolute inset-y-0 left-0 w-14 -translate-x-1/2 bg-emerald-400/25 blur-2xl"
            animate={pulse ? { opacity: [0.3, 0.75, 0.3] } : { opacity: 0.45 }}
            transition={pulse ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
          />
          <div className="absolute inset-y-0 left-0 w-[2px] -translate-x-1/2 bg-gradient-to-b from-white/30 via-white to-white/30 shadow-[0_0_18px_2px_rgba(52,211,153,0.85)]" />
          <motion.div
            className="absolute top-1/2 left-0 flex h-12 w-12 items-center justify-center rounded-full border border-white/80 bg-slate-950/90 text-white shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_32px_rgba(16,185,129,0.6)] backdrop-blur-md"
            style={{ x: "-50%", y: "-50%" }}
            animate={pulse ? { scale: [1, 1.06, 1] } : { scale: dragging ? 1.08 : 1 }}
            transition={
              pulse ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" } : { type: "spring", stiffness: 420, damping: 28 }
            }
          >
            <motion.span
              aria-hidden
              className="absolute -inset-2 rounded-full bg-emerald-400/40 blur-md"
              animate={pulse ? { scale: [1, 1.6, 1], opacity: [0.3, 0.7, 0.3] } : { scale: 1, opacity: 0.2 }}
              transition={pulse ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
            />
            <ChevronLeft className="relative h-4 w-4" aria-hidden />
            <ChevronRight className="relative -ml-1.5 h-4 w-4" aria-hidden />
          </motion.div>
          <AnimatePresence>
            {!touched ? (
              <motion.span
                key="hint"
                className="absolute top-1/2 left-0 mt-9 rounded-full border border-white/15 bg-slate-950/85 px-2.5 py-1 text-[10px] font-semibold tracking-[0.2em] whitespace-nowrap text-white uppercase shadow-lg backdrop-blur-md"
                style={{ x: "-50%" }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ delay: 1.4, duration: 0.4 }}
              >
                ← {t.compare.hint} →
              </motion.span>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

export function CompareStats() {
  const { t } = useI18n();
  const reduce = useReducedMotion();

  return (
    <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
      {t.compare.stats.map((stat, index) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl"
        >
          <p className="text-[10px] font-semibold tracking-[0.16em] text-slate-400 uppercase sm:text-[11px]">{stat.label}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm text-rose-300/80 line-through decoration-rose-400/60">{stat.before}</span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-500" aria-hidden />
            <span className="text-lg font-semibold text-emerald-300 sm:text-xl">{stat.after}</span>
          </div>
          <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-[0_0_12px_rgba(16,185,129,0.6)]"
              initial={reduce ? false : { width: "0%" }}
              whileInView={{ width: `${stat.to}%` }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 1.4, delay: 0.25 + index * 0.12, ease: [0.22, 1, 0.36, 1] }}
            />
            <div className="absolute inset-y-0 left-0 rounded-full bg-rose-400/80" style={{ width: `${stat.from}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function BeforePane({ copy, label, caption }: { copy: CompareCopy["beforeSite"]; label: string; caption: string }) {
  const reduce = useReducedMotion();

  return (
    <div className="absolute inset-0 flex h-full w-full flex-col overflow-hidden bg-[#d9d3c7] font-['Times_New_Roman',Times,serif] text-[#3b3630]">
      <div className="flex shrink-0 items-center gap-2 border-b border-[#9c968c] bg-[#c4beb3] px-2.5 py-1.5 @2xl:px-4 @2xl:py-2">
        <div aria-hidden className="hidden gap-1 @md:flex">
          {[0, 1, 2].map((dot) => (
            <span key={dot} className="h-2.5 w-2.5 border border-[#8a847a] bg-[#d8d2c7]" />
          ))}
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-1.5 border border-[#8f897f] bg-[#ece7dd] px-2 py-0.5 shadow-[inset_1px_1px_0_#a39d93]">
          <TriangleAlert className="h-3 w-3 shrink-0 text-[#c62828]" aria-hidden />
          <span className="shrink-0 font-sans text-[9px] font-bold text-[#c62828] @2xl:text-[11px]">{copy.notSecure}</span>
          <span aria-hidden className="text-[#a39d93]">|</span>
          <span className="truncate font-sans text-[9px] text-[#5d574f] @2xl:text-[11px]">{copy.domain}</span>
        </div>
        <span
          aria-hidden
          className="h-3 w-3 shrink-0 rounded-full border-2 border-[#b1aaa2] border-t-[#6a645c] motion-safe:animate-[spin_1.7s_linear_infinite] motion-reduce:animate-none"
        />
      </div>

      <div className="flex shrink-0 items-center justify-between gap-2 bg-[#1f2a6b] px-2.5 py-1.5 @2xl:px-5 @2xl:py-2.5">
        <span className="truncate text-[12px] font-bold tracking-wide text-[#f5d000] italic [text-shadow:1px_1px_0_#000] @lg:text-base @2xl:text-xl">
          ★ {copy.brand} ★
        </span>
        <motion.span
          aria-hidden
          className="shrink-0 bg-[#e01b1b] px-1.5 font-sans text-[8px] font-black text-[#ffe14d] @2xl:text-[11px]"
          animate={reduce ? undefined : { opacity: [1, 1, 0, 0] }}
          transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
        >
          {copy.newBadge}
        </motion.span>
      </div>

      <div className="shrink-0 overflow-hidden border-y border-[#7d1d1d] bg-[#b3261e] py-0.5 text-[9px] font-bold whitespace-nowrap text-[#ffe14d] @2xl:text-xs">
        <motion.div
          className="inline-flex"
          animate={reduce ? undefined : { x: ["0%", "-50%"] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        >
          <span className="px-4">{copy.marquee}</span>
          <span className="px-4">{copy.marquee}</span>
        </motion.div>
      </div>

      <nav className="flex shrink-0 flex-wrap items-center gap-x-1.5 border-b border-[#b9b2a6] bg-[#e4dfd4] px-2.5 py-1 text-[9px] @2xl:px-5 @2xl:text-[13px]">
        {copy.menu.map((item, index) => (
          <span key={item} className="flex items-center gap-1.5">
            <span className="text-[#1a0dab] underline underline-offset-2">{item}</span>
            {index < copy.menu.length - 1 ? <span className="text-[#8a847a]">|</span> : null}
          </span>
        ))}
      </nav>

      <div className="grid min-h-0 flex-1 grid-cols-2 gap-3 px-3 py-3 @2xl:gap-8 @2xl:px-8 @2xl:py-6">
        <div className="relative flex flex-col justify-center">
          <p className="text-[clamp(1.15rem,6.2cqw,3.4rem)] leading-none text-[#4a443d]">{copy.welcome}</p>
          <div aria-hidden className="mt-2 h-[3px] w-3/4 border-y border-t-[#8a847a] border-b-[#f4f0e8] @2xl:mt-3" />
          <p className="mt-2 text-[clamp(9px,1.7cqw,15px)] leading-snug text-[#6a645b] @2xl:mt-3">{copy.body}</p>
          <span className="mt-3 self-start border-2 border-t-[#f4f0e8] border-r-[#6f695f] border-b-[#6f695f] border-l-[#f4f0e8] bg-[#c9c3b8] px-2 py-0.5 text-[clamp(9px,1.4cqw,13px)] text-[#2f2a24] @2xl:mt-4">
            {copy.button}
          </span>
        </div>
        <div className="flex items-center justify-center">
          <div className="flex aspect-[4/3] w-full max-w-[88%] flex-col items-center justify-center gap-1 border border-dashed border-[#9d968a] bg-[#cdc7bb]">
            <ImageOff className="h-4 w-4 text-[#8d877e] @2xl:h-7 @2xl:w-7" aria-hidden />
            <span className="font-sans text-[8px] text-[#857e73] @2xl:text-[11px]">urun_foto1.JPG</span>
          </div>
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-3 gap-1.5 px-3 pb-11 @2xl:gap-3 @2xl:px-8 @2xl:pb-16">
        <div className="flex items-center justify-center bg-[repeating-linear-gradient(-45deg,#f5c400_0_7px,#1c1c1c_7px_14px)] p-[3px]">
          <span className="w-full bg-[#f5c400] px-1 py-1 text-center font-sans text-[7px] leading-tight font-black text-[#1c1c1c] uppercase @lg:text-[9px] @2xl:py-2 @2xl:text-xs">
            {copy.construction}
          </span>
        </div>
        <div className="flex items-center justify-center border-2 border-[#6f695f] bg-black px-1 py-1 text-center font-mono text-[7px] leading-tight text-[#39ff14] @lg:text-[9px] @2xl:text-xs">
          {copy.counter}
        </div>
        <div className="flex items-center justify-center border-2 border-t-[#f4f0e8] border-r-[#6f695f] border-b-[#6f695f] border-l-[#f4f0e8] bg-[#cfc9be] px-1 py-1 text-center text-[7px] leading-tight text-[#6a645b] italic @lg:text-[9px] @2xl:text-xs">
          {copy.updated}
        </div>
      </div>

      <div className="pointer-events-none absolute top-[31%] left-[3%] z-10 flex flex-col items-start gap-1.5 font-sans @2xl:top-[27%] @2xl:gap-2">
        {copy.flags.map((flag, index) => (
          <span
            key={flag}
            className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-2 py-0.5 text-[8px] font-semibold whitespace-nowrap text-white shadow-[0_6px_16px_-4px_rgba(225,29,72,0.7)] ring-1 ring-white/30 @2xl:text-[11px]"
            style={{ rotate: `${index % 2 === 0 ? -3 : 2}deg`, marginLeft: `${index * 6}%` }}
          >
            <TriangleAlert className="h-2.5 w-2.5 @2xl:h-3 @2xl:w-3" aria-hidden />
            {flag}
          </span>
        ))}
      </div>

      <span className="absolute bottom-3 left-3 z-20 inline-flex items-center gap-2 rounded-full bg-stone-900/85 px-2.5 py-1 font-sans text-[9px] font-semibold tracking-[0.16em] text-stone-100 uppercase shadow-lg ring-1 ring-white/10 @2xl:bottom-4 @2xl:left-4 @2xl:px-3.5 @2xl:py-1.5 @2xl:text-[11px]">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" aria-hidden />
        {label}
        <span className="hidden font-normal tracking-normal text-stone-400 normal-case @lg:inline">· {caption}</span>
      </span>
    </div>
  );
}

function AfterPane({ copy, label, caption }: { copy: CompareCopy["afterSite"]; label: string; caption: string }) {
  const reduce = useReducedMotion();
  const featureIcons = [Clock3, Search, Zap];

  return (
    <div className="absolute inset-0 flex h-full w-full flex-col overflow-hidden bg-[#05080d] text-slate-100">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(16,185,129,0.28),transparent_38%),radial-gradient(circle_at_20%_75%,rgba(34,211,238,0.14),transparent_42%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.07)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]"
      />

      <div className="relative flex shrink-0 items-center gap-2 border-b border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 @2xl:px-4 @2xl:py-2">
        <div aria-hidden className="hidden gap-1.5 @md:flex">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        </div>
        <div className="mx-auto flex min-w-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-0.5">
          <Lock className="h-3 w-3 shrink-0 text-emerald-400" aria-hidden />
          <span className="truncate text-[9px] text-slate-300 @2xl:text-[11px]">{copy.domain}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <ScoreRing value={98} />
          <span className="hidden text-[9px] font-medium text-slate-400 @lg:inline @2xl:text-[11px]">{copy.score}</span>
        </div>
      </div>

      <div className="relative flex shrink-0 items-center justify-between gap-2 px-3 py-2 @2xl:px-8 @2xl:py-3.5">
        <span className="flex items-center gap-1.5 @2xl:gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-[0_0_14px_rgba(16,185,129,0.5)] @2xl:h-7 @2xl:w-7 @2xl:rounded-lg">
            <Sofa className="h-3 w-3 text-slate-950 @2xl:h-4 @2xl:w-4" aria-hidden />
          </span>
          <span className="text-[11px] font-semibold tracking-tight text-white @2xl:text-base">{copy.brand}</span>
        </span>
        <span className="hidden items-center gap-4 text-[11px] text-slate-400 @xl:flex @2xl:gap-6 @2xl:text-[13px]">
          {copy.nav.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </span>
        <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-[9px] font-semibold whitespace-nowrap text-slate-950 shadow-[0_0_18px_rgba(16,185,129,0.45)] @2xl:px-4 @2xl:py-1.5 @2xl:text-xs">
          {copy.cta}
        </span>
      </div>

      <div className="relative grid min-h-0 flex-1 grid-cols-2 gap-3 px-3 py-2 @2xl:gap-8 @2xl:px-8 @2xl:py-4">
        <div className="relative flex items-center justify-center">
          <div className="relative aspect-[4/3] w-full max-w-[92%] overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-emerald-400/25 via-slate-900 to-cyan-500/15 shadow-[0_24px_60px_-20px_rgba(16,185,129,0.45)] @2xl:rounded-2xl">
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />
            <div aria-hidden className="absolute top-1/2 left-1/2 h-2/3 w-2/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/25 blur-2xl" />
            <Sofa
              className="absolute top-1/2 left-1/2 h-[45%] w-[45%] -translate-x-1/2 -translate-y-1/2 text-emerald-100 drop-shadow-[0_0_24px_rgba(16,185,129,0.8)]"
              strokeWidth={1.25}
              aria-hidden
            />
            <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/50 px-1.5 py-0.5 text-[8px] font-medium text-white backdrop-blur @2xl:top-3 @2xl:right-3 @2xl:px-2.5 @2xl:py-1 @2xl:text-[11px]">
              <Star className="h-2.5 w-2.5 fill-amber-300 text-amber-300 @2xl:h-3 @2xl:w-3" aria-hidden />
              {copy.rating}
            </span>
          </div>
          <motion.div
            className="absolute right-0 bottom-[6%] flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-950/90 px-2 py-1 shadow-[0_12px_30px_-8px_rgba(0,0,0,0.7)] backdrop-blur-md @2xl:right-[-4%] @2xl:gap-2.5 @2xl:rounded-xl @2xl:px-3 @2xl:py-2"
            animate={reduce ? undefined : { y: [0, -5, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 @2xl:h-7 @2xl:w-7">
              <BellRing className="h-2.5 w-2.5 text-emerald-300 @2xl:h-3.5 @2xl:w-3.5" aria-hidden />
            </span>
            <span className="leading-tight">
              <span className="block text-[8px] font-semibold text-white @2xl:text-xs">{copy.notification}</span>
              <span className="block text-[7px] text-slate-400 @2xl:text-[10px]">{copy.notificationTime}</span>
            </span>
          </motion.div>
        </div>

        <div className="relative flex flex-col justify-center">
          <span className="inline-flex items-center gap-1.5 self-start rounded-full border border-emerald-300/25 bg-emerald-400/10 px-2 py-0.5 text-[8px] font-medium tracking-[0.14em] text-emerald-200 uppercase @2xl:px-3 @2xl:py-1 @2xl:text-[11px]">
            <span className="relative flex h-1.5 w-1.5" aria-hidden>
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/70 motion-safe:animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            {copy.kicker}
          </span>
          <p className="mt-2 bg-gradient-to-br from-white via-emerald-50 to-emerald-300 bg-clip-text text-[clamp(0.95rem,4.1cqw,2.6rem)] leading-[1.08] font-semibold tracking-tight text-balance text-transparent @2xl:mt-4">
            {copy.title}
          </p>
          <p className="mt-2 text-[clamp(9px,1.6cqw,15px)] leading-snug text-slate-400 @2xl:mt-3">{copy.body}</p>
          <div className="mt-3 flex flex-wrap items-center gap-1.5 @2xl:mt-5 @2xl:gap-2.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[9px] font-semibold text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.5)] @2xl:px-4 @2xl:py-2 @2xl:text-xs">
              {copy.cta}
              <ArrowRight className="h-2.5 w-2.5 @2xl:h-3.5 @2xl:w-3.5" aria-hidden />
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[9px] font-medium text-white @2xl:px-4 @2xl:py-2 @2xl:text-xs">
              <MessageCircle className="h-2.5 w-2.5 text-emerald-300 @2xl:h-3.5 @2xl:w-3.5" aria-hidden />
              {copy.secondary}
            </span>
          </div>
        </div>
      </div>

      <div className="relative grid shrink-0 grid-cols-3 gap-1.5 px-3 pb-11 @2xl:gap-3 @2xl:px-8 @2xl:pb-16">
        {copy.features.map((feature, index) => {
          const Icon = featureIcons[index] ?? Zap;
          return (
            <div
              key={feature}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-1.5 py-1.5 backdrop-blur @2xl:gap-2.5 @2xl:rounded-xl @2xl:px-3 @2xl:py-2.5"
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-md bg-emerald-400/15 @2xl:h-7 @2xl:w-7 @2xl:rounded-lg">
                <Icon className="h-2.5 w-2.5 text-emerald-300 @2xl:h-3.5 @2xl:w-3.5" aria-hidden />
              </span>
              <span className="text-[7px] leading-tight font-medium text-slate-200 @lg:text-[9px] @2xl:text-xs">{feature}</span>
            </div>
          );
        })}
      </div>

      <span className="absolute right-3 bottom-3 z-20 inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[9px] font-semibold tracking-[0.16em] text-emerald-100 uppercase shadow-[0_0_18px_rgba(16,185,129,0.3)] ring-1 ring-emerald-300/40 backdrop-blur @2xl:right-4 @2xl:bottom-4 @2xl:px-3.5 @2xl:py-1.5 @2xl:text-[11px]">
        <span className="hidden font-normal tracking-normal text-emerald-200/70 normal-case @lg:inline">{caption} ·</span>
        {label}
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" aria-hidden />
      </span>
    </div>
  );
}

function ScoreRing({ value }: { value: number }) {
  const radius = 9;
  const circumference = 2 * Math.PI * radius;
  return (
    <span className="relative flex h-5 w-5 items-center justify-center @2xl:h-6 @2xl:w-6">
      <svg viewBox="0 0 24 24" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
        <circle cx="12" cy="12" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2.5" />
        <circle
          cx="12"
          cy="12"
          r={radius}
          fill="none"
          stroke="#34d399"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - value / 100)}
        />
      </svg>
      <span className="relative text-[7px] font-bold text-emerald-300 @2xl:text-[8px]">{value}</span>
    </span>
  );
}
