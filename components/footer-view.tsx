"use client";

import { ArrowRight, ArrowUp, createLucideIcon, Mail, MapPin, Phone, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/components/language-provider";
import { MarsLogo } from "@/components/MarsLogo";
import { slotsText } from "@/lib/format";
import { localizedText } from "@/lib/localized";
import type { SiteSettings } from "@/lib/public-content";
import { scrollToId, scrollToTopSmooth } from "@/lib/scroll";
import { whatsAppUrl } from "@/lib/whatsapp";

const Instagram = createLucideIcon("Instagram", [
  ["rect", { width: "20", height: "20", x: "2", y: "2", rx: "5", ry: "5", key: "ig-frame" }],
  ["path", { d: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z", key: "ig-lens" }],
  ["line", { x1: "17.5", x2: "17.51", y1: "6.5", y2: "6.5", key: "ig-dot" }],
]);

const Linkedin = createLucideIcon("Linkedin", [
  ["path", { d: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z", key: "in-mark" }],
  ["rect", { width: "4", height: "12", x: "2", y: "9", key: "in-bar" }],
  ["circle", { cx: "4", cy: "4", r: "2", key: "in-dot" }],
]);

const XLogo = createLucideIcon("XLogo", [
  [
    "path",
    {
      d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
      fill: "currentColor",
      stroke: "none",
      key: "x-mark",
    },
  ],
]);

function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="currentColor">
      <path d="M20.5 3.5A11 11 0 0 0 2.1 17.8L1 23l5.3-1.1A11 11 0 0 0 12 23a11 11 0 0 0 8.5-19.5ZM12 21a9 9 0 0 1-4.6-1.3l-.3-.2-3.1.7.7-3-.2-.3A9 9 0 1 1 12 21Zm5-6.7c-.3-.1-1.6-.8-1.8-.9s-.4-.1-.6.1-.7.9-.8 1-.3.2-.6.1a7.4 7.4 0 0 1-2.2-1.4 8.2 8.2 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.6l.4-.5.2-.3a.5.5 0 0 0 0-.5c0-.1-.6-1.4-.8-1.9s-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.8 11.8 0 0 0 4.6 4.1 15 15 0 0 0 1.5.6 3.6 3.6 0 0 0 1.7.1 2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .2-1.2c-.1-.2-.3-.3-.6-.4Z" />
    </svg>
  );
}

const companyLinks = [
  { key: "home", href: "/", id: "" },
  { key: "why", href: "/#why", id: "why" },
  { key: "process", href: "/#process", id: "process" },
  { key: "portfolio", href: "/#portfolio", id: "portfolio" },
  { key: "faq", href: "/#faq", id: "faq" },
] as const;

const serviceLinks = [
  { key: "corporate", href: "/#packages", id: "packages" },
  { key: "commerce", href: "/#packages", id: "packages" },
  { key: "landing", href: "/#packages", id: "packages" },
  { key: "automation", href: "/#packages", id: "packages" },
] as const;

const legalLinks = [
  { key: "kvkk", href: "/kvkk" },
  { key: "privacy", href: "/gizlilik-politikasi" },
  { key: "cookies", href: "/cerez-politikasi" },
] as const;

const linkClass =
  "group inline-flex items-center text-sm text-slate-400 transition-colors duration-200 hover:text-white focus-visible:text-white focus-visible:outline-none";

const columnHeadingClass = "text-[11px] font-semibold tracking-[0.2em] text-emerald-300/80 uppercase";

function LinkContent({ children }: { children: React.ReactNode }) {
  return (
    <>
      <span
        aria-hidden
        className="h-px w-0 bg-gradient-to-r from-emerald-400 to-teal-300 transition-all duration-300 group-hover:mr-2 group-hover:w-3 group-focus-visible:mr-2 group-focus-visible:w-3"
      />
      {children}
    </>
  );
}

function FooterAnchor({
  href,
  id,
  children,
}: {
  href: string;
  id: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (!id) {
    return (
      <Link href={href} className={linkClass}>
        <LinkContent>{children}</LinkContent>
      </Link>
    );
  }

  return (
    <a
      href={href}
      className={linkClass}
      onClick={(event) => {
        if (pathname !== "/") return;
        event.preventDefault();
        scrollToId(id);
      }}
    >
      <LinkContent>{children}</LinkContent>
    </a>
  );
}

function ContactItem({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
}) {
  const body = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-emerald-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-colors group-hover:border-emerald-300/40 group-hover:bg-emerald-400/10">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] font-medium tracking-[0.16em] text-slate-500 uppercase">{label}</span>
        <span className="mt-0.5 block truncate text-sm font-medium text-slate-200 transition-colors group-hover:text-white">
          {value}
        </span>
      </span>
    </>
  );

  if (!href) return <div className="group flex items-center gap-3">{body}</div>;

  return (
    <a href={href} className="group flex items-center gap-3 focus-visible:outline-none">
      {body}
    </a>
  );
}

function FooterCta({ settings }: { settings: SiteSettings }) {
  const { t } = useI18n();
  const slots = slotsText(settings.projectSlots, {
    many: t.footer.slots,
    one: t.footer.slotsOne,
    full: t.footer.slotsFull,
  });
  const whatsapp = whatsAppUrl(t.whatsapp.message, settings.whatsappDigits);

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950 p-8 shadow-[0_40px_120px_-30px_rgba(16,185,129,0.35),inset_0_1px_0_rgba(255,255,255,0.1)] sm:p-10 lg:p-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_80%_80%_at_80%_50%,black_20%,transparent_75%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl"
      />

      <div aria-hidden className="pointer-events-none absolute top-1/2 -right-28 hidden -translate-y-1/2 md:block lg:-right-16">
        <div className="relative h-80 w-80">
          <div className="absolute inset-0 rounded-full border border-emerald-300/15 [transform:rotateX(70deg)_rotateZ(-20deg)] motion-safe:animate-[spin_40s_linear_infinite]" />
          <div className="absolute inset-10 rounded-full bg-[radial-gradient(circle_at_30%_30%,#5eead4_0%,#10b981_35%,#065f46_70%,#022c22_100%)] opacity-60 shadow-[0_0_80px_rgba(16,185,129,0.45),inset_-20px_-20px_50px_rgba(2,6,23,0.75)]" />
          <div className="absolute inset-10 rounded-full bg-[radial-gradient(circle_at_70%_65%,rgba(2,6,23,0.35)_0_8%,transparent_9%),radial-gradient(circle_at_45%_70%,rgba(2,6,23,0.25)_0_5%,transparent_6%),radial-gradient(circle_at_60%_35%,rgba(2,6,23,0.2)_0_4%,transparent_5%)]" />
          <div className="absolute -inset-6 rounded-full border border-dashed border-sky-300/10 motion-safe:animate-[spin_60s_linear_infinite_reverse]">
            <span className="absolute top-1/2 -left-1 h-2 w-2 -translate-y-1/2 rounded-full bg-sky-300 shadow-[0_0_12px_rgba(125,211,252,0.9)]" />
          </div>
        </div>
      </div>

      <div className="relative max-w-xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
          <span className="relative flex h-1.5 w-1.5" aria-hidden>
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 motion-safe:animate-ping" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          {slots}
        </span>

        <h2 className="mt-5 text-3xl leading-tight font-bold tracking-tight text-balance text-white sm:text-4xl lg:text-5xl">
          {t.footer.ctaTitleBefore}{" "}
          <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-sky-300 bg-clip-text text-transparent">
            {t.footer.ctaTitleHighlight}
          </span>
        </h2>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-pretty text-slate-300">{t.footer.ctaText}</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/teklif-al"
            className="group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-[length:200%_100%] px-7 py-3.5 text-[15px] font-bold whitespace-nowrap text-slate-950 shadow-[0_10px_40px_-8px_rgba(16,185,129,0.7)] ring-1 ring-white/30 transition-all duration-500 hover:[background-position:100%_0] hover:shadow-[0_14px_50px_-6px_rgba(45,212,191,0.8)] focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-20deg] bg-white/50 blur-md motion-safe:animate-[hero-shine_3.5s_ease-in-out_infinite]"
            />
            <span className="relative">{t.footer.ctaPrimary}</span>
            <ArrowRight className="relative h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
          </Link>
          {whatsapp ? (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3.5 text-[15px] font-semibold whitespace-nowrap text-white backdrop-blur transition hover:border-green-400/40 hover:bg-green-500/10 hover:text-green-300 focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:outline-none"
            >
              <WhatsAppGlyph />
              {t.footer.ctaWhatsapp}
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function FooterView({ settings }: { settings: SiteSettings }) {
  const { locale, t } = useI18n();
  const address = localizedText(locale, settings.address, settings.addressEn);
  const footerCopy = localizedText(locale, settings.footerText, settings.footerTextEn) || t.footer.tagline;
  const socialLinks: { href: string; label: string; icon: LucideIcon }[] = [
    { href: settings.social.instagram, label: "Instagram", icon: Instagram },
    { href: settings.social.linkedin, label: "LinkedIn", icon: Linkedin },
    { href: settings.social.x, label: "X", icon: XLogo },
  ].filter((item) => item.href.trim());

  return (
    <footer
      id="iletisim"
      className="relative scroll-mt-24 overflow-hidden bg-slate-950 px-6 pt-20 pb-36 md:pt-28 md:pb-24"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_100%,black_20%,transparent_75%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-48 left-1/2 h-[30rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(16,185,129,0.18),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -right-40 h-[26rem] w-[26rem] rounded-full bg-sky-500/[0.07] blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl">
        <FooterCta settings={settings} />

        <div className="mt-20 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-4">
            <Link href="/" aria-label="Mars Web Ajans" className="inline-flex focus-visible:outline-none">
              {settings.footerLogoUrl ? (
                <img
                  src={settings.footerLogoUrl}
                  alt="Mars Web Ajans"
                  width={220}
                  height={40}
                  className="h-10 w-auto max-w-[220px] object-contain object-left"
                />
              ) : (
                <MarsLogo wordmarkClassName="text-base" />
              )}
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-slate-400">{footerCopy}</p>
            {socialLinks.length > 0 ? (
              <ul className="mt-6 flex items-center gap-2.5" aria-label={t.footer.social}>
                {socialLinks.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={item.label}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition duration-300 hover:-translate-y-0.5 hover:border-emerald-300/40 hover:bg-emerald-400/10 hover:text-emerald-300 hover:shadow-[0_8px_24px_-6px_rgba(16,185,129,0.5)] focus-visible:border-emerald-300/60 focus-visible:text-emerald-300 focus-visible:outline-none"
                    >
                      <item.icon className="h-4 w-4" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <nav aria-label={t.footer.company} className="lg:col-span-2">
            <h2 className={columnHeadingClass}>{t.footer.company}</h2>
            <ul className="mt-5 space-y-3">
              {companyLinks.map((item) => (
                <li key={item.key}>
                  <FooterAnchor href={item.href} id={item.id}>
                    {t.footer.links[item.key]}
                  </FooterAnchor>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t.footer.services} className="lg:col-span-3">
            <h2 className={columnHeadingClass}>{t.footer.services}</h2>
            <ul className="mt-5 space-y-3">
              {serviceLinks.map((item) => (
                <li key={item.key}>
                  <FooterAnchor href={item.href} id={item.id}>
                    {t.footer.links[item.key]}
                  </FooterAnchor>
                </li>
              ))}
            </ul>
          </nav>

          <div className="sm:col-span-2 lg:col-span-3">
            <h2 className={columnHeadingClass}>{t.footer.contact}</h2>
            <ul className="mt-5 space-y-4">
              {settings.email ? (
                <li>
                  <ContactItem icon={Mail} label={t.footer.email} value={settings.email} href={`mailto:${settings.email}`} />
                </li>
              ) : null}
              {settings.phone && settings.phoneHref ? (
                <li>
                  <ContactItem icon={Phone} label={t.footer.phone} value={settings.phone} href={settings.phoneHref} />
                </li>
              ) : null}
              {address ? (
                <li>
                  <ContactItem icon={MapPin} label={t.footer.address} value={address} />
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <svg aria-hidden viewBox="0 0 1000 170" className="pointer-events-none mt-16 block w-full select-none">
          <defs>
            <linearGradient id="footer-wordmark-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5eead4" stopOpacity="0.14" />
              <stop offset="55%" stopColor="#ffffff" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <text
            x="500"
            y="150"
            textAnchor="middle"
            textLength="990"
            lengthAdjust="spacingAndGlyphs"
            fontSize="190"
            fontWeight="900"
            letterSpacing="-6"
            fill="url(#footer-wordmark-fill)"
          >
            MARS WEB
          </text>
        </svg>

        <div className="relative flex flex-col gap-5 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 sm:text-sm">{t.footer.rights}</p>
            <p className="inline-flex items-center gap-1.5 text-xs text-slate-600">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-emerald-400/70 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              {t.footer.madeIn}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
            <nav aria-label={t.footer.legalNav} className="flex flex-wrap items-center gap-x-3 gap-y-2">
              {legalLinks.map((item, index) => (
                <span key={item.key} className="inline-flex items-center gap-3">
                  {index > 0 ? <span aria-hidden className="h-1 w-1 rounded-full bg-slate-700" /> : null}
                  <Link
                    href={item.href}
                    className="text-xs text-slate-500 transition-colors hover:text-emerald-300 focus-visible:text-emerald-300 focus-visible:outline-none sm:text-sm"
                  >
                    {t.footer.legal[item.key]}
                  </Link>
                </span>
              ))}
            </nav>
            <button
              type="button"
              onClick={scrollToTopSmooth}
              aria-label={t.footer.backToTop}
              title={t.footer.backToTop}
              className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition duration-300 hover:border-emerald-300/40 hover:bg-emerald-400/10 hover:text-emerald-300 hover:shadow-[0_0_24px_rgba(16,185,129,0.35)] focus-visible:border-emerald-300/60 focus-visible:outline-none"
            >
              <ArrowUp className="h-4 w-4 transition group-hover:-translate-y-0.5" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
