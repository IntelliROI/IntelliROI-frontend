"use client";

import { useMemo } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { Panel } from "@/components/ui/panel";
import { SectionLabel, RankBar } from "@/components/dashboard/DashboardChrome";
import { LoadingBlock } from "@/components/feedback/States";
import { organizationApi } from "@/features/organization/api/organization.api";
import { roiApi } from "@/features/roi/api/roi.api";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { useCompanyCurrency } from "@/hooks/use-company-currency";
import { queryKeys } from "@/lib/api/query-keys";
import type { IntelligenceScope } from "@/lib/rbac/intelligence-scope";

type Row = {
  id: number | string;
  label: string;
  requests: number;
  /** Company-currency spend from ROI service — never fromUsd. */
  cost: number;
  href: string;
};

/**
 * Attribution breakdown using the same ROI company-currency source as
 * Team Dashboard / Estimated ROI — not analytics+FX (avoids spend drift).
 */
export function UsageBreakdown({
  companySlug,
  scope,
}: {
  companySlug: string;
  scope: IntelligenceScope;
}) {
  const { currency: companyCurrency } = useCompanyCurrency(companySlug);
  const period = "month";

  const departmentsQ = useQuery({
    queryKey: ["company", companySlug, "usage-breakdown", "departments"],
    queryFn: () => organizationApi.listDepartments(),
    enabled: scope.kind === "company",
  });
  const teamsQ = useQuery({
    queryKey: [
      "company",
      companySlug,
      "usage-breakdown",
      "teams",
      scope.kind === "department" ? scope.id : null,
    ],
    queryFn: () =>
      organizationApi.listTeams(scope.kind === "department" ? scope.id : undefined),
    enabled: scope.kind === "department",
  });
  const employeesQ = useQuery({
    queryKey: ["company", companySlug, "usage-breakdown", "employees"],
    queryFn: () => organizationApi.listEmployees(),
    enabled: scope.kind === "team",
  });

  const teamMembers = useMemo(() => {
    if (scope.kind !== "team") return [];
    return (employeesQ.data ?? []).filter((e) => e.team_id === scope.id);
  }, [employeesQ.data, scope]);

  const teamSummary = useQuery({
    queryKey:
      scope.kind === "team"
        ? queryKeys.company.roi.teamSummary(companySlug, scope.id, period)
        : ["company", companySlug, "usage-breakdown", "team-summary", "off"],
    queryFn: () => roiApi.teamSummary(scope.kind === "team" ? scope.id : 0, period),
    enabled: scope.kind === "team",
  });

  const departmentRoi = useQueries({
    queries: (scope.kind === "company" ? departmentsQ.data ?? [] : []).map(
      (d) => ({
        queryKey: queryKeys.company.roi.department(companySlug, d.id, period),
        queryFn: () => roiApi.department(d.id, period),
        enabled: scope.kind === "company",
      }),
    ),
  });
  const teamRoi = useQueries({
    queries: (scope.kind === "department" ? teamsQ.data ?? [] : []).map((t) => ({
      queryKey: queryKeys.company.roi.team(companySlug, t.id, period),
      queryFn: () => roiApi.team(t.id, period),
      enabled: scope.kind === "department",
    })),
  });
  const employeeRoi = useQueries({
    queries: teamMembers.map((e) => ({
      queryKey: queryKeys.company.roi.employee(companySlug, e.id, period),
      queryFn: () => roiApi.employee(e.id, period),
      enabled:
        scope.kind === "team" &&
        ((teamSummary.isSuccess && teamSummary.data == null) ||
          teamSummary.isError),
    })),
  });

  let title = "";
  let rows: Row[] = [];
  let isLoading = false;

  if (scope.kind === "company") {
    title = "By department";
    isLoading = departmentsQ.isLoading || departmentRoi.some((q) => q.isLoading);
    rows = (departmentsQ.data ?? []).map((d, i) => ({
      id: d.id,
      label: d.department_name,
      requests: departmentRoi[i]?.data?.requests ?? 0,
      cost: departmentRoi[i]?.data?.total_spend ?? 0,
      href: `/${companySlug}/organization/departments/${d.id}`,
    }));
  } else if (scope.kind === "department") {
    title = "By team";
    isLoading = teamsQ.isLoading || teamRoi.some((q) => q.isLoading);
    rows = (teamsQ.data ?? []).map((t, i) => ({
      id: t.id,
      label: t.team_name,
      requests: teamRoi[i]?.data?.requests ?? 0,
      cost: teamRoi[i]?.data?.total_spend ?? 0,
      href: `/${companySlug}/organization/departments/${scope.id}/teams/${t.id}`,
    }));
  } else if (scope.kind === "team") {
    title = "By employee";
    isLoading =
      employeesQ.isLoading ||
      teamSummary.isLoading ||
      employeeRoi.some((q) => q.isLoading);
    if (teamSummary.data?.members?.length) {
      rows = teamSummary.data.members.map((m) => ({
        id: m.employee_id,
        label: m.display_name,
        requests: m.requests,
        cost: m.spend,
        href: `/${companySlug}/organization/employees/${m.employee_id}`,
      }));
    } else {
      rows = teamMembers.map((e, i) => ({
        id: e.id,
        label: e.display_name || `${e.first_name} ${e.last_name}`.trim(),
        requests: employeeRoi[i]?.data?.requests ?? 0,
        cost: employeeRoi[i]?.data?.total_spend ?? 0,
        href: `/${companySlug}/organization/employees/${e.id}`,
      }));
    }
  } else {
    return null;
  }

  const sorted = [...rows].sort((a, b) => b.cost - a.cost);
  const maxCost = Math.max(...sorted.map((r) => r.cost), 0);

  return (
    <Panel className="mt-px border-0 bg-ink p-5 md:p-6">
      <SectionLabel
        title={title}
        meta="This month · ROI company-currency spend"
      />
      {isLoading ? (
        <LoadingBlock className="h-32 border-0" />
      ) : sorted.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-text-secondary">
          No records to break down yet.
        </p>
      ) : (
        <div className="divide-y divide-hairline">
          {sorted.map((r) => (
            <RankBar
              key={r.id}
              label={r.label}
              valueLabel={`${formatNumber(r.requests)} req · ${formatCurrency(
                r.cost,
                companyCurrency,
              )}`}
              percent={maxCost > 0 ? (r.cost / maxCost) * 100 : 0}
              href={r.href}
            />
          ))}
        </div>
      )}
    </Panel>
  );
}
