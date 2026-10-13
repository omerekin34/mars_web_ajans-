"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/components/language-provider";

export function StickyCtaBar() {
  const { t } = useI18n();
  const pathname = usePathname();

  if (pathname === "/teklif-al" || pathname.startsWith("/admin")) return null;

  return (
    <div className="pb-safe fixed bottom-0 left-0 z-40 w-full border-t border-slate-800 bg-slate-950/80 backdrop-blur-lg md:hidden">
      <div className="px-4 pt-3">
        <Link
          href="/teklif-al"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3.5 text-base font-semibold text-white shadow-[0_8px_24px_rgba(16,185,129,0.35)] transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
        >
          {t.stickyCta.label}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
