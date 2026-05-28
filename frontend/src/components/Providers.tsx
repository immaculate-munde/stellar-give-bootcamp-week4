"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type ToastContextValue = {
  showToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);

  const value = useMemo(
    () => ({
      showToast: (next: string) => {
        setMessage(next);
        setTimeout(() => setMessage(null), 4000);
      },
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {message && (
        <div className="fixed bottom-6 right-6 z-[100] border border-cyan/30 bg-navy-card px-6 py-4 text-sm text-cyan shadow-lg">
          {message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
