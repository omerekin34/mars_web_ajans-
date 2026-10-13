"use client";

import { ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/components/language-provider";

type Method = {
  id: string;
  name: string;
};

const methods: Method[] = [
  { id: "mastercard", name: "Mastercard" },
  { id: "amex", name: "American Express" },
  { id: "apple-pay", name: "Apple Pay" },
  { id: "google-pay", name: "Google Pay" },
  { id: "visa", name: "Visa" },
];

function MastercardLogo() {
  return (
    <span className="inline-flex items-center gap-2" aria-hidden>
      <svg viewBox="0 0 38 24" className="h-6 w-9">
        <circle cx="13" cy="12" r="8" fill="#EB001B" />
        <circle cx="25" cy="12" r="8" fill="#F79E1B" />
        <path d="M19 6.71a8 8 0 0 1 0 10.58 8 8 0 0 1 0-10.58z" fill="#FF5F00" />
      </svg>
      <span className="text-[13px] leading-none font-medium tracking-[-0.01em] text-slate-100">mastercard</span>
    </span>
  );
}

function AmexLogo() {
  return (
    <span
      className="flex h-9 w-14 flex-col items-center justify-center rounded-md bg-[#1F72CD] text-[7.5px] leading-[1.15] font-extrabold tracking-[0.08em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]"
      aria-hidden
    >
      <span>AMERICAN</span>
      <span>EXPRESS</span>
    </span>
  );
}

function ApplePayLogo() {
  return (
    <span className="inline-flex items-center gap-1 text-white" aria-hidden>
      <svg viewBox="0 0 24 24" className="-mt-0.5 h-5 w-5" fill="currentColor">
        <path d="M16.37 12.72c-.03-2.35 1.92-3.48 2.01-3.53-1.1-1.6-2.8-1.82-3.4-1.85-1.45-.15-2.83.85-3.56.85-.74 0-1.88-.83-3.09-.81-1.59.02-3.06.92-3.88 2.35-1.65 2.87-.42 7.11 1.19 9.44.79 1.14 1.73 2.42 2.96 2.37 1.19-.05 1.64-.77 3.08-.77s1.84.77 3.1.74c1.28-.02 2.09-1.16 2.87-2.3.9-1.32 1.27-2.6 1.29-2.66-.03-.01-2.48-.95-2.51-3.77zM14.7 6.3c.65-.79 1.09-1.89.97-2.98-.94.04-2.08.63-2.75 1.42-.6.7-1.13 1.82-.99 2.89 1.05.08 2.12-.53 2.77-1.33z" />
      </svg>
      <span className="text-[18px] leading-none font-medium tracking-[-0.03em]">Pay</span>
    </span>
  );
}

function GooglePayLogo() {
  return (
    <span className="inline-flex items-center gap-1.5" aria-hidden>
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]">
        <path
          fill="#4285F4"
          d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.56-5.16 3.56-8.65z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.87-3c-1.07.72-2.45 1.15-4.08 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.09A12 12 0 0 0 12 24z"
        />
        <path
          fill="#FBBC05"
          d="M5.27 14.28a7.2 7.2 0 0 1 0-4.56V6.63H1.26a12 12 0 0 0 0 10.74l4.01-3.09z"
        />
        <path
          fill="#EA4335"
          d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.45-3.45C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.69 1.26 6.63l4.01 3.09C6.22 6.88 8.87 4.77 12 4.77z"
        />
      </svg>
      <span className="text-[18px] leading-none font-medium tracking-[-0.03em] text-slate-100">Pay</span>
    </span>
  );
}

function VisaLogo() {
  return (
    <svg viewBox="0 0 64 22" className="h-6 w-16" aria-hidden>
      <text
        x="32"
        y="18"
        textAnchor="middle"
        fill="#FFFFFF"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="21"
        fontStyle="italic"
        fontWeight="800"
        letterSpacing="0.6"
      >
        VISA
      </text>
    </svg>
  );
}

const logos = {
  mastercard: MastercardLogo,
  amex: AmexLogo,
  "apple-pay": ApplePayLogo,
  "google-pay": GooglePayLogo,
  visa: VisaLogo,
} as const;

function PaymentCard({ method }: { method: Method }) {
  const Logo = logos[method.id as keyof typeof logos];

  return (
    <div className="group relative flex h-[72px] w-44 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_30px_-18px_rgba(0,0,0,0.8)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:from-white/[0.1] hover:to-white/[0.04]">
      <span
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden
      />
      <span className="opacity-90 transition-opacity duration-300 group-hover:opacity-100">
        <Logo />
      </span>
    </div>
  );
}

export function PaymentTrust() {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const sequence = Array.from({ length: 5 }, () => methods).flat();
  const loop = [...sequence, ...sequence];
  const half = sequence.length;

  return (
    <section aria-label={t.trust.label} className="relative border-t border-white/10 py-14 md:py-16">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-px max-w-2xl bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent"
        aria-hidden
      />

      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/[0.08] px-3.5 py-1.5 backdrop-blur-md">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" strokeWidth={2} aria-hidden />
          <span className="text-[11px] font-semibold tracking-[0.18em] text-emerald-100 uppercase">{t.trust.badge}</span>
        </div>
        <p className="max-w-lg text-sm leading-relaxed text-slate-400 md:text-[15px]">{t.trust.text}</p>
      </div>

      <div className={`payment-marquee relative mt-10 overflow-hidden py-2 ${reduce ? "" : "payment-marquee-mask"}`}>
        {reduce ? (
          <ul className="flex flex-wrap items-center justify-center gap-4 px-6">
            {methods.map((method) => (
              <li key={method.id}>
                <PaymentCard method={method} />
                <span className="sr-only">{method.name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="animate-marquee flex w-max items-center">
              {[0, 1].map((copy) => (
                <ul
                  key={copy}
                  className="flex shrink-0 items-center gap-4 pr-4 md:gap-5 md:pr-5"
                  aria-hidden={copy === 1 ? true : undefined}
                >
                  {loop.slice(copy * half, (copy + 1) * half).map((method, index) => {
                    const primary = copy === 0 && index < methods.length;
                    return (
                      <li key={`${copy}-${method.id}-${index}`} aria-hidden={primary ? undefined : true}>
                        <PaymentCard method={method} />
                        {primary ? <span className="sr-only">{method.name}</span> : null}
                      </li>
                    );
                  })}
                </ul>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
