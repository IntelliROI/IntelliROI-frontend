import * as React from "react";
import { cn } from "@/lib/utils";

const fieldClass =
  "flex h-10 w-full border border-hairline bg-ink px-3 text-sm text-text-primary placeholder:text-text-secondary/45 transition-colors focus:border-accent focus:bg-surface/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 [color-scheme:dark]";

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
        "flex min-h-[96px] w-full border border-hairline bg-ink px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/45 transition-colors focus:border-accent focus:bg-surface/40 focus:outline-none [color-scheme:dark]",
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
    className={cn(
      fieldClass,
      "appearance-none bg-[length:12px] bg-[right_0.75rem_center] bg-no-repeat pr-9",
      "bg-[url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 fill=%27none%27 stroke=%27%23CBD5E1%27 stroke-width=%271.5%27%3E%3Cpath d=%27m2 4 4 4 4-4%27/%3E%3C/svg%3E')]",
      className,
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";
