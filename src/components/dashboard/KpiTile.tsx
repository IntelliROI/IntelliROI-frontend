import { cn, formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import { type ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

type KpiTileProps = {
  label: string;
  value: string | number;
  delta?: number;
  hint?: string;
  accent?: boolean;
  format?: "currency" | "number" | "percent" | "raw";
  className?: string;
  footer?: ReactNode;
};

export function KpiTile({
  label,
  value,
  delta,
  hint,
  accent,
  format = "raw",
  className,
  footer,
}: KpiTileProps) {
  const display =
    typeof value === "number"
      ? format === "currency"
        ? formatCurrency(value, "USD", true)
        : format === "percent"
          ? `${value.toFixed(1)}%`
          : format === "number"
            ? formatNumber(value, true)
            : String(value)
      : value;

  return (
    <div
      className={cn(
        "bg-ink p-6 transition-colors duration-500 hover:bg-surface",
        accent && "border-l-2 border-l-accent",
        className,
      )}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary">
        {label}
      </p>
      <p
        className={cn(
          "mt-4 font-mono text-3xl font-light tracking-tight text-text-primary md:text-4xl",
          accent && "text-accent",
        )}
      >
        {display}
      </p>
      <div className="mt-3 flex items-center gap-3">
        {typeof delta === "number" && (
          <span
            className={cn(
              "inline-flex items-center gap-1 font-mono text-[11px]",
              delta >= 0 ? "text-accent" : "text-danger",
            )}
          >
            {delta >= 0 ? (
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            )}
            {formatPercent(delta)}
          </span>
        )}
        {hint && (
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-secondary/70">
            {hint}
          </span>
        )}
      </div>
      {footer}
    </div>
  );
}
