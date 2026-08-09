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
        description="Raw AI request facts from Pipeline 1 — cost/ROI arrive later via Pipeline 2."
      />
      {usage.isLoading ? (
        <LoadingBlock className="h-48" />
      ) : (
        <DataTable
          columns={[
            { key: "id", label: "Request" },
            { key: "user", label: "User" },
            { key: "model", label: "Model" },
            { key: "tokens", label: "Tokens", align: "right" },
            { key: "latency", label: "Latency", align: "right" },
            { key: "action", label: "" },
          ]}
          rows={(usage.data ?? []).map((r) => ({
            id: r.id,
            user: r.user,
            model: `${r.provider}/${r.model}`,
            tokens: (r.tokens_in + r.tokens_out).toLocaleString(),
            latency: `${r.latency_ms}ms`,
            action: (
              <Link
                href={`/${companySlug}/usage/${r.id}`}
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
