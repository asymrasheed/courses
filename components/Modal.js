"use client";

import { useEffect } from "react";
import { IconX } from "@/components/icons";

export default function Modal({ open, onClose, title, children, width = "max-w-md" }) {
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-ink-950/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={`card relative w-full ${width} p-6 my-8 animate-fade-up`}
        style={{ boxShadow: "var(--shadow-pop)" }}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-xl text-cream-100">{title}</h3>
          <button
            onClick={onClose}
            className="text-cream-500 hover:text-cream-100 transition-colors"
            aria-label="Close"
          >
            <IconX width={18} height={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
