import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

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
    <div className="mb-8 flex flex-col gap-4 border-b border-hairline pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && (
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 text-2xl font-medium tracking-tight text-text-primary md:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary md:text-base">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}

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
    <div className="flex flex-col items-center justify-center border border-dashed border-hairline px-6 py-16 text-center">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
        Empty
      </p>
      <h3 className="mt-3 text-lg font-medium text-text-primary">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-text-secondary">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function LoadingBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse border border-hairline bg-surface/40",
        className ?? "h-40",
      )}
    />
  );
}

export function DataTable({
  columns,
  rows,
}: {
  columns: { key: string; label: string; align?: "left" | "right" }[];
  rows: Record<string, ReactNode>[];
}) {
  return (
    <div className="overflow-x-auto border border-hairline">
      <table className="w-full min-w-[640px] text-left">
        <thead className="bg-surface/60">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "border-b border-hairline px-4 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary",
                  col.align === "right" && "text-right",
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="transition-colors hover:bg-surface/40">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    "border-b border-hairline px-4 py-3 text-sm text-text-primary",
                    col.align === "right" && "text-right font-mono",
                  )}
                >
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
