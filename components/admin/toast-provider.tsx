"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastTone = "success" | "error";

type ToastItem = {
  id: number;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  notify: (message: string, tone?: ToastTone) => void;
  success: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const notify = useCallback((message: string, tone: ToastTone = "success") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3400);
  }, []);

  const success = useCallback(() => notify("İşlem Başarılı", "success"), [notify]);
  const value = useMemo(() => ({ notify, success }), [notify, success]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 bottom-4 z-[80] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-3 sm:right-6 sm:bottom-6">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto rounded-xl border px-4 py-3 text-sm font-semibold shadow-[0_16px_40px_rgba(2,6,23,0.45)] backdrop-blur-md ${
              toast.tone === "success"
                ? "border-emerald-300/40 bg-emerald-500 text-slate-950"
                : "border-rose-300/30 bg-rose-500 text-white"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useAdminToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useAdminToast must be used within ToastProvider");
  }
  return context;
}
