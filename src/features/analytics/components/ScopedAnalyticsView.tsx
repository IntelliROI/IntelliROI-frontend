"use client";

import { PageHeader, LoadingBlock } from "@/components/feedback/States";
import { Mosaic, Panel, Provenance } from "@/components/ui/panel";
import { KpiTile } from "@/components/dashboard/KpiTile";
import { TrendAreaChart } from "@/components/charts/Charts";
import { useScopedAnalytics } from "@/features/organization/hooks/useOrganizationQueries";
import { formatNumber } from "@/lib/utils";

export function ScopedAnalyticsView({
  companySlug,
  scope,
  scopeId,
  title,
}: {
  companySlug: string;
  scope: "company" | "department" | "team" | "employee";
  scopeId?: number | string;
  title: string;
}) {
  const analytics = useScopedAnalytics(companySlug, scope, scopeId);

  if (analytics.isLoading) return <LoadingBlock className="h-80" />;
  const a = analytics.data!;

  return (
    <div>
      <PageHeader
        eyebrow="Observability"
        title={title}
        description="Precomputed aggregates — frontend never rolls up raw requests."
      />
      <Mosaic cols={4}>
        <KpiTile label="Requests" value={a.requests} format="number" />
        <KpiTile label="Tokens in" value={formatNumber(a.tokens_in, true)} />
        <KpiTile label="Tokens out" value={formatNumber(a.tokens_out, true)} />
        <KpiTile label="Active users" value={a.active_users} format="number" accent />
      </Mosaic>
      <Panel className="mt-px border-0 bg-ink p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-medium text-text-primary">Request volume</h2>
          <Provenance computedAt={new Date().toISOString()} />
        </div>
        <TrendAreaChart
          data={a.series.map((p) => ({
            date: p.date.slice(5),
            value: p.requests,
          }))}
        />
      </Panel>
    </div>
  );
}
