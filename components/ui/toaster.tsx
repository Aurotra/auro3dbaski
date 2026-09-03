"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { cn } from "@/lib/cn";

type Toast = {
  id: number;
  message: string;
  tone: "ok" | "err";
};

type ToastApi = {
  push: (message: string, tone?: Toast["tone"]) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      push: () => {
        /* Toaster yoksa sessiz */
      },
    };
  }
  return ctx;
}

export function Toaster({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const push = useCallback((message: string, tone: Toast["tone"] = "ok") => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, message, tone }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const api = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2 px-4"
        aria-live="polite"
      >
        {items.map((t) => (
          <p
            key={t.id}
            role="status"
            className={cn(
              "pointer-events-auto max-w-md rounded-md border px-4 py-2.5 font-mono text-sm text-text shadow-lg",
              t.tone === "ok"
                ? "border-accent/40 bg-ink-soft"
                : "border-violet/50 bg-ink-soft",
            )}
          >
            {t.message}
          </p>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
