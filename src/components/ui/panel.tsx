import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

export function Panel({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("border border-hairline bg-ink", className)}>
      {children}
    </div>
  );
}

export function Mosaic({
  className,
  children,
  cols = 2,
}: {
  className?: string;
  children: ReactNode;
  cols?: 2 | 3 | 4;
}) {
  const colClass =
    cols === 4
      ? "md:grid-cols-4"
      : cols === 3
        ? "md:grid-cols-3"
        : "md:grid-cols-2";
  return (
    <div className={cn("grid gap-px bg-hairline", colClass, className)}>
      {children}
    </div>
  );
}

export function Chapter({
  number,
  label,
}: {
  number: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">
        {number}
      </span>
      <div className="h-px flex-1 bg-hairline" />
      <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-text-secondary">
        {label}
      </span>
    </div>
  );
}

export function LiveDot({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary">
      <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
      {label}
    </span>
  );
}

export function Provenance({
  computedAt,
  formulaVersion,
}: {
  computedAt?: string;
  formulaVersion?: string;
}) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-secondary/60">
      {formulaVersion ? `Formula ${formulaVersion}` : "Derived"}
      {computedAt
        ? ` · as of ${new Date(computedAt).toLocaleString()}`
        : ""}
    </p>
  );
}
