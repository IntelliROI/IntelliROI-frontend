"use client";

import Link from "next/link";
import { PageHeader, LoadingBlock, DataTable } from "@/components/feedback/States";
import { ScopeUnassigned } from "@/components/feedback/ScopeUnassigned";
import { useUsageRequests } from "@/features/usage/hooks/useUsage";
import { encodeUsagePeriodId } from "@/features/usage/api/usage.api";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useCompanyCurrency } from "@/hooks/use-company-currency";
import { resolveIntelligenceScope } from "@/lib/rbac/intelligence-scope";

export function UsageTable({ companySlug }: { companySlug: string }) {
  const user = useAuthStore((s) => s.user);
  const { currency: companyCurrency, fromUsd } = useCompanyCurrency(companySlug);
  const scope = resolveIntelligenceScope(user);
  const usage = useUsageRequests(companySlug);

  if (scope.kind === "unassigned") {
    return (
      <ScopeUnassigned
        role={scope.role}
        missing={scope.missing}
        title="Usage"
      />
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Metering"
        title="Usage"
        description="Daily AI request totals from analytics snapshots after gateway → cost → ROI workers run."
      />
      {usage.isLoading ? (
        <LoadingBlock className="h-48" />
      ) : (
        <DataTable
          columns={[
            { key: "id", label: "Period" },
            { key: "requests", label: "Requests", align: "right" },
            { key: "cost", label: "Cost", align: "right" },
            { key: "action", label: "" },
          ]}
          rows={(usage.data ?? []).map((r) => ({
            id: r.created_at || r.id,
            requests: r.requests.toLocaleString(),
            cost: formatCurrency(fromUsd(r.cost), companyCurrency),
            action: (
              <Link
                href={`/${companySlug}/usage/${encodeUsagePeriodId(r.id)}`}
                className="font-mono text-[10px] uppercase tracking-[0.15em] text-accent"
              >
                Detail
              </Link>
            ),
          }))}
        />
      )}
    </div>
  );
}
