"use client";

import { useState, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Star, TrendingUp } from "lucide-react";
import { CleanLogoImage } from "@/components/clean-logo-image";
import { useI18n } from "@/components/language-provider";
import { localizedList, localizedText } from "@/lib/localized";
import { referenceHref } from "@/lib/projects";
import type { PublicProject } from "@/lib/public-content";

export const logoWell =
  "bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.20),transparent_55%),radial-gradient(circle_at_85%_95%,rgba(14,165,233,0.14),transparent_50%),linear-gradient(160deg,#071a1a,#020617)]";

function trackSpotlight(event: PointerEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--x", `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty("--y", `${event.clientY - rect.top}px`);
}

function LogoMark({ name }: { name: string }) {
  return (
    <span className="flex h-20 w-20 items-center justify-center rounded-2xl border border-emerald-300/20 bg-gradient-to-br from-emerald-400/15 to-sky-400/10 text-3xl font-semibold tracking-tight text-emerald-100">
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

export function ProjectLogo({
  project,
  name,
  className = "max-h-24 max-w-[70%]",
}: {
  project: PublicProject;
  name: string;
  className?: string;
}) {
  const [failedUrl, setFailedUrl] = useState("");

  if (!project.imageUrl || failedUrl === project.imageUrl) return <LogoMark name={name} />;
  return (
    <CleanLogoImage src={project.imageUrl} className={className} onFail={() => setFailedUrl(project.imageUrl)} />
  );
}

export function ReferenceCard({ project }: { project: PublicProject }) {
  const { locale, t } = useI18n();
  const name = localizedText(locale, project.clientName, project.clientNameEn);
  const sector = localizedText(locale, project.sector, project.sectorEn);
  const summary =
    localizedText(locale, project.summary, project.summaryEn) ||
    localizedText(locale, project.clientProblem, project.clientProblemEn);
  const services = localizedList(locale, project.services, project.servicesEn).slice(0, 3);
  const metric = project.metrics[0];

  return (
    <Link
      href={referenceHref(project.slug)}
      onPointerMove={trackSpotlight}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition duration-300 hover:-translate-y-1.5 hover:border-emerald-300/35 hover:shadow-[0_24px_60px_-24px_rgba(16,185,129,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: "radial-gradient(380px circle at var(--x, 50%) var(--y, 50%), rgba(52, 211, 153, 0.10), transparent 45%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-emerald-300/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className={`relative aspect-[16/9] overflow-hidden border-b border-white/[0.06] ${project.coverUrl ? "bg-slate-900" : logoWell}`}>
        {project.coverUrl ? (
          <>
            <Image
              src={project.coverUrl}
              alt=""
              fill
              unoptimized
              loading="eager"
              referrerPolicy="no-referrer"
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover object-top transition duration-700 ease-out group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            {project.imageUrl ? (
              <div className="absolute bottom-4 left-4 flex h-12 max-w-[55%] items-center rounded-xl border border-white/15 bg-slate-950/70 px-3 backdrop-blur-md">
                <ProjectLogo project={project} name={name} className="max-h-8 max-w-full" />
              </div>
            ) : null}
          </>
        ) : (
          <>
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
            />
            <div
              aria-hidden
              className="absolute top-1/2 left-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/20 blur-3xl transition duration-500 group-hover:bg-emerald-400/30"
            />
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="flex h-28 w-44 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/50 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_40px_-18px_rgba(0,0,0,0.8)] backdrop-blur-md transition duration-500 ease-out group-hover:scale-105 group-hover:border-emerald-300/30">
                <ProjectLogo project={project} name={name} className="max-h-20 max-w-full" />
              </div>
            </div>
          </>
        )}

        <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-2">
          {project.isFeatured ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200/30 bg-amber-300/15 px-2.5 py-1 text-[11px] font-semibold text-amber-100 backdrop-blur-md">
              <Star className="h-3 w-3 fill-amber-200 text-amber-200" aria-hidden />
              {t.portfolio.featured}
            </span>
          ) : (
            <span />
          )}
          {project.year ? (
            <span className="rounded-full border border-white/10 bg-slate-950/60 px-2.5 py-1 text-[11px] font-medium text-slate-300 backdrop-blur-md">
              {project.year}
            </span>
          ) : null}
        </div>
      </div>

      <div className="relative flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2">
          {sector ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/25 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
              {sector}
            </span>
          ) : null}
          {services.map((service) => (
            <span key={service} className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-slate-400">
              {service}
            </span>
          ))}
        </div>

        <h3 className="mt-4 text-lg font-semibold tracking-tight text-balance text-white">{name}</h3>
        {summary ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">{summary}</p> : null}

        {metric ? (
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.06] px-4 py-3">
            <TrendingUp className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
            <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-sky-300 bg-clip-text text-xl font-bold tracking-tight text-transparent">
              {metric.value}
            </span>
            <span className="text-xs text-slate-400">{localizedText(locale, metric.label, metric.labelEn)}</span>
          </div>
        ) : null}

        <span aria-hidden className="min-h-6 flex-1" />
        <span className="flex items-center justify-between border-t border-white/[0.06] pt-5 text-sm font-medium text-slate-300 transition group-hover:text-emerald-200">
          {t.portfolio.detail}
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] transition duration-300 group-hover:border-transparent group-hover:bg-gradient-to-r group-hover:from-emerald-400 group-hover:to-teal-300 group-hover:text-slate-950 group-hover:shadow-[0_8px_24px_-6px_rgba(16,185,129,0.7)]">
            <ArrowUpRight className="h-4 w-4 transition duration-300 group-hover:rotate-45" aria-hidden />
          </span>
        </span>
      </div>
    </Link>
  );
}
