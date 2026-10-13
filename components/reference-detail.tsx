"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  LayoutDashboard,
  Lock,
  Maximize2,
  MessageCircle,
  Monitor,
  Quote,
  Server,
  Star,
  X,
} from "lucide-react";
import { useI18n } from "@/components/language-provider";
import { ProjectLogo, ReferenceCard, logoWell } from "@/components/reference-card";
import { Reveal } from "@/components/reveal";
import { useSiteSettings } from "@/components/site-settings-provider";
import { localizedList, localizedText } from "@/lib/localized";
import { commaList, displayHost, referenceHref } from "@/lib/projects";
import type { PublicProject } from "@/lib/public-content";
import { whatsAppUrl } from "@/lib/whatsapp";

type ReferenceDetailProps = {
  project: PublicProject;
  previous: PublicProject | null;
  next: PublicProject | null;
  related: PublicProject[];
};

const primaryCta =
  "inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_12px_32px_-8px_rgba(16,185,129,0.7)] transition hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";

const secondaryCta =
  "inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-xl transition hover:border-cyan-300/50 hover:bg-cyan-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70";

function Paragraphs({ text, className }: { text: string; className: string }) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  return (
    <div className={className}>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="whitespace-pre-line">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

function SectionTitle({ eyebrow, title, lead }: { eyebrow?: string; title: string; lead?: string }) {
  return (
    <div className="max-w-2xl">
      {eyebrow ? <p className="text-xs font-semibold tracking-[0.22em] text-emerald-300/80 uppercase">{eyebrow}</p> : null}
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-balance text-white md:text-4xl">{title}</h2>
      {lead ? <p className="mt-3 text-base leading-relaxed text-slate-400">{lead}</p> : null}
    </div>
  );
}

function BrowserFrame({ src, host, name }: { src: string; host: string; name: string }) {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-x-10 -inset-y-6 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.22),transparent_65%)] blur-2xl"
      />
      <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-900/80 shadow-[0_40px_120px_-30px_rgba(34,211,238,0.45)]">
        <div className="flex items-center gap-3 border-b border-white/10 bg-slate-950/80 px-4 py-3">
          <div className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          </div>
          {host ? (
            <div className="mx-auto flex min-w-0 max-w-xs flex-1 items-center justify-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1 text-xs text-slate-400">
              <Lock className="h-3 w-3 shrink-0 text-emerald-300/80" aria-hidden />
              <span className="truncate">{host}</span>
            </div>
          ) : (
            <span className="flex-1" />
          )}
          <span className="w-10" aria-hidden />
        </div>
        <div className="relative aspect-[16/9] bg-slate-950">
          <Image
            src={src}
            alt={name}
            fill
            unoptimized
            priority
            sizes="(min-width: 1280px) 1152px, 100vw"
            className="object-cover object-top"
          />
        </div>
      </div>
    </div>
  );
}

function Lightbox({
  images,
  index,
  name,
  onClose,
  onChange,
}: {
  images: string[];
  index: number;
  name: string;
  onClose: () => void;
  onChange: (index: number) => void;
}) {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const total = images.length;
  const go = useCallback((step: number) => onChange((index + step + total) % total), [index, onChange, total]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [go, onClose]);

  const navButton =
    "flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-slate-950/70 text-white backdrop-blur-md transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300";

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={name}
      data-lenis-prevent
      className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-4 bg-slate-950/92 p-4 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0 : 0.2 }}
      onClick={onClose}
    >
      <button type="button" autoFocus onClick={onClose} aria-label={t.reference.galleryClose} className={`${navButton} absolute top-4 right-4`}>
        <X className="h-5 w-5" aria-hidden />
      </button>
      <div className="relative h-[78vh] w-[min(94vw,1400px)]" onClick={(event) => event.stopPropagation()}>
        <Image src={images[index]} alt={`${name} ${index + 1}`} fill unoptimized sizes="94vw" className="object-contain" />
      </div>
      {total > 1 ? (
        <div className="flex items-center gap-4" onClick={(event) => event.stopPropagation()}>
          <button type="button" onClick={() => go(-1)} aria-label={t.reference.galleryPrev} className={navButton}>
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <span className="min-w-14 text-center text-sm text-slate-300 tabular-nums">
            {index + 1} / {total}
          </span>
          <button type="button" onClick={() => go(1)} aria-label={t.reference.galleryNext} className={navButton}>
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      ) : null}
    </motion.div>
  );
}

