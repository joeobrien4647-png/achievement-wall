import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

const ToastContext = createContext(null);

const ACCENT = {
  success: "border-emerald-500/60 bg-emerald-500/10",
  error: "border-red-500/60 bg-red-500/10",
  undo: "border-amber-500/60 bg-amber-500/10",
};

const DOT = {
  success: "bg-emerald-400",
  error: "bg-red-400",
  undo: "bg-amber-400",
};

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  const dismiss = useCallback(() => {
    setVisible(false);
    setTimeout(() => setToast(null), 300);
  }, []);

  const show = useCallback((message, opts = {}) => {
    const { type = "success", duration, action } = opts;
    const ms = duration ?? (type === "undo" ? 5000 : 3000);

    // Clear any existing toast timer
    if (timerRef.current) clearTimeout(timerRef.current);

    // Replace immediately
    setToast({ message, type, action });
    // Trigger slide-up on next frame
    requestAnimationFrame(() => setVisible(true));

    timerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => setToast(null), 300);
    }, ms);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}

      {/* Toast container — fixed bottom-center, above mobile nav */}
      {toast && (
        <div className="fixed bottom-20 sm:bottom-8 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
          <div
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg shadow-black/30 max-w-sm w-full transition-all duration-300 ${
              ACCENT[toast.type]
            } ${visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
          >
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${DOT[toast.type]}`} />
            <span className="text-sm text-white flex-1 min-w-0 truncate">{toast.message}</span>
            {toast.action && (
              <button
                onClick={() => {
                  toast.action.onClick?.();
                  if (timerRef.current) clearTimeout(timerRef.current);
                  dismiss();
                }}
                className="text-xs font-bold uppercase tracking-wide text-amber-400 hover:text-amber-300 transition-colors flex-shrink-0 ml-1"
              >
                {toast.action.label}
              </button>
            )}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
