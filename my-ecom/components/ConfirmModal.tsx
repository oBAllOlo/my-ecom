"use client";

import { createPortal } from "react-dom";
import { Trash2, AlertTriangle, Info, type LucideIcon } from "lucide-react";
import { buttonClasses } from "@/components/ui";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "danger" | "warning" | "info";
}

const typeConfig: Record<
  "danger" | "warning" | "info",
  { icon: LucideIcon; tone: string; confirmVariant: "danger" | "primary" }
> = {
  danger: { icon: Trash2, tone: "bg-danger/10 text-danger", confirmVariant: "danger" },
  warning: { icon: AlertTriangle, tone: "bg-warning/10 text-warning", confirmVariant: "primary" },
  info: { icon: Info, tone: "bg-info/10 text-info", confirmVariant: "primary" },
};

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "ยืนยัน",
  cancelText = "ยกเลิก",
  onConfirm,
  onCancel,
  type = "danger",
}: ConfirmModalProps) {
  if (!isOpen || typeof window === "undefined") return null;

  const { icon: Icon, tone, confirmVariant } = typeConfig[type];

  return createPortal(
    <div
      className="fixed inset-0 z-[100001] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-line bg-surface p-6 shadow-lg animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex flex-col items-center text-center">
          <span className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${tone}`}>
            <Icon className="h-6 w-6" />
          </span>
          <h3 className="text-lg font-semibold text-fg">{title}</h3>
        </div>

        <p className="mb-6 text-center text-sm leading-relaxed text-fg-muted">
          {message}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className={buttonClasses({ variant: "secondary", className: "flex-1" })}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={buttonClasses({ variant: confirmVariant, className: "flex-1" })}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
