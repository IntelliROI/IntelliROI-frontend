import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Enterprise button language — outline-first, accent-bordered, no background.
 * Default state: transparent bg, accent border + text.
 * Hover state: subtle accent fill (accent/10 bg).
 * Matches the IntelliROI enterprise design system.
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-mono text-[11px] font-semibold uppercase tracking-[0.16em]",
    "transition-colors duration-200 ease-out-expo",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
    "disabled:pointer-events-none disabled:opacity-40",
    "active:translate-y-px",
  ].join(" "),
  {
    variants: {
      variant: {
        /** Accent border + text, no fill. Hover: subtle accent bg fill. */
        primary:
          "border border-accent bg-transparent text-accent hover:bg-accent/10",
        /** Hairline border, muted text. Hover: accent border + accent text tint. */
        secondary:
          "border border-hairline bg-transparent text-text-primary hover:border-accent/50 hover:bg-accent/5 hover:text-accent",
        /** No border, no bg. Hover: surface bg. */
        ghost:
          "border border-transparent text-text-secondary hover:bg-surface hover:text-text-primary",
        /** Danger: red border + tinted text. Hover: red fill. */
        danger:
          "border border-danger/60 bg-transparent text-danger hover:bg-danger/10 hover:border-danger",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-8 px-3.5 text-[10px] tracking-[0.14em]",
        lg: "h-11 px-6 text-xs",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
