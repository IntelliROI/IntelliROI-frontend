/**
 * Lightweight performance helpers — keep dashboards snappy.
 */

/** Default TanStack Query options tuned for SaaS dashboards (less refetch churn). */
export const QUERY_DEFAULTS = {
  staleTime: 60_000,
  gcTime: 5 * 60_000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  retry: 1,
} as const;

/** Abort fetch if the backend hangs (avoids UI stuck spinners). */
export function withTimeout(ms: number, parent?: AbortSignal): AbortSignal {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  if (parent) {
    if (parent.aborted) {
      clearTimeout(timer);
      controller.abort();
    } else {
      parent.addEventListener(
        "abort",
        () => {
          clearTimeout(timer);
          controller.abort();
        },
        { once: true },
      );
    }
  }
  controller.signal.addEventListener("abort", () => clearTimeout(timer), {
    once: true,
  });
  return controller.signal;
}
