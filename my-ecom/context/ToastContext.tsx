"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success": return "✅";
      case "error": return "❌";
      case "warning": return "⚠️";
      case "info": return "ℹ️";
    }
  };

  const getColor = (type: ToastType) => {
    switch (type) {
      case "success": return "#22c55e";
      case "error": return "#ef4444";
      case "warning": return "#f59e0b";
      case "info": return "#3b82f6";
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container - Top Center */}
      <div
        style={{
          position: "fixed",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 100000,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 24px",
              background: "rgba(15, 23, 42, 0.95)",
              backdropFilter: "blur(10px)",
              border: `1px solid ${getColor(toast.type)}`,
              borderRadius: "12px",
              boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 0 20px ${getColor(toast.type)}30`,
              color: "#fff",
              fontSize: "0.95rem",
              animation: "slideDown 0.3s ease",
              cursor: "pointer",
              minWidth: "280px",
              maxWidth: "500px",
            }}
            onClick={() => removeToast(toast.id)}
          >
            <span style={{ fontSize: "1.2rem" }}>{getIcon(toast.type)}</span>
            <span style={{ flex: 1 }}>{toast.message}</span>
            <span style={{ opacity: 0.5, fontSize: "0.8rem" }}>✕</span>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>

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
