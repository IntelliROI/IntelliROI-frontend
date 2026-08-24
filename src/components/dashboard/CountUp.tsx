"use client";

import { useEffect, useRef, useState } from "react";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";

/** Animated number — spring-feel CountUp for KPI heroes. */
export function CountUp({
  value,
  format = "raw",
  currency = "INR",
  className,
  duration = 900,
}: {
  value: number;
  format?: "currency" | "number" | "percent" | "raw";
  currency?: string;
  className?: string;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);
  const start = useRef(0);
  const frame = useRef<number>();

  useEffect(() => {
    const from = start.current;
    const to = value;
    const t0 = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = from + (to - from) * eased;
      setDisplay(current);
      if (t < 1) frame.current = requestAnimationFrame(tick);
      else start.current = to;
    };

    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [value, duration]);

  const text =
    format === "currency"
      ? // Always two fraction digits for money KPIs (avoid $0.1 compact).
        formatCurrency(display, currency, false)
      : format === "percent"
        ? `${display.toFixed(1)}%`
        : format === "number"
          ? formatNumber(Math.round(display), true)
          : display.toFixed(0);

  return <span className={cn("tabular-nums", className)}>{text}</span>;
}
