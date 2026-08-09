"use client";

import { cn } from "@/lib/utils";

/** Micro sparkline for KPI tiles — role accent stroke. */
export function Sparkline({
  data,
  className,
  height = 36,
}: {
  data: number[];
  className?: string;
  height?: number;
}) {
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 100;
  const h = height;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1 || 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  const last = data[data.length - 1];
  const first = data[0];
  const up = last >= first;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={cn("w-full overflow-visible", className)}
      preserveAspectRatio="none"
      aria-hidden
    >
      <polyline
        fill="none"
        stroke="var(--role-accent)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
        opacity={0.9}
      />
      <circle
        cx={w}
        cy={h - ((last - min) / range) * (h - 4) - 2}
        r="2"
        fill="var(--role-accent)"
      />
      <title>{up ? "Trending up" : "Trending down"}</title>
    </svg>
  );
}
