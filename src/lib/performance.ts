/**
 * TanStack Query defaults — cache hits keep UI instant on route changes.
 */
export const QUERY_DEFAULTS = {
  staleTime: 60_000,
  gcTime: 5 * 60_000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  retry: 0,
} as const;
