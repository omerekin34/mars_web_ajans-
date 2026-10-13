"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronRight, Clock, FileText, Headphones, Mail, MessageCircle, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useI18n } from "@/components/language-provider";
import { useSiteSettings } from "@/components/site-settings-provider";
import { scrollToId } from "@/lib/scroll";
import { whatsAppUrl } from "@/lib/whatsapp";

function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="currentColor">
      <path d="M20.5 3.5A11 11 0 0 0 2.1 17.8L1 23l5.3-1.1A11 11 0 0 0 12 23a11 11 0 0 0 8.5-19.5ZM12 21a9 9 0 0 1-4.6-1.3l-.3-.2-3.1.7.7-3-.2-.3A9 9 0 1 1 12 21Zm5-6.7c-.3-.1-1.6-.8-1.8-.9s-.4-.1-.6.1-.7.9-.8 1-.3.2-.6.1a7.4 7.4 0 0 1-2.2-1.4 8.2 8.2 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.6l.4-.5.2-.3a.5.5 0 0 0 0-.5c0-.1-.6-1.4-.8-1.9s-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.8 11.8 0 0 0 4.6 4.1 15 15 0 0 0 1.5.6 3.6 3.6 0 0 0 1.7.1 2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .2-1.2c-.1-.2-.3-.3-.6-.4Z" />
    </svg>
  );
}

export function LiveSupport() {
  const { t } = useI18n();
  const settings = useSiteSettings();
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const onQuote = pathname === "/teklif-al";
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const goToContact = () => {
    setOpen(false);
    scrollToId("iletisim");
  };

  return (
    <div
      ref={rootRef}
      className={`fixed right-4 z-50 flex flex-col items-end gap-3 md:right-6 ${onQuote ? "bottom-8" : "bottom-24 md:bottom-8"}`}
    >
      <AnimatePresence>
        {open ? (
          <motion.div
            id={panelId}
            role="dialog"
            aria-modal="false"
            aria-labelledby={titleId}
            initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-[20rem] max-w-[calc(100vw-2rem)] origin-bottom-right overflow-hidden rounded-3xl border border-white/10 bg-slate-950/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_30px_80px_-20px_rgba(0,0,0,0.85)] backdrop-blur-2xl"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl"
            />

            <div className="relative p-5 pb-4">
              <div className="flex items-start gap-3">
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-500/15 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
                  <Headphones className="h-5 w-5" aria-hidden />
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 id={titleId} className="text-base font-semibold leading-tight text-white">
                    {t.support.title}
                  </h2>
                  <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-emerald-300">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:animate-none" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    </span>
                    {t.support.status}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={t.support.close}
                  className="-mr-1 -mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-400">{t.support.description}</p>
            </div>

            <div className="relative flex flex-col gap-2 px-4 pb-4">
              {settings.whatsappDigits ? (
                <a
                  href={whatsAppUrl(t.whatsapp.message, settings.whatsappDigits)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex w-full items-center gap-3 rounded-2xl border border-emerald-400/25 bg-gradient-to-r from-emerald-500/15 to-emerald-500/[0.04] p-3 transition hover:border-emerald-400/45 hover:from-emerald-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-[0_6px_18px_rgba(16,185,129,0.4)]">
                    <WhatsAppGlyph />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-white">{t.support.whatsapp}</span>
                    <span className="block text-xs text-emerald-200/70">{t.support.whatsappHint}</span>
                  </span>
                  <ChevronRight
                    className="h-4 w-4 shrink-0 text-emerald-300/70 transition group-hover:translate-x-0.5 group-hover:text-emerald-200"
                    aria-hidden
                  />
                </a>
              ) : null}
              {settings.email ? (
                <a
                  href={`mailto:${settings.email}`}
                  className="group flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 transition hover:border-white/20 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-200">
                    <Mail className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-white">{t.support.email}</span>
                    <span className="block truncate text-xs text-slate-400">{settings.email}</span>
                  </span>
                  <ChevronRight
                    className="h-4 w-4 shrink-0 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-slate-300"
                    aria-hidden
                  />
                </a>
              ) : null}
              <button
                type="button"
                onClick={goToContact}
                className="group flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-left transition hover:border-white/20 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-200">
                  <FileText className="h-4 w-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-white">{t.support.contact}</span>
                  <span className="block text-xs text-slate-400">{t.support.contactHint}</span>
                </span>
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-slate-300"
                  aria-hidden
                />
              </button>
            </div>

            <div className="relative flex items-center gap-2 border-t border-white/5 bg-white/[0.02] px-5 py-3 text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {t.support.responseTime}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="relative">
        {!open ? (
          <span
            aria-hidden
            className="animate-support-breathe pointer-events-none absolute -inset-1 -z-10 rounded-full bg-emerald-400/30 blur-md motion-reduce:animate-none"
          />
        ) : null}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? t.support.close : t.support.open}
          className="relative inline-flex items-center gap-3 rounded-full border border-white/10 bg-slate-900/85 p-1.5 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_32px_-10px_rgba(16,185,129,0.55)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-emerald-400/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60 motion-reduce:transition-none motion-reduce:hover:translate-y-0 md:pr-5"
        >
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_6px_18px_rgba(16,185,129,0.45)]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={open ? "close" : "open"}
                initial={reduceMotion ? false : { opacity: 0, rotate: -45, scale: 0.7 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, rotate: 45, scale: 0.7 }}
                transition={{ duration: 0.18 }}
                className="flex"
              >
                {open ? <X className="h-5 w-5" aria-hidden /> : <MessageCircle className="h-5 w-5" aria-hidden />}
              </motion.span>
            </AnimatePresence>
            {!open ? (
              <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-emerald-300 ring-2 ring-slate-900" />
            ) : null}
          </span>
          <span className="hidden whitespace-nowrap md:inline">{t.support.title}</span>
        </button>
      </div>
    </div>
  );
}
