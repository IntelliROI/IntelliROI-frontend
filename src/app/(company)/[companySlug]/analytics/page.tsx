"use client";

import { ScopedAnalyticsView } from "@/features/analytics/components/ScopedAnalyticsView";
import { ScopeUnassigned } from "@/components/feedback/ScopeUnassigned";
import { useAuthStore } from "@/stores/auth-store";
import { resolveIntelligenceScope } from "@/lib/rbac/intelligence-scope";

export default function AnalyticsPage({
  params,
}: {
  params: { companySlug: string };
}) {
  const user = useAuthStore((s) => s.user);
  const scope = resolveIntelligenceScope(user);

  if (scope.kind === "unassigned") {
    return (
      <ScopeUnassigned
        role={scope.role}
        missing={scope.missing}
        title={scope.title}
      />
    );
  }

  return (
    <ScopedAnalyticsView
      companySlug={params.companySlug}
      scope={scope.kind}
      scopeId={
        scope.kind === "company"
          ? undefined
          : scope.kind === "employee"
            ? scope.id
            : scope.id
      }
      title={scope.title}
    />
  );
}
