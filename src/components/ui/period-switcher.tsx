"use client";

import { cn } from "@/lib/utils";

export type RoiPeriod = "day" | "week" | "month";
export type AnalyticsPeriod = "day" | "month";

const ROI_OPTIONS: { id: RoiPeriod; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
];

const ANALYTICS_OPTIONS: { id: AnalyticsPeriod; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "month", label: "Month" },
];

/**
 * Shared period toggle that only offers values the backend accepts.
 *
 * ROI: day | week | month
 * Analytics: day | month (no week, no year)
 */
export function PeriodSwitcher({
  value,
  onChange,
  variant = "roi",
  className,
}: {
  value: string;
  onChange: (period: string) => void;
  variant?: "roi" | "analytics";
  className?: string;
}) {
  const options = variant === "roi" ? ROI_OPTIONS : ANALYTICS_OPTIONS;
  return (
    <div
      className={cn(
        "flex items-center border border-hairline font-mono text-[10px] uppercase tracking-[0.14em]",
        className,
      )}
      role="group"
      aria-label="Period"
    >
      {options.map((opt, i) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          aria-pressed={value === opt.id}
          className={cn(
            "h-7 px-3 transition-colors duration-150",
            i > 0 && "border-l border-hairline",
            value === opt.id
              ? "bg-accent/10 text-accent"
              : "text-text-secondary/60 hover:text-text-primary",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
