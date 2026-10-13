"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CircleCheck,
  Clock,
  Gift,
  Globe,
  Loader2,
  Lock,
  Mail,
  RefreshCw,
  Rocket,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Target,
  TrendingUp,
  User,
  Workflow,
  X,
  type LucideIcon,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { LiveSupport } from "@/components/live-support";
import { useI18n } from "@/components/language-provider";
import { fill } from "@/lib/format";
import { submitQuoteLead } from "@/lib/quote-lead";

const steps = ["need", "status", "budget", "contact"] as const;
const needIds = ["corporate", "commerce", "landing", "custom"] as const;
const statusIds = ["scratch", "domain", "refresh"] as const;
const budgetIds = ["starter", "growth", "scale"] as const;

type NeedId = (typeof needIds)[number];
type StatusId = (typeof statusIds)[number];
type BudgetId = (typeof budgetIds)[number];

const needIcons: Record<NeedId, LucideIcon> = {
  corporate: Building2,
  commerce: ShoppingBag,
  landing: Target,
  custom: Workflow,
};

const statusIcons: Record<StatusId, LucideIcon> = {
  scratch: Sparkles,
  domain: Globe,
  refresh: RefreshCw,
};

const budgetIcons: Record<BudgetId, LucideIcon> = {
  starter: Rocket,
  growth: TrendingUp,
  scale: Sparkles,
};

const trustIcons: LucideIcon[] = [Clock, Gift, ShieldCheck];

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

const cardBase =
  "group relative w-full rounded-2xl border p-4 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 sm:p-5";

const cardIdle = "border-white/10 bg-white/[0.03] hover:-translate-y-0.5 hover:border-emerald-300/30 hover:bg-white/[0.05]";

const cardActive =
  "border-emerald-400/60 bg-emerald-400/[0.07] shadow-[0_0_0_1px_rgba(52,211,153,0.25),0_18px_50px_-18px_rgba(16,185,129,0.6)]";

const primaryButton =
  "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-[length:200%_100%] font-bold text-slate-950 shadow-[0_10px_40px_-10px_rgba(16,185,129,0.7)] ring-1 ring-white/30 transition-all duration-500 hover:[background-position:100%_0] hover:shadow-[0_14px_50px_-8px_rgba(45,212,191,0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-wait disabled:opacity-70";

const fieldShell =
  "flex items-center overflow-hidden rounded-2xl border bg-white/[0.04] transition focus-within:bg-white/[0.06]";

