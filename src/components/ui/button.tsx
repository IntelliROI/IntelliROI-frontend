import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-mono text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-300 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "border border-accent bg-accent text-ink shadow-glow-sm hover:bg-transparent hover:text-accent",
        secondary:
          "border border-hairline bg-transparent text-text-primary hover:border-accent/50 hover:text-accent",
        ghost:
          "border border-transparent text-text-secondary hover:border-hairline hover:text-accent",
        danger:
          "border border-danger bg-danger/10 text-danger hover:bg-danger hover:text-ink",
      },
      size: {
        default: "px-7 py-3.5",
        sm: "px-4 py-2 text-[11px]",
        lg: "px-8 py-4",
        icon: "h-10 w-10",
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
