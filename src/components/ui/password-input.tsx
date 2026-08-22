"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

const fieldClass =
  "flex h-10 w-full border border-hairline bg-surface/40 py-0 pl-3 pr-10 text-sm text-text-primary placeholder:text-text-secondary/45 transition-colors focus:border-accent focus:bg-ink focus:outline-none disabled:cursor-not-allowed disabled:opacity-50";

export type PasswordInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
>;

/**
 * Password field with show/hide toggle for the auth family.
 * Matches Input chrome; keeps type switching local so callers stay simple.
 */
export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(({ className, id, disabled, ...props }, ref) => {
  const [visible, setVisible] = React.useState(false);
  const toggleId = id ? `${id}-toggle` : undefined;

  return (
    <div className="relative w-full">
      <input
        ref={ref}
        id={id}
        type={visible ? "text" : "password"}
        disabled={disabled}
        className={cn(fieldClass, className)}
        {...props}
      />
      <button
        type="button"
        id={toggleId}
        disabled={disabled}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-text-secondary transition-colors hover:text-accent disabled:pointer-events-none disabled:opacity-40"
      >
        {visible ? (
          <EyeOff size={16} strokeWidth={1.5} />
        ) : (
          <Eye size={16} strokeWidth={1.5} />
        )}
      </button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";
