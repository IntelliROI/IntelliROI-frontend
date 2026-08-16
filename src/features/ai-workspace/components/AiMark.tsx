import { cn } from "@/lib/utils";

/** Brand-mint AI mark used in workspace chrome & loading states. */
export function AiMark({
  size = "md",
  className,
  pulse,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
  pulse?: boolean;
}) {
  const box =
    size === "sm" ? "h-8 w-8" : size === "lg" ? "h-12 w-12" : "h-10 w-10";
  const dot = size === "sm" ? "h-1.5 w-1.5" : size === "lg" ? "h-2.5 w-2.5" : "h-2 w-2";

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full border border-brand/45 bg-brand/10",
        box,
        className,
      )}
      aria-hidden
    >
      <span
        className={cn(
          "rounded-full bg-brand",
          dot,
          pulse && "animate-pulse",
        )}
      />
    </div>
  );
}

export function AiChatLoader({ label = "Loading chat…" }: { label?: string }) {
  return (
    <div
      className="flex h-full flex-col items-center justify-center gap-4"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="relative flex items-center justify-center">
        <AiMark size="lg" pulse />
        <span className="absolute inset-[-6px] animate-spin rounded-full border border-transparent border-t-brand/70 border-r-brand/20" />
      </div>
      <p className="text-[13px] text-text-secondary/80">{label}</p>
    </div>
  );
}
