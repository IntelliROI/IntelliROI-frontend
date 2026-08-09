"use client";

import { useQuery } from "@tanstack/react-query";
import { usageApi } from "@/features/usage/api/usage.api";
import { queryKeys } from "@/lib/api/query-keys";

export function useUsageRequests(companySlug: string) {
  return useQuery({
    queryKey: queryKeys.company.usage(companySlug),
    queryFn: () => usageApi.list(),
    staleTime: 60_000,
  });
}

export function useUsageRequest(companySlug: string, requestId: string) {
  return useQuery({
    queryKey: queryKeys.company.usageRequest(companySlug, requestId),
    queryFn: () => usageApi.get(requestId),
    enabled: Boolean(requestId),
    staleTime: 60_000,
  });
}
