"use client";

import React from "react";
import { createPortal } from "react-dom";

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
  if (!isOpen) return null;

  const typeStyles = {
    danger: { btnClass: "bg-red-500 hover:bg-red-600", icon: "🗑️" },
    warning: { btnClass: "bg-amber-500 hover:bg-amber-600", icon: "⚠️" },
    info: { btnClass: "bg-blue-500 hover:bg-blue-600", icon: "ℹ️" },
  };

  const { btnClass, icon } = typeStyles[type];

  const modal = (
    <div
      className="fixed inset-0 z-[100001] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={onCancel}
    >
      <div
        className="bg-gradient-to-b from-slate-800 to-slate-900 border border-white/10 rounded-2xl p-6 max-w-[400px] w-[90%] shadow-2xl animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon & Title */}
        <div className="text-center mb-4">
          <span className="text-5xl">{icon}</span>
          <h3 className="text-white text-xl font-bold mt-3">{title}</h3>
        </div>

        {/* Message */}
        <p className="text-slate-400 text-center mb-6 leading-relaxed">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-5 bg-white/10 border border-white/20 rounded-xl text-white font-semibold cursor-pointer transition-all hover:bg-white/20"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 px-5 border-none rounded-xl text-white font-semibold cursor-pointer transition-all ${btnClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof window === "undefined") return null;
  return createPortal(modal, document.body);
}
