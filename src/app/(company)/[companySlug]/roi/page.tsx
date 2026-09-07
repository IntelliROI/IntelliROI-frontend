"use client";

import { useState } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { PageHeader, LoadingBlock } from "@/components/feedback/States";
import { ScopeUnassigned } from "@/components/feedback/ScopeUnassigned";
import { Mosaic, Panel, Provenance } from "@/components/ui/panel";
import { KpiTile } from "@/components/dashboard/KpiTile";
import { PeriodSwitcher, type RoiPeriod } from "@/components/ui/period-switcher";
import { TrendAreaChart, SimpleBarChart } from "@/components/charts/Charts";
import { roiApi } from "@/features/roi/api/roi.api";
import { analyticsApi } from "@/features/analytics/api/analytics.api";
import { organizationApi } from "@/features/organization/api/organization.api";
import { useAuthStore } from "@/stores/auth-store";
import { useCompanyCurrency } from "@/hooks/use-company-currency";
import { EstimatedRoiSetupHint } from "@/features/roi/components/EstimatedRoiSetupHint";
import { resolveIntelligenceScope } from "@/lib/rbac/intelligence-scope";
import type { RoiSummary } from "@/features/roi/api/roi.api";
import type { AnalyticsSummary } from "@/features/analytics/api/analytics.api";
import { toAnalyticsPeriod } from "@/features/roi/lib/aggregate";
import { queryKeys } from "@/lib/api/query-keys";

