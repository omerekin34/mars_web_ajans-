"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

type AdminModalProps = {
  open: boolean;
  title: string;
  description?: string;
  wide?: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export function AdminModal({ open, title, description, wide = false, onClose, children }: AdminModalProps) {
  const titleId = useId();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    const frame = window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    });
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      window.cancelAnimationFrame(frame);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button type="button" aria-label="Pencereyi kapat" className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative z-10 flex max-h-[min(92vh,820px)] w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 shadow-[0_30px_80px_rgba(2,6,23,0.55)] backdrop-blur-md ${wide ? "max-w-4xl" : "max-w-xl"}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-white">
              {title}
            </h2>
            {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-slate-300 transition hover:border-emerald-400/40 hover:text-white"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
