"use client";

import { useQuery } from "@tanstack/react-query";
import { usageApi, type UsageListScope } from "@/features/usage/api/usage.api";
import { queryKeys } from "@/lib/api/query-keys";
import { useAuthStore } from "@/stores/auth-store";
import { resolveIntelligenceScope } from "@/lib/rbac/intelligence-scope";

function toUsageScope(
  scope: ReturnType<typeof resolveIntelligenceScope>,
): UsageListScope | null {
  if (scope.kind === "unassigned") return null;
  if (scope.kind === "company") return { kind: "company" };
  return { kind: scope.kind, id: scope.id };
}

export function useUsageRequests(companySlug: string) {
  const user = useAuthStore((s) => s.user);
  const intel = resolveIntelligenceScope(user);
  const scope = toUsageScope(intel);

  return useQuery({
    queryKey: [
      ...queryKeys.company.usage(companySlug),
      intel.kind,
      scope && "id" in scope ? scope.id : null,
    ],
    queryFn: () => usageApi.list(scope ?? { kind: "company" }),
    enabled: scope != null,
    staleTime: 60_000,
  });
}

export function useUsageRequest(companySlug: string, requestId: string) {
  const user = useAuthStore((s) => s.user);
  const intel = resolveIntelligenceScope(user);
  const scope = toUsageScope(intel);

  return useQuery({
    queryKey: [
      ...queryKeys.company.usageRequest(companySlug, requestId),
      intel.kind,
      scope && "id" in scope ? scope.id : null,
    ],
    queryFn: () => usageApi.get(requestId, scope ?? { kind: "company" }),
    enabled: Boolean(requestId) && scope != null,
    staleTime: 60_000,
  });
}
