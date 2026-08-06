"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowUpRight, Check, X } from "lucide-react";
import { KpiTile } from "@/components/dashboard/KpiTile";
import { Mosaic, Panel, Provenance } from "@/components/ui/panel";
import { PageHeader, LoadingBlock, DataTable } from "@/components/feedback/States";
import { TrendAreaChart, ProviderDonut } from "@/components/charts/Charts";
import { Button } from "@/components/ui/button";
import { roiApi } from "@/features/roi/api/roi.api";
import { analyticsApi } from "@/features/analytics/api/analytics.api";
import { costApi } from "@/features/cost/api/cost.api";
import { organizationApi } from "@/features/organization/api/organization.api";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export function CeoDashboard({ companySlug }: { companySlug: string }) {
  const company = useAuthStore((s) => s.company);

  const roi = useQuery({
    queryKey: ["company", companySlug, "roi", "summary"],
    queryFn: () => roiApi.company("month"),
  });
  const analytics = useQuery({
    queryKey: ["company", companySlug, "analytics"],
    queryFn: () => analyticsApi.company("day"),
  });
  const costs = useQuery({
    queryKey: ["company", companySlug, "costs"],
    queryFn: () => costApi.summary("company", "month"),
  });
  const departments = useQuery({
    queryKey: ["company", companySlug, "departments"],
    queryFn: () => organizationApi.listDepartments(),
  });
  const recommendations = useQuery({
    queryKey: ["company", companySlug, "roi", "recommendations"],
    queryFn: () => roiApi.recommendations("open"),
  });

  if (roi.isLoading || analytics.isLoading) {
    return <LoadingBlock className="h-96" />;
  }

  const roiData = roi.data!;
  const series =
    analytics.data?.series.map((p) => ({
      date: p.date.slice(5),
      value: p.roi_pct,
      secondary: p.cost / 100,
    })) ?? [];

  return (
    <div>
      <PageHeader
        eyebrow="Executive"
        title={`${company?.name ?? "Company"} ROI Console`}
        description="Is the AI investment paying off — by department, provider, and adoption."
        actions={
          <Button asChild variant="secondary" size="sm">
            <Link href={`/${companySlug}/ai-workspace`}>
              Open Workspace
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
          </Button>
        }
      />

      <Mosaic cols={4} className="mb-px">
        <KpiTile
          label="AI Spend MTD"
          value={roiData.total_spend}
          format="currency"
          delta={-4.2}
          hint="vs budget"
        />
        <KpiTile
          label="Business Value"
          value={roiData.business_value}
          format="currency"
          delta={roiData.vs_last_month_pct}
        />
        <KpiTile
          label="Company ROI"
          value={roiData.roi_pct}
          format="percent"
          accent
          hint="hero metric"
        />
        <KpiTile
          label="Adoption"
          value={`${Math.round(roiData.adoption_rate * 100)}%`}
          hint={`${roiData.active_employees}/${roiData.total_seats} seats`}
        />
      </Mosaic>

      <div className="grid gap-px bg-hairline lg:grid-cols-5">
        <Panel className="border-0 bg-ink p-6 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium tracking-tight text-text-primary">
              ROI trend
            </h2>
            <Provenance
              computedAt={roiData.computed_at}
              formulaVersion={roiData.formula_version}
            />
          </div>
          <TrendAreaChart data={series} secondaryKey="secondary" />
        </Panel>
        <Panel className="border-0 bg-ink p-6 lg:col-span-2">
          <h2 className="mb-4 font-medium tracking-tight text-text-primary">
            Provider spend
          </h2>
          <ProviderDonut
            data={(costs.data?.by_provider ?? []).map((p) => ({
              name: p.provider,
              value: p.cost,
            }))}
          />
          <ul className="mt-2 space-y-2">
            {(costs.data?.by_provider ?? []).map((p) => (
              <li
                key={p.provider}
                className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.15em] text-text-secondary"
              >
                <span>{p.provider}</span>
                <span className="text-text-primary">
                  {formatCurrency(p.cost, "USD", true)}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <h2 className="mb-4 font-medium tracking-tight text-text-primary">
            Department comparison
          </h2>
          <DataTable
            columns={[
              { key: "name", label: "Department" },
              { key: "spend", label: "Spend", align: "right" },
              { key: "roi", label: "ROI", align: "right" },
              { key: "people", label: "People", align: "right" },
              { key: "action", label: "" },
            ]}
            rows={(departments.data ?? []).map((d) => ({
              name: d.department_name,
              spend: formatCurrency(d.monthly_spend, "USD", true),
              roi: (
                <span className="text-accent">{d.roi_pct}%</span>
              ),
              people: d.employee_count,
              action: (
                <Link
                  href={`/${companySlug}/organization/departments/${d.id}`}
                  className="font-mono text-[10px] uppercase tracking-[0.15em] text-accent"
                >
                  Open
                </Link>
              ),
            }))}
          />
        </div>

        <div className="lg:col-span-2">
          <h2 className="mb-4 font-medium tracking-tight text-text-primary">
            Recommendations
          </h2>
          <div className="space-y-px bg-hairline">
            {(recommendations.data ?? []).map((rec) => (
              <div key={rec.id} className="bg-ink p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                  Save {formatCurrency(rec.impact_monthly_usd)}/mo
                </p>
                <p className="mt-2 text-sm text-text-primary">{rec.title}</p>
                <p className="mt-1 text-xs text-text-secondary">{rec.rationale}</p>
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() =>
                      roiApi.updateRecommendation(rec.id, "accepted")
                    }
                  >
                    <Check className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      roiApi.updateRecommendation(rec.id, "dismissed")
                    }
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Dismiss
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
