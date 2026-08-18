"use client";

import { type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { LIST_PAGE_SIZE_OPTIONS } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export type StatusFilter = "" | "active" | "inactive";

/* ─────────────────────────────────────────────────────────────────────────
   ListFilterBar — search + status + optional extra filters, sits above table
───────────────────────────────────────────────────────────────────────── */
type ListFilterBarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  status?: StatusFilter;
  onStatusChange?: (value: StatusFilter) => void;
  showStatus?: boolean;
  /** Extra filter controls rendered after the status select (e.g. department picker). */
  extra?: ReactNode;
};

export function ListFilterBar({
  search,
  onSearchChange,
  searchPlaceholder = "Search",
  status = "",
  onStatusChange,
  showStatus = true,
  extra,
}: ListFilterBarProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 border border-hairline bg-surface/10 p-3">
      <label className="relative min-w-[12rem] flex-1">
        <span className="sr-only">{searchPlaceholder}</span>
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-secondary/45"
          strokeWidth={1.5}
        />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="h-8 pl-8 font-mono text-[12px] tracking-normal"
        />
      </label>
      {showStatus && onStatusChange ? (
        <Select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
          className="h-8 w-auto min-w-[10.5rem] shrink-0 font-mono text-[10px] uppercase tracking-[0.08em]"
          aria-label="Status"
        >
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="inactive">Archived</option>
        </Select>
      ) : null}
      {extra}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   ListPagination — page size + range + prev/next, sits below the table
───────────────────────────────────────────────────────────────────────── */
type ListPaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  noun?: string;
};

function rangeLabel(page: number, pageSize: number, total: number): string {
  if (total <= 0) return "0";
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return `${from}–${to} of ${total}`;
}

export function ListPagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
  noun = "results",
}: ListPaginationProps) {
  const canPrev = page > 1;
  const canNext = totalPages > 0 && page < totalPages;

  return (
    <div className="mt-4 flex flex-col gap-3 border border-hairline bg-surface/10 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div
          className="flex items-center border border-hairline font-mono text-[10px] uppercase tracking-[0.14em]"
          role="group"
          aria-label="Page size"
        >
          {LIST_PAGE_SIZE_OPTIONS.map((size, i) => (
            <button
              key={size}
              type="button"
              onClick={() => onPageSizeChange(size)}
              aria-pressed={pageSize === size}
              className={cn(
                "h-7 px-2.5 transition-colors duration-150",
                i > 0 && "border-l border-hairline",
                pageSize === size
                  ? "bg-accent/10 text-accent"
                  : "text-text-secondary/60 hover:text-text-primary",
              )}
            >
              {size}
            </button>
          ))}
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-secondary/55">
          {rangeLabel(page, pageSize, total)} {noun}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={!canPrev}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
          Prev
        </Button>
        <span className="min-w-[3.5rem] text-center font-mono text-[10px] uppercase tracking-[0.14em] text-text-secondary/55">
          {totalPages === 0 ? "0 / 0" : `${page} / ${totalPages}`}
        </span>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={!canNext}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
        </Button>
      </div>
    </div>
  );
}
