"use client";

import { PageHeader, LoadingBlock } from "@/components/feedback/States";
import { Mosaic, Panel, Provenance } from "@/components/ui/panel";
import { KpiTile } from "@/components/dashboard/KpiTile";
import { useUsageRequest } from "@/features/usage/hooks/useUsage";
import { useCompanyCurrency } from "@/hooks/use-company-currency";

export function UsageRequestDetail({
  companySlug,
  requestId,
}: {
  companySlug: string;
  requestId: string;
}) {
  const { currency: companyCurrency, fromUsd } = useCompanyCurrency(companySlug);
  const detail = useUsageRequest(companySlug, requestId);

  if (detail.isLoading) return <LoadingBlock className="h-64" />;

  if (detail.isError || !detail.data) {
    return (
      <p className="border border-hairline px-4 py-8 text-sm text-text-secondary">
        Could not load this usage period from the live service.
        {detail.error instanceof Error ? ` (${detail.error.message})` : null}
      </p>
    );
  }

  const r = detail.data;

  return (
    <div>
      <PageHeader
        eyebrow="Period"
        title={r.created_at || r.id}
        description="Company daily totals from analytics snapshots (request-level list is not on the cost service)."
      />
      <Mosaic cols={4}>
        <KpiTile label="Requests" value={r.requests} format="number" />
        <KpiTile
          label="Cost"
          value={fromUsd(r.cost)}
          format="currency"
          currency={companyCurrency}
        />
        <KpiTile label="Tokens" value={r.tokens} format="number" />
        <KpiTile label="Status" value={r.status} accent />
      </Mosaic>
      <Panel className="mt-6 p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary">
          Snapshot
        </p>
        <Provenance computedAt={r.created_at} />
        <p className="mt-4 text-sm text-text-secondary">
          Scope: {r.user} · Model rollup: {r.model} · Provider: {r.provider}
        </p>
      </Panel>
    </div>
  );
}
