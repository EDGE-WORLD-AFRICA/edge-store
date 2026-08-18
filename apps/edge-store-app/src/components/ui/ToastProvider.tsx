import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState
} from "react";
import type { ReactNode } from "react";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Bell,
  X
} from "lucide-react";
import type { IToast, IToastOptions, IToastVariant } from "@edge-store/shared";

interface IToastContextValue {
  toast: (options: IToastOptions) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<IToastContextValue | null>(null);

const MAX_VISIBLE_TOASTS = 8;

const variantConfig: Record<IToastVariant, { icon: ReactNode; containerClass: string }> = {
  success: {
    icon: <CheckCircle2 size={18} />,
    containerClass: "border-success/30 bg-success text-success-foreground"
  },
  error: {
    icon: <AlertCircle size={18} />,
    containerClass: "border-danger/30 bg-danger text-danger-foreground"
  },
  warning: {
    icon: <AlertTriangle size={18} />,
    containerClass: "border-warning/30 bg-warning text-warning-foreground"
  },
  info: {
    icon: <Bell size={18} />,
    containerClass: "border-info/30 bg-info text-info-foreground"
  },
  default: {
    icon: <Bell size={18} />,
    containerClass: "border-border bg-card text-card-foreground"
  },
  dark: {
    icon: <Bell size={18} />,
    containerClass: "border-foreground/20 bg-foreground text-background"
  },
  custom: {
    icon: <Bell size={18} />,
    containerClass: ""
  }
};

const generateId = (): string => (`toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<IToast[]>([]);
  const [existingId, setExistingIds] = useState<Set<string>>(new Set());
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    setExistingIds((prev) => new Set(prev).add(id));

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      setExistingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });

    }, 250);

    const timer = timersRef.current.get(id);
    if(timer){
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const toast = useCallback((options:  IToastOptions) => {
    const id = generateId();
    const newToast: IToast = {
      id,
      title: options.title,
      message: options.message,
      variant: options.variant || "default",
      duration: options.duration !== undefined ? options.duration : 4000,
      dismissible: options.dismissible !== undefined ? options.dismissible : true,
      customClass: options.customClass,
      createdAt: Date.now()
    };

    setToasts((prev) => {
     const updated = [...prev, newToast];
     if(updated.length > MAX_VISIBLE_TOASTS){
      const removed = updated.shift();
      if(removed){
        const timer = timersRef.current.get(removed.id);
        
        if(timer) clearTimeout(timer);
        timersRef.current.delete(removed.id);
      }
      return updated.slice(-MAX_VISIBLE_TOASTS);
     } 
     return updated;
    });

    if(newToast.duration > 0){
      const timer = setTimeout(() => {
        removeToast(id);
      }, newToast.duration);

      timersRef.current.set(id, timer);
    }

  }, [removeToast]);

  const dismiss = useCallback((id: string) => {
    removeToast(id);
  }, [removeToast]);

  const dismissAll = useCallback(() => {
    toasts.forEach((t) => removeToast(t.id));
  }, [toasts, removeToast]);

  const value = useMemo(() => (
    { toast, dismiss, dismissAll}
  ), [toasts, dismiss, dismissAll]);

  return(
    <ToastContext.Provider value={value}>
      { children }

      {/* Toast container - Mobile first */}
      <div className="pointer-events-none fixed top-0 right-0 z-[10000] flex flex-col items-end gap-2 p-4 sm:p-6">
        {toasts.map((t) => {
          const config = variantConfig[t.variant];
          const isExiting = existingId.has(t.id);

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm ${
                isExiting ? "animate-toast-out" : "animate-toast-in"
              } ${
                t.variant === "custom" && t.customClass
                  ? t.customClass
                  : config.containerClass
              }`}
            >
              <span className="mt-0.5 shrink-0">
                {t.variant === "custom" ? <Bell size={18} /> : config.icon}
              </span>

              <div className="flex-1 space-y-0.5">
                {t.title && (
                  <p className="text-sm font-semibold leading-tight">{t.title}</p>
                )}
                <p className="text-sm leading-snug opacity-90">{t.message}</p>
              </div>

              {t.dismissible && (
                <button
                  onClick={() => dismiss(t.id)}
                  className="shrink-0 rounded p-0.5 opacity-70 transition-opacity hover:opacity-100"
                  aria-label="Dismiss notification"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};


export const useToast = (): IToastContextValue => {
  const context = useContext(ToastContext);
  if(!context){
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};