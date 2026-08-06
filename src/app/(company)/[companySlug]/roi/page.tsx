"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader, LoadingBlock } from "@/components/feedback/States";
import { Mosaic, Panel, Provenance } from "@/components/ui/panel";
import { KpiTile } from "@/components/dashboard/KpiTile";
import { TrendAreaChart, SimpleBarChart } from "@/components/charts/Charts";
import { roiApi } from "@/features/roi/api/roi.api";
import { analyticsApi } from "@/features/analytics/api/analytics.api";
import { organizationApi } from "@/features/organization/api/organization.api";

export default function RoiPage({
  params,
}: {
  params: { companySlug: string };
}) {
  const roi = useQuery({
    queryKey: ["company", params.companySlug, "roi", "summary"],
    queryFn: () => roiApi.company("month"),
  });
  const analytics = useQuery({
    queryKey: ["company", params.companySlug, "analytics"],
    queryFn: () => analyticsApi.company("day"),
  });
  const departments = useQuery({
    queryKey: ["company", params.companySlug, "departments"],
    queryFn: () => organizationApi.listDepartments(),
  });

  if (roi.isLoading) return <LoadingBlock className="h-80" />;
  const r = roi.data!;

  return (
    <div>
      <PageHeader
        eyebrow="Financial"
        title="ROI Analysis"
        description="Investment vs business value — recomputable with formula provenance."
      />
      <Mosaic cols={4}>
        <KpiTile label="Spend" value={r.total_spend} format="currency" />
        <KpiTile label="Business value" value={r.business_value} format="currency" />
        <KpiTile label="ROI" value={r.roi_pct} format="percent" accent />
        <KpiTile label="Hours saved" value={r.time_saved_hours} format="number" />
      </Mosaic>

      <div className="mt-px grid gap-px bg-hairline lg:grid-cols-2">
        <Panel className="border-0 bg-ink p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium text-text-primary">ROI over time</h2>
            <Provenance
              computedAt={r.computed_at}
              formulaVersion={r.formula_version}
            />
          </div>
          <TrendAreaChart
            data={(analytics.data?.series ?? []).map((p) => ({
              date: p.date.slice(5),
              value: p.roi_pct,
            }))}
          />
        </Panel>
        <Panel className="border-0 bg-ink p-6">
          <h2 className="mb-4 font-medium text-text-primary">
            Department ROI
          </h2>
          <SimpleBarChart
            data={(departments.data ?? []).map((d) => ({
              name: d.department_name.slice(0, 8),
              value: d.roi_pct,
            }))}
          />
        </Panel>
      </div>
    </div>
  );
}
