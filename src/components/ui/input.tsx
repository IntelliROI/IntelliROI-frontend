"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shared field chrome.
 * Note: do NOT put `flex` on native <select> — it breaks option/text layout
 * and can shove the caret/arrow to the wrong side on Windows browsers.
 */
const fieldClass =
  "h-10 w-full border border-hairline bg-surface px-3 text-sm text-text-primary placeholder:text-text-secondary/45 transition-colors hover:border-accent/40 focus:border-accent focus:bg-surface-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 [color-scheme:dark]";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn("flex", fieldClass, className)}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "mb-1.5 block font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-text-secondary",
      className,
    )}
    {...props}
  />
));
Label.displayName = "Label";

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "flex min-h-[96px] w-full border border-hairline bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/45 transition-colors hover:border-accent/40 focus:border-accent focus:bg-surface-2 focus:outline-none [color-scheme:dark]",
        className,
      )}
      {...props}
    />
  );
}

function isCompactSelect(className?: string) {
  if (!className) return false;
  return (
    /\bw-auto\b/.test(className) ||
    /\bshrink-0\b/.test(className) ||
    /\bmin-w-\[/.test(className)
  );
}

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => {
  const compact = isCompactSelect(className);
  return (
    <div
      className={cn(
        "relative",
        compact ? "inline-block shrink-0 align-middle" : "block w-full",
      )}
    >
      <select
        ref={ref}
        className={cn(
          fieldClass,
          "cursor-pointer appearance-none bg-none pr-9",
          /* Kill native OS arrows that render on the wrong side */
          "[appearance:none] [-webkit-appearance:none] [-moz-appearance:none]",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 z-[1] h-3.5 w-3.5 -translate-y-1/2 text-text-secondary"
        strokeWidth={1.5}
        aria-hidden
      />
    </div>
  );
});
Select.displayName = "Select";
