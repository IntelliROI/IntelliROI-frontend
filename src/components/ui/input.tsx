import * as React from "react";
import { cn } from "@/lib/utils";

const fieldClass =
  "flex h-10 w-full border border-hairline bg-surface/40 px-3 text-sm text-text-primary placeholder:text-text-secondary/45 transition-colors focus:border-accent focus:bg-ink focus:outline-none disabled:cursor-not-allowed disabled:opacity-50";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(fieldClass, className)}
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
        "flex min-h-[96px] w-full border border-hairline bg-surface/40 px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/45 transition-colors focus:border-accent focus:bg-ink focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(fieldClass, "pr-8", className)}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";
