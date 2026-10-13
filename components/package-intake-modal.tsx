"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Clock, Lock, X } from "lucide-react";
import { useI18n } from "@/components/language-provider";
import { formatTry } from "@/lib/format";
import { localizedText } from "@/lib/localized";
import { submitPackageLead } from "@/lib/package-lead";
import type { PublicPackage } from "@/lib/public-content";

type PackageIntakeModalProps = {
  pkg: PublicPackage | null;
  onClose: () => void;
};

type FieldErrors = {
  name: boolean;
  company: boolean;
  phone: boolean;
  email: boolean;
};

const emptyErrors: FieldErrors = {
  name: false,
  company: false,
  phone: false,
  email: false,
};

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function normalizeTrPhone(raw: string) {
  let digits = digitsOnly(raw);
  if (digits.startsWith("90") && digits.length > 10) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return digits.slice(0, 10);
}

function formatTrPhone(digits: string) {
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 8), digits.slice(8, 10)].filter(Boolean).join(" ");
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

const fieldClass =
  "w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-300/70 focus:bg-white/[0.06]";

export function PackageIntakeModal({ pkg, onClose }: PackageIntakeModalProps) {
  const { locale, t } = useI18n();
  const packageId = pkg?.id ?? null;
  const packageLabel = pkg ? `${localizedText(locale, pkg.title, pkg.titleEn)} - ${formatTry(pkg.price, locale)}` : null;
  const delivery = pkg ? localizedText(locale, pkg.delivery, pkg.deliveryEn) : "";
  const copy = t.packages.intake;
  const reduce = useReducedMotion();
  const titleId = useId();
  const formId = useId();
  const nameId = useId();
  const companyId = useId();
  const phoneId = useId();
  const emailId = useId();
  const notesId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const sendingRef = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [addonPicks, setAddonPicks] = useState<number[]>([]);
  const [errors, setErrors] = useState<FieldErrors>(emptyErrors);
  const [submitError, setSubmitError] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setName("");
    setCompany("");
    setPhone("");
    setEmail("");
    setNotes("");
    setAddonPicks([]);
    setErrors(emptyErrors);
    setSubmitError(false);
    sendingRef.current = false;
    setSending(false);
    setSent(false);
  }, [packageId]);

  useEffect(() => {
    if (!packageId) return;

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !sendingRef.current) {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = [...dialog.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled])")];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !dialog.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const frame = requestAnimationFrame(() => {
      dialogRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    });

    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [packageId, onClose]);

  if (!mounted) return null;

  const trPhone = locale === "tr";
  const addons = pkg?.addons ?? [];
  const pickedAddons = addons.filter((_, index) => addonPicks.includes(index));
  const total = (pkg?.price ?? 0) + pickedAddons.reduce((sum, addon) => sum + addon.price, 0);

  const toggleAddon = (index: number) => {
    setAddonPicks((current) => (current.includes(index) ? current.filter((item) => item !== index) : [...current, index]));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!pkg || sending) return;

    const phoneDigits = trPhone ? normalizeTrPhone(phone) : digitsOnly(phone);
    const nextErrors: FieldErrors = {
      name: name.trim().length < 2,
      company: company.trim().length < 2,
      phone: trPhone ? !/^5\d{9}$/.test(phoneDigits) : phoneDigits.length < 7 || phoneDigits.length > 15,
      email: !validEmail(email),
    };
    setErrors(nextErrors);
    setSubmitError(false);
    if (Object.values(nextErrors).some(Boolean)) {
      const focusId = nextErrors.name ? nameId : nextErrors.company ? companyId : nextErrors.phone ? phoneId : emailId;
      document.getElementById(focusId)?.focus();
      return;
    }

    const phoneValue = trPhone ? `+90 ${formatTrPhone(phoneDigits)}` : phone.trim();
    sendingRef.current = true;
    setSending(true);
    const result = await submitPackageLead({
      name: name.trim(),
      company: company.trim(),
      phone: phoneValue,
      email: email.trim(),
      notes: notes.trim(),
      packageLabel: `${pkg.title} - ${formatTry(pkg.price, "tr")}`,
      addons: pickedAddons.map((addon) => `${addon.title} (+${formatTry(addon.price, "tr")})`),
      estimatedTotal: total,
    });
    sendingRef.current = false;
    setSending(false);
    if (!result.ok) {
      setSubmitError(true);
      return;
    }
    setSent(true);
  };

  return createPortal(
    <AnimatePresence>
      {packageId && packageLabel ? (
        <motion.div
          key="package-intake"
          className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/75 p-3 backdrop-blur-md sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.22 }}
          onClick={() => {
            if (!sending) onClose();
          }}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative flex max-h-[min(92vh,760px)] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-white/15 bg-slate-950/55 shadow-[0_30px_90px_rgba(2,6,23,0.55)] backdrop-blur-2xl"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: reduce ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(167,139,250,0.18),transparent_46%)]" />
            <div className="relative flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
              <div>
                <h2 id={titleId} className="text-lg font-semibold tracking-tight text-white">
                  {copy.title}
                </h2>
                <p className="mt-1 text-sm text-slate-400">{copy.lead}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={sending}
                aria-label={copy.close}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-slate-300 transition hover:border-white/30 hover:text-white disabled:opacity-40"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <div className="relative overflow-y-auto px-5 py-5 sm:px-6">
              {sent ? (
                <div className="flex flex-col items-center px-2 py-10 text-center" role="status">
                  <motion.div
                    initial={reduce ? false : { scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 280, damping: 16 }}
                    className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-300/40"
                  >
                    <motion.span
                      aria-hidden
                      className="absolute inset-0 rounded-full bg-emerald-400/25"
                      initial={reduce ? false : { scale: 0.8, opacity: 0.7 }}
                      animate={reduce ? undefined : { scale: 1.55, opacity: 0 }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                    />
                    <Check className="h-8 w-8" strokeWidth={2.4} aria-hidden />
                  </motion.div>
                  <p className="mt-6 max-w-sm text-base leading-7 text-emerald-100">{copy.success}</p>
                </div>
              ) : (
                <form id={formId} onSubmit={(event) => void submit(event)} noValidate className="grid gap-4">
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-medium tracking-[0.16em] text-violet-200/80 uppercase">
                      <Lock className="h-3.5 w-3.5" aria-hidden />
                      {copy.selected}
                    </p>
                    <div className="rounded-2xl border border-violet-300/30 bg-violet-400/10 px-4 py-3">
                      <p className="text-sm font-semibold text-white">{packageLabel}</p>
                      {delivery ? (
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-violet-100/80">
                          <Clock className="h-3.5 w-3.5" aria-hidden />
                          {t.packages.delivery}: {delivery}
                        </p>
                      ) : null}
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500">{copy.locked}</p>
                  </div>

                  {addons.length > 0 ? (
                    <fieldset>
                      <div className="mb-1 flex items-center justify-between gap-3">
                        <legend className="text-sm font-medium text-slate-200">{copy.addons}</legend>
                        <span className="text-[11px] tracking-wide text-slate-500 uppercase">{copy.optional}</span>
                      </div>
                      <p className="mb-3 text-xs text-slate-500">{copy.addonsHint}</p>
                      <div className="grid gap-2">
                        {addons.map((addon, index) => {
                          const picked = addonPicks.includes(index);
                          return (
                            <label
                              key={`${addon.title}-${index}`}
                              className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                                picked
                                  ? "border-violet-300/60 bg-violet-400/10 text-white"
                                  : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20"
                              }`}
                            >
                              <span className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={picked}
                                  onChange={() => toggleAddon(index)}
                                  className="h-4 w-4 shrink-0 accent-violet-400"
                                />
                                <span>{localizedText(locale, addon.title, addon.titleEn)}</span>
                              </span>
                              <span className={`shrink-0 tabular-nums ${picked ? "text-violet-100" : "text-slate-400"}`}>
                                +{formatTry(addon.price, locale)}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-emerald-300/25 bg-emerald-400/[0.06] px-4 py-3">
                        <span className="text-sm text-emerald-100">{copy.total}</span>
                        <span className="text-lg font-semibold text-white tabular-nums" aria-live="polite">
                          {formatTry(total, locale)}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-slate-500">{copy.totalNote}</p>
                    </fieldset>
                  ) : null}

                  <Field
                    id={nameId}
                    label={copy.name}
                    value={name}
                    placeholder={copy.namePlaceholder}
                    autoComplete="name"
                    autoFocus
                    error={errors.name ? copy.nameError : ""}
                    onChange={(value) => {
                      setName(value);
                      setErrors((current) => ({ ...current, name: false }));
                    }}
                  />
                  <Field
                    id={companyId}
                    label={copy.company}
                    value={company}
                    placeholder={copy.companyPlaceholder}
                    autoComplete="organization"
                    error={errors.company ? copy.companyError : ""}
                    onChange={(value) => {
                      setCompany(value);
                      setErrors((current) => ({ ...current, company: false }));
                    }}
                  />
                  <div>
                    <label htmlFor={phoneId} className="mb-2 block text-sm font-medium text-slate-200">
                      {copy.phone}
                    </label>
                    <div
                      className={`flex overflow-hidden rounded-2xl border bg-white/[0.04] ${
                        errors.phone ? "border-rose-400" : "border-white/10 focus-within:border-violet-300/70"
                      }`}
                    >
                      {trPhone ? (
                        <span className="flex items-center border-r border-white/10 px-4 text-sm font-semibold text-slate-300">
                          +90
                        </span>
                      ) : null}
                      <input
                        id={phoneId}
                        name="phone"
                        inputMode="tel"
                        autoComplete="tel"
                        required
                        aria-invalid={errors.phone}
                        aria-describedby={errors.phone ? `${phoneId}-error` : undefined}
                        placeholder={copy.phonePlaceholder}
                        value={trPhone ? formatTrPhone(normalizeTrPhone(phone)) : phone}
                        onChange={(event) => {
                          setPhone(trPhone ? normalizeTrPhone(event.target.value) : event.target.value);
                          setErrors((current) => ({ ...current, phone: false }));
                        }}
                        className="w-full bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                      />
                    </div>
                    {errors.phone ? (
                      <p id={`${phoneId}-error`} className="mt-2 text-sm text-rose-300">
                        {copy.phoneError}
                      </p>
                    ) : null}
                  </div>
                  <Field
                    id={emailId}
                    label={copy.email}
                    type="email"
                    value={email}
                    placeholder={copy.emailPlaceholder}
                    autoComplete="email"
                    error={errors.email ? copy.emailError : ""}
                    onChange={(value) => {
                      setEmail(value);
                      setErrors((current) => ({ ...current, email: false }));
                    }}
                  />
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label htmlFor={notesId} className="text-sm font-medium text-slate-200">
                        {copy.notes}
                      </label>
                      <span className="text-[11px] tracking-wide text-slate-500 uppercase">{copy.optional}</span>
                    </div>
                    <textarea
                      id={notesId}
                      name="notes"
                      rows={4}
                      maxLength={1000}
                      value={notes}
                      placeholder={copy.notesPlaceholder}
                      onChange={(event) => setNotes(event.target.value)}
                      className={`${fieldClass} resize-none`}
                    />
                  </div>

                  {submitError ? (
                    <p className="text-sm text-rose-300" role="alert">
                      {copy.submitError}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={sending}
                    className="mt-1 rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-violet-100 disabled:cursor-wait disabled:opacity-70"
                  >
                    {sending ? copy.submitting : copy.submit}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

function Field({
  id,
  label,
  value,
  placeholder,
  autoComplete,
  error,
  onChange,
  type = "text",
  autoFocus = false,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  autoComplete: string;
  error: string;
  onChange: (value: string) => void;
  type?: string;
  autoFocus?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-200">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        data-autofocus={autoFocus ? "" : undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={`${fieldClass} ${error ? "border-rose-400" : ""}`}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-sm text-rose-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
