"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ModalSize = "sm" | "md" | "lg" | "xl";

const sizeClass: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-3xl",
};

type ModalProps = {
  open: boolean;
  onClose: () => void;
  /** Small mono label above the title */
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  /** Extra classes on the panel */
  className?: string;
};

/**
 * Shared IntelliROI dialog — ink panel over dimmed overlay.
 * Use for create / assign / edit actions instead of inline table strips.
 */
export function Modal({
  open,
  onClose,
  eyebrow,
  title,
  description,
  children,
  footer,
  size = "md",
  className,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-16 sm:items-center sm:pt-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          "relative w-full border border-hairline bg-ink shadow-2xl shadow-black/50",
          sizeClass[size],
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-hairline bg-surface-2/40 px-5 py-4">
          <div className="min-w-0">
            {eyebrow ? (
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                {eyebrow}
              </p>
            ) : null}
            <h2
              id="modal-title"
              className="text-lg font-medium text-text-primary"
            >
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm text-text-secondary">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center text-text-secondary transition-colors hover:text-text-primary"
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
        <div className="max-h-[min(70vh,32rem)] overflow-y-auto p-5">
          {children}
        </div>
        {footer ? (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-hairline bg-surface/30 px-5 py-3">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
