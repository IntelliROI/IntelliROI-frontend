"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader, LoadingBlock } from "@/components/feedback/States";
import { Mosaic, Panel, Provenance } from "@/components/ui/panel";
import { KpiTile } from "@/components/dashboard/KpiTile";
import { TrendAreaChart } from "@/components/charts/Charts";
import { useScopedAnalytics } from "@/features/organization/hooks/useOrganizationQueries";
import { analyticsApi } from "@/features/analytics/api/analytics.api";
import { roiApi } from "@/features/roi/api/roi.api";
import { queryKeys } from "@/lib/api/query-keys";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { useCompanyCurrency } from "@/hooks/use-company-currency";

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
  const { currency: companyCurrency, fromUsd } = useCompanyCurrency(companySlug);
  const analytics = useScopedAnalytics(companySlug, scope, scopeId);
  const period = "month";

  const roiSpend = useQuery({
    queryKey: [
      "company",
      companySlug,
      "analytics-roi-spend",
      scope,
      scopeId,
      period,
    ],
    queryFn: async () => {
      if (scope === "department" && scopeId != null)
        return roiApi.department(Number(scopeId), period);
      if (scope === "team" && scopeId != null)
        return roiApi.team(Number(scopeId), period);
      if (scope === "employee" && scopeId != null)
        return roiApi.employee(scopeId, period);
      return roiApi.company(period);
    },
  });

  const models = useQuery({
    queryKey: queryKeys.company.analytics.models(companySlug),
    queryFn: () => analyticsApi.models("day"),
    enabled: scope === "company",
  });

  if (analytics.isLoading) return <LoadingBlock className="h-80" />;
  const a = analytics.data;
  if (!a) {
    return (
      <p className="border border-hairline px-4 py-8 text-sm text-text-secondary">
        Could not load analytics from the live service.
      </p>
    );
  }

  const spendLocal =
    roiSpend.data != null ? roiSpend.data.total_spend : fromUsd(a.total_cost);

  return (
    <div>
      <PageHeader
        eyebrow="Observability"
        title={title}
        description="Request trends from analytics; AI spend KPI aligned with Estimated ROI (company currency)."
      />
      <Mosaic cols={3}>
        <KpiTile
          label="Requests"
          value={roiSpend.data?.requests ?? a.requests}
          format="number"
        />
        <KpiTile label="Tokens" value={formatNumber(a.tokens_in, true)} />
        <KpiTile
          label="AI spend"
          value={spendLocal}
          format="currency"
          currency={companyCurrency}
          accent
        />
      </Mosaic>
      <Panel className="mt-px border-0 bg-ink p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-medium text-text-primary">Request volume</h2>
          <Provenance
            computedAt={
              roiSpend.data?.computed_at ??
              a.series?.[a.series.length - 1]?.date
            }
          />
        </div>
        <TrendAreaChart
          data={(a.series ?? []).map((p) => ({
            date: p.date.slice(5),
            value: p.requests,
          }))}
        />
      </Panel>
      {scope === "company" ? (
        <Panel className="mt-px border-0 bg-ink p-6">
          <h2 className="mb-4 font-medium text-text-primary">Models</h2>
          {(models.data ?? []).length === 0 ? (
            <p className="text-sm text-text-secondary">
              No model snapshots yet. Run the analytics worker after chat + cost +
              ROI.
            </p>
          ) : (
            <ul className="space-y-2">
              {(models.data ?? []).map((m) => (
                <li
                  key={m.model}
                  className="flex items-center justify-between border border-hairline px-3 py-2 text-sm"
                >
                  <span>{m.model}</span>
                  <span className="font-mono text-text-secondary">
                    {m.requests} req ·{" "}
                    {formatCurrency(fromUsd(m.cost), companyCurrency)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      ) : null}
    </div>
  );
}
