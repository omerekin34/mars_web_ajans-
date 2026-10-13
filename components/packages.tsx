"use client";

import { useState } from "react";
import { Check, Clock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { PackageIntakeModal } from "@/components/package-intake-modal";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { useI18n } from "@/components/language-provider";
import { fill, formatTry } from "@/lib/format";
import { localizedList, localizedText } from "@/lib/localized";
import { discountPercent } from "@/lib/package-addons";
import type { PublicPackage } from "@/lib/public-content";

type PackagesProps = {
  packages: PublicPackage[];
  selected: string;
  onSelect: (id: string) => void;
};

export function Packages({ packages, selected, onSelect }: PackagesProps) {
  const { locale, t } = useI18n();
  const [intake, setIntake] = useState<PublicPackage | null>(null);

  const choose = (item: PublicPackage) => {
    onSelect(item.id);
    setIntake(item);
  };

  return (
    <section id="packages" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeading eyebrow={t.packages.eyebrow} title={t.packages.title} lead={t.packages.lead} />
        </Reveal>
        {packages.length === 0 ? (
          <p className="mt-16 text-center text-sm text-slate-500">{t.packages.empty}</p>
        ) : (
          <div className="mt-16 grid items-stretch gap-5 pt-3 sm:grid-cols-2 xl:grid-cols-3">
            {packages.map((item, index) => {
              const active = selected === item.id;
              const title = localizedText(locale, item.title, item.titleEn);
              const tagline = localizedText(locale, item.tagline, item.taglineEn);
              const features = localizedList(locale, item.features, item.featuresEn);
              const priceNote = localizedText(locale, item.priceNote, item.priceNoteEn);
              const delivery = localizedText(locale, item.delivery, item.deliveryEn);
              const badge = localizedText(locale, item.badge, item.badgeEn) || (item.isPopular ? t.packages.recommended : "");
              const cta = localizedText(locale, item.ctaLabel, item.ctaLabelEn) || t.packages.choose;
              const discount = discountPercent(item.price, item.oldPrice);
              return (
                <Reveal key={item.id} delay={index * 0.08} className="h-full">
                  <motion.article
                    whileHover={{ y: -8 }}
                    transition={{ type: "spring", stiffness: 260, damping: 22 }}
                    className={`relative flex h-full flex-col rounded-3xl border p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition-[border-color,box-shadow] duration-300 hover:border-violet-300/70 hover:shadow-[0_24px_80px_rgba(139,92,246,0.18)] ${
                      item.isPopular
                        ? "border-violet-400/50 bg-gradient-to-b from-violet-500/[0.09] to-white/[0.02]"
                        : active
                          ? "border-violet-400/50 bg-white/[0.03]"
                          : "border-white/10 bg-white/[0.03]"
                    }`}
                  >
                    {badge ? (
                      <span
                        className={`absolute -top-3 left-6 rounded-full border px-3 py-1 text-[11px] font-medium tracking-wide uppercase ${
                          item.isPopular
                            ? "border-violet-300/30 bg-violet-400/15 text-violet-100"
                            : "border-emerald-300/30 bg-emerald-400/10 text-emerald-100"
                        }`}
                      >
                        {badge}
                      </span>
                    ) : null}
                    <h3 className="text-xl font-semibold text-white">{title}</h3>
                    {tagline ? <p className="mt-2 text-sm leading-relaxed text-slate-400">{tagline}</p> : null}
                    <div className="mt-6 flex items-center justify-between gap-3">
                      <p className="text-xs tracking-[0.16em] text-slate-500 uppercase">{t.packages.starting}</p>
                      {discount > 0 ? (
                        <span className="rounded-full bg-emerald-400/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-200">
                          {fill(t.packages.discount, { n: String(discount) })}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <p className="text-4xl font-semibold tracking-tight text-white tabular-nums">{formatTry(item.price, locale)}</p>
                      {item.oldPrice ? (
                        <p className="text-base text-slate-500 tabular-nums line-through decoration-rose-400/70">
                          {formatTry(item.oldPrice, locale)}
                        </p>
                      ) : null}
                    </div>
                    {priceNote ? <p className="mt-1.5 text-xs text-slate-500">{priceNote}</p> : null}
                    {delivery ? (
                      <p className="mt-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300">
                        <Clock className="h-3.5 w-3.5 text-violet-300" aria-hidden />
                        <span>
                          {t.packages.delivery}: <span className="font-medium text-white">{delivery}</span>
                        </span>
                      </p>
                    ) : null}
                    <ul className="mt-6 flex-1 space-y-3 border-t border-white/10 pt-6">
                      {features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-300">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {item.addons.length > 0 ? (
                      <p className="mt-6 flex items-center gap-2 text-xs text-violet-200/80">
                        <Sparkles className="h-3.5 w-3.5" aria-hidden />
                        {fill(t.packages.addonsCount, { count: String(item.addons.length) })}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => choose(item)}
                      className={`mt-4 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                        item.isPopular
                          ? "bg-white text-slate-950 hover:bg-violet-100"
                          : "border border-white/15 text-white hover:bg-white hover:text-slate-950"
                      }`}
                    >
                      {active && !item.ctaLabel ? t.packages.selected : cta}
                    </button>
                  </motion.article>
                </Reveal>
              );
            })}
          </div>
        )}
        <p className="mt-8 text-center text-xs text-slate-500">{t.packages.finePrint}</p>
      </div>
      <PackageIntakeModal pkg={intake} onClose={() => setIntake(null)} />
    </section>
  );
}
