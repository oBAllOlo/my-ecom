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

  const colors = {
    danger: { bg: "#ef4444", hover: "#dc2626", icon: "🗑️" },
    warning: { bg: "#f59e0b", hover: "#d97706", icon: "⚠️" },
    info: { bg: "#3b82f6", hover: "#2563eb", icon: "ℹ️" },
  };

  const color = colors[type];

  const modal = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100001,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(4px)",
        animation: "fadeIn 0.2s ease",
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "16px",
          padding: "24px",
          maxWidth: "400px",
          width: "90%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          animation: "scaleIn 0.2s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon & Title */}
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <span style={{ fontSize: "3rem" }}>{color.icon}</span>
          <h3
            style={{
              color: "#fff",
              fontSize: "1.25rem",
              fontWeight: 700,
              marginTop: "12px",
            }}
          >
            {title}
          </h3>
        </div>

        {/* Message */}
        <p
          style={{
            color: "#94a3b8",
            textAlign: "center",
            marginBottom: "24px",
            lineHeight: 1.6,
          }}
        >
          {message}
        </p>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "12px 20px",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "10px",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "12px 20px",
              background: color.bg,
              border: "none",
              borderRadius: "10px",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );

  if (typeof window === "undefined") return null;
  return createPortal(modal, document.body);
}
