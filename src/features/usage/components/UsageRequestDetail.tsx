"use client";

import { PageHeader, LoadingBlock } from "@/components/feedback/States";
import { Mosaic, Panel, Provenance } from "@/components/ui/panel";
import { KpiTile } from "@/components/dashboard/KpiTile";
import { useUsageRequest } from "@/features/usage/hooks/useUsage";

export function UsageRequestDetail({
  companySlug,
  requestId,
}: {
  companySlug: string;
  requestId: string;
}) {
  const detail = useUsageRequest(companySlug, requestId);

  if (detail.isLoading) return <LoadingBlock className="h-64" />;

  if (!detail.data) {
    return (
      <p className="border border-hairline px-4 py-8 text-sm text-text-secondary">
        Could not load this usage request from the live service.
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
        <KpiTile label="Cost" value={r.cost} format="currency" />
        <KpiTile label="Tokens" value={r.tokens_in} format="number" />
        <KpiTile label="Status" value={r.status} accent />
      </Mosaic>
      <Panel className="mt-6 p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary">
          Business context
        </p>
        <p className="mt-3 text-sm text-text-primary">
          Project: {r.project ?? "—"} · Category: {r.task_category ?? "—"}
        </p>
        <div className="mt-4">
          <Provenance computedAt={r.created_at} formulaVersion="raw-fact" />
        </div>
      </Panel>
    </div>
  );
}
