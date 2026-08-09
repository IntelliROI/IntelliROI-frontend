"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn, formatPercent } from "@/lib/utils";
import { CountUp } from "@/components/dashboard/CountUp";
import { Sparkline } from "@/components/dashboard/Sparkline";
import { revealTransition } from "@/lib/motion";

type Format = "currency" | "number" | "percent" | "raw";

type MetricTileProps = {
  label: string;
  value: number | string;
  format?: Format;
  delta?: number;
  hint?: string;
  spark?: number[];
  /** Hero = dominant figure (Ruixen/Advanced Stats pattern) */
  variant?: "hero" | "default" | "compact";
  /** Legacy: accent left border + accent value color */
  accent?: boolean;
  className?: string;
  footer?: ReactNode;
  delay?: number;
};

export function MetricTile({
  label,
  value,
  format = "raw",
  delta,
  hint,
  spark,
  variant = "default",
  accent,
  className,
  footer,
  delay = 0,
}: MetricTileProps) {
  const isHero = variant === "hero";
  const isCompact = variant === "compact";
  const numeric = typeof value === "number" ? value : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...revealTransition, delay }}
      className={cn(
        "relative overflow-hidden bg-ink transition-colors duration-300 hover:bg-surface/70",
        isHero &&
          "bg-[radial-gradient(ellipse_at_top_right,color-mix(in_srgb,var(--role-accent)_12%,transparent),transparent_55%)]",
        accent && !isHero && "border-l-2 border-l-accent",
        isHero
          ? "px-6 py-7 md:px-8 md:py-8"
          : isCompact
            ? "px-4 py-4"
            : "px-5 py-5",
        className,
      )}
    >
      {isHero && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent"
          aria-hidden
        />
      )}

      <div className="flex items-start justify-between gap-4">
        <p
          className={cn(
            "font-mono font-medium uppercase text-text-secondary",
            isHero
              ? "text-[10px] tracking-[0.22em]"
              : "text-[10px] tracking-[0.16em]",
          )}
        >
          {label}
        </p>
        {typeof delta === "number" && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-mono text-[11px]",
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
      </div>

      <p
        className={cn(
          "mt-3 font-mono font-light leading-none tracking-tight text-text-primary",
          isHero
            ? "text-[2.75rem] text-accent md:text-[3.5rem]"
            : isCompact
              ? "text-xl"
              : "text-[1.75rem] md:text-[2rem]",
          accent && !isHero && "text-accent",
        )}
      >
        {numeric != null ? (
          <CountUp
            value={numeric}
            format={format === "raw" ? "number" : format}
          />
        ) : (
          value
        )}
      </p>

      {(hint || spark) && (
        <div
          className={cn(
            "mt-4 flex items-end justify-between gap-4",
            isHero && "mt-6",
          )}
        >
          {hint ? (
            <p className="max-w-[14rem] font-mono text-[10px] uppercase tracking-[0.14em] text-text-secondary/75">
              {hint}
            </p>
          ) : (
            <span />
          )}
          {spark && spark.length > 1 && (
            <div className={cn("shrink-0", isHero ? "w-36" : "w-24")}>
              <Sparkline data={spark} height={isHero ? 40 : 32} />
            </div>
          )}
        </div>
      )}

      {footer && <div className="mt-4">{footer}</div>}
    </motion.div>
  );
}

/** Back-compat alias used across older screens */
export { MetricTile as KpiTile };