export function QuoteWizard() {
  const { t } = useI18n();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const skipInitialScroll = useRef(true);
  const advanceTimer = useRef<number | undefined>(undefined);
  const formId = useId();
  const nameId = useId();
  const businessId = useId();
  const emailId = useId();
  const phoneId = useId();
  const errorId = useId();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [need, setNeed] = useState<NeedId | null>(null);
  const [status, setStatus] = useState<StatusId | null>(null);
  const [budget, setBudget] = useState<BudgetId | null>(null);
  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState("");
  const [selectionError, setSelectionError] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    name: false,
    business: false,
    email: false,
    phone: false,
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState<"save" | "schema" | "config" | null>(null);
  const sendingRef = useRef(false);

  const total = steps.length;
  const current = steps[step];
  const answers = [
    need ? t.quote.need.options[need].title : null,
    status ? t.quote.status.options[status].title : null,
    budget ? t.quote.budget.options[budget] : null,
  ];
  const reachable = (index: number) => answers.slice(0, index).every(Boolean);

  useEffect(() => {
    if (skipInitialScroll.current) {
      skipInitialScroll.current = false;
      return;
    }
    const panel = panelRef.current;
    if (!panel || panel.getBoundingClientRect().top > 80) return;
    panel.scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" });
  }, [step, sent, reduceMotion]);

  useEffect(() => () => window.clearTimeout(advanceTimer.current), []);

  const goTo = (index: number) => {
    window.clearTimeout(advanceTimer.current);
    setSelectionError(false);
    setDirection(index >= step ? 1 : -1);
    setStep(index);
  };

  const goNext = () => {
    const missing =
      (current === "need" && !need) || (current === "status" && !status) || (current === "budget" && !budget);
    if (missing) {
      setSelectionError(true);
      return;
    }
    goTo(Math.min(step + 1, total - 1));
  };

  const goPrev = () => goTo(Math.max(step - 1, 0));

  const choose = (apply: () => void) => {
    apply();
    setSelectionError(false);
    window.clearTimeout(advanceTimer.current);
    const from = step;
    advanceTimer.current = window.setTimeout(
      () => {
        setDirection(1);
        setStep((value) => (value === from ? Math.min(value + 1, total - 1) : value));
      },
      reduceMotion ? 0 : 340,
    );
  };

  const closeWizard = () => {
    if (sendingRef.current) return;
    router.push("/");
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || sendingRef.current) return;
      router.push("/");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  const clearForm = () => {
    setNeed(null);
    setStatus(null);
    setBudget(null);
    setName("");
    setBusiness("");
    setEmail("");
    setDigits("");
    setSelectionError(false);
    setFieldErrors({ name: false, business: false, email: false, phone: false });
  };

  const resetWizard = () => {
    clearForm();
    setStep(0);
    setDirection(1);
    setSubmitError(null);
    setSent(false);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (sendingRef.current) return;
    const nextErrors = {
      name: name.trim().length < 2,
      business: business.trim().length < 2,
      email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
      phone: !/^5\d{9}$/.test(digits),
    };
    setFieldErrors(nextErrors);
    if (nextErrors.name || nextErrors.business || nextErrors.email || nextErrors.phone || !need || !status || !budget) {
      const focusId = nextErrors.name ? nameId : nextErrors.business ? businessId : nextErrors.email ? emailId : phoneId;
      document.getElementById(focusId)?.focus();
      return;
    }

    sendingRef.current = true;
    setSending(true);
    setSubmitError(null);
    const result = await submitQuoteLead({
      projectType: t.quote.need.options[need].title,
      domainStatus: t.quote.status.options[status].title,
      budgetRange: t.quote.budget.options[budget],
      fullName: name.trim(),
      companyName: business.trim(),
      email: email.trim(),
      phone: `+90 ${formatPhone(digits)}`,
    });
    sendingRef.current = false;
    setSending(false);

    if (!result.ok) {
      setSubmitError(result.reason);
      return;
    }

    clearForm();
    setSent(true);
  };

  return (
    <>
      <Navbar />
      <main id="icerik" className="relative min-h-screen overflow-hidden px-4 pt-28 pb-24 sm:px-6 md:pt-36">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,black_30%,transparent_80%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(16,185,129,0.22),transparent)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/3 -left-40 h-[28rem] w-[28rem] rounded-full bg-emerald-500/10 blur-3xl motion-safe:animate-[hero-drift_14s_ease-in-out_infinite]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/4 -right-40 h-[30rem] w-[30rem] rounded-full bg-sky-500/10 blur-3xl motion-safe:animate-[hero-drift_18s_ease-in-out_infinite_reverse]"
        />

        <div className="relative mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-14">
          <aside className="text-center lg:sticky lg:top-32 lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] py-1 pr-3 pl-1 text-xs text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_0_30px_rgba(16,185,129,0.15)] backdrop-blur-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 px-2.5 py-1 text-[10px] font-bold tracking-wider text-slate-950 uppercase">
                <span className="relative flex h-1.5 w-1.5" aria-hidden>
                  <span className="absolute inline-flex h-full w-full rounded-full bg-slate-950/60 motion-safe:animate-ping" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-slate-950" />
                </span>
                {t.quote.kicker}
              </span>
              {t.quote.trust[1]}
            </span>
            <h1 className="mt-6 text-3xl leading-[1.1] font-bold tracking-tight text-balance text-white sm:text-4xl lg:text-[2.75rem]">
              {t.quote.title}
            </h1>
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-pretty text-slate-300 lg:mx-0">
              {t.quote.lead}
            </p>

            {sent ? null : (
              <ol className="mt-10 hidden space-y-1 lg:block">
                {steps.map((id, index) => {
                  const done = index < step && Boolean(answers[index]);
                  const active = index === step;
                  const canGo = reachable(index) && !sending;
                  return (
                    <li key={id} className="relative">
                      {index < total - 1 ? (
                        <span
                          aria-hidden
                          className={`absolute top-11 left-[1.15rem] h-[calc(100%-2.25rem)] w-px ${
                            done ? "bg-gradient-to-b from-emerald-400/70 to-emerald-400/20" : "bg-white/10"
                          }`}
                        />
                      ) : null}
                      <button
                        type="button"
                        onClick={() => goTo(index)}
                        disabled={!canGo}
                        aria-current={active ? "step" : undefined}
                        className={`flex w-full items-start gap-4 rounded-2xl p-1.5 text-left transition ${
                          canGo && !active ? "hover:bg-white/[0.04]" : ""
                        } disabled:cursor-not-allowed`}
                      >
                        <span
                          className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold transition ${
                            active
                              ? "border-emerald-300/60 bg-emerald-400/15 text-emerald-200 shadow-[0_0_24px_rgba(16,185,129,0.45)]"
                              : done
                                ? "border-emerald-400 bg-emerald-400 text-slate-950"
                                : "border-white/10 bg-slate-900 text-slate-500"
                          }`}
                        >
                          {done ? <Check className="h-4 w-4" strokeWidth={3} aria-hidden /> : index + 1}
                        </span>
                        <span className="min-w-0 flex-1 pt-1.5 pb-4">
                          <span className="flex items-center justify-between gap-3">
                            <span className={`text-sm font-semibold ${active || done ? "text-white" : "text-slate-500"}`}>
                              {t.quote.stepLabels[id]}
                            </span>
                            {done ? <span className="text-xs text-emerald-300/80">{t.quote.edit}</span> : null}
                          </span>
                          {answers[index] ? (
                            <span className="mt-0.5 block truncate text-sm text-slate-400">{answers[index]}</span>
                          ) : null}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            )}

            <TrustList items={t.quote.trust} className="mt-8 hidden lg:grid" />
          </aside>

          <div ref={panelRef} className="relative scroll-mt-28">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-gradient-to-tr from-emerald-500/15 via-teal-400/5 to-sky-500/15 blur-3xl"
            />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-gradient-to-b from-slate-900/85 to-slate-950/90 shadow-[0_40px_120px_-30px_rgba(16,185,129,0.35),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.14),transparent_70%)]" />

              <div className="relative flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-8">
                {sent ? (
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300">
                    <CircleCheck className="h-4 w-4" aria-hidden />
                    {t.quote.success.title}
                  </span>
                ) : (
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2 text-sm">
                      <span className="font-bold text-emerald-300 tabular-nums">
                        {String(step + 1).padStart(2, "0")}
                        <span className="text-slate-500"> / {String(total).padStart(2, "0")}</span>
                      </span>
                      <span className="truncate font-medium text-slate-300">{t.quote.stepLabels[current]}</span>
                    </div>
                    <div className="mt-2.5 grid max-w-xs grid-cols-4 gap-1.5" aria-hidden>
                      {steps.map((id, index) => (
                        <span key={id} className="h-1 overflow-hidden rounded-full bg-white/10">
                          <motion.span
                            className="block h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 shadow-[0_0_12px_rgba(16,185,129,0.6)]"
                            initial={false}
                            animate={{ width: index <= step ? "100%" : "0%" }}
                            transition={{ duration: reduceMotion ? 0 : 0.4, ease: "easeOut" }}
                          />
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={closeWizard}
                  disabled={sending}
                  aria-label={t.quote.close}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-slate-400 transition hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>

              <p className="sr-only" aria-live="polite">
                {sent ? t.quote.success.title : fill(t.quote.progress, { current: String(step + 1), total: String(total) })}
              </p>

              <div className="relative px-5 py-6 sm:px-8 sm:py-8">
                {sent ? (
                  <SuccessView onReset={resetWizard} />
                ) : (
                  <>
                    <div className="overflow-hidden">
                      <motion.div
                        key={current}
                        initial={reduceMotion ? false : { x: direction > 0 ? 56 : -56, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: reduceMotion ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] }}
                      >
                        {current === "need" ? (
                          <StepFrame title={t.quote.need.title} lead={t.quote.need.lead}>
                            <div className="grid gap-3 sm:grid-cols-2">
                              {needIds.map((id) => (
                                <OptionCard
                                  key={id}
                                  icon={needIcons[id]}
                                  title={t.quote.need.options[id].title}
                                  body={t.quote.need.options[id].body}
                                  selected={need === id}
                                  stacked
                                  onSelect={() => choose(() => setNeed(id))}
                                />
                              ))}
                            </div>
                          </StepFrame>
                        ) : null}

                        {current === "status" ? (
                          <StepFrame title={t.quote.status.title} lead={t.quote.status.lead}>
                            <div className="grid gap-3">
                              {statusIds.map((id) => (
                                <OptionCard
                                  key={id}
                                  icon={statusIcons[id]}
                                  title={t.quote.status.options[id].title}
                                  body={t.quote.status.options[id].body}
                                  selected={status === id}
                                  onSelect={() => choose(() => setStatus(id))}
                                />
                              ))}
                            </div>
                          </StepFrame>
                        ) : null}

                        {current === "budget" ? (
                          <StepFrame title={t.quote.budget.title} lead={t.quote.budget.lead}>
                            <div className="grid gap-3">
                              {budgetIds.map((id) => {
                                const selected = budget === id;
                                const Icon = budgetIcons[id];
                                return (
                                  <button
                                    key={id}
                                    type="button"
                                    aria-pressed={selected}
                                    onClick={() => choose(() => setBudget(id))}
                                    className={`${cardBase} flex flex-row items-center gap-4 ${selected ? cardActive : cardIdle}`}
                                  >
                                    <SelectedMark selected={selected} />
                                    <IconBox icon={Icon} selected={selected} />
                                    <span className="min-w-0 flex-1 pr-6 sm:flex sm:items-center sm:justify-between sm:gap-4">
                                      <span className="block">
                                        <span className="block text-[11px] font-semibold tracking-[0.16em] text-emerald-300/80 uppercase">
                                          {t.quote.budget.tiers[id].label}
                                        </span>
                                        <span className="mt-0.5 block text-sm leading-relaxed text-slate-400">
                                          {t.quote.budget.tiers[id].hint}
                                        </span>
                                      </span>
                                      <span className="mt-1 block text-lg font-bold tracking-tight whitespace-nowrap text-white tabular-nums sm:mt-0 sm:text-xl">
                                        {t.quote.budget.options[id]}
                                      </span>
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </StepFrame>
                        ) : null}

                        {current === "contact" ? (
                          <StepFrame title={t.quote.contact.title} lead={t.quote.contact.lead}>
                            <div className="mb-6 flex flex-wrap gap-2 lg:hidden">
                              {answers.map((answer, index) =>
                                answer ? (
                                  <button
                                    key={steps[index]}
                                    type="button"
                                    onClick={() => goTo(index)}
                                    className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-emerald-300/25 bg-emerald-400/[0.08] px-3 py-1.5 text-xs text-emerald-100 transition hover:border-emerald-300/50"
                                  >
                                    <Check className="h-3 w-3 shrink-0 text-emerald-300" aria-hidden />
                                    <span className="truncate">{answer}</span>
                                  </button>
                                ) : null,
                              )}
                            </div>
                            <form
                              id={formId}
                              onSubmit={(event) => void submit(event)}
                              noValidate
                              className="grid gap-x-4 gap-y-5 sm:grid-cols-2"
                            >
                              <Field
                                id={nameId}
                                icon={User}
                                label={t.quote.contact.name}
                                value={name}
                                placeholder={t.quote.contact.namePlaceholder}
                                autoComplete="name"
                                error={fieldErrors.name ? t.quote.contact.nameError : ""}
                                onChange={(value) => {
                                  setName(value);
                                  setFieldErrors((currentErrors) => ({ ...currentErrors, name: false }));
                                }}
                              />
                              <Field
                                id={businessId}
                                icon={Building2}
                                label={t.quote.contact.business}
                                value={business}
                                placeholder={t.quote.contact.businessPlaceholder}
                                autoComplete="organization"
                                error={fieldErrors.business ? t.quote.contact.businessError : ""}
                                onChange={(value) => {
                                  setBusiness(value);
                                  setFieldErrors((currentErrors) => ({ ...currentErrors, business: false }));
                                }}
                              />
                              <Field
                                id={emailId}
                                icon={Mail}
                                label={t.quote.contact.email}
                                type="email"
                                value={email}
                                placeholder={t.quote.contact.emailPlaceholder}
                                autoComplete="email"
                                error={fieldErrors.email ? t.quote.contact.emailError : ""}
                                onChange={(value) => {
                                  setEmail(value);
                                  setFieldErrors((currentErrors) => ({ ...currentErrors, email: false }));
                                }}
                              />
                              <div>
                                <label htmlFor={phoneId} className="mb-2 block text-sm font-medium text-slate-200">
                                  {t.quote.contact.phone}
                                </label>
                                <div
                                  className={`${fieldShell} ${
                                    fieldErrors.phone
                                      ? "border-rose-400/70"
                                      : "border-white/10 focus-within:border-emerald-400/60"
                                  }`}
                                >
                                  <span className="flex items-center self-stretch border-r border-white/10 px-3.5 text-sm font-semibold text-slate-300">
                                    +90
                                  </span>
                                  <input
                                    id={phoneId}
                                    name="phone"
                                    inputMode="numeric"
                                    autoComplete="tel-national"
                                    placeholder="5XX XXX XX XX"
                                    aria-invalid={fieldErrors.phone}
                                    aria-describedby={fieldErrors.phone ? `${phoneId}-error` : undefined}
                                    value={formatPhone(digits)}
                                    onChange={(event) => {
                                      setDigits(normalizePhone(event.target.value));
                                      setFieldErrors((currentErrors) => ({ ...currentErrors, phone: false }));
                                    }}
                                    className="w-full bg-transparent px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-500"
                                  />
                                </div>
                                {fieldErrors.phone ? (
                                  <p id={`${phoneId}-error`} className="mt-2 text-xs leading-relaxed text-rose-300">
                                    {t.quote.contact.phoneError}
                                  </p>
                                ) : null}
                              </div>
                            </form>
                          </StepFrame>
                        ) : null}
                      </motion.div>
                    </div>

                    {selectionError ? (
                      <p id={errorId} className="mt-5 text-sm text-rose-300" role="alert">
                        {t.quote.required}
                      </p>
                    ) : null}
                    {submitError ? (
                      <p
                        className="mt-5 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
                        role="alert"
                      >
                        {submitError === "schema" ? t.quote.contact.schemaError : t.quote.contact.submitError}
                      </p>
                    ) : null}

                    <div className="mt-8 flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                      {step > 0 ? (
                        <button
                          type="button"
                          onClick={goPrev}
                          disabled={sending}
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <ArrowLeft className="h-4 w-4" aria-hidden />
                          {t.quote.back}
                        </button>
                      ) : (
                        <span className="hidden sm:block" />
                      )}
                      {current === "contact" ? (
                        <button
                          type="submit"
                          form={formId}
                          disabled={sending}
                          className={`${primaryButton} w-full px-7 py-4 text-base sm:w-auto`}
                        >
                          <span
                            aria-hidden
                            className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-20deg] bg-white/50 blur-md motion-safe:animate-[hero-shine_3.5s_ease-in-out_infinite]"
                          />
                          {sending ? <Loader2 className="relative h-5 w-5 animate-spin" aria-hidden /> : null}
                          <span className="relative">{sending ? t.quote.contact.submitting : t.quote.contact.submit}</span>
                          {sending ? null : (
                            <ArrowRight className="relative h-5 w-5 transition group-hover:translate-x-1" aria-hidden />
                          )}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={goNext}
                          aria-describedby={selectionError ? errorId : undefined}
                          className={`${primaryButton} w-full px-6 py-3 text-sm sm:w-auto`}
                        >
                          <span className="relative">{t.quote.next}</span>
                          <ArrowRight className="relative h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
                        </button>
                      )}
                    </div>

                    {current === "contact" ? (
                      <p className="mt-4 flex items-start justify-center gap-1.5 text-center text-xs leading-relaxed text-slate-500 sm:justify-end sm:text-right">
                        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500/80" aria-hidden />
                        <span>
                          {t.quote.contact.privacy}{" "}
                          <Link href="/kvkk" className="text-slate-300 underline-offset-2 hover:text-white hover:underline">
                            {t.quote.contact.privacyLink}
                          </Link>
                        </span>
                      </p>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          </div>

          <TrustList items={t.quote.trust} className="grid sm:grid-cols-3 lg:hidden" />
        </div>
      </main>
      <LiveSupport />
    </>
  );
}

function TrustList({ items, className }: { items: readonly string[]; className: string }) {
  return (
    <ul className={`gap-3 ${className}`}>
      {items.map((item, index) => {
        const Icon = trustIcons[index] ?? CircleCheck;
        return (
          <li
            key={item}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-300/25 bg-emerald-400/10 text-emerald-300">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            {item}
          </li>
        );
      })}
    </ul>
  );
}

function SuccessView({ onReset }: { onReset: () => void }) {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex flex-col items-center px-2 py-6 text-center" role="status">
      <motion.div
        initial={reduceMotion ? false : { scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 280, damping: 16 }}
        className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-300/40 shadow-[0_0_60px_rgba(16,185,129,0.35)]"
      >
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full bg-emerald-400/25"
          initial={reduceMotion ? false : { scale: 0.8, opacity: 0.7 }}
          animate={reduceMotion ? undefined : { scale: 1.6, opacity: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        <Check className="h-9 w-9" strokeWidth={2.4} aria-hidden />
      </motion.div>
      <h2 className="mt-6 text-2xl font-bold tracking-tight text-white sm:text-3xl">{t.quote.success.title}</h2>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400">{t.quote.success.body}</p>

      <div className="mt-8 w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left">
        <p className="text-xs font-semibold tracking-[0.16em] text-emerald-300/80 uppercase">{t.quote.success.nextTitle}</p>
        <ol className="mt-4 space-y-3">
          {t.quote.success.next.map((item, index) => (
            <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-400/10 text-xs font-bold text-emerald-300">
                {index + 1}
              </span>
              <span className="pt-0.5">{item}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Link href="/" className={`${primaryButton} px-6 py-3 text-sm`}>
          <span className="relative">{t.quote.success.home}</span>
          <ArrowRight className="relative h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
        </Link>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/[0.08]"
        >
          {t.quote.success.again}
        </button>
      </div>
    </div>
  );
}

function StepFrame({ title, lead, children }: { title: string; lead: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight text-balance text-white sm:text-2xl">{title}</h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">{lead}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function SelectedMark({ selected }: { selected: boolean }) {
  return (
    <span
      aria-hidden
      className={`absolute top-3.5 right-3.5 flex h-5 w-5 items-center justify-center rounded-full border transition ${
        selected ? "border-emerald-400 bg-emerald-400 text-slate-950" : "border-white/20 bg-transparent text-transparent"
      }`}
    >
      <Check className="h-3 w-3" strokeWidth={3} />
    </span>
  );
}

function IconBox({ icon: Icon, selected }: { icon: LucideIcon; selected: boolean }) {
  return (
    <span
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition ${
        selected
          ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-300"
          : "border-white/10 bg-white/5 text-slate-300 group-hover:border-emerald-300/30 group-hover:text-emerald-200"
      }`}
    >
      <Icon className="h-5 w-5" aria-hidden />
    </span>
  );
}

function OptionCard({
  icon,
  title,
  body,
  selected,
  stacked = false,
  onSelect,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  selected: boolean;
  stacked?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`${cardBase} flex gap-4 ${stacked ? "flex-row items-center sm:flex-col sm:items-start" : "flex-row items-center"} ${
        selected ? cardActive : cardIdle
      }`}
    >
      <SelectedMark selected={selected} />
      <IconBox icon={icon} selected={selected} />
      <span className="min-w-0 pr-6">
        <span className="block text-base font-semibold text-white">{title}</span>
        <span className="mt-1 block text-sm leading-relaxed text-slate-400">{body}</span>
      </span>
    </button>
  );
}

function Field({
  id,
  icon: Icon,
  label,
  value,
  placeholder,
  autoComplete,
  error,
  onChange,
  type = "text",
}: {
  id: string;
  icon: LucideIcon;
  label: string;
  value: string;
  placeholder: string;
  autoComplete: string;
  error: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-200">
        {label}
      </label>
      <div className={`${fieldShell} ${error ? "border-rose-400/70" : "border-white/10 focus-within:border-emerald-400/60"}`}>
        <Icon className="ml-4 h-4 w-4 shrink-0 text-slate-500" aria-hidden />
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-transparent px-3 py-3.5 text-sm text-white outline-none placeholder:text-slate-500"
        />
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-xs leading-relaxed text-rose-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
