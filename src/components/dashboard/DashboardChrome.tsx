"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionLabel({
  title,
  meta,
  action,
  className,
}: {
  title: string;
  meta?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-4 flex flex-wrap items-end justify-between gap-3",
        className,
      )}
    >
      <div>
        <h2 className="text-[15px] font-medium tracking-tight text-text-primary">
          {title}
        </h2>
        {meta && (
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-text-secondary/70">
            {meta}
          </div>
        )}
      </div>
      {action}
    </div>
  );
}

/** Horizontal ranking bar — Stripe/Datadog breakdown style */
export function RankBar({
  label,
  valueLabel,
  percent,
  href,
}: {
  label: string;
  valueLabel: string;
  percent: number;
  href?: string;
}) {
  const width = Math.max(4, Math.min(100, percent));
  const inner = (
    <>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="truncate text-[13px] text-text-primary">{label}</span>
        <span className="shrink-0 font-mono text-[11px] text-text-secondary">
          {valueLabel}
        </span>
      </div>
      <div className="h-[3px] w-full bg-hairline">
        <div
          className="h-full bg-accent transition-[width] duration-700 ease-out-expo"
          style={{ width: `${width}%` }}
        />
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="block py-3 transition-opacity hover:opacity-90">
        {inner}
      </Link>
    );
  }
  return <div className="py-3">{inner}</div>;
}

export function InsightRow({
  tone = "info",
  code,
  children,
}: {
  tone?: "info" | "warn" | "good";
  code?: string;
  children: ReactNode;
}) {
  const toneClass =
    tone === "good"
      ? "text-accent"
      : tone === "warn"
        ? "text-warning"
        : "text-text-secondary";

  return (
    <div className="flex gap-3 border-b border-hairline px-4 py-3.5 last:border-b-0">
      <span
        className={cn(
          "mt-0.5 font-mono text-[10px] uppercase tracking-[0.16em]",
          toneClass,
        )}
      >
        {code ?? (tone === "good" ? "OK" : tone === "warn" ? "WATCH" : "NOTE")}
      </span>
      <p className="text-[13px] leading-relaxed text-text-primary">{children}</p>
    </div>
  );
}