export default function RoiPage({
  params,
}: {
  params: { companySlug: string };
}) {
  const [period, setPeriod] = useState<RoiPeriod>("month");
  const user = useAuthStore((s) => s.user);
  const { currency: companyCurrency } = useCompanyCurrency(params.companySlug);
  const analyticsPeriod = toAnalyticsPeriod(period);
  const scope = resolveIntelligenceScope(user);

  const teamSummary = useQuery({
    queryKey:
      scope.kind === "team"
        ? queryKeys.company.roi.teamSummary(params.companySlug, scope.id, period)
        : ["company", params.companySlug, "roi", "team-summary", "off"],
    queryFn: () =>
      roiApi.teamSummary(scope.kind === "team" ? scope.id : 0, period),
    enabled: scope.kind === "team",
  });

  const needTeamLegacy =
    scope.kind === "team" &&
    (teamSummary.isSuccess || teamSummary.isError) &&
    teamSummary.data == null;

  const roi = useQuery({
    queryKey: [
      "company",
      params.companySlug,
      "roi",
      "summary",
      scope.kind,
      "id" in scope ? scope.id : null,
      period,
    ],
    queryFn: (): Promise<RoiSummary> => {
      if (scope.kind === "department") return roiApi.department(scope.id, period);
      if (scope.kind === "team") return roiApi.team(scope.id, period);
      if (scope.kind === "employee") return roiApi.employee(scope.id, period);
      return roiApi.company(period);
    },
    enabled:
      scope.kind !== "unassigned" &&
      (scope.kind !== "team" || needTeamLegacy),
  });
  const formulas = useQuery({
    queryKey: ["company", params.companySlug, "roi", "formula-versions"],
    queryFn: () => roiApi.formulaVersions(),
    enabled: scope.kind === "company",
  });
  const analytics = useQuery({
    queryKey: [
      "company",
      params.companySlug,
      "analytics",
      scope.kind,
      "id" in scope ? scope.id : null,
      analyticsPeriod,
    ],
    queryFn: (): Promise<AnalyticsSummary> => {
      if (scope.kind === "department")
        return analyticsApi.department(scope.id, analyticsPeriod);
      if (scope.kind === "team")
        return analyticsApi.team(scope.id, analyticsPeriod);
      if (scope.kind === "employee")
        return analyticsApi.employee(scope.id, analyticsPeriod);
      return analyticsApi.company(analyticsPeriod);
    },
    enabled: scope.kind !== "unassigned",
  });
  const departments = useQuery({
    queryKey: ["company", params.companySlug, "departments"],
    queryFn: () => organizationApi.listDepartments(),
    enabled: scope.kind === "company",
  });
  const teams = useQuery({
    queryKey: [
      "company",
      params.companySlug,
      "teams",
      scope.kind === "department" ? scope.id : null,
    ],
    queryFn: () =>
      scope.kind === "department"
        ? organizationApi.listTeams(scope.id)
        : Promise.resolve([]),
    enabled: scope.kind === "department",
  });
  const deptRoi = useQueries({
    queries: (departments.data ?? []).map((d) => ({
      queryKey: [
        "company",
        params.companySlug,
        "roi",
        "department",
        d.id,
        period,
      ],
      queryFn: () => roiApi.department(d.id, period),
      enabled: scope.kind === "company" && Boolean(departments.data?.length),
    })),
  });
  const teamRoi = useQueries({
    queries: (teams.data ?? []).map((t) => ({
      queryKey: ["company", params.companySlug, "roi", "team", t.id, period],
      queryFn: () => roiApi.team(t.id, period),
      enabled: scope.kind === "department" && Boolean(teams.data?.length),
    })),
  });

  if (scope.kind === "unassigned") {
    return (
      <ScopeUnassigned
        role={scope.role}
        missing={scope.missing}
        title="ROI Analysis"
      />
    );
  }

  const loading =
    (scope.kind === "team" &&
      (teamSummary.isLoading || (needTeamLegacy && roi.isLoading))) ||
    (scope.kind !== "team" && roi.isLoading);

  if (loading) return <LoadingBlock className="h-80" />;

  const display: RoiSummary | null =
    scope.kind === "team" && teamSummary.data
      ? {
          period,
          total_spend: teamSummary.data.spend,
          business_value: teamSummary.data.business_value,
          roi_pct: teamSummary.data.roi_pct,
          time_saved_hours: 0,
          requests: teamSummary.data.requests,
          team_id: scope.id,
          computed_at: teamSummary.data.period_start,
        }
      : (roi.data ?? null);

  if (!display) {
    return (
      <p className="border border-hairline px-4 py-8 text-sm text-text-secondary">
        Could not load Estimated ROI from the live service.
      </p>
    );
  }

  const formulaVersion =
    display.formula_version ||
    formulas.data?.[formulas.data.length - 1]?.version ||
    undefined;

  const breakdownTitle =
    scope.kind === "company"
      ? "Department ROI"
      : scope.kind === "department"
        ? "Team ROI"
        : null;
  const breakdownData =
    scope.kind === "company"
      ? (departments.data ?? []).map((d, i) => ({
          name: d.department_name.slice(0, 8),
          value: deptRoi[i]?.data?.roi_pct ?? 0,
        }))
      : scope.kind === "department"
        ? (teams.data ?? []).map((t, i) => ({
            name: t.team_name.slice(0, 8),
            value: teamRoi[i]?.data?.roi_pct ?? 0,
          }))
        : [];

  return (
    <div>
      <PageHeader
        eyebrow="Financial"
        title={
          scope.kind === "company"
            ? "ROI Analysis"
            : scope.kind === "department"
              ? "Department ROI"
              : scope.kind === "team"
                ? "Team ROI"
                : "My Estimated ROI"
        }
        description="Investment vs business value — recomputable with formula provenance."
        actions={
          <PeriodSwitcher
            value={period}
            onChange={(p) => setPeriod(p as RoiPeriod)}
            variant="roi"
          />
        }
      />
      <Mosaic cols={4}>
        <KpiTile
          label="Spend"
          value={display.total_spend}
          format="currency"
          currency={companyCurrency}
        />
        <KpiTile
          label="Business value"
          value={display.business_value}
          format="currency"
          currency={companyCurrency}
        />
        <KpiTile label="ROI" value={display.roi_pct} format="percent" accent />
        <KpiTile
          label="Hours saved"
          value={display.time_saved_hours}
          format="number"
        />
      </Mosaic>

      <EstimatedRoiSetupHint
        companySlug={params.companySlug}
        visible={display.total_spend > 0 && display.business_value <= 0}
      />

      <div className="mt-px grid gap-px bg-hairline lg:grid-cols-2">
        <Panel className="border-0 bg-ink p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium text-text-primary">ROI over time</h2>
            <Provenance
              computedAt={display.computed_at}
              formulaVersion={formulaVersion}
            />
          </div>
          <TrendAreaChart
            data={(analytics.data?.series ?? []).map((p) => ({
              date: p.date.slice(5),
              value: p.roi_pct,
            }))}
          />
        </Panel>
        {breakdownTitle ? (
          <Panel className="border-0 bg-ink p-6">
            <h2 className="mb-4 font-medium text-text-primary">
              {breakdownTitle}
            </h2>
            <SimpleBarChart data={breakdownData} />
          </Panel>
        ) : (
          <Panel className="border-0 bg-ink p-6">
            <h2 className="mb-4 font-medium text-text-primary">Scope</h2>
            <p className="text-sm text-text-secondary">
              Showing Estimated ROI for your assigned {scope.kind} only.
            </p>
          </Panel>
        )}
      </div>
    </div>
  );
}
