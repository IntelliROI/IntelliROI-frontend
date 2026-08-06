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
  const r = detail.data!;

  return (
    <div>
      <PageHeader
        eyebrow="Request"
        title={r.id}
        description={`${r.user} · ${r.provider}/${r.model}`}
      />
      <Mosaic cols={4}>
        <KpiTile label="Tokens in" value={r.tokens_in} format="number" />
        <KpiTile label="Tokens out" value={r.tokens_out} format="number" />
        <KpiTile label="Latency" value={`${r.latency_ms}ms`} />
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
