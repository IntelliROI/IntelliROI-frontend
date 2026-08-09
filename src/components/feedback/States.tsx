"use client";

import { type ReactNode, useState, useCallback } from "react";
import {
  LayoutGrid,
  LayoutList,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { site } from "@/config/site";

/* ─────────────────────────────────────────────────────────────────────────
   BrandMark — the IntelliROI square logo used in loaders
───────────────────────────────────────────────────────────────────────── */
function BrandMark({ size = "md" }: { size?: "sm" | "md" | "lg" | "xl" }) {
  const box = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  }[size];
  const dot = {
    sm: "h-1.5 w-1.5",
    md: "h-2 w-2",
    lg: "h-2.5 w-2.5",
    xl: "h-3.5 w-3.5",
  }[size];

  return (
    <div
      className={cn(
        "relative flex items-center justify-center border border-brand/40 bg-brand/10",
        box,
      )}
      aria-hidden
    >
      <span
        className={cn("bg-brand shadow-[0_0_8px_var(--brand-accent)]", dot)}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   SpinRing — animated orbital ring around a center element
───────────────────────────────────────────────────────────────────────── */
function SpinRing({ size = "md" }: { size?: "sm" | "md" | "lg" | "xl" }) {
  const inset = { sm: "-5px", md: "-6px", lg: "-8px", xl: "-10px" }[size];
  return (
    <span
      className="absolute animate-spin"
      style={{ inset, borderRadius: 0 }}
    >
      {/* top border accent */}
      <span className="absolute inset-0 border border-transparent border-t-brand/70 border-r-brand/20" />
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   PageLoader — full-screen branded loader (auth hydration, route guard)
───────────────────────────────────────────────────────────────────────── */
export function PageLoader({ label }: { label?: string }) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-ink"
      role="status"
      aria-live="polite"
      aria-label={label ?? "Loading"}
    >
      {/* Outer ambient glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-64 w-64 rounded-full bg-brand/5 blur-3xl" />
      </div>

      {/* Logo + spinner */}
      <div className="relative flex items-center justify-center">
        <BrandMark size="xl" />
        <SpinRing size="xl" />
        {/* outer slower ring */}
        <span
          className="absolute animate-[spin_3s_linear_infinite_reverse]"
          style={{ inset: "-18px" }}
        >
          <span className="absolute inset-0 border border-transparent border-b-brand/25 border-l-brand/10" />
        </span>
      </div>

      {/* Brand name */}
      <div className="flex flex-col items-center gap-1">
        <span className="font-mono text-[13px] font-bold tracking-[0.28em] text-text-primary">
          {site.name.toUpperCase()}
        </span>
        {label && (
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary/60 animate-pulse">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   SectionLoader — inline section-level branded spinner
   Used where LoadingBlock was: isLoading ? <SectionLoader /> : <Content />
───────────────────────────────────────────────────────────────────────── */
export function SectionLoader({
  label,
  className,
  height = "h-64",
}: {
  label?: string;
  className?: string;
  height?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 border border-hairline bg-surface/10",
        height,
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label={label ?? "Loading"}
    >
      {/* Logo + spin */}
      <div className="relative flex items-center justify-center">
        <BrandMark size="md" />
        <SpinRing size="md" />
      </div>
      {label && (
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary/55">
          {label}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   LoadingBlock — shimmer block (kept for back-compat, upgraded visually)
───────────────────────────────────────────────────────────────────────── */
export function LoadingBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden border border-hairline bg-surface/20",
        className ?? "h-40",
      )}
      aria-hidden
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   ShimmerCard — single skeleton card shape for grid skeletons
───────────────────────────────────────────────────────────────────────── */
export function ShimmerCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden border border-hairline bg-surface/20 p-4",
        className,
      )}
      aria-hidden
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
      <div className="mb-3 h-2 w-20 bg-surface-2/80" />
      <div className="mb-4 h-4 w-3/4 bg-surface-2/60" />
      <div className="flex gap-4">
        <div className="h-2 w-16 bg-surface-2/40" />
        <div className="h-2 w-16 bg-surface-2/40" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   SkeletonRows — table row skeleton with shimmer
───────────────────────────────────────────────────────────────────────── */
export function SkeletonRows({
  rows = 5,
  cols = 4,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="overflow-hidden border border-hairline">
      <div className="flex items-center gap-4 border-b border-hairline bg-surface/50 px-4 py-3">
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={i}
            className="h-2.5 bg-surface-2"
            style={{ width: `${60 + (i % 3) * 30}px` }}
          />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, ri) => (
        <div
          key={ri}
          className={cn(
            "relative flex items-center gap-4 overflow-hidden border-b border-hairline/50 px-4 py-4 last:border-b-0",
            ri % 2 === 1 && "bg-surface/20",
          )}
        >
          <div
            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent"
            style={{ animation: `shimmer 1.8s ease-in-out ${ri * 100}ms infinite` }}
          />
          {Array.from({ length: cols }).map((_, ci) => (
            <div
              key={ci}
              className="h-2 bg-surface-2/70"
              style={{ width: `${ci === 0 ? 40 : 80 + (ci * 20) % 60}px` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   PageHeader — enterprise section header
───────────────────────────────────────────────────────────────────────── */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-hairline pb-6 md:mb-10 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0 max-w-3xl">
        {eyebrow && (
          <div className="mb-2 flex items-center gap-1.5">
            {eyebrow.split(" · ").map((seg, i, arr) => (
              <span key={seg} className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-accent">
                  {seg}
                </span>
                {i < arr.length - 1 && (
                  <ChevronRight className="h-2.5 w-2.5 text-text-secondary/40" strokeWidth={2} />
                )}
              </span>
            ))}
          </div>
        )}
        <h1 className="text-[1.65rem] font-semibold leading-tight tracking-tight text-text-primary md:text-[1.85rem]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-text-secondary/80 md:text-sm">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   ViewToggle
───────────────────────────────────────────────────────────────────────── */
export type ViewMode = "table" | "grid";

export function ViewToggle({
  view,
  onViewChange,
  className,
}: {
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center border border-hairline", className)}>
      <button
        type="button"
        onClick={() => onViewChange("table")}
        className={cn(
          "flex h-7 w-8 items-center justify-center transition-colors duration-150",
          view === "table"
            ? "bg-accent/10 text-accent"
            : "text-text-secondary/60 hover:text-text-primary",
        )}
        aria-label="Table view"
        aria-pressed={view === "table"}
      >
        <LayoutList className="h-3.5 w-3.5" strokeWidth={1.75} />
      </button>
      <div className="h-4 w-px bg-hairline" />
      <button
        type="button"
        onClick={() => onViewChange("grid")}
        className={cn(
          "flex h-7 w-8 items-center justify-center transition-colors duration-150",
          view === "grid"
            ? "bg-accent/10 text-accent"
            : "text-text-secondary/60 hover:text-text-primary",
        )}
        aria-label="Grid view"
        aria-pressed={view === "grid"}
      >
        <LayoutGrid className="h-3.5 w-3.5" strokeWidth={1.75} />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   TableColumn
───────────────────────────────────────────────────────────────────────── */
export type TableColumn = {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
  sortable?: boolean;
  width?: string;
  mono?: boolean;
};

type SortDir = "asc" | "desc" | null;

/* ─────────────────────────────────────────────────────────────────────────
   DataTable
───────────────────────────────────────────────────────────────────────── */
export function DataTable({
  columns,
  rows,
  rowKey,
  showIndex = false,
  maxHeight,
}: {
  columns: TableColumn[];
  rows: Record<string, ReactNode>[];
  rowKey?: string;
  showIndex?: boolean;
  maxHeight?: string;
}) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const handleSort = useCallback(
    (key: string) => {
      if (sortKey !== key) {
        setSortKey(key);
        setSortDir("asc");
      } else if (sortDir === "asc") {
        setSortDir("desc");
      } else {
        setSortKey(null);
        setSortDir(null);
      }
    },
    [sortKey, sortDir],
  );

  const sortedRows = [...rows].sort((a, b) => {
    if (!sortKey || !sortDir) return 0;
    const av = a[sortKey];
    const bv = b[sortKey];
    const as = typeof av === "string" || typeof av === "number" ? av : "";
    const bs = typeof bv === "string" || typeof bv === "number" ? bv : "";
    const cmp =
      typeof as === "number" && typeof bs === "number"
        ? as - bs
        : String(as).localeCompare(String(bs), undefined, { numeric: true });
    return sortDir === "asc" ? cmp : -cmp;
  });

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center border border-dashed border-hairline bg-surface/10 px-8 py-16 text-center">
        <Database className="mb-3 h-8 w-8 text-text-secondary/30" strokeWidth={1} />
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary/50">
          No data
        </p>
        <p className="mt-1 text-[13px] text-text-secondary/60">
          No records found for this view
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn("overflow-hidden border border-hairline", maxHeight && "overflow-y-auto")}
      style={maxHeight ? { maxHeight } : undefined}
    >
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead className="sticky top-0 z-10">
          <tr className="border-b border-hairline bg-surface/80 backdrop-blur-sm">
            {showIndex && (
              <th className="w-10 border-r border-hairline/50 px-3 py-3 font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-text-secondary/40">
                #
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/70",
                  col.align === "right" && "text-right",
                  col.align === "center" && "text-center",
                  col.sortable &&
                    "cursor-pointer select-none hover:text-text-primary",
                  col.width,
                )}
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
              >
                <span className="inline-flex items-center gap-1.5">
                  {col.label}
                  {col.sortable && (
                    <span className="shrink-0 text-text-secondary/40">
                      {sortKey === col.key ? (
                        sortDir === "asc" ? (
                          <ArrowUp className="h-3 w-3" strokeWidth={2} />
                        ) : (
                          <ArrowDown className="h-3 w-3" strokeWidth={2} />
                        )
                      ) : (
                        <ArrowUpDown className="h-3 w-3" strokeWidth={1.5} />
                      )}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row, i) => (
            <tr
              key={rowKey ? String(row[rowKey]) : i}
              className={cn(
                "group/row border-b border-hairline/60 transition-colors duration-100 last:border-b-0",
                "hover:bg-accent/[0.04]",
                i % 2 === 1 && "bg-surface/25",
              )}
            >
              {showIndex && (
                <td className="border-r border-hairline/30 px-3 py-3.5 font-mono text-[10px] text-text-secondary/35">
                  {String(i + 1).padStart(2, "0")}
                </td>
              )}
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    "px-4 py-3.5 text-[13px] text-text-primary",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    col.mono && "font-mono text-[12px] text-text-secondary",
                  )}
                >
                  {row[col.key] ?? <span className="text-text-secondary/30">—</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-t border-hairline bg-surface/40 px-4 py-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-secondary/50">
          {rows.length} {rows.length === 1 ? "record" : "records"}
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   GridCard + GridView
───────────────────────────────────────────────────────────────────────── */
export type GridCard = {
  title: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode;
  metrics?: { label: string; value: ReactNode }[];
  action?: ReactNode;
  accent?: boolean;
};

export function GridView({
  cards,
  cols = 3,
  emptyTitle = "No records",
  emptyDescription,
}: {
  cards: GridCard[];
  cols?: 2 | 3 | 4;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center border border-dashed border-hairline bg-surface/10 px-8 py-16 text-center">
        <Database className="mb-3 h-8 w-8 text-text-secondary/30" strokeWidth={1} />
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary/50">
          No data
        </p>
        <p className="mt-1 text-[13px] text-text-secondary/60">
          {emptyDescription ?? "No records found for this view"}
        </p>
      </div>
    );
  }

  const colClass = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  }[cols];

  return (
    <div className={cn("grid gap-3", colClass)}>
      {cards.map((card, i) => (
        <div
          key={i}
          className={cn(
            "group relative flex flex-col border border-hairline bg-ink transition-all duration-200",
            "hover:border-accent/30 hover:bg-surface/60",
            card.accent && "border-l-2 border-l-accent",
          )}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/0 to-transparent transition-opacity duration-300 group-hover:via-accent/30" />
          <div className="flex items-start justify-between gap-3 border-b border-hairline/50 px-4 py-3.5">
            <div className="min-w-0 flex-1">
              <div className="truncate text-[14px] font-semibold leading-snug text-text-primary">
                {card.title}
              </div>
              {card.subtitle && (
                <div className="mt-0.5 truncate text-[12px] text-text-secondary/70">
                  {card.subtitle}
                </div>
              )}
            </div>
            {card.badge && <div className="shrink-0">{card.badge}</div>}
          </div>
          {card.metrics && card.metrics.length > 0 && (
            <div className="grid grid-cols-2 divide-x divide-hairline/50 border-b border-hairline/50">
              {card.metrics.slice(0, 4).map((m) => (
                <div key={m.label} className="px-4 py-3">
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-secondary/55">
                    {m.label}
                  </p>
                  <p className="mt-1 text-[14px] font-medium text-text-primary">
                    {m.value}
                  </p>
                </div>
              ))}
            </div>
          )}
          {card.action && (
            <div className="mt-auto flex items-center justify-end px-4 py-2.5">
              {card.action}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   EmptyState
───────────────────────────────────────────────────────────────────────── */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-hairline bg-surface/10 px-8 py-20 text-center">
      <Database className="mb-4 h-10 w-10 text-text-secondary/25" strokeWidth={1} />
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary/50">
        Empty
      </p>
      <h3 className="mt-2 text-[15px] font-semibold text-text-primary">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-[13px] leading-relaxed text-text-secondary/70">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
