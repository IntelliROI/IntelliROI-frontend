"use client";

import Link from "next/link";
import { PageHeader, LoadingBlock, DataTable } from "@/components/feedback/States";
import { useUsageRequests } from "@/features/usage/hooks/useUsage";
import { encodeUsagePeriodId } from "@/features/usage/api/usage.api";
import { formatCurrency } from "@/lib/utils";
import { AI_COST_CURRENCY } from "@/constants/locale";

export function UsageTable({ companySlug }: { companySlug: string }) {
  const usage = useUsageRequests(companySlug);

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
            cost: formatCurrency(r.cost, AI_COST_CURRENCY),
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
