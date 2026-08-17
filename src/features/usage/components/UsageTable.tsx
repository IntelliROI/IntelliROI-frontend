"use client";

import Link from "next/link";
import { PageHeader, LoadingBlock, DataTable } from "@/components/feedback/States";
import { useUsageRequests } from "@/features/usage/hooks/useUsage";

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
            cost: r.cost.toFixed(2),
            action: (
              <Link
                href={`/${companySlug}/usage/${encodeURIComponent(r.id)}`}
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
