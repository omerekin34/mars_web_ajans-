"use client";

import { useId, useState } from "react";
import { ArrowRight, Clock, Flame, Hourglass, Lock, MessageCircle, Receipt, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { LossSlider } from "@/components/loss-slider";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { useAnimatedNumber } from "@/components/use-animated-number";
import { useSiteSettings } from "@/components/site-settings-provider";
import { useI18n } from "@/components/language-provider";
import { localizedText } from "@/lib/localized";
import { fill, formatNumber, formatRatio, formatTry, lossTone, slotsText } from "@/lib/format";
import { monthlyLossCap } from "@/lib/packages";
import type { PublicPackage } from "@/lib/public-content";
import { whatsAppUrl } from "@/lib/whatsapp";

type CalculatorProps = {
  packages: PublicPackage[];
  packageId: string;
  onPackageChange: (id: string) => void;
};

const weeklyRange = { min: 1, max: 25, step: 1 };
const profitRange = { min: 500, max: 10000, step: 100 };
const weeklyPresets = [2, 5, 10, 20];
const profitPresets = [1000, 2500, 5000, 10000];

function normalizePhone(raw: string) {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("90") && digits.length > 10) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return digits.slice(0, 10);
}

function formatPhone(digits: string) {
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 8), digits.slice(8, 10)]
    .filter(Boolean)
    .join(" ");
}