function ProjectNavCard({ project, label, direction }: { project: PublicProject; label: string; direction: "prev" | "next" }) {
  const { locale } = useI18n();
  const name = localizedText(locale, project.clientName, project.clientNameEn);
  const sector = localizedText(locale, project.sector, project.sectorEn);
  const Icon = direction === "prev" ? ArrowLeft : ArrowRight;

  return (
    <Link
      href={referenceHref(project.slug)}
      className={`group flex items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-cyan-300/40 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 ${
        direction === "next" ? "flex-row-reverse text-right" : ""
      }`}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 text-slate-300 transition group-hover:border-cyan-300/50 group-hover:bg-cyan-400 group-hover:text-slate-950">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">{label}</span>
        <span className="mt-1 block truncate text-base font-semibold text-white">{name}</span>
        {sector ? <span className="block text-xs text-slate-400">{sector}</span> : null}
      </span>
    </Link>
  );
}

export function ReferenceDetail({ project, previous, next, related }: ReferenceDetailProps) {
  const { locale, t } = useI18n();
  const settings = useSiteSettings();
  const reduce = useReducedMotion();
  const [lightbox, setLightbox] = useState<number | null>(null);
  const closeLightbox = useCallback(() => setLightbox(null), []);

  const name = localizedText(locale, project.clientName, project.clientNameEn);
  const sector = localizedText(locale, project.sector, project.sectorEn);
  const summary = localizedText(locale, project.summary, project.summaryEn);
  const services = localizedList(locale, project.services, project.servicesEn);
  const duration = localizedText(locale, project.duration, project.durationEn);
  const problem = localizedText(locale, project.clientProblem, project.clientProblemEn);
  const solution = localizedText(locale, project.ourSolution, project.ourSolutionEn);
  const features = localizedList(locale, project.features, project.featuresEn);
  const quote = localizedText(locale, project.quote, project.quoteEn);
  const quoteAuthor = localizedText(locale, project.quoteAuthor, project.quoteAuthorEn);
  const host = displayHost(project.websiteUrl);
  const whatsappHref = whatsAppUrl(t.reference.wantMessage.replaceAll("{name}", name), settings.whatsappDigits);

  const tech = [
    { key: "frontend", label: t.reference.frontend, icon: Monitor, items: commaList(project.techFrontend) },
    { key: "backend", label: t.reference.backend, icon: Server, items: commaList(project.techBackend) },
    { key: "admin", label: t.reference.admin, icon: LayoutDashboard, items: commaList(project.techAdmin) },
  ].filter((group) => group.items.length > 0);

  const facts = [
    { key: "sector", label: t.reference.sector, value: sector, icon: Briefcase },
    { key: "year", label: t.reference.year, value: project.year, icon: CalendarDays },
    { key: "duration", label: t.reference.duration, value: duration, icon: Clock },
  ].filter((fact) => fact.value);

  const hasStory = Boolean(
    problem || solution || features.length || project.metrics.length || project.gallery.length || tech.length || quote,
  );
  const metricCols =
    project.metrics.length >= 4 ? "lg:grid-cols-4" : project.metrics.length === 3 ? "lg:grid-cols-3" : "";
  const previousProject = previous && previous.id !== next?.id ? previous : null;

  const wantButton = whatsappHref ? (
    <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={primaryCta}>
      <MessageCircle className="h-4 w-4" aria-hidden />
      {t.reference.want}
    </a>
  ) : (
    <Link href="/teklif-al" className={primaryCta}>
      {t.reference.want}
      <ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  );

  return (
    <>
      <section className="relative overflow-hidden px-6 pt-32 pb-12 md:pt-40 md:pb-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(16,185,129,0.16),transparent_70%)]"
        />
        <div className="mx-auto max-w-6xl">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <li>
                <Link href="/" className="transition hover:text-slate-200">
                  {t.reference.home}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href="/referanslar" className="transition hover:text-slate-200">
                  {t.reference.list}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="max-w-[16rem] truncate text-slate-300">
                {name}
              </li>
            </ol>
          </nav>

          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-end">
            <Reveal>
              <div className="flex flex-wrap items-center gap-2">
                {sector ? (
                  <span className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs font-medium tracking-wide text-cyan-100">
                    {sector}
                  </span>
                ) : null}
                {project.isFeatured ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-200/30 bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-100">
                    <Star className="h-3 w-3 fill-amber-200 text-amber-200" aria-hidden />
                    {t.portfolio.featured}
                  </span>
                ) : null}
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl md:text-6xl">{name}</h1>
              {summary ? <p className="mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-slate-300">{summary}</p> : null}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {wantButton}
                {project.websiteUrl ? (
                  <a href={project.websiteUrl} target="_blank" rel="noopener noreferrer" className={secondaryCta}>
                    {t.reference.visit}
                    <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </a>
                ) : null}
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <aside className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
                <div className={`flex h-36 items-center justify-center rounded-2xl border border-white/5 p-6 ${logoWell}`}>
                  <ProjectLogo project={project} name={name} className="max-h-24 max-w-[75%]" />
                </div>
                {facts.length || services.length ? (
                  <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5 px-1">
                    {facts.map((fact) => (
                      <div key={fact.key} className={fact.key === "sector" && facts.length % 2 === 1 ? "col-span-2" : ""}>
                        <dt className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.16em] text-slate-500 uppercase">
                          <fact.icon className="h-3.5 w-3.5" aria-hidden />
                          {fact.label}
                        </dt>
                        <dd className="mt-1.5 text-sm font-medium text-white">{fact.value}</dd>
                      </div>
                    ))}
                    {services.length ? (
                      <div className="col-span-2">
                        <dt className="text-[11px] font-semibold tracking-[0.16em] text-slate-500 uppercase">{t.reference.services}</dt>
                        <dd className="mt-2 flex flex-wrap gap-2">
                          {services.map((service) => (
                            <span key={service} className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs text-slate-200">
                              {service}
                            </span>
                          ))}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                ) : null}
              </aside>
            </Reveal>
          </div>

          {project.coverUrl ? (
            <Reveal className="mt-14 md:mt-20" delay={0.12}>
              <BrowserFrame src={project.coverUrl} host={host} name={name} />
            </Reveal>
          ) : null}
        </div>
      </section>

      {project.metrics.length ? (
        <section className="px-6 py-12 md:py-16" aria-label={t.reference.results}>
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <SectionTitle eyebrow={t.reference.results} title={t.reference.resultsLead} />
            </Reveal>
            <div className={`mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 ${metricCols}`}>
              {project.metrics.map((metric, index) => (
                <Reveal key={`${metric.value}-${index}`} delay={index * 0.06}>
                  <div className="h-full rounded-3xl border border-white/10 bg-[linear-gradient(160deg,rgba(16,185,129,0.1),rgba(2,6,23,0.2))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                    <p className="bg-gradient-to-br from-emerald-200 to-cyan-300 bg-clip-text text-4xl font-semibold tracking-tight text-transparent md:text-5xl">
                      {metric.value}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{localizedText(locale, metric.label, metric.labelEn)}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {problem || solution ? (
        <section className="px-6 py-12 md:py-16">
          <div className="mx-auto max-w-6xl space-y-5">
            {problem ? (
              <Reveal>
                <article className="grid gap-6 rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-10 lg:grid-cols-[200px_minmax(0,1fr)]">
                  <div>
                    <span className="font-mono text-sm text-amber-200/80">01</span>
                    <p className="mt-2 text-xs font-semibold tracking-[0.22em] text-amber-200/80 uppercase">{t.reference.challengeEyebrow}</p>
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">{t.reference.challenge}</h2>
                    <Paragraphs text={problem} className="mt-5 max-w-3xl space-y-4 text-base leading-8 text-slate-300" />
                  </div>
                </article>
              </Reveal>
            ) : null}
            {solution ? (
              <Reveal>
                <article className="grid gap-6 rounded-3xl border border-cyan-300/25 bg-[linear-gradient(165deg,rgba(34,211,238,0.12),rgba(15,23,42,0.3))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] md:p-10 lg:grid-cols-[200px_minmax(0,1fr)]">
                  <div>
                    <span className="font-mono text-sm text-cyan-200">{problem ? "02" : "01"}</span>
                    <p className="mt-2 text-xs font-semibold tracking-[0.22em] text-cyan-200 uppercase">{t.reference.solutionEyebrow}</p>
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">{t.reference.solution}</h2>
                    <Paragraphs text={solution} className="mt-5 max-w-3xl space-y-4 text-base leading-8 text-slate-100" />
                  </div>
                </article>
              </Reveal>
            ) : null}
          </div>
        </section>
      ) : null}

      {features.length ? (
        <section className="px-6 py-12 md:py-16">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <SectionTitle title={t.reference.features} />
            </Reveal>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {features.map((feature, index) => (
                <motion.li
                  key={`${feature}-${index}`}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: Math.min(index, 6) * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  className="flex h-full items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                    <Check className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  <span className="text-sm leading-6 text-slate-200">{feature}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {project.gallery.length ? (
        <section className="px-6 py-12 md:py-16">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <SectionTitle title={t.reference.gallery} />
            </Reveal>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {project.gallery.map((src, index) => {
                const wide = index === 0 && project.gallery.length % 2 === 1;
                return (
                  <Reveal key={src} delay={Math.min(index, 4) * 0.05} className={wide ? "sm:col-span-2" : ""}>
                    <button
                      type="button"
                      onClick={() => setLightbox(index)}
                      aria-label={t.reference.galleryOpen.replace("{index}", String(index + 1))}
                      className={`group relative block w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 ${
                        wide ? "aspect-[16/8]" : "aspect-[16/10]"
                      }`}
                    >
                      <Image
                        src={src}
                        alt=""
                        fill
                        unoptimized
                        sizes={wide ? "(min-width: 1280px) 1152px, 100vw" : "(min-width: 640px) 50vw, 100vw"}
                        className="object-cover object-top transition duration-700 ease-out group-hover:scale-[1.03]"
                      />
                      <span className="absolute right-3 bottom-3 flex h-9 w-9 items-center justify-center rounded-full bg-slate-950/70 text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100 group-focus-visible:opacity-100">
                        <Maximize2 className="h-4 w-4" aria-hidden />
                      </span>
                    </button>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {tech.length ? (
        <section className="px-6 py-12 md:py-16">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <SectionTitle title={t.reference.tech} />
            </Reveal>
            <div className={`mt-8 grid gap-4 ${tech.length === 3 ? "md:grid-cols-3" : tech.length === 2 ? "md:grid-cols-2" : ""}`}>
              {tech.map((group, index) => (
                <Reveal key={group.key} delay={index * 0.06}>
                  <div className="h-full rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-cyan-200">
                        <group.icon className="h-5 w-5" aria-hidden />
                      </span>
                      <p className="text-sm font-semibold text-white">{group.label}</p>
                    </div>
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <li
                          key={item}
                          className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {quote ? (
        <section className="px-6 py-12 md:py-16">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <figure className="relative overflow-hidden rounded-[2rem] border border-emerald-400/20 bg-[linear-gradient(160deg,rgba(16,185,129,0.12),rgba(2,6,23,0.4))] p-8 md:p-14">
                <Quote aria-hidden className="absolute -top-2 right-6 h-28 w-28 text-emerald-300/10 md:h-40 md:w-40" />
                <p className="text-xs font-semibold tracking-[0.22em] text-emerald-300/80 uppercase">{t.reference.testimonial}</p>
                <blockquote className="relative mt-6 max-w-4xl text-xl leading-relaxed text-pretty text-white md:text-2xl">
                  “{quote}”
                </blockquote>
                {quoteAuthor ? <figcaption className="mt-6 text-sm font-medium text-slate-300">— {quoteAuthor}</figcaption> : null}
              </figure>
            </Reveal>
          </div>
        </section>
      ) : null}

      {!hasStory ? (
        <section className="px-6 py-8">
          <p className="mx-auto max-w-6xl rounded-3xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-10 text-center text-sm text-slate-400">
            {t.reference.noDetail}
          </p>
        </section>
      ) : null}

      {previousProject || next ? (
        <nav aria-label={t.reference.list} className="px-6 py-10">
          <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2">
            {previousProject ? <ProjectNavCard project={previousProject} label={t.reference.previous} direction="prev" /> : <span />}
            {next ? <ProjectNavCard project={next} label={t.reference.next} direction="next" /> : null}
          </div>
        </nav>
      ) : null}

      {related.length ? (
        <section className="px-6 py-12 md:py-16">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <SectionTitle title={t.reference.related} />
              <Link href="/referanslar" className="inline-flex items-center gap-2 text-sm font-medium text-cyan-200 transition hover:text-cyan-100">
                {t.reference.back}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ReferenceCard key={item.id} project={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="px-6 pt-8 pb-28 md:pb-32">
        <Reveal className="mx-auto max-w-6xl">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_15%_0%,rgba(16,185,129,0.25),transparent_55%),radial-gradient(circle_at_90%_100%,rgba(34,211,238,0.2),transparent_50%),#030712] px-6 py-14 text-center md:px-16 md:py-20">
            <p className="text-xs font-semibold tracking-[0.22em] text-emerald-300/80 uppercase">{t.reference.ctaEyebrow}</p>
            <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-balance text-white md:text-5xl">
              {t.reference.ctaTitle}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300">{t.reference.ctaLead}</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/teklif-al" className={primaryCta}>
                {t.reference.quote}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              {whatsappHref ? (
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={secondaryCta}>
                  <MessageCircle className="h-4 w-4" aria-hidden />
                  {t.reference.want}
                </a>
              ) : null}
            </div>
          </div>
        </Reveal>
      </section>

      <AnimatePresence>
        {lightbox !== null ? (
          <Lightbox images={project.gallery} index={lightbox} name={name} onClose={closeLightbox} onChange={setLightbox} />
        ) : null}
      </AnimatePresence>
    </>
  );
}
