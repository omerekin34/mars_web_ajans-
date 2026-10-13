"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/components/language-provider";
import { MarsLogo } from "@/components/MarsLogo";
import { scrollToId, scrollToTop } from "@/lib/scroll";

const links = [
  { id: "why", key: "why" },
  { id: "cozumler", key: "problem" },
  { id: "process", key: "process" },
  { id: "portfolio", key: "portfolio" },
  { id: "packages", key: "packages" },
  { id: "calculator", key: "calculator" },
  { id: "faq", key: "faq" },
] as const;

type LinkId = (typeof links)[number]["id"];

const quoteButtonClass =
  "group relative hidden items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-[length:200%_100%] px-4 py-2 text-xs font-bold text-slate-950 shadow-[0_6px_24px_-6px_rgba(16,185,129,0.8)] ring-1 ring-white/30 transition-all duration-500 hover:[background-position:100%_0] hover:shadow-[0_8px_30px_-4px_rgba(45,212,191,0.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 md:inline-flex xl:px-5 xl:text-sm";

const linkClassName =
  "relative whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/80";

export function Navbar() {
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<LinkId | null>(null);
  const [activeId, setActiveId] = useState<LinkId | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 160, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1280px)");
    const onChange = () => {
      if (media.matches) setOpen(false);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (pathname !== "/") {
      setActiveId(null);
      return;
    }

    let frame = 0;
    const update = () => {
      const marker = window.scrollY + 180;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      let current: LinkId | null = null;
      for (const link of links) {
        const el = document.getElementById(link.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top + window.scrollY;
        if (top <= marker) current = link.id;
      }
      if (atBottom) {
        for (let index = links.length - 1; index >= 0; index -= 1) {
          if (document.getElementById(links[index].id)) {
            current = links[index].id;
            break;
          }
        }
      }
      setActiveId((previous) => (previous === current ? previous : current));
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("hashchange", onScroll);
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("hashchange", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  const go = (id: string) => {
    setOpen(false);
    setHovered(null);
    if (pathname === "/") {
      scrollToId(id);
      return;
    }
    router.push(`/#${id}`);
  };

  const onLinkClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    go(id);
  };

  return (
    <>
      <a
        href="#icerik"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:text-slate-950"
      >
        {t.nav.skip}
      </a>

      <header
        className={`fixed left-1/2 z-50 flex w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-4 rounded-full border backdrop-blur-xl transition-all duration-500 sm:gap-6 ${
          scrolled
            ? "top-3 border-white/10 bg-slate-950/75 px-3 py-2 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(16,185,129,0.08)] sm:px-4"
            : "top-6 border-white/[0.08] bg-slate-900/40 px-4 py-2.5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] sm:px-5 sm:py-3"
        }`}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-10 -top-px h-px bg-gradient-to-r from-transparent via-emerald-300/70 to-transparent"
        />
        {!reduce ? (
          <span aria-hidden className="pointer-events-none absolute inset-x-6 -bottom-px h-px overflow-hidden">
            <motion.span
              className="block h-full origin-left bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400"
              style={{ scaleX: progress }}
            />
          </span>
        ) : null}
        <Link
          href="/"
          scroll
          className="inline-flex shrink-0 items-center"
          aria-label="Mars Web Ajans"
          onClick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
            event.preventDefault();
            setOpen(false);
            document.body.style.overflow = "";

            if (window.location.hash) {
              window.history.replaceState(window.history.state, "", pathname === "/" ? "/" : window.location.pathname);
            }

            if (pathname === "/") {
              scrollToTop();
              return;
            }

            scrollToTop();
            router.push("/");
            window.setTimeout(scrollToTop, 0);
            window.setTimeout(scrollToTop, 120);
          }}
        >
          <MarsLogo wordmarkClassName="max-[380px]:sr-only" />
        </Link>

        <nav
          aria-label="Mars Web Ajans"
          onMouseLeave={() => setHovered(null)}
          className="hidden shrink-0 items-center gap-0.5 xl:flex"
        >
          {links.map((link) => {
            const active = activeId === link.id;
            return (
              <a
                key={link.id}
                href={`/#${link.id}`}
                aria-current={active ? "location" : undefined}
                onMouseEnter={() => setHovered(link.id)}
                onFocus={() => setHovered(link.id)}
                onBlur={() => setHovered((current) => (current === link.id ? null : current))}
                onClick={(event) => onLinkClick(event, link.id)}
                className={`${linkClassName} ${active ? "text-white" : ""}`}
              >
                {hovered === link.id ? (
                  <motion.span
                    layoutId="navHover"
                    className="absolute inset-0 rounded-full bg-white/[0.07] ring-1 ring-white/10"
                    style={{ borderRadius: 9999 }}
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                ) : null}
                {active ? (
                  <motion.span
                    layoutId="navActive"
                    className="absolute -bottom-0.5 left-1/2 h-1 w-4 -translate-x-1/2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                ) : null}
                <span className="relative z-10">{t.nav[link.key]}</span>
              </a>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          <Link href="/teklif-al" className={quoteButtonClass} onClick={() => setOpen(false)}>
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-20deg] bg-white/50 blur-md motion-safe:animate-[hero-shine_4s_ease-in-out_infinite]"
            />
            <span className="relative">{t.nav.quote}</span>
            <ArrowRight className="relative h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden />
          </Link>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-200 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 xl:hidden"
            aria-expanded={open}
            aria-label={open ? t.nav.close : t.nav.menu}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              aria-label={t.nav.close}
              className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] xl:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.nav
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className={`fixed left-1/2 z-50 w-[min(100%-2rem,22rem)] origin-top -translate-x-1/2 rounded-3xl border border-white/10 bg-slate-950/85 p-2 shadow-2xl backdrop-blur-xl xl:hidden ${
                scrolled ? "top-[5.25rem]" : "top-[6.5rem]"
              }`}
              aria-label="Mars Web Ajans"
            >
              <div className="flex flex-col">
                {links.map((link) => {
                  const active = activeId === link.id;
                  return (
                    <a
                      key={link.id}
                      href={`/#${link.id}`}
                      aria-current={active ? "location" : undefined}
                      onClick={(event) => onLinkClick(event, link.id)}
                      className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition-colors hover:bg-white/[0.06] hover:text-white ${
                        active ? "bg-emerald-400/10 text-emerald-300" : "text-slate-300"
                      }`}
                    >
                      {t.nav[link.key]}
                      {active ? <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" /> : null}
                    </a>
                  );
                })}
                <Link
                  href="/teklif-al"
                  onClick={() => setOpen(false)}
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-300 px-4 py-3 text-sm font-bold text-slate-950 md:hidden"
                >
                  {t.nav.quote}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </motion.nav>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
