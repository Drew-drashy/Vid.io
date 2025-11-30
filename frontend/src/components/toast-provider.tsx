import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastStatus = "success" | "error" | "info" | "loading";

type ToastOptions = {
  title: string;
  description?: string;
  status?: ToastStatus;
  duration?: number;
};

type ToastMessage = Required<ToastOptions> & { id: string };

type ToastContextValue = {
  toast: (options: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description = "", status = "info", duration = 3500 }: ToastOptions) => {
      const id =
        (typeof crypto !== "undefined" && "randomUUID" in crypto && crypto.randomUUID()) ||
        `${Date.now()}-${Math.random()}`;

      const nextToast: ToastMessage = {
        id,
        title,
        description,
        status,
        duration,
      };

      setToasts((prev) => [...prev, nextToast]);

      if (duration > 0) {
        window.setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[60] flex max-w-sm flex-col gap-3">
        {toasts.map((item) => (
          <ToastItem key={item.id} toast={item} onClose={() => removeToast(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

function ToastItem({ toast, onClose }: { toast: ToastMessage; onClose: () => void }) {
  const palette: Record<ToastStatus, string> = {
    success: "bg-emerald-500/15 border-emerald-600 text-emerald-100",
    error: "bg-rose-500/15 border-rose-600 text-rose-100",
    info: "bg-blue-500/15 border-blue-600 text-blue-100",
    loading: "bg-amber-500/15 border-amber-600 text-amber-100",
  };

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur ${palette[toast.status]}`}
    >
      <div className="flex-1">
        <p className="text-sm font-semibold leading-tight">{toast.title}</p>
        {toast.description ? (
          <p className="mt-1 text-xs text-white/80">{toast.description}</p>
        ) : null}
      </div>
      <button
        className="text-xs font-semibold uppercase tracking-wide text-white/70 hover:text-white"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  );
}
