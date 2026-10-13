"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type { CSSProperties } from "react";
import { CleanLogoImage } from "@/components/clean-logo-image";
import { useI18n } from "@/components/language-provider";
import { localizedText } from "@/lib/localized";
import { referenceHref } from "@/lib/projects";
import type { PublicProject } from "@/lib/public-content";

const MIN_ITEMS_PER_COPY = 8;
const SECONDS_PER_ITEM = 4.5;

function PartnerMark({ project, hidden = false }: { project: PublicProject; hidden?: boolean }) {
  const { locale } = useI18n();
  const clientName = localizedText(locale, project.clientName, project.clientNameEn);
  const sector = localizedText(locale, project.sector, project.sectorEn);

  const content = (
    <>
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] transition-colors duration-500 group-hover/item:border-emerald-400/40 group-hover/item:bg-emerald-400/10">
        {project.imageUrl ? (
          <CleanLogoImage
            src={project.imageUrl}
            className="max-h-5 max-w-5 opacity-70 grayscale transition-all duration-500 group-hover/item:scale-110 group-hover/item:opacity-100 group-hover/item:grayscale-0"
          />
        ) : (
          <span className="text-xs font-bold text-slate-400 transition-colors duration-500 group-hover/item:text-emerald-300">
            {clientName.slice(0, 1).toUpperCase()}
          </span>
        )}
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-semibold tracking-tight whitespace-nowrap text-slate-300 transition-colors duration-500 group-hover/item:text-white">
          {clientName}
        </span>
        {sector ? (
          <span className="text-[11px] whitespace-nowrap text-slate-500 transition-colors duration-500 group-hover/item:text-emerald-300/80">
            {sector}
          </span>
        ) : null}
      </span>
    </>
  );

  const className =
    "group/item relative flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] py-2.5 pr-5 pl-2.5 backdrop-blur-sm transition-all duration-500 ease-out hover:-translate-y-0.5 hover:border-emerald-400/30 hover:bg-white/[0.05] hover:shadow-[0_12px_32px_-12px_rgba(16,185,129,0.45)]";

  return (
    <Link
      href={referenceHref(project.slug)}
      tabIndex={hidden ? -1 : undefined}
      aria-label={hidden ? undefined : clientName}
      className={`${className} focus-visible:border-emerald-400/60 focus-visible:outline-none`}
    >
      {content}
    </Link>
  );
}

export function LogoMarquee({ projects }: { projects: PublicProject[] }) {
  const { t } = useI18n();
  const reduce = useReducedMotion();

  const repeats = projects.length === 0 ? 0 : Math.ceil(MIN_ITEMS_PER_COPY / projects.length);
  const sequence = Array.from({ length: repeats }, () => projects).flat();
  const duration = `${Math.max(sequence.length * SECONDS_PER_ITEM, 24)}s`;

  return (
    <div className="relative z-10 w-full overflow-hidden bg-slate-950/50 py-9">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 h-24 w-[min(40rem,80%)] -translate-x-1/2 rounded-full bg-emerald-500/[0.07] blur-3xl"
      />

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex items-center justify-center gap-4 px-6"
      >
        <span aria-hidden className="h-px w-10 bg-gradient-to-r from-transparent to-slate-600 sm:w-20" />
        <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden>
          <span className="absolute inset-0 rounded-full bg-emerald-400 motion-safe:animate-ping" />
          <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </span>
        <p className="text-center text-[11px] font-medium tracking-[0.25em] text-slate-400 uppercase sm:text-xs">
          {t.marquee.label}
        </p>
        <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden>
          <span className="absolute inset-0 rounded-full bg-emerald-400 motion-safe:animate-ping [animation-delay:500ms]" />
          <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </span>
        <span aria-hidden className="h-px w-10 bg-gradient-to-l from-transparent to-slate-600 sm:w-20" />
      </motion.div>

      {projects.length === 0 ? null : reduce ? (
        <ul className="relative mt-7 flex flex-wrap items-center justify-center gap-4 px-6">
          {projects.map((project) => (
            <li key={project.id}>
              <PartnerMark project={project} />
            </li>
          ))}
        </ul>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="group relative mt-7 overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
        >
          <div
            className="flex w-max animate-[marquee_var(--marquee-duration)_linear_infinite] group-hover:[animation-play-state:paused] group-has-[:focus-visible]:[animation-play-state:paused]"
            style={{ "--marquee-duration": duration } as CSSProperties}
          >
            {[0, 1].map((copy) => (
              <ul
                key={copy}
                className="flex shrink-0 items-center gap-4 pr-4"
                aria-hidden={copy === 1 ? true : undefined}
              >
                {sequence.map((project, index) => {
                  const primary = copy === 0 && index < projects.length;
                  return (
                    <li key={`${copy}-${project.id}-${index}`} aria-hidden={primary ? undefined : true}>
                      <PartnerMark project={project} hidden={!primary} />
                    </li>
                  );
                })}
              </ul>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
