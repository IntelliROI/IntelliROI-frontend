"use client";

import { useMemo } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { Panel } from "@/components/ui/panel";
import { SectionLabel, RankBar } from "@/components/dashboard/DashboardChrome";
import { LoadingBlock } from "@/components/feedback/States";
import { organizationApi } from "@/features/organization/api/organization.api";
import { analyticsApi } from "@/features/analytics/api/analytics.api";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { useCompanyCurrency } from "@/hooks/use-company-currency";
import type { IntelligenceScope } from "@/lib/rbac/intelligence-scope";

type Row = {
  id: number | string;
  label: string;
  requests: number;
  cost: number;
  href: string;
};

/**
 * Answers "who / where" for AI usage — the Usage page previously only
 * showed a single company-wide daily total with no department, team, or
 * employee attribution. This reuses the same scoped analytics snapshots
 * (department/team/employee) the rest of the app already relies on, so the
 * numbers here always agree with the drill-down dashboards.
 */
export function UsageBreakdown({
  companySlug,
  scope,
}: {
  companySlug: string;
  scope: IntelligenceScope;
}) {
  const { currency: companyCurrency, fromUsd } = useCompanyCurrency(companySlug);

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

  const departmentAnalytics = useQueries({
    queries: (scope.kind === "company" ? departmentsQ.data ?? [] : []).map(
      (d) => ({
        queryKey: ["company", companySlug, "analytics", "department", d.id, "month"],
        queryFn: () => analyticsApi.department(d.id, "month"),
        enabled: scope.kind === "company",
      }),
    ),
  });
  const teamAnalytics = useQueries({
    queries: (scope.kind === "department" ? teamsQ.data ?? [] : []).map((t) => ({
      queryKey: ["company", companySlug, "analytics", "team", t.id, "month"],
      queryFn: () => analyticsApi.team(t.id, "month"),
      enabled: scope.kind === "department",
    })),
  });
  const employeeAnalytics = useQueries({
    queries: teamMembers.map((e) => ({
      queryKey: ["company", companySlug, "analytics", "employee", e.id, "month"],
      queryFn: () => analyticsApi.employee(e.id, "month"),
      enabled: scope.kind === "team",
    })),
  });

  let title = "";
  let rows: Row[] = [];
  let isLoading = false;

  if (scope.kind === "company") {
    title = "By department";
    isLoading = departmentsQ.isLoading;
    rows = (departmentsQ.data ?? []).map((d, i) => ({
      id: d.id,
      label: d.department_name,
      requests: departmentAnalytics[i]?.data?.requests ?? 0,
      cost: departmentAnalytics[i]?.data?.total_cost ?? 0,
      href: `/${companySlug}/organization/departments/${d.id}`,
    }));
  } else if (scope.kind === "department") {
    title = "By team";
    isLoading = teamsQ.isLoading;
    rows = (teamsQ.data ?? []).map((t, i) => ({
      id: t.id,
      label: t.team_name,
      requests: teamAnalytics[i]?.data?.requests ?? 0,
      cost: teamAnalytics[i]?.data?.total_cost ?? 0,
      href: `/${companySlug}/organization/departments/${scope.id}/teams/${t.id}`,
    }));
  } else if (scope.kind === "team") {
    title = "By employee";
    isLoading = employeesQ.isLoading;
    rows = teamMembers.map((e, i) => ({
      id: e.id,
      label: e.display_name || `${e.first_name} ${e.last_name}`.trim(),
      requests: employeeAnalytics[i]?.data?.requests ?? 0,
      cost: employeeAnalytics[i]?.data?.total_cost ?? 0,
      href: `/${companySlug}/organization/employees/${e.id}`,
    }));
  } else {
    // Employee scope is already "me" — no further attribution to show.
    return null;
  }

  const sorted = [...rows].sort((a, b) => b.cost - a.cost);
  const maxCost = Math.max(...sorted.map((r) => r.cost), 1);

  return (
    <Panel className="mt-px border-0 bg-ink p-5 md:p-6">
      <SectionLabel
        title={title}
        meta="This month · who / where AI spend is coming from"
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
                fromUsd(r.cost),
                companyCurrency,
              )}`}
              percent={(r.cost / maxCost) * 100}
              href={r.href}
            />
          ))}
        </div>
      )}
    </Panel>
  );
}
