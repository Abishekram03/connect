"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    title: "",
    message: "",
  });
  const [resolvePromise, setResolvePromise] = useState<(value: boolean) => void>(() => {});

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(opts);
      setResolvePromise(() => resolve);
      setOpen(true);
    });
  }, []);

  const handleConfirm = () => {
    setOpen(false);
    resolvePromise(true);
  };

  const handleCancel = () => {
    setOpen(false);
    resolvePromise(false);
  };

  const btnStyles = {
    danger: "bg-red-600 text-white hover:bg-red-700",
    warning: "bg-amber-600 text-white hover:bg-amber-700",
    default: "bg-ink text-primary-foreground hover:opacity-90",
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {open && (
        <>
          <div className="fixed inset-0 z-[10000] bg-black/40 animate-in fade-in duration-200" onClick={handleCancel} />
          <div className="fixed left-1/2 top-1/2 z-[10001] w-[calc(100vw-32px)] max-w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 fade-in duration-200">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-ink">{options.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{options.message}</p>
              </div>
              <button onClick={handleCancel} className="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                onClick={handleCancel}
                className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {options.cancelLabel || "Cancel"}
              </button>
              <button
                onClick={handleConfirm}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${btnStyles[options.variant || "default"]}`}
              >
                {options.confirmLabel || "Confirm"}
              </button>
            </div>
          </div>
        </>
      )}
    </ConfirmContext.Provider>
  );
}