export function Calculator({ packages, packageId, onPackageChange }: CalculatorProps) {
  const { locale, t } = useI18n();
  const settings = useSiteSettings();
  const weeklyId = useId();
  const profitId = useId();
  const phoneId = useId();
  const errorId = useId();
  const [weekly, setWeekly] = useState(5);
  const [profit, setProfit] = useState(2000);
  const [digits, setDigits] = useState("");
  const [error, setError] = useState(false);

  const monthly = weekly * 4 * profit;
  const annual = monthly * 12;
  const daily = monthly / 30;
  const animatedMonthly = useAnimatedNumber(monthly);
  const meter = Math.min(100, (monthly / monthlyLossCap) * 100);
  const tone = lossTone(meter);
  const severity = meter > 66 ? t.calculator.severity.high : meter > 33 ? t.calculator.severity.mid : t.calculator.severity.low;
  const selected = packages.find((item) => item.id === packageId) ?? packages.find((item) => item.isPopular) ?? packages[0] ?? null;
  const ratio = selected && selected.price > 0 ? annual / selected.price : 0;
  const monthsToMatch = selected && monthly > 0 ? selected.price / monthly : 0;
  const paybackDays = selected && daily > 0 ? Math.max(1, Math.ceil(selected.price / daily)) : 0;
  const compareMax = Math.max(annual, selected?.price ?? 0, 1);
  const selectedDelivery = selected ? localizedText(locale, selected.delivery, selected.deliveryEn) : "";
  const insight =
    ratio >= 1
      ? fill(t.calculator.ratio, { n: formatRatio(ratio, locale) })
      : fill(t.calculator.ratioLow, { months: formatRatio(Math.max(monthsToMatch, 0.1), locale) });

  const breakdown = [
    { label: t.calculator.dailyLabel, value: daily },
    { label: t.calculator.weeklyLabel, value: weekly * profit },
    { label: t.calculator.yearlyLabel, value: annual },
  ];

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^5\d{9}$/.test(digits)) {
      setError(true);
      document.getElementById(phoneId)?.focus();
      return;
    }
    if (!selected) return;
    setError(false);
    const message = fill(t.calculator.message, {
      weekly: formatNumber(weekly, locale),
      profit: formatTry(profit, locale),
      monthly: formatTry(monthly, locale),
      pkg: localizedText(locale, selected.title, selected.titleEn),
      price: formatTry(selected.price, locale),
      phone: formatPhone(digits),
    });
    const href = whatsAppUrl(message, settings.whatsappDigits);
    if (!href) return;
    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <section id="calculator" className="relative isolate px-6 py-24 md:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[520px] w-[min(900px,90vw)] -translate-x-1/2 -translate-y-1/3 rounded-full bg-gradient-to-r from-rose-500/10 via-transparent to-emerald-500/10 blur-3xl"
      />
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeading eyebrow={t.calculator.eyebrow} title={t.calculator.title} lead={t.calculator.lead} />
        </Reveal>
        <Reveal>
          <div className="mt-14 rounded-[28px] bg-gradient-to-br from-rose-500/40 via-white/10 to-emerald-400/35 p-px shadow-[0_30px_120px_rgba(2,6,23,0.6)]">
            <div className="relative overflow-hidden rounded-[27px] bg-slate-950/85 p-6 backdrop-blur-2xl sm:p-10">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)] bg-[size:32px_32px]"
              />
              <div className="relative grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
                <div className="space-y-8">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-rose-400/25 bg-rose-500/10 px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-rose-200 uppercase">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 motion-safe:animate-ping" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
                      </span>
                      {t.calculator.live}
                    </span>
                    <TrendingDown className="h-5 w-5 text-rose-400/80" aria-hidden />
                  </div>

                  <LossSlider
                    id={weeklyId}
                    label={t.calculator.weekly}
                    min={weeklyRange.min}
                    max={weeklyRange.max}
                    step={weeklyRange.step}
                    value={weekly}
                    display={`${formatNumber(weekly, locale)} ${t.calculator.customers}`}
                    onChange={setWeekly}
                    minLabel={formatNumber(weeklyRange.min, locale)}
                    maxLabel={formatNumber(weeklyRange.max, locale)}
                    presets={weeklyPresets.map((value) => ({ value, label: formatNumber(value, locale) }))}
                    presetsLabel={`${t.calculator.weekly}: ${t.calculator.presetsLabel}`}
                  />
                  <LossSlider
                    id={profitId}
                    label={t.calculator.profit}
                    min={profitRange.min}
                    max={profitRange.max}
                    step={profitRange.step}
                    value={profit}
                    display={formatTry(profit, locale)}
                    onChange={setProfit}
                    minLabel={formatTry(profitRange.min, locale)}
                    maxLabel={formatTry(profitRange.max, locale)}
                    presets={profitPresets.map((value) => ({ value, label: formatTry(value, locale) }))}
                    presetsLabel={`${t.calculator.profit}: ${t.calculator.presetsLabel}`}
                  />

                  <div className="relative overflow-hidden rounded-3xl border border-rose-400/20 bg-gradient-to-br from-rose-500/[0.12] via-rose-500/[0.04] to-transparent p-6">
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full bg-rose-500/25 blur-3xl"
                    />
                    <div className="relative">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-rose-100/80">{t.calculator.monthlyLabel}</p>
                        <span className="rounded-full border border-rose-400/30 bg-rose-500/15 px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.18em] text-rose-200 uppercase">
                          {severity}
                        </span>
                      </div>
                      <p
                        className={`mt-2 text-5xl font-semibold tracking-tight tabular-nums sm:text-6xl ${tone}`}
                        aria-live="polite"
                      >
                        −{formatTry(animatedMonthly, locale)}
                      </p>
                      <p className="mt-2 text-sm text-rose-200/80 tabular-nums">
                        {t.calculator.annualLabel}: <span className="font-semibold text-rose-100">{formatTry(annual, locale)}</span>
                      </p>

                      <dl className="mt-5 grid grid-cols-3 gap-2">
                        {breakdown.map((item) => (
                          <div key={item.label} className="rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-2.5">
                            <dt className="text-[10px] tracking-[0.14em] text-slate-500 uppercase">{item.label}</dt>
                            <dd className="mt-1 truncate text-sm font-semibold text-white tabular-nums">
                              {formatTry(item.value, locale)}
                            </dd>
                          </div>
                        ))}
                      </dl>

                      <div className="mt-6">
                        <div className="mb-2 flex items-center justify-between text-[11px] text-slate-400">
                          <span>{t.calculator.severityLabel}</span>
                          <span className="tabular-nums">{Math.round(meter)}%</span>
                        </div>
                        <div
                          className="relative h-2.5 overflow-hidden rounded-full bg-white/[0.07]"
                          role="meter"
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={Math.round(meter)}
                          aria-label={t.calculator.meter}
                        >
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-red-600 shadow-[0_0_16px_rgba(244,63,94,0.55)]"
                            style={{ backgroundSize: `${(100 / Math.max(meter, 1)) * 100}% 100%` }}
                            initial={false}
                            animate={{ width: `${meter}%` }}
                            transition={{ type: "spring", stiffness: 140, damping: 22 }}
                          />
                          <span aria-hidden className="absolute top-0 left-1/3 h-full w-px bg-slate-950/70" />
                          <span aria-hidden className="absolute top-0 left-2/3 h-full w-px bg-slate-950/70" />
                        </div>
                        <div aria-hidden className="mt-1.5 grid grid-cols-3 text-[10px] tracking-wide text-slate-500 uppercase">
                          <span>{t.calculator.severity.low}</span>
                          <span className="text-center">{t.calculator.severity.mid}</span>
                          <span className="text-right">{t.calculator.severity.high}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="-mt-4 text-xs text-slate-500">{t.calculator.weekNote}</p>
                </div>

                <div className="flex flex-col rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-500/15 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                      <Receipt className="h-5 w-5 text-emerald-300" aria-hidden />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{t.calculator.rightTitle}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-400">{t.calculator.rightLead}</p>
                    </div>
                  </div>
                  {packages.length === 0 || !selected ? (
                    <p className="mt-6 text-sm text-slate-500">{t.packages.empty}</p>
                  ) : (
                    <>
                      <div role="radiogroup" aria-label={t.calculator.rightTitle} className="mt-6 space-y-2">
                        {packages.map((item) => {
                          const active = item.id === selected.id;
                          const delivery = localizedText(locale, item.delivery, item.deliveryEn);
                          return (
                            <button
                              key={item.id}
                              type="button"
                              role="radio"
                              aria-checked={active}
                              onClick={() => onPackageChange(item.id)}
                              className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                                active
                                  ? "border-emerald-400/50 bg-emerald-400/10 shadow-[0_0_24px_-8px_rgba(16,185,129,0.5)]"
                                  : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                              }`}
                            >
                              <span
                                aria-hidden
                                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition ${
                                  active ? "border-emerald-400 bg-emerald-400/20" : "border-white/25"
                                }`}
                              >
                                {active ? <span className="h-2 w-2 rounded-full bg-emerald-400" /> : null}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-medium text-white">
                                  {localizedText(locale, item.title, item.titleEn)}
                                </span>
                                {delivery ? (
                                  <span className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                                    <Clock className="h-3 w-3" aria-hidden />
                                    {delivery}
                                  </span>
                                ) : null}
                              </span>
                              <span
                                className={`text-sm font-semibold tabular-nums ${active ? "text-emerald-200" : "text-slate-400"}`}
                              >
                                {formatTry(item.price, locale)}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                        <div>
                          <dt className="text-xs tracking-wide text-slate-500 uppercase">{t.calculator.priceLabel}</dt>
                          <dd className="mt-1 text-2xl font-semibold tracking-tight text-white tabular-nums">
                            {formatTry(selected.price, locale)}
                          </dd>
                        </div>
                        {selectedDelivery ? (
                          <div>
                            <dt className="text-xs tracking-wide text-slate-500 uppercase">{t.calculator.durationLabel}</dt>
                            <dd className="mt-1 text-2xl font-semibold tracking-tight text-white">{selectedDelivery}</dd>
                          </div>
                        ) : null}
                      </dl>

                      <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                        <p className="text-xs font-medium text-slate-300">{t.calculator.compareTitle}</p>
                        <div className="mt-3 space-y-3">
                          <div>
                            <div className="flex justify-between text-[11px] text-slate-400">
                              <span>{t.calculator.compareLoss}</span>
                              <span className="font-semibold text-rose-300 tabular-nums">{formatTry(annual, locale)}</span>
                            </div>
                            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                              <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-rose-500 to-rose-400"
                                initial={false}
                                animate={{ width: `${Math.max(2, (annual / compareMax) * 100)}%` }}
                                transition={{ type: "spring", stiffness: 140, damping: 22 }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-[11px] text-slate-400">
                              <span>{t.calculator.compareInvest}</span>
                              <span className="font-semibold text-emerald-300 tabular-nums">
                                {formatTry(selected.price, locale)}
                              </span>
                            </div>
                            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                              <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300"
                                initial={false}
                                animate={{ width: `${Math.max(2, (selected.price / compareMax) * 100)}%` }}
                                transition={{ type: "spring", stiffness: 140, damping: 22 }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <p className="flex items-start gap-2.5 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm leading-relaxed text-rose-100">
                          <Flame className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" aria-hidden />
                          {insight}
                        </p>
                        {paybackDays > 0 ? (
                          <p className="flex items-start gap-2.5 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm leading-relaxed text-emerald-100">
                            <Hourglass className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden />
                            {fill(t.calculator.payback, { days: formatNumber(paybackDays, locale) })}
                          </p>
                        ) : null}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <form onSubmit={submit} className="relative mt-10 border-t border-white/10 pt-8" noValidate>
                <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                  <div>
                    <label htmlFor={phoneId} className="text-sm font-medium text-slate-200">
                      {t.calculator.phoneLabel}
                    </label>
                    <div className="relative mt-3">
                      <span className="pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm font-medium text-slate-300">
                        +90
                      </span>
                      <input
                        id={phoneId}
                        name="phone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        placeholder={t.calculator.phonePlaceholder}
                        value={formatPhone(digits)}
                        aria-invalid={error}
                        aria-describedby={error ? errorId : undefined}
                        onChange={(event) => {
                          setDigits(normalizePhone(event.target.value));
                          if (error) setError(false);
                        }}
                        className={`w-full rounded-2xl border bg-white/5 py-4 pr-4 pl-[4.75rem] text-left tracking-wide text-white tabular-nums outline-none transition placeholder:text-slate-600 focus:bg-white/[0.07] focus:shadow-[0_0_0_4px_rgba(16,185,129,0.12)] ${
                          error ? "border-rose-400/60" : "border-white/10 focus:border-emerald-400/50"
                        }`}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="group inline-flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 px-7 py-4 text-sm font-semibold text-slate-950 shadow-[0_0_32px_rgba(16,185,129,0.35)] transition hover:shadow-[0_0_44px_rgba(16,185,129,0.55)] hover:brightness-110 sm:text-base lg:w-auto"
                  >
                    <MessageCircle className="h-5 w-5" aria-hidden />
                    {t.calculator.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                  </button>
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                  <Lock className="h-3 w-3" aria-hidden />
                  {t.calculator.privacy}
                </p>
                {error ? (
                  <p id={errorId} className="mt-2 text-xs text-rose-400" role="alert">
                    {t.calculator.error}
                  </p>
                ) : null}
                <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-2xl border border-amber-400/20 bg-amber-500/[0.06] px-4 py-3 sm:flex-row">
                  <p className="flex items-center gap-2 text-sm text-amber-100">
                    <Flame className="h-4 w-4 shrink-0 text-amber-400" aria-hidden />
                    {slotsText(settings.projectSlots, {
                      many: t.calculator.urgency,
                      one: t.calculator.urgencyOne,
                      full: t.calculator.urgencyFull,
                    })}
                  </p>
                  <p className="text-center text-xs text-slate-500 sm:text-right">{t.calculator.estimate}</p>
                </div>
              </form>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
